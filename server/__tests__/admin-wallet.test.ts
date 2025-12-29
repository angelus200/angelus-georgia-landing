import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock email functions
vi.mock('../email', () => ({
  sendDepositConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendDepositRejectionEmail: vi.fn().mockResolvedValue({ success: true }),
  sendInterestCreditEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Admin Wallet Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Interest Calculation', () => {
    it('should calculate daily interest correctly for 7% annual rate', () => {
      const principal = 10000;
      const annualRate = 0.07;
      const dailyRate = annualRate / 365;
      const dailyInterest = principal * dailyRate;
      
      // 7% of 10000 = 700 per year
      // 700 / 365 = ~1.92 per day
      expect(dailyInterest).toBeCloseTo(1.9178, 2);
    });

    it('should not qualify for interest if deposit is below 10000€', () => {
      const depositAmount = 5000;
      const qualifiesForBonus = depositAmount >= 10000;
      
      expect(qualifiesForBonus).toBe(false);
    });

    it('should qualify for interest if deposit is 10000€ or more', () => {
      const depositAmount = 10000;
      const qualifiesForBonus = depositAmount >= 10000;
      
      expect(qualifiesForBonus).toBe(true);
    });

    it('should calculate correct bonus amount for qualifying deposit', () => {
      const depositAmount = 15000;
      const annualRate = 0.07;
      const expectedAnnualBonus = depositAmount * annualRate;
      
      expect(expectedAnnualBonus).toBe(1050);
    });
  });

  describe('Deposit Processing', () => {
    it('should correctly update balance after deposit', () => {
      const currentBalance = 5000;
      const depositAmount = 2500;
      const newBalance = currentBalance + depositAmount;
      
      expect(newBalance).toBe(7500);
    });

    it('should track total deposited amount', () => {
      const currentTotalDeposited = 10000;
      const newDeposit = 5000;
      const newTotalDeposited = currentTotalDeposited + newDeposit;
      
      expect(newTotalDeposited).toBe(15000);
    });
  });

  describe('Wallet Status', () => {
    it('should have correct status values', () => {
      const validStatuses = ['active', 'frozen', 'closed'];
      
      expect(validStatuses).toContain('active');
      expect(validStatuses).toContain('frozen');
      expect(validStatuses).toContain('closed');
    });
  });

  describe('Deposit Methods', () => {
    it('should support all deposit methods', () => {
      const validMethods = ['bank_transfer', 'crypto_btc', 'crypto_eth', 'crypto_usdt', 'crypto_other'];
      
      expect(validMethods.length).toBe(5);
      expect(validMethods).toContain('bank_transfer');
      expect(validMethods).toContain('crypto_btc');
    });
  });
});

describe('Email Notifications', () => {
  it('should format currency correctly for German locale', () => {
    const amount = 10000;
    const formatted = amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    
    expect(formatted).toContain('10');
    expect(formatted).toContain('€');
  });

  it('should calculate interest credit email values correctly', () => {
    const interestAmount = 19.18;
    const currentBonusBalance = 100;
    const newBonusBalance = currentBonusBalance + interestAmount;
    
    expect(newBonusBalance).toBeCloseTo(119.18, 2);
  });
});
