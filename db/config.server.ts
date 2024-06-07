// eslint-disable-next-line import/no-named-as-default
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "~/utils/env.server";

import * as schema from "./schema";

const queryClient = new Database(env.APP_DATABASE_URL);
export const db = drizzle(queryClient, { schema });
