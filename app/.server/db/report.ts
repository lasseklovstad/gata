import { desc, eq, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { gataReport, reportFile } from "db/schema";
import { ReportType } from "~/types/GataReport.type";
import type { ReportSchema } from "~/utils/formSchema";

import type { User } from "./user";
import { deleteImage } from "../services/cloudinaryService";

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
   const primaryUser = loggedInUser.primaryUser;
   return await db
      .insert(gataReport)
      .values({
         ...values,
         type: ReportType[values.type],
         createdBy: loggedInUser.id,
         lastModifiedBy: primaryUser.name,
      })
      .returning({ reportId: gataReport.id });
};

export const updateReport = async (reportId: string, values: ReportSchema, loggedInUser: User) => {
   const primaryUser = loggedInUser.primaryUser;
   await db
      .update(gataReport)
      .set({
         ...values,
         type: ReportType[values.type],
         lastModifiedBy: primaryUser.name,
         lastModifiedDate: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(gataReport.id, reportId));
};

export const deleteReport = async (reportId: string) => {
   await db.transaction(async (tx) => {
      const reportFiles = await tx.select().from(reportFile).where(eq(reportFile.reportId, reportId));
      await Promise.all(
         reportFiles.map(async (file) => {
            if (!file.cloudId) {
               throw new Error("No cloud id!");
            }
            await deleteImage(file.cloudId);
            await tx.delete(reportFile).where(eq(reportFile.id, file.id));
         })
      );
      await tx.delete(gataReport).where(eq(gataReport.id, reportId));
   });
};

export const updateReportContent = async (reportId: string, content: string, loggedInUser: User) => {
   const primaryUser = loggedInUser.primaryUser;
   await db
      .update(gataReport)
      .set({
         content,
         lastModifiedBy: primaryUser.name,
         lastModifiedDate: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(gataReport.id, reportId));
};
