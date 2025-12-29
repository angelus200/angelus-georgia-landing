/**
 * Cron Jobs for Angelus Management Georgia
 * 
 * This module handles scheduled tasks like daily interest calculations.
 */

import { getWalletsQualifyingForInterest, calculateAndCreditInterest } from "./db";
import { sendInterestCreditEmail } from "./email";

// Track if cron jobs are already running
let cronJobsInitialized = false;

/**
 * Calculate and credit interest for all qualifying wallets
 * This should run daily at midnight
 */
export async function runDailyInterestCalculation(): Promise<{
  walletsProcessed: number;
  credited: number;
  totalAmount: number;
  errors: string[];
}> {
  console.log("[CRON] Starting daily interest calculation...");
  
  const result = {
    walletsProcessed: 0,
    credited: 0,
    totalAmount: 0,
    errors: [] as string[],
  };

  try {
    const wallets = await getWalletsQualifyingForInterest();
    result.walletsProcessed = wallets.length;

    console.log(`[CRON] Found ${wallets.length} wallets qualifying for interest`);

    for (const wallet of wallets) {
      try {
        const interestResult = await calculateAndCreditInterest(wallet.id);
        
        if (interestResult.credited) {
          result.credited++;
          result.totalAmount += interestResult.amount;
          
          // Send email notification
          try {
            await sendInterestCreditEmail(
              wallet.userId,
              interestResult.amount,
              parseFloat(wallet.bonusBalance) + interestResult.amount
            );
          } catch (emailError: any) {
            console.error(`[CRON] Failed to send interest email for wallet ${wallet.id}:`, emailError.message);
          }
        }
      } catch (walletError: any) {
        result.errors.push(`Wallet ${wallet.id}: ${walletError.message}`);
        console.error(`[CRON] Error processing wallet ${wallet.id}:`, walletError.message);
      }
    }

    console.log(`[CRON] Daily interest calculation complete: ${result.credited}/${result.walletsProcessed} wallets credited, total: ${result.totalAmount.toFixed(2)}€`);
  } catch (error: any) {
    console.error("[CRON] Failed to run daily interest calculation:", error.message);
    result.errors.push(`Global error: ${error.message}`);
  }

  return result;
}

/**
 * Initialize cron jobs
 * Uses setInterval for simplicity - in production, consider using node-cron or similar
 */
export function initializeCronJobs(): void {
  if (cronJobsInitialized) {
    console.log("[CRON] Cron jobs already initialized, skipping...");
    return;
  }

  cronJobsInitialized = true;
  console.log("[CRON] Initializing cron jobs...");

  // Calculate time until next midnight
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();

  console.log(`[CRON] First interest calculation scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

  // Schedule first run at midnight
  setTimeout(() => {
    // Run immediately at midnight
    runDailyInterestCalculation();
    
    // Then run every 24 hours
    setInterval(() => {
      runDailyInterestCalculation();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, msUntilMidnight);

  console.log("[CRON] Cron jobs initialized successfully");
}

/**
 * Manual trigger for testing - runs interest calculation immediately
 */
export async function triggerInterestCalculation(): Promise<ReturnType<typeof runDailyInterestCalculation>> {
  console.log("[CRON] Manual interest calculation triggered");
  return runDailyInterestCalculation();
}
