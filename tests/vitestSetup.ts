import { sql } from "drizzle-orm";
import { beforeEach } from "vitest";

import { db } from "db/config.server";
import { role } from "db/schema";
import { RoleName } from "~/utils/roleUtils";

export const truncateAllTables = () => {
   const query = sql`SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations';
    `;

   const tables = db.all<{ name: string }>(query);
   db.run(`PRAGMA foreign_keys = OFF`);
   for (const table of tables) {
      const truncateQuery = sql.raw(`DELETE FROM ${table.name}`);
      db.run(truncateQuery);
   }
   db.run(`PRAGMA foreign_keys = ON`);
};

beforeEach(async () => {
   truncateAllTables();
   await db.insert(role).values([
      { name: "Medlem", roleName: RoleName.Member },
      { name: "Administrator", roleName: RoleName.Admin },
   ]);
});
