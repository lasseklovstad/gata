import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";

import { getReportsSimple } from "~/.server/db/report";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ReportType } from "~/types/GataReport.type";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);

   const [reports] = await Promise.all([getReportsSimple(context, ReportType.DOCUMENT)]);
   return json({ reports, loggedInUser });
};

export default function ReportPage() {
   const { loggedInUser, reports } = useLoaderData<typeof loader>();
   return (
      <PageLayout>
         <div className="flex justify-between items-center">
            <Typography variant="h1" id="report-page-title">
               Aktuelle dokumenter
            </Typography>
            {isAdmin(loggedInUser) && (
               <Button as={Link} to="new">
                  <Plus className="mr-2" />
                  Opprett
               </Button>
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
