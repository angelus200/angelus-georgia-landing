CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` varchar(500) NOT NULL,
	`thumbnailUrl` varchar(500),
	`category` enum('about_us','properties','georgia','testimonials','projects','other') NOT NULL DEFAULT 'other',
	`duration` int,
	`sortOrder` int DEFAULT 0,
	`featured` boolean DEFAULT false,
	`published` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
