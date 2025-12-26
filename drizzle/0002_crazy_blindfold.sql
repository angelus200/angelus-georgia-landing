CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int,
	`packageIds` text,
	`totalAmount` decimal(15,2) NOT NULL,
	`downPayment` decimal(15,2) NOT NULL,
	`remainingAmount` decimal(15,2) NOT NULL,
	`paymentPlan` enum('full','monthly','quarterly') NOT NULL,
	`installmentMonths` int,
	`status` enum('pending','confirmed','active','completed','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installment_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paidDate` timestamp,
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installment_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`area` decimal(10,2) NOT NULL,
	`bedrooms` int NOT NULL,
	`bathrooms` int NOT NULL,
	`constructionStatus` enum('planning','foundation','structure','finishing','completed') NOT NULL,
	`completionDate` timestamp,
	`images` text NOT NULL,
	`features` text,
	`expectedReturn` decimal(5,2),
	`rentalGuarantee` boolean DEFAULT false,
	`installmentAvailable` boolean DEFAULT true,
	`minDownPayment` decimal(5,2),
	`status` enum('available','reserved','sold') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`type` enum('single','bundle') NOT NULL,
	`services` text NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_packages_id` PRIMARY KEY(`id`)
);
