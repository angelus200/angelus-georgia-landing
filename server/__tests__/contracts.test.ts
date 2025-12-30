import { describe, it, expect } from "vitest";
import { generateContractNumber } from "../db";

describe("Contract Number Generation", () => {
  it("should generate a valid contract number format", () => {
    const contractNumber = generateContractNumber();
    
    expect(contractNumber).toBeDefined();
    expect(contractNumber).toMatch(/^AMG-\d{8}-[A-Z0-9]{4}$/);
  });

  it("should generate unique contract numbers", () => {
    const numbers = new Set<string>();
    
    for (let i = 0; i < 10; i++) {
      const num = generateContractNumber();
      expect(numbers.has(num)).toBe(false);
      numbers.add(num);
    }
    
    expect(numbers.size).toBe(10);
  });

  it("should include current date in contract number", () => {
    const contractNumber = generateContractNumber();
    const now = new Date();
    const expectedDatePart = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    
    expect(contractNumber).toContain(expectedDatePart);
  });
});

describe("Contract Template Functions", () => {
  it("should format currency correctly", async () => {
    const { formatCurrency } = await import("../../client/src/lib/contractTemplate");
    
    const result = formatCurrency(1000);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(3);
  });

  it("should format date correctly", async () => {
    const { formatDate } = await import("../../client/src/lib/contractTemplate");
    
    const testDate = "2024-12-30T10:00:00.000Z";
    const formatted = formatDate(testDate);
    
    expect(formatted).toBeDefined();
    expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });

  it("should generate valid HTML contract", async () => {
    const { generateContractHtml } = await import("../../client/src/lib/contractTemplate");
    
    const html = generateContractHtml({
      contractNumber: "AMG-20241230-TEST",
      contractDate: "2024-12-30T10:00:00.000Z",
      buyerFirstName: "Max",
      buyerLastName: "Mustermann",
      buyerEmail: "max@example.com",
      propertyTitle: "Luxus Apartment",
      propertyLocation: "Tiflis Zentrum",
      propertyCity: "Tiflis",
      propertyArea: 100,
      purchasePrice: 200000,
      downPaymentPercent: 40,
      downPaymentAmount: 80000,
      remainingAmount: 120000,
      paymentPlan: "installment",
      installmentMonths: 24,
      monthlyInstallment: 5000,
      withdrawalDeadline: "2025-01-13T10:00:00.000Z",
    });
    
    expect(html).toContain("AMG-20241230-TEST");
    expect(html).toContain("Max Mustermann");
    expect(html).toContain("Luxus Apartment");
    expect(html).toContain("Tiflis");
    expect(html).toContain("Widerrufsrecht");
  });
});
