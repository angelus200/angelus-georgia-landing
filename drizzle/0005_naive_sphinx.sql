CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`iban` varchar(50),
	`swift` varchar(20),
	`accountNumber` varchar(50),
	`routingNumber` varchar(50),
	`currency` varchar(10) DEFAULT 'EUR',
	`country` varchar(100),
	`address` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`isPrimary` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`itemType` enum('property','service','package') NOT NULL,
	`propertyId` int,
	`serviceId` int,
	`packageId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(15,2) NOT NULL,
	`options` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(255),
	`status` enum('active','converted','abandoned') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crypto_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`currency` enum('BTC','ETH','USDT_ERC20','USDT_TRC20') NOT NULL,
	`address` varchar(255) NOT NULL,
	`label` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crypto_wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`baseCurrency` varchar(10) NOT NULL,
	`targetCurrency` varchar(10) NOT NULL,
	`rate` decimal(20,8) NOT NULL,
	`source` varchar(100),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exchange_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`itemType` enum('property','service','package') NOT NULL,
	`propertyId` int,
	`serviceId` int,
	`packageId` int,
	`itemName` varchar(255) NOT NULL,
	`itemDescription` text,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(15,2) NOT NULL,
	`totalPrice` decimal(15,2) NOT NULL,
	`options` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`totalAmount` decimal(15,2) NOT NULL,
	`currencyAmount` decimal(20,8),
	`currency` varchar(10) DEFAULT 'EUR',
	`cryptoCurrency` varchar(20),
	`exchangeRate` decimal(20,8),
	`status` enum('pending','awaiting_payment','payment_received','processing','completed','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('crypto_btc','crypto_eth','crypto_usdt','bank_transfer','card'),
	`paymentDetails` text,
	`billingAddress` text,
	`notes` text,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`transactionRef` varchar(255) NOT NULL,
	`type` enum('payment','refund','partial_payment') NOT NULL DEFAULT 'payment',
	`method` enum('crypto_btc','crypto_eth','crypto_usdt','bank_transfer','card') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`cryptoAmount` decimal(20,8),
	`cryptoCurrency` varchar(20),
	`txHash` varchar(255),
	`walletAddress` varchar(255),
	`bankReference` varchar(255),
	`status` enum('pending','confirming','confirmed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`confirmations` int DEFAULT 0,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`confirmedAt` timestamp,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_transactions_transactionRef_unique` UNIQUE(`transactionRef`)
);
--> statement-breakpoint
CREATE TABLE `property_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`type` enum('image','video','document') NOT NULL,
	`url` varchar(500) NOT NULL,
	`s3Key` varchar(500),
	`title` varchar(255),
	`description` text,
	`sortOrder` int DEFAULT 0,
	`isPrimary` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`longDescription` text,
	`category` enum('company_formation','rental_guarantee','property_management','legal','tax','other') NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`priceType` enum('fixed','monthly','yearly','percentage','custom') DEFAULT 'fixed',
	`percentageRate` decimal(5,2),
	`durationMonths` int,
	`includedItems` text,
	`requirements` text,
	`processingTimeDays` int,
	`icon` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`isStandalone` boolean DEFAULT true,
	`isAddon` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `properties` ADD `longDescription` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `properties` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `properties` ADD `pricePerSqm` decimal(10,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `yearBuilt` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `propertyType` enum('apartment','house','villa','commercial','land') DEFAULT 'apartment';--> statement-breakpoint
ALTER TABLE `properties` ADD `mainImage` varchar(500);--> statement-breakpoint
ALTER TABLE `properties` ADD `videos` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `virtualTourUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `properties` ADD `amenities` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `rentalGuaranteePercent` decimal(5,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `rentalGuaranteeDuration` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `maxInstallmentMonths` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `installmentInterestRate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `isFeatured` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `properties` ADD `viewCount` int DEFAULT 0;