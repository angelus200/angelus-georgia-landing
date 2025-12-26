ALTER TABLE `users` ADD `firstName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `street` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `postalCode` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `idDocumentType` enum('passport','id_card','drivers_license');--> statement-breakpoint
ALTER TABLE `users` ADD `idDocumentNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `profileComplete` boolean DEFAULT false NOT NULL;