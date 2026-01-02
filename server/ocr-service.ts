import Tesseract from 'tesseract.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  language: string;
  error?: string;
}

interface PDFOCRResult {
  success: boolean;
  pages: Array<{
    pageNumber: number;
    text: string;
    confidence: number;
  }>;
  fullText: string;
  averageConfidence: number;
  error?: string;
}

/**
 * Perform OCR on an image file or base64 data
 */
export async function performOCR(
  imageSource: string | Buffer,
  language: string = 'deu+eng'
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageSource, language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      success: true,
      text: result.data.text.trim(),
      confidence: result.data.confidence,
      language: language,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      language: language,
      error: error instanceof Error ? error.message : 'Unknown OCR error',
    };
  }
}

/**
 * Convert PDF pages to images using pdftoppm (from poppler-utils)
 */
async function convertPDFToImages(pdfPath: string): Promise<string[]> {
  const tempDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const outputPrefix = path.join(tempDir, 'page');

  try {
    // Use pdftoppm to convert PDF to PNG images
    await execAsync(`pdftoppm -png -r 300 "${pdfPath}" "${outputPrefix}"`);

    // Get list of generated images
    const files = await fs.promises.readdir(tempDir);
    const imageFiles = files
      .filter((f) => f.endsWith('.png'))
      .sort()
      .map((f) => path.join(tempDir, f));

    return imageFiles;
  } catch (error) {
    console.error('PDF to image conversion error:', error);
    throw new Error('Failed to convert PDF to images');
  }
}

/**
 * Perform OCR on a scanned PDF document
 */
export async function performPDFOCR(
  pdfSource: string | Buffer,
  language: string = 'deu+eng'
): Promise<PDFOCRResult> {
  const tempDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
  let pdfPath: string;

  try {
    await fs.promises.mkdir(tempDir, { recursive: true });

    // If buffer, save to temp file
    if (Buffer.isBuffer(pdfSource)) {
      pdfPath = path.join(tempDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, pdfSource);
    } else if (pdfSource.startsWith('data:')) {
      // Base64 data URL
      const base64Data = pdfSource.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      pdfPath = path.join(tempDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, buffer);
    } else {
      // Assume it's a file path
      pdfPath = pdfSource;
    }

    // Convert PDF to images
    const imageFiles = await convertPDFToImages(pdfPath);

    if (imageFiles.length === 0) {
      return {
        success: false,
        pages: [],
        fullText: '',
        averageConfidence: 0,
        error: 'No pages found in PDF',
      };
    }

    // Perform OCR on each page
    const pages: Array<{ pageNumber: number; text: string; confidence: number }> = [];
    let totalConfidence = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      console.log(`Processing page ${i + 1} of ${imageFiles.length}...`);
      const result = await performOCR(imageFiles[i], language);

      pages.push({
        pageNumber: i + 1,
        text: result.text,
        confidence: result.confidence,
      });

      totalConfidence += result.confidence;
    }

    // Combine all text
    const fullText = pages.map((p) => p.text).join('\n\n--- Page Break ---\n\n');
    const averageConfidence = totalConfidence / pages.length;

    // Cleanup temp files
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Failed to cleanup temp directory:', e);
    }

    return {
      success: true,
      pages,
      fullText,
      averageConfidence,
    };
  } catch (error) {
    console.error('PDF OCR Error:', error);

    // Cleanup on error
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }

    return {
      success: false,
      pages: [],
      fullText: '',
      averageConfidence: 0,
      error: error instanceof Error ? error.message : 'Unknown PDF OCR error',
    };
  }
}

/**
 * Detect if a PDF is scanned (image-based) or text-based
 */
export async function isPDFScanned(pdfSource: string | Buffer): Promise<boolean> {
  const tempDir = path.join(os.tmpdir(), `pdf-check-${Date.now()}`);
  let pdfPath: string;

  try {
    await fs.promises.mkdir(tempDir, { recursive: true });

    // If buffer, save to temp file
    if (Buffer.isBuffer(pdfSource)) {
      pdfPath = path.join(tempDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, pdfSource);
    } else if (pdfSource.startsWith('data:')) {
      const base64Data = pdfSource.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      pdfPath = path.join(tempDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, buffer);
    } else {
      pdfPath = pdfSource;
    }

    // Try to extract text using pdftotext
    const textPath = path.join(tempDir, 'output.txt');
    await execAsync(`pdftotext "${pdfPath}" "${textPath}"`);

    const text = await fs.promises.readFile(textPath, 'utf-8');
    const cleanText = text.replace(/\s+/g, '').trim();

    // Cleanup
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }

    // If very little text extracted, it's likely a scanned PDF
    return cleanText.length < 100;
  } catch (error) {
    // Cleanup on error
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }

    // If pdftotext fails, assume it's scanned
    return true;
  }
}

/**
 * Smart PDF text extraction - uses OCR only if needed
 */
export async function extractTextFromPDF(
  pdfSource: string | Buffer,
  language: string = 'deu+eng'
): Promise<{ text: string; usedOCR: boolean; confidence?: number }> {
  const tempDir = path.join(os.tmpdir(), `pdf-extract-${Date.now()}`);
  let pdfPath: string;

  try {
    await fs.promises.mkdir(tempDir, { recursive: true });

    // If buffer, save to temp file
    if (Buffer.isBuffer(pdfSource)) {
      pdfPath = path.join(tempDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, pdfSource);
    } else if (pdfSource.startsWith('data:')) {
      const base64Data = pdfSource.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      pdfPath = path.join(tempDir, 'input.pdf');
      await fs.promises.writeFile(pdfPath, buffer);
    } else {
      pdfPath = pdfSource;
    }

    // First try regular text extraction
    const textPath = path.join(tempDir, 'output.txt');
    try {
      await execAsync(`pdftotext -layout "${pdfPath}" "${textPath}"`);
      const text = await fs.promises.readFile(textPath, 'utf-8');
      const cleanText = text.trim();

      // If we got meaningful text, return it
      if (cleanText.length > 100) {
        // Cleanup
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
          // Ignore
        }

        return {
          text: cleanText,
          usedOCR: false,
        };
      }
    } catch (e) {
      console.log('Regular text extraction failed, falling back to OCR');
    }

    // Fall back to OCR
    console.log('Using OCR for text extraction...');
    const ocrResult = await performPDFOCR(pdfPath, language);

    // Cleanup
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }

    if (ocrResult.success) {
      return {
        text: ocrResult.fullText,
        usedOCR: true,
        confidence: ocrResult.averageConfidence,
      };
    }

    return {
      text: '',
      usedOCR: true,
      confidence: 0,
    };
  } catch (error) {
    // Cleanup on error
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }

    console.error('PDF text extraction error:', error);
    return {
      text: '',
      usedOCR: false,
    };
  }
}
