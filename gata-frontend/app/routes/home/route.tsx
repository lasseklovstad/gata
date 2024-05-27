import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { useRootLoader } from "~/root";
import { News } from "~/routes/home/News";
import type { IGataReport } from "~/types/GataReport.type";
import type { Page } from "~/types/Page.type";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isMember } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const auth = await createAuthenticator(context).authenticator.isAuthenticated(request);
   if (auth) {
      const params = new URL(request.url).searchParams;
      const reportPage = await client<Page<IGataReport>>(`report?page=${params.get("page") || 0}&type=NEWS`, {
         signal: request.signal,
         token: auth.accessToken,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      }).catch((e) => {
         if (e instanceof Response && e.status === 403) return undefined;
         else {
            throw e;
         }
      });
      return json<LoaderData>({ reportPage });
   }
   return json<LoaderData>({ reportPage: undefined });
};

export type LoaderData = {
   reportPage: Page<IGataReport> | undefined;
};

export default function Home() {
   const { auth0User, loggedInUser } = useRootLoader();
   const { reportPage } = useLoaderData<typeof loader>();
   if (auth0User) {
      if (loggedInUser && isMember(loggedInUser) && reportPage) {
         return <News reportPage={reportPage} loggedInUser={loggedInUser} />;
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
