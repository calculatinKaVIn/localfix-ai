ALTER TABLE `problems` ADD `resolutionReason` enum('fixed','duplicate','invalid','no_action_needed','other');--> statement-breakpoint
ALTER TABLE `problems` ADD `resolvedAt` timestamp;