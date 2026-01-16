import { desc, eq, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { gataReport, oldReportFiles, cloudinaryImage, reportFiles } from "db/schema";
import { ReportType } from "~/types/GataReport.type";
import type { ReportSchema } from "~/utils/formSchema";

import type { User } from "./user";

export const getReportsSimple = async (reportType: ReportType) => {
   return await db
      .select({ id: gataReport.id, title: gataReport.title, description: gataReport.description })
      .from(gataReport)
      .where(eq(gataReport.type, reportType))
      .orderBy(desc(gataReport.createdDate))
      .limit(50);
};

export const getReportsWithContent = async (reportType: ReportType) => {
   return await db
      .select({
         id: gataReport.id,
         title: gataReport.title,
         description: gataReport.description,
         content: gataReport.content,
         createdBy: gataReport.createdBy,
         lastModifiedDate: gataReport.lastModifiedDate,
      })
      .from(gataReport)
      .where(eq(gataReport.type, reportType))
      .orderBy(desc(gataReport.createdDate))
      .limit(50);
};

export const getReportSimple = async (reportId: string) => {
   const [result] = await db
      .select({
         id: gataReport.id,
         title: gataReport.title,
         description: gataReport.description,
         type: gataReport.type,
      })
      .from(gataReport)
      .where(eq(gataReport.id, reportId))
      .limit(1);
   return { ...result, type: ReportType[result.type] };
};

export const getReport = async (reportId: string) => {
   const [result] = await db
      .select({
         id: gataReport.id,
         title: gataReport.title,
         description: gataReport.description,
         lastModifiedBy: gataReport.lastModifiedBy,
         content: gataReport.content,
         lastModifiedDate: gataReport.lastModifiedDate,
         createdBy: gataReport.createdBy,
         type: gataReport.type,
      })
      .from(gataReport)
      .where(eq(gataReport.id, reportId))
      .limit(1);
   return { ...result, type: ReportType[result.type] };
};

export const insertReport = async (values: ReportSchema, loggedInUser: User) => {
   return await db
      .insert(gataReport)
      .values({
         ...values,
         type: ReportType[values.type],
         createdBy: loggedInUser.id,
         lastModifiedBy: loggedInUser.name,
      })
      .returning();
};

export const updateReport = async (reportId: string, values: ReportSchema, loggedInUser: User) => {
   await db
      .update(gataReport)
      .set({
         ...values,
         type: ReportType[values.type],
         lastModifiedBy: loggedInUser.name,
         lastModifiedDate: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(gataReport.id, reportId));
};

export const deleteReport = async (reportId: string) => {
   const reportFiles = await db.select().from(oldReportFiles).where(eq(oldReportFiles.reportId, reportId));
   await Promise.all(
      reportFiles.map(async (file) => {
         if (!file.cloudId) {
            throw new Error("No cloud id!");
         }
         await db.delete(oldReportFiles).where(eq(oldReportFiles.id, file.id));
      })
   );
   await db.delete(gataReport).where(eq(gataReport.id, reportId));
};

export const updateReportContent = async (reportId: string, content: string, loggedInUser: User) => {
   await db
      .update(gataReport)
      .set({
         content,
         lastModifiedBy: loggedInUser.name,
         lastModifiedDate: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(gataReport.id, reportId));
};

export const getAllReportsWithOldFiles = async () => {
   const reports = await db
      .select({
         id: gataReport.id,
         content: gataReport.content,
      })
      .from(gataReport);

   const reportsWithFiles = await Promise.all(
      reports.map(async (report) => {
         const files = await db.select().from(oldReportFiles).where(eq(oldReportFiles.reportId, report.id));
         return { ...report, oldFiles: files };
      })
   );

   return reportsWithFiles.filter((report) => report.oldFiles.length > 0);
};

export const batchInsertCloudImages = async (images: Array<typeof cloudinaryImage.$inferInsert>) => {
   if (images.length === 0) return;
   await db.insert(cloudinaryImage).values(images);
};

export const batchInsertReportFiles = async (reportFileRecords: Array<{ reportId: string; fileId: string }>) => {
   if (reportFileRecords.length === 0) return;
   await db.insert(reportFiles).values(reportFileRecords);
};

export const updateReportContentOnly = async (reportId: string, content: string) => {
   await db.update(gataReport).set({ content }).where(eq(gataReport.id, reportId));
};
