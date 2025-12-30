import puppeteer from "puppeteer";
import { storagePut } from "./storage";

/**
 * Generate PDF from HTML content and upload to S3
 */
export async function generatePdfFromHtml(
  html: string,
  filename: string
): Promise<{ url: string; key: string }> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    // Upload to S3
    const key = `contracts/${filename}`;
    const result = await storagePut(key, pdfBuffer, "application/pdf");

    return {
      url: result.url,
      key: result.key,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate contract PDF and return URL
 */
export async function generateContractPdf(
  contractNumber: string,
  html: string
): Promise<{ url: string; key: string }> {
  const timestamp = Date.now();
  const filename = `vorvertrag-${contractNumber}-${timestamp}.pdf`;
  
  return generatePdfFromHtml(html, filename);
}
