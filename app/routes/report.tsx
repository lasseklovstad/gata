import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";

import { getReportsSimple } from "~/.server/db/report";
import { PageLayout } from "~/components/PageLayout";
import { ButtonResponsive } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ReportType } from "~/types/GataReport.type";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);

   const [reports] = await Promise.all([getReportsSimple(ReportType.DOCUMENT)]);
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
            {isAdmin(loggedInUser) && <ButtonResponsive as={Link} to="new" label="Opprett" icon={<Plus />} />}
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
