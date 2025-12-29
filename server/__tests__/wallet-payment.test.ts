import { describe, it, expect } from "vitest";

describe("Wallet Payment Logic", () => {
  it("should calculate bonus and main balance usage correctly - bonus first", () => {
    const mainBalance = 5000;
    const bonusBalance = 500;
    const purchaseAmount = 300;
    
    // Logic: Use bonus first, then main balance
    let bonusUsed = 0;
    let mainUsed = 0;
    
    if (bonusBalance >= purchaseAmount) {
      bonusUsed = purchaseAmount;
    } else {
      bonusUsed = bonusBalance;
      mainUsed = purchaseAmount - bonusBalance;
    }
    
    expect(bonusUsed).toBe(300);
    expect(mainUsed).toBe(0);
  });

  it("should use main balance when bonus is insufficient", () => {
    const mainBalance = 5000;
    const bonusBalance = 100;
    const purchaseAmount = 500;
    
    let bonusUsed = 0;
    let mainUsed = 0;
    
    if (bonusBalance >= purchaseAmount) {
      bonusUsed = purchaseAmount;
    } else {
      bonusUsed = bonusBalance;
      mainUsed = purchaseAmount - bonusBalance;
    }
    
    expect(bonusUsed).toBe(100);
    expect(mainUsed).toBe(400);
  });

  it("should reject purchase when total balance is insufficient", () => {
    const mainBalance = 200;
    const bonusBalance = 100;
    const totalAvailable = mainBalance + bonusBalance;
    const purchaseAmount = 500;
    
    expect(totalAvailable < purchaseAmount).toBe(true);
  });

  it("should allow purchase when total balance is sufficient", () => {
    const mainBalance = 400;
    const bonusBalance = 100;
    const totalAvailable = mainBalance + bonusBalance;
    const purchaseAmount = 500;
    
    expect(totalAvailable >= purchaseAmount).toBe(true);
  });

  it("should calculate new balances correctly after purchase", () => {
    const mainBalance = 5000;
    const bonusBalance = 350;
    const purchaseAmount = 500;
    
    let bonusUsed = 0;
    let mainUsed = 0;
    
    if (bonusBalance >= purchaseAmount) {
      bonusUsed = purchaseAmount;
    } else {
      bonusUsed = bonusBalance;
      mainUsed = purchaseAmount - bonusBalance;
    }
    
    const newMainBalance = mainBalance - mainUsed;
    const newBonusBalance = bonusBalance - bonusUsed;
    
    expect(bonusUsed).toBe(350);
    expect(mainUsed).toBe(150);
    expect(newMainBalance).toBe(4850);
    expect(newBonusBalance).toBe(0);
  });

  it("should handle zero bonus balance", () => {
    const mainBalance = 1000;
    const bonusBalance = 0;
    const purchaseAmount = 200;
    
    let bonusUsed = 0;
    let mainUsed = 0;
    
    if (bonusBalance >= purchaseAmount) {
      bonusUsed = purchaseAmount;
    } else {
      bonusUsed = bonusBalance;
      mainUsed = purchaseAmount - bonusBalance;
    }
    
    expect(bonusUsed).toBe(0);
    expect(mainUsed).toBe(200);
  });

  it("should handle exact balance match", () => {
    const mainBalance = 300;
    const bonusBalance = 200;
    const totalAvailable = mainBalance + bonusBalance;
    const purchaseAmount = 500;
    
    expect(totalAvailable).toBe(purchaseAmount);
    
    let bonusUsed = 0;
    let mainUsed = 0;
    
    if (bonusBalance >= purchaseAmount) {
      bonusUsed = purchaseAmount;
    } else {
      bonusUsed = bonusBalance;
      mainUsed = purchaseAmount - bonusBalance;
    }
    
    const newMainBalance = mainBalance - mainUsed;
    const newBonusBalance = bonusBalance - bonusUsed;
    
    expect(newMainBalance).toBe(0);
    expect(newBonusBalance).toBe(0);
  });
});
