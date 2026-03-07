CREATE TABLE `problemTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`problemId` int NOT NULL,
	`originalLanguage` varchar(10) NOT NULL,
	`language` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`translatedBy` varchar(50) NOT NULL DEFAULT 'ai',
	`confidence` int,
	`isApproved` int DEFAULT 0,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `problemTranslations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `problems_v2` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`status` enum('submitted','in_progress','resolved','rejected') NOT NULL DEFAULT 'submitted',
	`originalLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`detectedLanguage` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `problems_v2_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `problemTranslations` ADD CONSTRAINT `problemTranslations_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problemTranslations` ADD CONSTRAINT `problemTranslations_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problems_v2` ADD CONSTRAINT `problems_v2_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;