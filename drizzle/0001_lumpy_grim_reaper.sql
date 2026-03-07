CREATE TABLE `problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` enum('submitted','in_progress','resolved','rejected') NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`problemId` int NOT NULL,
	`classification` enum('pothole','streetlight','trash','graffiti','sidewalk','water_damage','vegetation','other') NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL,
	`department` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`riskLevel` varchar(50) NOT NULL,
	`affectedArea` varchar(255) NOT NULL,
	`suggestedUrgency` varchar(255) NOT NULL,
	`impactScore` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_problemId_unique` UNIQUE(`problemId`)
);
--> statement-breakpoint
ALTER TABLE `problems` ADD CONSTRAINT `problems_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE cascade ON UPDATE no action;