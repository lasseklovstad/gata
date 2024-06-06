CREATE TABLE `gata_contingent` (
	`gata_user_id` text NOT NULL,
	`is_paid` integer NOT NULL,
	`year` integer NOT NULL,
	PRIMARY KEY(`gata_user_id`, `year`),
	FOREIGN KEY (`gata_user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `external_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`picture` text,
	`last_login` text NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `gata_report` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text,
	`created_date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`last_modified_by` text NOT NULL,
	`last_modified_date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`title` text NOT NULL,
	`type` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `gata_report_file` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text,
	`report_id` text NOT NULL,
	`cloud_url` text,
	`cloud_id` text,
	FOREIGN KEY (`report_id`) REFERENCES `gata_report`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `responsibility` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`name` text(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `responsibility_note` (
	`id` text PRIMARY KEY NOT NULL,
	`last_modified_by` text NOT NULL,
	`last_modified_date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`resonsibility_year_id` text NOT NULL,
	FOREIGN KEY (`resonsibility_year_id`) REFERENCES `responsibility_year`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `responsibility_year` (
	`id` text PRIMARY KEY NOT NULL,
	`responsibility_id` text NOT NULL,
	`user_id` text NOT NULL,
	`year` integer NOT NULL,
	FOREIGN KEY (`responsibility_id`) REFERENCES `responsibility`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gata_role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role_name` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gata_user` (
	`id` text PRIMARY KEY NOT NULL,
	`subscribe` integer DEFAULT false NOT NULL,
	`primary_external_user_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gata_user_roles` (
	`users_id` text NOT NULL,
	`roles_id` text NOT NULL,
	FOREIGN KEY (`users_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roles_id`) REFERENCES `gata_role`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `responsibility_note_resonsibility_year_id_unique` ON `responsibility_note` (`resonsibility_year_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `gata_role_role_name_unique` ON `gata_role` (`role_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `gata_user_primary_external_user_id_unique` ON `gata_user` (`primary_external_user_id`);

INSERT INTO gata_role VALUES ('251f5cec-ae94-43a6-9f05-54d602c3b254', 'Administrator', 1);
INSERT INTO gata_role VALUES ('8f7756ea-43dd-45d1-9703-12d9f3fbc23b', 'Medlem', 0);