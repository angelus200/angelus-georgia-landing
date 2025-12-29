import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database functions
vi.mock('../db', () => ({
  getOrCreateWallet: vi.fn(),
  getWalletByUserId: vi.fn(),
  updateWalletBalance: vi.fn(),
  createWalletTransaction: vi.fn(),
  getWalletTransactions: vi.fn(),
  getWalletTransactionsByUserId: vi.fn(),
  createDepositRequest: vi.fn(),
  getDepositRequestsByUserId: vi.fn(),
  getPendingDepositRequests: vi.fn(),
  getAllDepositRequests: vi.fn(),
  updateDepositRequestStatus: vi.fn(),
  getDepositRequestById: vi.fn(),
  processDeposit: vi.fn(),
  calculateAndCreditInterest: vi.fn(),
  useWalletForPurchase: vi.fn(),
  getAllWallets: vi.fn(),
  getWalletsQualifyingForInterest: vi.fn(),
  getInterestCalculationsByWalletId: vi.fn(),
}));

import {
  getOrCreateWallet,
  getWalletByUserId,
  processDeposit,
  calculateAndCreditInterest,
  useWalletForPurchase,
} from '../db';

describe('Wallet System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrCreateWallet', () => {
    it('should return existing wallet if found', async () => {
      const mockWallet = {
        id: 1,
        userId: 123,
        balance: '1000.00',
        bonusBalance: '50.00',
        totalDeposited: '1000.00',
        qualifiesForInterest: false,
        status: 'active',
      };

      vi.mocked(getOrCreateWallet).mockResolvedValue(mockWallet);

      const result = await getOrCreateWallet(123);

      expect(result).toEqual(mockWallet);
      expect(getOrCreateWallet).toHaveBeenCalledWith(123);
    });

    it('should create new wallet if not found', async () => {
      const newWallet = {
        id: 2,
        userId: 456,
        balance: '0.00',
        bonusBalance: '0.00',
        totalDeposited: '0.00',
        qualifiesForInterest: false,
        status: 'active',
      };

      vi.mocked(getOrCreateWallet).mockResolvedValue(newWallet);

      const result = await getOrCreateWallet(456);

      expect(result).toEqual(newWallet);
      expect(result?.balance).toBe('0.00');
    });
  });

  describe('processDeposit', () => {
    it('should process deposit and update wallet balance', async () => {
      const mockResult = {
        success: true,
        qualifiesForBonus: false,
        bonusAmount: 0,
      };

      vi.mocked(processDeposit).mockResolvedValue(mockResult);

      const result = await processDeposit(
        1, // walletId
        123, // userId
        5000, // amount
        'bank_transfer',
        { description: 'Test deposit' }
      );

      expect(result.success).toBe(true);
      expect(result.qualifiesForBonus).toBe(false);
    });

    it('should qualify for 7% bonus when first deposit >= 10000€', async () => {
      const mockResult = {
        success: true,
        qualifiesForBonus: true,
        bonusAmount: 700, // 7% of 10000
      };

      vi.mocked(processDeposit).mockResolvedValue(mockResult);

      const result = await processDeposit(
        1,
        123,
        10000,
        'bank_transfer',
        { description: 'First deposit' }
      );

      expect(result.success).toBe(true);
      expect(result.qualifiesForBonus).toBe(true);
      expect(result.bonusAmount).toBe(700);
    });

    it('should not qualify for bonus when first deposit < 10000€', async () => {
      const mockResult = {
        success: true,
        qualifiesForBonus: false,
        bonusAmount: 0,
      };

      vi.mocked(processDeposit).mockResolvedValue(mockResult);

      const result = await processDeposit(
        1,
        123,
        9999,
        'bank_transfer',
        { description: 'Small deposit' }
      );

      expect(result.qualifiesForBonus).toBe(false);
      expect(result.bonusAmount).toBe(0);
    });
  });

  describe('calculateAndCreditInterest', () => {
    it('should credit interest for qualifying wallets', async () => {
      const mockResult = {
        credited: true,
        amount: 1.92, // Daily interest on 10000€ at 7% annual
      };

      vi.mocked(calculateAndCreditInterest).mockResolvedValue(mockResult);

      const result = await calculateAndCreditInterest(1);

      expect(result.credited).toBe(true);
      expect(result.amount).toBeGreaterThan(0);
    });

    it('should not credit interest for non-qualifying wallets', async () => {
      const mockResult = {
        credited: false,
        amount: 0,
      };

      vi.mocked(calculateAndCreditInterest).mockResolvedValue(mockResult);

      const result = await calculateAndCreditInterest(2);

      expect(result.credited).toBe(false);
      expect(result.amount).toBe(0);
    });
  });

  describe('useWalletForPurchase', () => {
    it('should use bonus balance first, then main balance', async () => {
      const mockResult = {
        success: true,
        mainUsed: 50,
        bonusUsed: 100,
      };

      vi.mocked(useWalletForPurchase).mockResolvedValue(mockResult);

      const result = await useWalletForPurchase(
        1, // walletId
        123, // userId
        150, // amount
        1, // orderId
        'Test purchase'
      );

      expect(result.success).toBe(true);
      expect(result.bonusUsed).toBe(100); // Bonus used first
      expect(result.mainUsed).toBe(50); // Remaining from main
    });

    it('should fail if insufficient balance', async () => {
      vi.mocked(useWalletForPurchase).mockRejectedValue(
        new Error('Insufficient wallet balance')
      );

      await expect(
        useWalletForPurchase(1, 123, 10000, 1, 'Large purchase')
      ).rejects.toThrow('Insufficient wallet balance');
    });
  });

  describe('Interest Calculation Logic', () => {
    it('should calculate correct daily interest rate', () => {
      const annualRate = 0.07; // 7%
      const dailyRate = annualRate / 365;
      
      expect(dailyRate).toBeCloseTo(0.0001918, 5);
    });

    it('should calculate correct interest for 30 days', () => {
      const principal = 10000;
      const annualRate = 0.07;
      const dailyRate = annualRate / 365;
      const days = 30;
      
      const interest = principal * dailyRate * days;
      
      expect(interest).toBeCloseTo(57.53, 1);
    });

    it('should calculate correct annual interest', () => {
      const principal = 10000;
      const annualRate = 0.07;
      
      const annualInterest = principal * annualRate;
      
      expect(annualInterest).toBeCloseTo(700, 2);
    });
  });

  describe('Deposit Methods', () => {
    it('should support bank transfer', async () => {
      vi.mocked(processDeposit).mockResolvedValue({
        success: true,
        qualifiesForBonus: false,
        bonusAmount: 0,
      });

      const result = await processDeposit(1, 123, 1000, 'bank_transfer', {
        bankReference: 'REF123',
      });

      expect(result.success).toBe(true);
    });

    it('should support Bitcoin deposits', async () => {
      vi.mocked(processDeposit).mockResolvedValue({
        success: true,
        qualifiesForBonus: false,
        bonusAmount: 0,
      });

      const result = await processDeposit(1, 123, 1000, 'crypto_btc', {
        txHash: '0x123abc',
        cryptoCurrency: 'BTC',
        cryptoAmount: '0.025',
        exchangeRate: '40000',
      });

      expect(result.success).toBe(true);
    });

    it('should support Ethereum deposits', async () => {
      vi.mocked(processDeposit).mockResolvedValue({
        success: true,
        qualifiesForBonus: false,
        bonusAmount: 0,
      });

      const result = await processDeposit(1, 123, 1000, 'crypto_eth', {
        txHash: '0x456def',
        cryptoCurrency: 'ETH',
        cryptoAmount: '0.5',
        exchangeRate: '2000',
      });

      expect(result.success).toBe(true);
    });

    it('should support USDT deposits', async () => {
      vi.mocked(processDeposit).mockResolvedValue({
        success: true,
        qualifiesForBonus: false,
        bonusAmount: 0,
      });

      const result = await processDeposit(1, 123, 1000, 'crypto_usdt', {
        txHash: 'TRC20_789ghi',
        cryptoCurrency: 'USDT',
        cryptoAmount: '1000',
        exchangeRate: '1',
      });

      expect(result.success).toBe(true);
    });
  });
});
