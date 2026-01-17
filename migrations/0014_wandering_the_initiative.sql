PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_event_cloudinary_images` (
	`event_id` integer NOT NULL,
	`cloudinary_cloud_id` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `gata_event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cloudinary_cloud_id`) REFERENCES `cloudinary_image`(`cloud_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_event_cloudinary_images`("event_id", "cloudinary_cloud_id") SELECT "event_id", "cloudinary_cloud_id" FROM `event_cloudinary_images`;--> statement-breakpoint
DROP TABLE `event_cloudinary_images`;--> statement-breakpoint
ALTER TABLE `__new_event_cloudinary_images` RENAME TO `event_cloudinary_images`;--> statement-breakpoint
PRAGMA foreign_keys=ON;