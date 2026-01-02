import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import multer from "multer";
import { storagePut } from "../storage";
import { optimizePropertyImage, createPropertyThumbnail } from "../image-optimizer";
import { extractTextFromPDF, performOCR } from "../ocr-service";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload endpoint
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
  
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
      }
      
      const file = req.file;
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const s3Key = `properties/images/${timestamp}_${sanitizedName}`;
      
      const { url } = await storagePut(s3Key, file.buffer, file.mimetype);
      
      res.json({ url, key: s3Key });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload fehlgeschlagen" });
    }
  });
  
  // Optimized image upload endpoint (auto-compresses and resizes)
  app.post("/api/upload/image", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
      }
      
      const file = req.file;
      const timestamp = Date.now();
      const baseName = file.originalname.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
      
      // Optimize the image
      const optimized = await optimizePropertyImage(file.buffer);
      
      if (!optimized.success || !optimized.buffer) {
        // Fallback to original if optimization fails
        const s3Key = `properties/images/${timestamp}_${baseName}.${file.mimetype.split('/')[1]}`;
        const { url } = await storagePut(s3Key, file.buffer, file.mimetype);
        return res.json({ 
          url, 
          key: s3Key,
          optimized: false,
          originalSize: file.size,
          finalSize: file.size
        });
      }
      
      // Upload optimized image
      const s3Key = `properties/images/${timestamp}_${baseName}.webp`;
      const { url } = await storagePut(s3Key, optimized.buffer, 'image/webp');
      
      // Also create and upload thumbnail
      const thumbnail = await createPropertyThumbnail(file.buffer);
      let thumbnailUrl = url;
      
      if (thumbnail.success && thumbnail.buffer) {
        const thumbKey = `properties/thumbnails/${timestamp}_${baseName}_thumb.webp`;
        const thumbResult = await storagePut(thumbKey, thumbnail.buffer, 'image/webp');
        thumbnailUrl = thumbResult.url;
      }
      
      res.json({ 
        url, 
        key: s3Key,
        thumbnailUrl,
        optimized: true,
        originalSize: file.size,
        finalSize: optimized.optimizedSize,
        compressionRatio: optimized.compressionRatio.toFixed(1),
        dimensions: { width: optimized.width, height: optimized.height }
      });
    } catch (error) {
      console.error("Optimized upload error:", error);
      res.status(500).json({ error: "Bildoptimierung fehlgeschlagen" });
    }
  });
  
  // OCR endpoint for scanned documents
  const ocrUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for PDFs
  });
  
  app.post("/api/ocr/pdf", ocrUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
      }
      
      const file = req.file;
      
      if (!file.mimetype.includes('pdf')) {
        return res.status(400).json({ error: "Nur PDF-Dateien werden unterstützt" });
      }
      
      console.log(`Starting OCR for PDF: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      const result = await extractTextFromPDF(file.buffer, 'deu+eng');
      
      res.json({
        success: true,
        text: result.text,
        usedOCR: result.usedOCR,
        confidence: result.confidence,
        filename: file.originalname
      });
    } catch (error) {
      console.error("OCR error:", error);
      res.status(500).json({ error: "OCR-Verarbeitung fehlgeschlagen" });
    }
  });
  
  // OCR endpoint for images
  app.post("/api/ocr/image", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
      }
      
      const file = req.file;
      
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: "Nur Bilddateien werden unterstützt" });
      }
      
      console.log(`Starting OCR for image: ${file.originalname}`);
      
      const result = await performOCR(file.buffer, 'deu+eng');
      
      res.json({
        success: result.success,
        text: result.text,
        confidence: result.confidence,
        filename: file.originalname,
        error: result.error
      });
    } catch (error) {
      console.error("Image OCR error:", error);
      res.status(500).json({ error: "Bild-OCR fehlgeschlagen" });
    }
  });
  
  // Video upload endpoint (larger file size limit)
  const videoUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos
  });
  
  app.post("/api/upload/video", videoUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Keine Datei hochgeladen" });
      }
      
      const file = req.file;
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const s3Key = `properties/videos/${timestamp}_${sanitizedName}`;
      
      const { url } = await storagePut(s3Key, file.buffer, file.mimetype);
      
      res.json({ url, key: s3Key });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({ error: "Video-Upload fehlgeschlagen" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
