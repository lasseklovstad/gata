import { db } from "db/config.server";
import { cloudinaryImage, reportFiles } from "db/schema";

export const insertReportFile = async (reportId: string, file: Omit<typeof cloudinaryImage.$inferInsert, "id">) => {
   await db.insert(cloudinaryImage).values(file).returning();
   await db.insert(reportFiles).values({ fileId: file.cloudId, reportId });
};
