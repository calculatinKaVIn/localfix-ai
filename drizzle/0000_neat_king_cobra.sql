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
CREATE TABLE `problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`status` enum('in_progress','resolved') NOT NULL DEFAULT 'in_progress',
	`resolutionReason` enum('fixed','duplicate','invalid','no_action_needed','other'),
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `problems_id` PRIMARY KEY(`id`)
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
	`status` enum('in_progress','resolved') NOT NULL DEFAULT 'in_progress',
	`originalLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`detectedLanguage` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `problems_v2_id` PRIMARY KEY(`id`)
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
	`detailedAnalysis` text,
	`safetyConsiderations` text,
	`environmentalImpact` text,
	`affectedStakeholders` text,
	`estimatedRepairCost` text,
	`recommendedSolution` text,
	`timelineEstimate` text,
	`relatedIssues` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_problemId_unique` UNIQUE(`problemId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `imageAnalytics` ADD CONSTRAINT `imageAnalytics_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imageAnalytics` ADD CONSTRAINT `imageAnalytics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problemTranslations` ADD CONSTRAINT `problemTranslations_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problemTranslations` ADD CONSTRAINT `problemTranslations_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problems` ADD CONSTRAINT `problems_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problems_v2` ADD CONSTRAINT `problems_v2_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE cascade ON UPDATE no action;