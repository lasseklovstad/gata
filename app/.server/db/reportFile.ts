import { AppLoadContext } from "@remix-run/node";
import { db } from "db/config.server";
import { reportFile } from "db/schema";
import { eq } from "drizzle-orm";

export const insertReportFile = async (context: AppLoadContext, values: Omit<typeof reportFile.$inferInsert, "id">) => {
   return await db.insert(reportFile).values(values).returning();
};

export const getReportFile = async (context: AppLoadContext, fileId: string) => {
   const [result] = await db.select().from(reportFile).where(eq(reportFile.id, fileId));
   if (!result) {
      throw new Error("Could not find image");
   }
   return result;
};
