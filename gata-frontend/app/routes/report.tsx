import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";

import { getUserFromExternalUserId } from "~/.server/db/user";
import { getReportsSimple } from "~/api/report.api";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const { accessToken: token, profile } = await createAuthenticator(context).getRequiredAuth(request);
   const signal = request.signal;

   if (!profile.id) throw new Error("Profile id is required");

   const [loggedInUser, reports] = await Promise.all([
      getUserFromExternalUserId(context, profile.id),
      getReportsSimple({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);
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
            {reports.content.map((report) => {
               return (
                  <li key={report.id} className="hover:bg-blue-50">
                     <Link to={`/reportInfo/${report.id}`} className="w-full p-2 block">
                        <Typography variant="largeText">{report.title}</Typography>
                        <Typography className="text-gray-500">{report.description}</Typography>
                     </Link>
                  </li>
               );
            })}
            {reports.totalElements === 0 && <li>Det finnes ingen dokumenter enda!</li>}
         </ul>
         <Outlet />
      </PageLayout>
   );
}
