CREATE TABLE `image_likes` (
	`cloud_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	PRIMARY KEY(`cloud_id`, `user_id`),
	FOREIGN KEY (`cloud_id`) REFERENCES `cloudinary_image`(`cloud_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
