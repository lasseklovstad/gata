CREATE TABLE `push_subscriptions` (
	`user_id` text NOT NULL,
	`endpoint` text PRIMARY KEY NOT NULL,
	`subscription` blob NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
