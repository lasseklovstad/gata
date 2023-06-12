import { json, type LoaderFunction, type V2_MetaFunction } from "@remix-run/node";
import {
   Links,
   LiveReload,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   useLoaderData,
   useNavigation,
} from "@remix-run/react";
import { authenticator } from "./utils/auth.server";
import { IGataUser } from "./old-app/types/GataUser.type";
import { client } from "./old-app/api/client/client";
import { Progress, Container, Box, Text } from "@chakra-ui/react";
import { ResponsiveAppBar } from "./old-app/components/ResponsiveAppBar";
import { Auth0Profile } from "remix-auth-auth0";

export const meta: V2_MetaFunction = () => {
   return [{ title: "Gata" }];
};

export default function App() {
   return (
      <html lang="no">
         <head>
            <meta charSet="utf-8" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta name="description" content="Nettside for gata" />
            <link rel="apple-touch-icon" href="/logo192.png" />
            <link rel="manifest" href="/manifest.json" />
            <Meta />
            <Links />
         </head>
         <body>
            <Root />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
         </body>
      </html>
   );
}

export const loader: LoaderFunction = async ({ request }) => {
   const auth = await authenticator.isAuthenticated(request);
   if (auth) {
      const user = auth.profile;
      const loggedInUser = await client<IGataUser>("user/loggedin", {
         token: auth.accessToken,
         signal: request.signal,
      });
      return json<RootLoaderData>({ isAuthenticated: true, loggedInUser, user });
   }
   return json<RootLoaderData>({ isAuthenticated: false });
};

export interface RootLoaderData {
   loggedInUser?: IGataUser;
   isAuthenticated: boolean;
   user?: Auth0Profile;
}

function Root() {
   const { loggedInUser, isAuthenticated, user } = useLoaderData<typeof loader>();
   const { state } = useNavigation();
   return (
      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
         <ResponsiveAppBar loggedInUser={loggedInUser} isAuthenticated={isAuthenticated} user={user} />
         <Progress size="xs" colorScheme="blue" isIndeterminate={state === "loading"} hasStripe />
         <Container as="main" maxW="6xl" sx={{ mb: 16 }}>
            <Outlet />
         </Container>
         <Box as="footer" sx={{ marginTop: "auto", p: 1 }}>
            <Text>Versjon: {process.env.npm_package_version}</Text>
         </Box>
      </Box>
   );
}
