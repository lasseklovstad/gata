import { AppLoadContext } from "@remix-run/cloudflare";
import { gataReport } from "db/schema";
import { eq, sql } from "drizzle-orm";
import { ReportType } from "~/types/GataReport.type";
import { ReportSchema } from "~/utils/formSchema";
import { getPrimaryUser } from "~/utils/userUtils";
import { User } from "./user";

export const getReportsSimple = async (context: AppLoadContext, reportType: ReportType) => {
   return await context.db
      .select({ id: gataReport.id, title: gataReport.title, description: gataReport.description })
      .from(gataReport)
      .where(eq(gataReport.type, reportType))
      .limit(50);
};

export const getReportsWithContent = async (context: AppLoadContext, reportType: ReportType) => {
   return await context.db
      .select({
         id: gataReport.id,
         title: gataReport.title,
         description: gataReport.description,
         content: sql<string>`convert_from(loread(lo_open(${gataReport.content}::int, x'40000'::int), x'40000'::int),  'UTF8')`,
         createdBy: gataReport.createdBy,
         lastModifiedDate: gataReport.lastModifiedDate,
      })
      .from(gataReport)
      .where(eq(gataReport.type, reportType))
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
         content: sql<string>`convert_from(loread(lo_open(${gataReport.content}::int, x'40000'::int), x'40000'::int),  'UTF8')`,
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
         id: sql`gen_random_uuid()`,
         ...values,
         type: ReportType[values.type],
         createdBy: loggedInUser.id,
         lastModifiedBy: primaryUser.name,
         lastModifiedDate: sql`now()`,
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
   await context.db.delete(gataReport).where(eq(gataReport.id, reportId));
};
