import { Heading, Text } from "@chakra-ui/react";
import { json, LoaderFunction, useLoaderData } from "react-router-dom";

import { client } from "../api/client/client";
import { getAccessToken, getIsAuthenticated } from "../auth0Client";
import { News } from "../components/News";
import { PageLayout } from "../components/PageLayout";
import { isMember } from "../components/useRoles";
import { IGataReport } from "../types/GataReport.type";
import { IGataUser } from "../types/GataUser.type";
import { Page } from "../types/Page.type";

export const homeLoader: LoaderFunction = async ({ request: { signal, url } }) => {
   const isAuthenticated = await getIsAuthenticated();

   try {
      const token = await getAccessToken();
      const loggedInUser = await client<IGataUser>("user/loggedin", { signal, token });
      const params = new URL(url).searchParams;
      const reportPage = await client<Page<IGataReport>>(`report?page=${params.get("page") || 0}&type=NEWS`, {
         signal,
         token,
      });
      return json<HomeLoaderData>({ isAuthenticated, loggedInUser, reportPage });
   } catch (e) {
      return json({ isAuthenticated });
   }
};

interface HomeLoaderData {
   loggedInUser: IGataUser | undefined;
   reportPage: Page<IGataReport> | undefined;
   isAuthenticated: boolean;
}

export const Home = () => {
   const { loggedInUser, reportPage, isAuthenticated } = useLoaderData() as HomeLoaderData;
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
};
