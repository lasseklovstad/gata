import { Heading, Text } from "@chakra-ui/react";
import { LoaderFunctionArgs, SerializeFrom, json } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";

import { News } from "~/old-app/components/News";
import { PageLayout } from "~/old-app/components/PageLayout";
import { isMember } from "~/old-app/components/useRoles";
import type { IGataReport } from "~/old-app/types/GataReport.type";
import type { Page } from "~/old-app/types/Page.type";
import { loader as rootLoader } from "~/root";
import { authenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const auth = await authenticator.isAuthenticated(request);
   if (auth) {
      const params = new URL(request.url).searchParams;
      const reportPage = await client<Page<IGataReport>>(`report?page=${params.get("page") || 0}&type=NEWS`, {
         signal: request.signal,
         token: auth.accessToken,
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
   const { loggedInUser, isAuthenticated } = useRouteLoaderData("root") as SerializeFrom<typeof rootLoader>;
   const { reportPage } = useLoaderData<typeof loader>();
   if (isAuthenticated) {
      if (loggedInUser && isMember(loggedInUser) && reportPage) {
         return <News reportPage={reportPage} loggedInUser={loggedInUser} />;
      } else {
         return (
            <PageLayout>
               <Heading as="h1">Velkommen</Heading>
               <Text>Du må være medlem for å se nyheter</Text>
            </PageLayout>
         );
      }
   } else {
      return (
         <PageLayout>
            <Heading as="h1">Velkommen</Heading>
            <Text>Logg inn for å se noe</Text>
         </PageLayout>
      );
   }
}
