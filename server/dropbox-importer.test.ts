import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { importFromDropboxFolder } from "./dropbox-importer";
import fs from "fs";
import path from "path";

describe("Dropbox Importer", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join("/tmp", `test-dropbox-${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should return error for invalid Dropbox link", async () => {
    const result = await importFromDropboxFolder(
      "https://invalid-link.com",
      undefined
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("Error");
    expect(result.draftIds).toHaveLength(0);
  });

  it("should handle missing CSV files gracefully", async () => {
    const result = await importFromDropboxFolder(
      "https://www.dropbox.com/sh/invalid?dl=0",
      undefined
    );

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }, 30000);

  it("should parse CSV headers correctly", () => {
    // Helper function test
    const parseCSVLine = (line: string): string[] => {
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
    };

    const line = 'title,description,"location, city",price';
    const result = parseCSVLine(line);

    expect(result).toEqual(["title", "description", "location, city", "price"]);
  });

  it("should handle semicolon-separated CSV", () => {
    const parseCSVLine = (line: string): string[] => {
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
    };

    const line = "title;description;location;price";
    const result = parseCSVLine(line);

    expect(result).toEqual(["title", "description", "location", "price"]);
  });

  it("should validate Dropbox URL format", () => {
    const isValidDropboxUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        return (
          urlObj.hostname.includes("dropbox.com") &&
          (urlObj.pathname.includes("/sh/") || urlObj.pathname.includes("/l/"))
        );
      } catch {
        return false;
      }
    };

    expect(isValidDropboxUrl("https://www.dropbox.com/sh/abc123?dl=0")).toBe(
      true
    );
    expect(isValidDropboxUrl("https://www.dropbox.com/l/abc123")).toBe(true);
    expect(isValidDropboxUrl("https://invalid.com/file")).toBe(false);
  });

  it("should convert Dropbox share link to download URL", () => {
    const getDropboxDownloadUrl = (shareLink: string): string => {
      return shareLink.replace("?dl=0", "?dl=1").replace("?dl=1", "?dl=1");
    };

    const shareLink = "https://www.dropbox.com/sh/abc123?dl=0";
    const downloadUrl = getDropboxDownloadUrl(shareLink);

    expect(downloadUrl).toBe("https://www.dropbox.com/sh/abc123?dl=1");
  });

  it("should handle property data extraction", () => {
    const extractPropertyData = (row: any) => {
      return {
        title: row.title || row.name || row.property_name || "",
        description: row.description || row.desc || "",
        location: row.location || row.address || "",
        city: row.city || row.stadt || "",
        price: row.price || row.preis || row.selling_price || "",
        area: row.area || row.fläche || row.sqm || "",
        bedrooms: parseInt(row.bedrooms || row.zimmer || "0"),
        bathrooms: parseInt(row.bathrooms || row.bäder || "0"),
        propertyType: row.property_type || row.type || "apartment",
        constructionStatus: row.construction_status || row.status || "planning",
      };
    };

    const row = {
      title: "Luxury Apartment",
      description: "Beautiful apartment",
      location: "Batumi",
      city: "Batumi",
      price: "150000",
      area: "120",
      bedrooms: 3,
      bathrooms: 2,
      property_type: "apartment",
      construction_status: "completed",
    };

    const extracted = extractPropertyData(row);

    expect(extracted.title).toBe("Luxury Apartment");
    expect(extracted.bedrooms).toBe(3);
    expect(extracted.bathrooms).toBe(2);
    expect(extracted.propertyType).toBe("apartment");
  });

  it("should handle German column names", () => {
    const extractPropertyData = (row: any) => {
      return {
        title: row.titel || row.name || "",
        bedrooms: parseInt(row.zimmer || "0"),
        bathrooms: parseInt(row.bäder || "0"),
        city: row.stadt || "",
        area: row.fläche || "",
      };
    };

    const row = {
      titel: "Luxus Wohnung",
      zimmer: "3",
      bäder: "2",
      stadt: "Batumi",
      fläche: "120",
    };

    const extracted = extractPropertyData(row);

    expect(extracted.title).toBe("Luxus Wohnung");
    expect(extracted.bedrooms).toBe(3);
    expect(extracted.bathrooms).toBe(2);
    expect(extracted.city).toBe("Batumi");
  });

  it("should return proper error structure", async () => {
    const result = await importFromDropboxFolder(
      "https://www.dropbox.com/sh/invalid?dl=0",
      undefined
    );

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("draftIds");
    expect(result).toHaveProperty("errors");
    expect(Array.isArray(result.draftIds)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
