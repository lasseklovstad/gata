PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_event_participants` (
	`event_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`is_participating` integer,
	`unsubscribed` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `gata_event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `gata_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_event_participants`("event_id", "user_id", "is_participating", "unsubscribed") SELECT "event_id", "user_id", "is_participating", "unsubscribed" FROM `event_participants`;--> statement-breakpoint
DROP TABLE `event_participants`;--> statement-breakpoint
ALTER TABLE `__new_event_participants` RENAME TO `event_participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;