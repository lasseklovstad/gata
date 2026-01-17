CREATE TABLE `report_files` (
	`report_id` text NOT NULL,
	`file_id` text NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `gata_report`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_id`) REFERENCES `cloudinary_image`(`cloud_id`) ON UPDATE cascade ON DELETE cascade
);
