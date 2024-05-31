-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE IF NOT EXISTS "external_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"picture" varchar(500),
	"last_login" varchar(255),
	"user_id" uuid,
	"primary_user" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gata_role" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"role_name" smallint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gata_user_roles" (
	"users_id" uuid NOT NULL,
	"roles_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "responsibility_note" (
	"id" uuid PRIMARY KEY NOT NULL,
	"last_modified_by" varchar(255),
	"last_modified_date" timestamp,
	"text" text,
	"resonsibility_year_id" uuid,
	CONSTRAINT "uc_responsibility_noteresonsibility_year_id_col" UNIQUE("resonsibility_year_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "responsibility" (
	"id" uuid PRIMARY KEY NOT NULL,
	"description" varchar(255),
	"name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gata_report_file" (
	"id" uuid PRIMARY KEY NOT NULL,
	"data" text,
	"report_id" uuid,
	"cloud_url" varchar(255),
	"cloud_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gata_contingent" (
	"id" uuid PRIMARY KEY NOT NULL,
	"gata_user_id" uuid,
	"is_paid" boolean NOT NULL,
	"year" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "responsibility_year" (
	"id" uuid PRIMARY KEY NOT NULL,
	"responsibility_id" uuid,
	"user_id" uuid,
	"year" smallint DEFAULT 2022 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "databasechangeloglock" (
	"id" integer PRIMARY KEY NOT NULL,
	"locked" boolean NOT NULL,
	"lockgranted" timestamp,
	"lockedby" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "databasechangelog" (
	"id" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"dateexecuted" timestamp NOT NULL,
	"orderexecuted" integer NOT NULL,
	"exectype" varchar(10) NOT NULL,
	"md5sum" varchar(35),
	"description" varchar(255),
	"comments" varchar(255),
	"tag" varchar(255),
	"liquibase" varchar(20),
	"contexts" varchar(255),
	"labels" varchar(255),
	"deployment_id" varchar(10)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gata_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subscribe" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gata_report" (
	"id" uuid PRIMARY KEY NOT NULL,
	"content" text,
	"created_date" timestamp,
	"description" varchar(255),
	"last_modified_by" varchar(255),
	"last_modified_date" timestamp,
	"title" varchar(255),
	"type" integer,
	"created_by" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_user" ADD CONSTRAINT "fk_externaluser_on_user" FOREIGN KEY ("user_id") REFERENCES "public"."gata_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_user_roles" ADD CONSTRAINT "fkbpbw3vgnis23w02nf2y0feq2o" FOREIGN KEY ("users_id") REFERENCES "public"."gata_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_user_roles" ADD CONSTRAINT "fkpj6icpdqk25f1p84i0026amgw" FOREIGN KEY ("roles_id") REFERENCES "public"."gata_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "responsibility_note" ADD CONSTRAINT "fkid88vcc5vq1ud0b9nosy83c1j" FOREIGN KEY ("resonsibility_year_id") REFERENCES "public"."responsibility_year"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_report_file" ADD CONSTRAINT "gata_report_file_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."gata_report"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_contingent" ADD CONSTRAINT "gata_contingent_gata_user_fk" FOREIGN KEY ("gata_user_id") REFERENCES "public"."gata_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "responsibility_year" ADD CONSTRAINT "fk2lt1fb6j0ymujyfk3gw10swwy" FOREIGN KEY ("user_id") REFERENCES "public"."gata_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "responsibility_year" ADD CONSTRAINT "fkra1mk7fypiiose7ow566634tm" FOREIGN KEY ("responsibility_id") REFERENCES "public"."responsibility"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_report" ADD CONSTRAINT "fk_gatareport_on_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."gata_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;