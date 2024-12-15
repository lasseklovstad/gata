import { getUpCommingEvents } from "~/.server/db/gataEvent";
import { getReportsWithContent } from "~/.server/db/report";
import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { useRootLoader } from "~/root";
import { News } from "~/routes/home/News";
import { ReportType } from "~/types/GataReport.type";
import { getUserSession } from "~/utils/auth.server";
import { isMember } from "~/utils/roleUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request }: Route.LoaderArgs) => {
   const userSession = await getUserSession(request);
   const loggedInUser = userSession?.id
      ? ((await getOptionalUserFromExternalUserId(userSession.id)) ?? undefined)
      : undefined;
   return {
      reports: isMember(loggedInUser) ? await getReportsWithContent(ReportType.NEWS) : undefined,
      events: loggedInUser && isMember(loggedInUser) ? await getUpCommingEvents(loggedInUser.id) : undefined,
   };
};

export default function Home({ loaderData: { reports, events } }: Route.ComponentProps) {
   const rootLoaderData = useRootLoader();
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
