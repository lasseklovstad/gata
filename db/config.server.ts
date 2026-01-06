import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

export const db = drizzle({ connection: { source: process.env.APP_DATABASE_URL }, schema });

migrate(db, { migrationsFolder: "migrations" });
