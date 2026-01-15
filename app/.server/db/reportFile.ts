import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { oldReportFiles, reportFiles, cloudinaryImage } from "db/schema";

export const insertReportFile = async (reportId: string, file: Omit<typeof cloudinaryImage.$inferInsert, "id">) => {
   await db.insert(cloudinaryImage).values(file).returning();
   await db.insert(reportFiles).values({ fileId: file.cloudId, reportId });
};

export const getReportFile = async (fileId: string) => {
   const [result] = await db.select().from(oldReportFiles).where(eq(oldReportFiles.id, fileId));
   return result;
};
