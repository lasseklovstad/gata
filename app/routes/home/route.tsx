import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getReportsWithContent } from "~/.server/db/report";
import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { useRootLoader } from "~/root";
import { News } from "~/routes/home/News";
import { ReportType } from "~/types/GataReport.type";
import { createAuthenticator } from "~/utils/auth.server";
import { isMember } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const auth = await createAuthenticator(context).authenticator.isAuthenticated(request);
   const loggedInUser = auth?.profile.id
      ? (await getOptionalUserFromExternalUserId(context, auth.profile.id)) ?? undefined
      : undefined;
   return { reports: isMember(loggedInUser) ? await getReportsWithContent(context, ReportType.NEWS) : undefined };
};

export default function Home() {
   const { auth0User, loggedInUser } = useRootLoader();
   const { reports } = useLoaderData<typeof loader>();
   if (auth0User) {
      if (loggedInUser && isMember(loggedInUser) && reports) {
         return <News reports={reports} loggedInUser={loggedInUser} />;
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
