ALTER TABLE `gata_user` ADD `name` text NOT NULL DEFAULT '/no-profile.jpg';--> statement-breakpoint
ALTER TABLE `gata_user` ADD `picture` text NOT NULL DEFAULT '/no-profile.jpg';--> statement-breakpoint

UPDATE gata_user
SET name = (
    SELECT eu.name
    FROM external_user eu
    WHERE eu.id = gata_user.primary_external_user_id
);--> statement-breakpoint

UPDATE gata_user
SET picture = (
    SELECT eu.picture
    FROM external_user eu
    WHERE eu.id = gata_user.primary_external_user_id
);