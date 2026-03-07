CREATE TABLE `imageAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`problemId` int NOT NULL,
	`userId` int,
	`imageUrl` text NOT NULL,
	`eventType` enum('load','error','retry','success','timeout') NOT NULL,
	`status` enum('pending','loading','success','failed') NOT NULL,
	`errorCode` varchar(50),
	`errorMessage` text,
	`errorType` varchar(100),
	`retryAttempt` int DEFAULT 0,
	`maxRetries` int DEFAULT 3,
	`loadTime` int,
	`fileSize` int,
	`contentType` varchar(100),
	`userAgent` text,
	`networkType` varchar(50),
	`bandwidth` int,
	`httpStatus` int,
	`cacheControl` varchar(255),
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imageAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `imageAnalytics` ADD CONSTRAINT `imageAnalytics_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imageAnalytics` ADD CONSTRAINT `imageAnalytics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;