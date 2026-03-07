ALTER TABLE `reports` ADD `detailedAnalysis` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `safetyConsiderations` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `environmentalImpact` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `affectedStakeholders` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `estimatedRepairCost` varchar(255);--> statement-breakpoint
ALTER TABLE `reports` ADD `recommendedSolution` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `timelineEstimate` varchar(255);--> statement-breakpoint
ALTER TABLE `reports` ADD `relatedIssues` text;