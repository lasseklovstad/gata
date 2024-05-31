ALTER TABLE "gata_role" ADD CONSTRAINT "gata_role_role_name_unique" UNIQUE("role_name");

INSERT INTO
  gata_role (id, NAME, role_name)
VALUES
  (gen_random_uuid (), 'Medlem', 0),
  (gen_random_uuid (), 'Administrator', 1)
ON CONFLICT (role_name) 
DO NOTHING;