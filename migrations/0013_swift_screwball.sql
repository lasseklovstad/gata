ALTER TABLE `cloudinary_image` ADD `is_deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `cloudinary_image` ADD `type` text;