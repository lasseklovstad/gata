ALTER TABLE "gata_role" ADD CONSTRAINT "gata_role_role_name_unique" UNIQUE("role_name");

-- Insert default rows in table if they do not exist
INSERT INTO
  gata_role (id, NAME, role_name)
VALUES
  (gen_random_uuid (), 'Medlem', 0),
  (gen_random_uuid (), 'Administrator', 1)
ON CONFLICT (role_name) 
DO NOTHING;

-- Update content from hibernate CLOB to text content
UPDATE gata_report
SET
  CONTENT = CONVERT_FROM(
    loread (
      lo_open (CONTENT::INT, x'40000'::INT),
      x'40000'::INT
    ),
    'UTF8'
  );