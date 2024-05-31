import { AppLoadContext } from "@remix-run/cloudflare";
import { reportFile } from "db/schema";
import { eq, sql } from "drizzle-orm";

export const insertReportFile = async (context: AppLoadContext, values: Omit<typeof reportFile.$inferInsert, "id">) => {
   return await context.db
      .insert(reportFile)
      .values({
         id: sql`gen_random_uuid()`,
         ...values,
      })
      .returning();
};

export const getReportFile = async (context: AppLoadContext, fileId: string) => {
   const [result] = await context.db.select().from(reportFile).where(eq(reportFile.id, fileId));
   if (!result) {
      throw new Error("Could not find image");
   }
   return result;
};
