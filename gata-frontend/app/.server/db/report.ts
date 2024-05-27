import { AppLoadContext } from "@remix-run/cloudflare";
import { gataReport, user } from "db/schema";
import { eq, sql } from "drizzle-orm";
import { ReportType } from "~/types/GataReport.type";

export const getReportsSimple = async (context: AppLoadContext) => {
   return await context.db
      .select({ id: gataReport.id, title: gataReport.title, description: gataReport.description })
      .from(gataReport)
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
