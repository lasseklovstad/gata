-- Step 1: Add the new column without the NOT NULL constraint
ALTER TABLE "gata_user"
ADD COLUMN "primary_external_user_id" VARCHAR(255);

-- Step 2: Update the new column with the appropriate values
UPDATE gata_user gu
SET primary_external_user_id = (
    SELECT eu.id
    FROM external_user eu
    WHERE eu.user_id = gu.id
      AND eu.primary_user = TRUE
);

-- Step 3: Add the NOT NULL constraint to the column
ALTER TABLE "gata_user"
ALTER COLUMN "primary_external_user_id" SET NOT NULL;

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gata_user" ADD CONSTRAINT "gata_user_primary_external_user_id_external_user_id_fk" FOREIGN KEY ("primary_external_user_id") REFERENCES "public"."external_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;




--> statement-breakpoint
ALTER TABLE "external_user" DROP COLUMN IF EXISTS "primary_user";--> statement-breakpoint
ALTER TABLE "gata_user" ADD CONSTRAINT "gata_user_primary_external_user_id_unique" UNIQUE("primary_external_user_id");