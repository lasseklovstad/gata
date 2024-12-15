import { Plus } from "lucide-react";
import { Link, Outlet } from "react-router";

import { getReportsSimple } from "~/.server/db/report";
import { PageLayout } from "~/components/PageLayout";
import { ButtonResponsive } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ReportType } from "~/types/GataReport.type";
import { getRequiredUser } from "~/utils/auth.server";
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

export default function ReportPage({ loaderData: { loggedInUser, reports } }: Route.ComponentProps) {
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
