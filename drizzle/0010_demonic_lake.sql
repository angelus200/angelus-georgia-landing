CREATE TABLE `customer_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`bonusBalance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`totalDeposited` decimal(15,2) NOT NULL DEFAULT '0.00',
	`qualifiesForInterest` boolean NOT NULL DEFAULT false,
	`lastInterestCalculation` timestamp,
	`firstDepositDate` timestamp,
	`status` enum('active','frozen','closed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_wallets_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `deposit_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`method` enum('bank_transfer','crypto_btc','crypto_eth','crypto_usdt','crypto_other') NOT NULL,
	`cryptoAmount` decimal(20,8),
	`cryptoCurrency` varchar(20),
	`depositAddress` varchar(255),
	`bankAccountId` int,
	`status` enum('pending','awaiting_payment','payment_received','processing','completed','expired','cancelled') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp,
	`notes` text,
	`adminNotes` text,
	`processedBy` int,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deposit_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interest_calculations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`userId` int NOT NULL,
	`principalAmount` decimal(15,2) NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`interestAmount` decimal(15,2) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`daysInPeriod` int NOT NULL,
	`status` enum('calculated','credited','cancelled') NOT NULL DEFAULT 'calculated',
	`transactionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interest_calculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deposit','withdrawal','purchase','refund','interest_credit','bonus_used') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`balanceAfter` decimal(15,2) NOT NULL,
	`bonusBalanceAfter` decimal(15,2),
	`depositMethod` enum('bank_transfer','crypto_btc','crypto_eth','crypto_usdt','crypto_other'),
	`cryptoCurrency` varchar(20),
	`cryptoAmount` decimal(20,8),
	`exchangeRate` decimal(20,8),
	`txHash` varchar(255),
	`bankReference` varchar(255),
	`orderId` int,
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`description` text,
	`adminNotes` text,
	`processedBy` int,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
