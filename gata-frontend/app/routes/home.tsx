import { Heading, Text } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { client } from "~/old-app/api/client/client";
import { News } from "~/old-app/components/News";
import { PageLayout } from "~/old-app/components/PageLayout";
import { isMember } from "~/old-app/components/useRoles";
import type { IGataReport } from "~/old-app/types/GataReport.type";
import type { IGataUser } from "~/old-app/types/GataUser.type";
import type { Page } from "~/old-app/types/Page.type";
import { authenticator } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
   const auth = await authenticator.isAuthenticated(request);
   if (auth) {
      const loggedInUser = await client<IGataUser>("user/loggedin", {
         signal: request.signal,
         token: auth.accessToken,
      });
      const params = new URL(request.url).searchParams;
      const reportPage = await client<Page<IGataReport>>(`report?page=${params.get("page") || 0}&type=NEWS`, {
         signal: request.signal,
         token: auth.accessToken,
      });
      return json<LoaderData>({ isAuthenticated: true, loggedInUser, reportPage });
   }
   return json({ isAuthenticated: false });
};

export interface LoaderData {
   loggedInUser: IGataUser | undefined;
   reportPage: Page<IGataReport> | undefined;
   isAuthenticated: boolean;
}

export default function Home() {
   const { loggedInUser, reportPage, isAuthenticated } = useLoaderData<typeof loader>();
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
