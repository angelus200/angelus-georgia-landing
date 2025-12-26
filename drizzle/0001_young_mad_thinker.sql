CREATE TABLE `contact_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	CONSTRAINT `contact_inquiries_id` PRIMARY KEY(`id`)
);
