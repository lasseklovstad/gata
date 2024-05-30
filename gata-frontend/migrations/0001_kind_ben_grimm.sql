ALTER TABLE "responsibility_note" DROP CONSTRAINT "uc_responsibility_noteresonsibility_year_id_col";--> statement-breakpoint
ALTER TABLE "external_user" DROP CONSTRAINT "fk_externaluser_on_user";
--> statement-breakpoint
ALTER TABLE "gata_user_roles" DROP CONSTRAINT "fkbpbw3vgnis23w02nf2y0feq2o";
--> statement-breakpoint
ALTER TABLE "gata_user_roles" DROP CONSTRAINT "fkpj6icpdqk25f1p84i0026amgw";
--> statement-breakpoint
ALTER TABLE "responsibility_note" DROP CONSTRAINT "fkid88vcc5vq1ud0b9nosy83c1j";
--> statement-breakpoint
ALTER TABLE "gata_report_file" DROP CONSTRAINT "gata_report_file_report_id_fk";
--> statement-breakpoint
ALTER TABLE "gata_contingent" DROP CONSTRAINT "gata_contingent_gata_user_fk";
--> statement-breakpoint
ALTER TABLE "responsibility_year" DROP CONSTRAINT "fk2lt1fb6j0ymujyfk3gw10swwy";
--> statement-breakpoint
ALTER TABLE "responsibility_year" DROP CONSTRAINT "fkra1mk7fypiiose7ow566634tm";
--> statement-breakpoint
ALTER TABLE "gata_report" DROP CONSTRAINT "fk_gatareport_on_created_by";
--> statement-breakpoint
ALTER TABLE "gata_role" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_role" ALTER COLUMN "role_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility_note" ALTER COLUMN "resonsibility_year_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_contingent" ALTER COLUMN "gata_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility_year" ALTER COLUMN "responsibility_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "responsibility_year" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_report" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gata_contingent" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "gata_contingent" ADD CONSTRAINT "gata_contingent_year_gata_user_id_pk" PRIMARY KEY("year","gata_user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_user" ADD CONSTRAINT "external_user_user_id_gata_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gata_user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_user_roles" ADD CONSTRAINT "gata_user_roles_users_id_gata_user_id_fk" FOREIGN KEY ("users_id") REFERENCES "public"."gata_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_user_roles" ADD CONSTRAINT "gata_user_roles_roles_id_gata_role_id_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."gata_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "responsibility_note" ADD CONSTRAINT "responsibility_note_resonsibility_year_id_responsibility_year_id_fk" FOREIGN KEY ("resonsibility_year_id") REFERENCES "public"."responsibility_year"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_report_file" ADD CONSTRAINT "gata_report_file_report_id_gata_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."gata_report"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_contingent" ADD CONSTRAINT "gata_contingent_gata_user_id_gata_user_id_fk" FOREIGN KEY ("gata_user_id") REFERENCES "public"."gata_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "responsibility_year" ADD CONSTRAINT "responsibility_year_responsibility_id_responsibility_id_fk" FOREIGN KEY ("responsibility_id") REFERENCES "public"."responsibility"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "responsibility_year" ADD CONSTRAINT "responsibility_year_user_id_gata_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gata_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_report" ADD CONSTRAINT "gata_report_created_by_gata_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."gata_user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "responsibility_note" ADD CONSTRAINT "responsibility_note_resonsibility_year_id_unique" UNIQUE("resonsibility_year_id");