DROP TABLE "databasechangelog";--> statement-breakpoint
DROP TABLE "databasechangeloglock";--> statement-breakpoint
ALTER TABLE "external_user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "external_user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "external_user" ALTER COLUMN "last_login" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "external_user" ALTER COLUMN "last_login" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "external_user" ALTER COLUMN "last_login" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "created_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "created_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "last_modified_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "last_modified_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "last_modified_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report_file" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "gata_report_file" ALTER COLUMN "report_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "last_modified_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "last_modified_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "last_modified_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "text" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility_year" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "responsibility_year" ALTER COLUMN "year" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gata_user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "gata_user" ALTER COLUMN "subscribe" SET DEFAULT false;