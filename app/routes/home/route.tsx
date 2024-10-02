import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getUpCommingEvents } from "~/.server/db/gataEvent";
import { getReportsWithContent } from "~/.server/db/report";
import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { useRootLoader } from "~/root";
import { News } from "~/routes/home/News";
import { ReportType } from "~/types/GataReport.type";
import { createAuthenticator } from "~/utils/auth.server";
import { isMember } from "~/utils/roleUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const auth = await createAuthenticator().authenticator.isAuthenticated(request);
   const loggedInUser = auth?.id ? ((await getOptionalUserFromExternalUserId(auth.id)) ?? undefined) : undefined;
   return {
      reports: isMember(loggedInUser) ? await getReportsWithContent(ReportType.NEWS) : undefined,
      events: isMember(loggedInUser) ? await getUpCommingEvents(loggedInUser.id) : undefined,
   };
};

export default function Home() {
   const rootLoaderData = useRootLoader();
   const { reports, events } = useLoaderData<typeof loader>();
   if (rootLoaderData?.auth0User) {
      if (rootLoaderData.loggedInUser && isMember(rootLoaderData.loggedInUser) && reports && events) {
         return <News reports={reports} loggedInUser={rootLoaderData.loggedInUser} events={events} />;
      } else {
         return (
            <PageLayout>
               <Typography variant="h1">Velkommen</Typography>
               <Typography>Du må være medlem for å se nyheter</Typography>
            </PageLayout>
         );
      }
   } else {
      return (
         <PageLayout>
            <Typography variant="h1">Velkommen</Typography>
            <Typography>Logg inn for å se noe</Typography>
         </PageLayout>
      );
   }
}
