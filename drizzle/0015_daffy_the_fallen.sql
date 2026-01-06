CREATE TABLE `user_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('user','admin','manager','sales') NOT NULL DEFAULT 'user',
	`token` varchar(255) NOT NULL,
	`invitedBy` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`status` enum('pending','accepted','expired','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','sales') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `invitedBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `invitationToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `invitationTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;