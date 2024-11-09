import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { env } from "~/utils/env.server";

import * as schema from "./schema";

export const db = drizzle({ connection: { source: env.APP_DATABASE_URL }, schema });

migrate(db, { migrationsFolder: "migrations" });
