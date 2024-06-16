CREATE TABLE `cloudinary_image` (
	`cloud_url` text NOT NULL,
	`cloud_id` text PRIMARY KEY NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_cloudinary_images` (
	`event_id` integer NOT NULL,
	`cloudinary_cloud_id` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `gata_event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cloudinary_cloud_id`) REFERENCES `cloudinary_image`(`cloud_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_organizer` (
	`event_id` integer NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `gata_event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_polls` (
	`event_id` integer NOT NULL,
	`poll_id` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `gata_event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poll_id`) REFERENCES `poll`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gata_event` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`start_date` text,
	`start_time` text,
	`created_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `poll` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`can_select_multiple` integer NOT NULL,
	`can_add_suggestions` integer NOT NULL,
	`is_anonymous` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `poll_option` (
	`id` integer PRIMARY KEY NOT NULL,
	`text_option` text NOT NULL,
	`poll_id` integer NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `poll`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `poll_vote` (
	`id` integer PRIMARY KEY NOT NULL,
	`poll_id` integer NOT NULL,
	`poll_option_id` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `poll`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poll_option_id`) REFERENCES `poll_option`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
