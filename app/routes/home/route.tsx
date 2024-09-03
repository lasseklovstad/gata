import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";

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

   if (!auth) {
      return redirect("/login-totp");
   }

   const loggedInUser = auth.id ? ((await getOptionalUserFromExternalUserId(auth.id)) ?? undefined) : undefined;

   return {
      reports: isMember(loggedInUser) ? await getReportsWithContent(ReportType.NEWS) : undefined,
      events: isMember(loggedInUser) ? await getUpCommingEvents() : undefined,
   };
};

export default function Home() {
   const { auth0User, loggedInUser } = useRootLoader();
   const { reports, events } = useLoaderData<typeof loader>();
   if (auth0User) {
      if (loggedInUser && isMember(loggedInUser) && reports && events) {
         return <News reports={reports} loggedInUser={loggedInUser} events={events} />;
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
