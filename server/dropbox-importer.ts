import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { storagePut } from "./storage";
import { createPropertyDraft } from "./db";
import { invokeLLM } from "./_core/llm";

const execAsync = promisify(exec);

// Helper: Convert Dropbox share link to direct download link
function getDropboxDownloadUrl(shareLink: string): string {
  // Convert share link to direct download
  // https://www.dropbox.com/sh/xxxxx?dl=0 -> https://www.dropbox.com/sh/xxxxx?dl=1
  return shareLink.replace("?dl=0", "?dl=1").replace("?dl=1", "?dl=1");
}

// Helper: Parse Dropbox folder and extract files
async function downloadDropboxFolder(
  dropboxLink: string,
  tempDir: string
): Promise<{ csvFiles: string[]; imageFiles: string[]; pdfFiles: string[] }> {
  try {
    // Convert to direct download URL
    const downloadUrl = getDropboxDownloadUrl(dropboxLink);

    // Download the ZIP file from Dropbox
    const zipPath = path.join(tempDir, "dropbox-export.zip");
    const { stdout, stderr } = await execAsync(
      `curl -L "${downloadUrl}" -o "${zipPath}" 2>&1`
    );

    if (stderr && !stderr.includes("100")) {
      console.error("Download error:", stderr);
    }

    // Extract ZIP file
    const extractDir = path.join(tempDir, "extracted");
    await execAsync(`unzip -q "${zipPath}" -d "${extractDir}"`);

    // Scan for files
    const csvFiles: string[] = [];
    const imageFiles: string[] = [];
    const pdfFiles: string[] = [];

    const scanDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanDir(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if ([".csv", ".xlsx", ".xls"].includes(ext)) {
            csvFiles.push(filePath);
          } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
            imageFiles.push(filePath);
          } else if (ext === ".pdf") {
            pdfFiles.push(filePath);
          }
        }
      }
    };

    scanDir(extractDir);

    return { csvFiles, imageFiles, pdfFiles };
  } catch (error) {
    console.error("Error downloading Dropbox folder:", error);
    throw error;
  }
}

// Helper: Parse Excel/CSV file
async function parseExcelFile(filePath: string): Promise<any[]> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".csv") {
    // Parse CSV
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const headers = parseCSVLine(lines[0]);
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCSVLine(lines[i]);
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header.toLowerCase()] = values[idx];
      });
      data.push(row);
    }
    return data;
  } else {
    // Parse Excel using xlsx library with dynamic import
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data;
    } catch (error) {
      console.error("Error parsing Excel file with XLSX:", error);
      // Fallback: treat as CSV
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      const headers = parseCSVLine(lines[0]);
      const data: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header.toLowerCase()] = values[idx];
        });
        data.push(row);
      }
      return data;
    }
  }
}

// Helper: Parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === "," || char === ";") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

// Helper: Upload image to S3 with optimization
async function uploadImageToS3(
  imagePath: string,
  propertyName: string
): Promise<string> {
  try {
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);

    // Upload to S3
    const fileName = path.basename(imagePath);
    const key = `properties/${propertyName}/images/${Date.now()}-${fileName}`;
    const { url } = await storagePut(key, imageBuffer, "image/webp");

    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Main: Import from Dropbox folder
export async function importFromDropboxFolder(
  dropboxLink: string,
  developerCode?: string
): Promise<{
  success: boolean;
  message: string;
  draftIds: number[];
  errors: string[];
}> {
  const tempDir = path.join("/tmp", `dropbox-import-${Date.now()}`);
  const errors: string[] = [];
  const draftIds: number[] = [];

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download and extract Dropbox folder
    const { csvFiles, imageFiles, pdfFiles } = await downloadDropboxFolder(
      dropboxLink,
      tempDir
    );

    if (csvFiles.length === 0) {
      throw new Error(
        "No CSV or Excel files found in Dropbox folder. Please include a data file."
      );
    }

    // Process each CSV/Excel file
    for (const csvFile of csvFiles) {
      try {
        const propertyData = await parseExcelFile(csvFile);

        // Process each row in the CSV
        for (const row of propertyData) {
          try {
            // Extract data from row
            const title = row.title || row.name || row.property_name || "";
            const description = row.description || row.desc || "";
            const location = row.location || row.address || "";
            const city = row.city || row.stadt || "";
            const price = row.price || row.preis || row.selling_price || "";
            const area = row.area || row.fläche || row.sqm || "";
            const bedrooms = parseInt(row.bedrooms || row.zimmer || "0");
            const bathrooms = parseInt(row.bathrooms || row.bäder || "0");
            const propertyType = row.property_type || row.type || "apartment";
            const constructionStatus =
              row.construction_status || row.status || "planning";
            const completionDate = row.completion_date || row.fertigstellung || "";
            const expectedReturn =
              row.expected_return || row.rendite || row.yield || "";

            // Collect images for this property
            const propertyImages: string[] = [];
            for (const imagePath of imageFiles) {
              try {
                const imageUrl = await uploadImageToS3(imagePath, title);
                propertyImages.push(imageUrl);
              } catch (imgError) {
                console.error("Error uploading image:", imgError);
                errors.push(
                  `Failed to upload image for property "${title}": ${String(imgError)}`
                );
              }
            }

            // Create property draft
            const draftId = await createPropertyDraft({
              title,
              description,
              location,
              city,
              originalPrice: price,
              sellingPrice: price,
              area,
              bedrooms,
              bathrooms,
              propertyType: propertyType as any,
              constructionStatus: constructionStatus as any,
              completionDate: completionDate
                ? new Date(completionDate)
                : undefined,
              mainImage: propertyImages[0] || "",
              images: propertyImages.join(","),
              expectedReturn,
              status: "draft",
              sourceDocuments: "Dropbox Import",
              developerName: developerCode || "",
            });

            draftIds.push(draftId);
          } catch (rowError) {
            errors.push(
              `Error processing row: ${String(rowError)}`
            );
          }
        }
      } catch (csvError) {
        errors.push(`Error processing CSV file: ${String(csvError)}`);
      }
    }

    // Clean up temp directory
    await execAsync(`rm -rf "${tempDir}"`);

    return {
      success: draftIds.length > 0,
      message: `Successfully imported ${draftIds.length} properties from Dropbox`,
      draftIds,
      errors,
    };
  } catch (error) {
    // Clean up temp directory on error
    try {
      await execAsync(`rm -rf "${tempDir}"`);
    } catch (cleanupError) {
      console.error("Error cleaning up temp directory:", cleanupError);
    }

    return {
      success: false,
      message: `Error importing from Dropbox: ${String(error)}`,
      draftIds: [],
      errors: [String(error)],
    };
  }
}
