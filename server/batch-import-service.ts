import * as XLSX from 'xlsx';
import {
  downloadFile,
  listFilesInFolder,
  getFileMetadata,
} from './google-drive-service';
import { storagePut } from './storage';
import { createPropertyDraft } from './db';

interface ExcelRow {
  title?: string;
  description?: string;
  location?: string;
  city?: string;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  year?: number;
  condition?: string;
  originalPrice?: number;
  salePrice?: number;
  downPayment?: number;
  installmentAllowed?: boolean;
  interestRate?: number;
  developer?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  propertyDraftId?: string;
  errors?: string[];
}

interface FolderImportResult {
  folderName: string;
  totalFiles: number;
  successCount: number;
  failureCount: number;
  results: ImportResult[];
}

export async function parseExcelFile(buffer: Buffer): Promise<ExcelRow[]> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as any[];

    // Skip header row and parse data
    const headers = rows[0] as string[];
    const data: ExcelRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any[];
      if (!row || row.length === 0) continue;

      const item: ExcelRow = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '');
        const value = row[index];

        if (key === 'title') item.title = value;
        else if (key === 'description') item.description = value;
        else if (key === 'location') item.location = value;
        else if (key === 'city') item.city = value;
        else if (key === 'area' || key === 'fläche') item.area = Number(value) || 0;
        else if (key === 'rooms' || key === 'zimmer') item.rooms = Number(value) || 0;
        else if (key === 'bathrooms' || key === 'badezimmer')
          item.bathrooms = Number(value) || 0;
        else if (key === 'floor' || key === 'etage') item.floor = Number(value) || 0;
        else if (key === 'year' || key === 'baujahr') item.year = Number(value) || 0;
        else if (key === 'condition' || key === 'zustand') item.condition = value;
        else if (key === 'originalprice' || key === 'originalepreis')
          item.originalPrice = Number(value) || 0;
        else if (key === 'saleprice' || key === 'verkaufspreis')
          item.salePrice = Number(value) || 0;
        else if (key === 'downpayment' || key === 'anzahlung')
          item.downPayment = Number(value) || 30;
        else if (key === 'installmentallowed' || key === 'ratenzahlungerlaubt')
          item.installmentAllowed = value === 'Ja' || value === 'Yes' || value === true;
        else if (key === 'interestrate' || key === 'zinssatz')
          item.interestRate = Number(value) || 0;
        else if (key === 'developer' || key === 'bauträger') item.developer = value;
      });

      if (item.title) {
        data.push(item);
      }
    }

    return data;
  } catch (error) {
    console.error('Failed to parse Excel file:', error);
    throw error;
  }
}

export async function importPropertyFromFolder(
  folderId: string,
  developerId?: string
): Promise<FolderImportResult> {
  const result: FolderImportResult = {
    folderName: '',
    totalFiles: 0,
    successCount: 0,
    failureCount: 0,
    results: [],
  };

  try {
    // Get folder metadata
    const folderMeta = await getFileMetadata(folderId);
    result.folderName = folderMeta?.name || 'Unknown';

    // List files in folder
    const files = await listFilesInFolder(folderId);
    result.totalFiles = files.length;

    // Find Excel file
    const excelFile = files.find(
      (f) =>
        f.mimeType ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        f.mimeType === 'application/vnd.ms-excel' ||
        f.name.endsWith('.xlsx') ||
        f.name.endsWith('.xls')
    );

    if (!excelFile) {
      result.results.push({
        success: false,
        message: 'No Excel file found in folder',
        errors: ['Excel file (XLSX/XLS) is required'],
      });
      result.failureCount++;
      return result;
    }

    // Download and parse Excel file
    const excelBuffer = await downloadFile(excelFile.id);
    const excelRows = await parseExcelFile(excelBuffer);

    // Find image folder
    const imageFolder = files.find(
      (f) =>
        f.mimeType === 'application/vnd.google-apps.folder' &&
        (f.name.toLowerCase() === 'bilder' ||
          f.name.toLowerCase() === 'images' ||
          f.name.toLowerCase() === 'fotos')
    );

    let images: any[] = [];
    if (imageFolder) {
      images = await listFilesInFolder(imageFolder.id);
    }

    // Find PDF file
    const pdfFile = files.find((f) => f.mimeType === 'application/pdf');

    // Process each row from Excel
    for (const row of excelRows) {
      try {
        // Upload images
        const imageUrls: string[] = [];
        const mainImageUrl = '';

        if (images.length > 0) {
          for (let i = 0; i < Math.min(images.length, 10); i++) {
            const img = images[i];
            if (
              img.mimeType.startsWith('image/') &&
              !img.name.startsWith('.')
            ) {
              try {
                const imgBuffer = await downloadFile(img.id);
                const { url } = await storagePut(
                  `properties/${result.folderName}/${img.name}`,
                  imgBuffer,
                  img.mimeType
                );
                if (i === 0) {
                  // First image is main image
                  (mainImageUrl as any) = url;
                } else {
                  imageUrls.push(url);
                }
              } catch (err) {
                console.error(`Failed to upload image ${img.name}:`, err);
              }
            }
          }
        }

        // Upload PDF if exists
        let pdfUrl = '';
        if (pdfFile) {
          try {
            const pdfBuffer = await downloadFile(pdfFile.id);
            const { url } = await storagePut(
              `properties/${result.folderName}/${pdfFile.name}`,
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
          title: row.title || result.folderName,
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

        result.results.push({
          success: true,
          message: `Property "${row.title}" imported successfully`,
          propertyDraftId: typeof draftId === 'number' ? String(draftId) : (draftId || undefined),
        });
        result.successCount++;
      } catch (error) {
        result.results.push({
          success: false,
          message: `Failed to import property "${row.title}"`,
          errors: [String(error)],
        });
        result.failureCount++;
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to import folder:', error);
    result.results.push({
      success: false,
      message: 'Folder import failed',
      errors: [String(error)],
    });
    result.failureCount++;
    return result;
  }
}

export async function importMultipleFolders(
  folderIds: string[],
  developerId?: string
): Promise<FolderImportResult[]> {
  const results: FolderImportResult[] = [];

  for (const folderId of folderIds) {
    const result = await importPropertyFromFolder(folderId, developerId);
    results.push(result);
  }

  return results;
}
