import { Readable } from 'stream';
// @ts-ignore
import unzipper from 'unzipper';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { parseExcelFile } from './batch-import-service';
import { storagePut } from './storage';
import { createPropertyDraft } from './db';

interface ExtractedFolder {
  name: string;
  excelPath?: string;
  imagePaths: string[];
  pdfPath?: string;
}

interface ZipImportResult {
  folderName: string;
  successCount: number;
  failureCount: number;
  results: Array<{
    success: boolean;
    message: string;
    propertyDraftId?: string;
    errors?: string[];
  }>;
}

export async function extractZipFile(buffer: Buffer): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>();

  return new Promise((resolve, reject) => {
    const stream = Readable.from([buffer]);

    stream
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        const fileName = entry.path;

        if (entry.type === 'File') {
          const chunks: Buffer[] = [];
          entry.on('data', (chunk: Buffer) => chunks.push(chunk));
          entry.on('end', () => {
            files.set(fileName, Buffer.concat(chunks));
          });
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject)
      .on('close', () => resolve(files));
  });
}

export async function organizeExtractedFiles(
  files: Map<string, Buffer>
): Promise<ExtractedFolder[]> {
  const folders = new Map<string, ExtractedFolder>();

  // Organize files by folder
  for (const [filePath, buffer] of Array.from(files.entries())) {
    const parts = filePath.split('/').filter((p: string) => p.length > 0);

    if (parts.length < 2) continue; // Skip root level files

    const folderName = parts[0];
    const fileName = parts[parts.length - 1];
    const relativePath = parts.slice(1).join('/');

    if (!folders.has(folderName)) {
      folders.set(folderName, {
        name: folderName,
        imagePaths: [],
      });
    }

    const folder = folders.get(folderName)!;

    // Categorize files
    if (
      fileName.toLowerCase().endsWith('.xlsx') ||
      fileName.toLowerCase().endsWith('.xls') ||
      fileName.toLowerCase().endsWith('.csv')
    ) {
      folder.excelPath = filePath;
    } else if (fileName.toLowerCase().endsWith('.pdf')) {
      folder.pdfPath = filePath;
    } else if (
      fileName.match(/\.(jpg|jpeg|png|webp|gif)$/i) &&
      !fileName.startsWith('.')
    ) {
      folder.imagePaths.push(filePath);
    }
  }

  return Array.from(folders.values());
}

export async function importFromZip(
  buffer: Buffer,
  developerId?: string
): Promise<ZipImportResult[]> {
  const results: ZipImportResult[] = [];

  try {
    // Extract ZIP file
    const files = await extractZipFile(buffer);

    // Organize files by folder
    const folders = await organizeExtractedFiles(files);

    // Process each folder
    for (const folder of folders) {
      const folderResult: ZipImportResult = {
        folderName: folder.name,
        successCount: 0,
        failureCount: 0,
        results: [],
      };

      try {
        // Check if Excel file exists
        if (!folder.excelPath) {
          folderResult.results.push({
            success: false,
            message: `No Excel file found in folder "${folder.name}"`,
            errors: ['Excel file (XLSX/XLS/CSV) is required'],
          });
          folderResult.failureCount++;
          results.push(folderResult);
          continue;
        }

        // Parse Excel file
        const excelBuffer = files.get(folder.excelPath)!;
        const excelRows = await parseExcelFile(excelBuffer);

        // Process each row
        for (const row of excelRows) {
          try {
            // Upload images
            const imageUrls: string[] = [];
            let mainImageUrl = '';

            for (let i = 0; i < folder.imagePaths.length; i++) {
              const imagePath = folder.imagePaths[i];
              const imageBuffer = files.get(imagePath)!;
              const fileName = path.basename(imagePath);

              try {
                const { url } = await storagePut(
                  `properties/${folder.name}/${fileName}`,
                  imageBuffer,
                  getMimeType(fileName)
                );

                if (i === 0) {
                  mainImageUrl = url;
                } else {
                  imageUrls.push(url);
                }
              } catch (err) {
                console.error(`Failed to upload image ${fileName}:`, err);
              }
            }

            // Upload PDF if exists
            let pdfUrl = '';
            if (folder.pdfPath) {
              try {
                const pdfBuffer = files.get(folder.pdfPath)!;
                const pdfFileName = path.basename(folder.pdfPath);
                const { url } = await storagePut(
                  `properties/${folder.name}/${pdfFileName}`,
                  pdfBuffer,
                  'application/pdf'
                );
                pdfUrl = url;
              } catch (err) {
                console.error('Failed to upload PDF:', err);
              }
            }

            // Create property draft
            const draftData: any = {
              title: row.title || folder.name,
              description: row.description || '',
              location: row.location || '',
              city: row.city || 'Tiflis',
              area: String(row.area || 0),
              rooms: String(row.rooms || 0),
              bathrooms: String(row.bathrooms || 0),
              floor: String(row.floor || 0),
              year: String(row.year || new Date().getFullYear()),
              condition: row.condition || 'Neu',
              originalPrice: String(row.originalPrice || 0),
              salePrice: String(row.salePrice || row.originalPrice || 0),
              downPaymentPercent: String(row.downPayment || 30),
              installmentAllowed: row.installmentAllowed || false,
              interestRate: String(row.interestRate || 0),
              mainImage: mainImageUrl,
              images: imageUrls.join(','),
              pdfUrl: pdfUrl,
              developerName: row.developer,
              status: 'draft',
            };

            const draftId = await createPropertyDraft(draftData);

            folderResult.results.push({
              success: true,
              message: `Property "${row.title}" imported successfully`,
              propertyDraftId: typeof draftId === 'number' ? String(draftId) : (draftId || undefined),
            });
            folderResult.successCount++;
          } catch (error) {
            folderResult.results.push({
              success: false,
              message: `Failed to import property "${row.title}"`,
              errors: [String(error)],
            });
            folderResult.failureCount++;
          }
        }
      } catch (error) {
        folderResult.results.push({
          success: false,
          message: `Failed to process folder "${folder.name}"`,
          errors: [String(error)],
        });
        folderResult.failureCount++;
      }

      results.push(folderResult);
    }

    return results;
  } catch (error) {
    console.error('Failed to import ZIP file:', error);
    return [
      {
        folderName: 'Error',
        successCount: 0,
        failureCount: 1,
        results: [
          {
            success: false,
            message: 'Failed to process ZIP file',
            errors: [String(error)],
          },
        ],
      },
    ];
  }
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
