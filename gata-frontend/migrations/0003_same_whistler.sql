DROP TABLE "databasechangelog";--> statement-breakpoint
DROP TABLE "databasechangeloglock";--> statement-breakpoint
ALTER TABLE "external_user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "last_modified_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gata_report_file" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "last_modified_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "responsibility_year" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility_year" ALTER COLUMN "year" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gata_user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "gata_user" ALTER COLUMN "subscribe" SET DEFAULT false;