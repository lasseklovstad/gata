import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { reportFile } from "db/schema";

export const insertReportFile = async (values: Omit<typeof reportFile.$inferInsert, "id">) => {
   return await db.insert(reportFile).values(values).returning();
};

export const getReportFile = async (fileId: string) => {
   const [result] = await db.select().from(reportFile).where(eq(reportFile.id, fileId));
   return result;
};
