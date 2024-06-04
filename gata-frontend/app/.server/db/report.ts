import { AppLoadContext } from "@remix-run/cloudflare";
import { gataReport, reportFile } from "db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ReportType } from "~/types/GataReport.type";
import { ReportSchema } from "~/utils/formSchema";
import { getPrimaryUser } from "~/utils/userUtils";
import { User } from "./user";
import { deleteImage } from "../services/cloudinaryService";

export const getReportsSimple = async (context: AppLoadContext, reportType: ReportType) => {
   return await context.db
      .select({ id: gataReport.id, title: gataReport.title, description: gataReport.description })
      .from(gataReport)
      .where(eq(gataReport.type, reportType))
      .orderBy(desc(gataReport.createdDate))
      .limit(50);
};

export const getReportsWithContent = async (context: AppLoadContext, reportType: ReportType) => {
   return await context.db
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

export const getReportSimple = async (context: AppLoadContext, reportId: string) => {
   const [result] = await context.db
      .select({
         id: gataReport.id,
         title: gataReport.title,
         description: gataReport.description,
         type: gataReport.type,
      })
      .from(gataReport)
      .where(eq(gataReport.id, reportId))
      .limit(1);
   if (!result) {
      throw new Error("Finner ikke rapport med id " + reportId);
   }
   return { ...result, type: ReportType[result.type] };
};

export const getReport = async (context: AppLoadContext, reportId: string) => {
   const [result] = await context.db
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

   if (!result) {
      throw new Error("Finner ikke rapport med id " + reportId);
   }
   return { ...result, type: ReportType[result.type] };
};

export const insertReport = async (context: AppLoadContext, values: ReportSchema, loggedInUser: User) => {
   const primaryUser = getPrimaryUser(loggedInUser);
   return await context.db
      .insert(gataReport)
      .values({
         ...values,
         type: ReportType[values.type],
         createdBy: loggedInUser.id,
         lastModifiedBy: primaryUser.name,
      })
      .returning({ reportId: gataReport.id });
};

export const updateReport = async (
   context: AppLoadContext,
   reportId: string,
   values: ReportSchema,
   loggedInUser: User
) => {
   const primaryUser = getPrimaryUser(loggedInUser);
   await context.db
      .update(gataReport)
      .set({
         ...values,
         type: ReportType[values.type],
         lastModifiedBy: primaryUser.name,
         lastModifiedDate: sql`now()`,
      })
      .where(eq(gataReport.id, reportId));
};

export const deleteReport = async (context: AppLoadContext, reportId: string) => {
   await context.db.transaction(async (tx) => {
      const reportFiles = await tx.select().from(reportFile).where(eq(reportFile.reportId, reportId));
      await Promise.all(
         reportFiles.map(async (file) => {
            if (!file.cloudId) {
               throw new Error("No cloud id!");
            }
            await deleteImage(context, file.cloudId);
            await tx.delete(reportFile).where(eq(reportFile.id, file.id));
         })
      );
      await tx.delete(gataReport).where(eq(gataReport.id, reportId));
   });
};

export const updateReportContent = async (
   context: AppLoadContext,
   reportId: string,
   content: string,
   loggedInUser: User
) => {
   const primaryUser = getPrimaryUser(loggedInUser);
   await context.db
      .update(gataReport)
      .set({
         content,
         lastModifiedBy: primaryUser.name,
         lastModifiedDate: sql`now()`,
      })
      .where(eq(gataReport.id, reportId));
};
