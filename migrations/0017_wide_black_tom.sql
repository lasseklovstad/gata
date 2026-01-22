DROP TABLE `gata_report_file`;--> statement-breakpoint
ALTER TABLE `gata_event` ADD `is_deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `gata_report` ADD `is_deleted` integer DEFAULT false NOT NULL;