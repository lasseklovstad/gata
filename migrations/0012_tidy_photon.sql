CREATE TABLE `user_timeline_event` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`event_date` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`place` text,
	`longitude` numeric,
	`latitude` numeric,
	`is_verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_by` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
