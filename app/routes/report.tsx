import { Plus, Upload } from "lucide-react";
import { Form, Link, Outlet, useNavigation } from "react-router";

import { getReportsSimple } from "~/.server/db/report";
import { PageLayout } from "~/components/PageLayout";
import { ButtonResponsive } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ReportType } from "~/types/GataReport.type";
import { getRequiredUser } from "~/utils/auth.server";
import { migrateAllReportFilesToBlob } from "~/utils/migrateReportFiles.server";
import { isAdmin } from "~/utils/roleUtils";

import type { Route } from "./+types/report";

export const meta = () => {
   return [{ title: "Aktuelle dokumenter - Gata" }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const [reports] = await Promise.all([getReportsSimple(ReportType.DOCUMENT)]);
   return { reports, loggedInUser };
};

export const action = async ({ request }: Route.ActionArgs) => {
   await getRequiredUser(request);

   const formData = await request.formData();
   const intent = formData.get("intent");

   if (intent === "migrateAllFiles") {
      try {
         const progress = await migrateAllReportFilesToBlob();
         return {
            success: true,
            message: `Migration complete: ${progress.successful} reports migrated successfully, ${progress.failed} failed. Total files: ${progress.totalFiles}`,
            progress,
         };
      } catch (error) {
         console.error("Migration error:", error);
         return {
            success: false,
            message: error instanceof Error ? error.message : "Migration failed with unknown error",
         };
      }
   }

   return { success: false, message: "Unknown intent" };
};

export default function ReportPage({ loaderData: { loggedInUser, reports }, actionData }: Route.ComponentProps) {
   const navigation = useNavigation();
   const isMigrating = navigation.state === "submitting" && navigation.formData?.get("intent") === "migrateAllFiles";

   return (
      <PageLayout>
         <div className="flex justify-between items-center">
            <Typography variant="h1" id="report-page-title">
               Aktuelle dokumenter
            </Typography>
            {isAdmin(loggedInUser) && <ButtonResponsive as={Link} to="new" label="Opprett" icon={<Plus />} />}
         </div>

         {/* Migration Section */}
         <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Typography variant="h3" className="mb-2">
               Admin: File Migration
            </Typography>
            <Typography className="text-sm text-gray-600 mb-3">
               Migrate all report files from Cloudinary and oldReportFiles to Azure Blob Storage. This will update all
               content references to point directly to Azure URLs.
            </Typography>
            <Form method="post">
               <input type="hidden" name="intent" value="migrateAllFiles" />
               <ButtonResponsive
                  as="button"
                  type="submit"
                  label={isMigrating ? "Migrating..." : "Migrate All Files to Azure"}
                  icon={<Upload />}
                  disabled={isMigrating}
               />
            </Form>
            {actionData && (
               <div
                  className={`mt-3 p-3 rounded ${
                     actionData.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
               >
                  <Typography className="font-semibold">{actionData.message}</Typography>
                  {actionData.progress && (
                     <Typography className="text-sm mt-1">
                        Reports processed: {actionData.progress.completed} / {actionData.progress.totalReports}
                     </Typography>
                  )}
               </div>
            )}
         </div>

         <ul aria-labelledby="report-page-title" className="divide-y my-4">
            {reports.map((report) => {
               return (
                  <li key={report.id} className="hover:bg-blue-50">
                     <Link to={`/reportInfo/${report.id}`} className="w-full p-2 block">
                        <Typography variant="largeText">{report.title}</Typography>
                        <Typography className="text-gray-500">{report.description}</Typography>
                     </Link>
                  </li>
               );
            })}
            {reports.length === 0 && <li>Det finnes ingen dokumenter enda!</li>}
         </ul>
         <Outlet />
      </PageLayout>
   );
}
