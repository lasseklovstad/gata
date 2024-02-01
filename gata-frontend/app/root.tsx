import { Progress, Container, Box, Text, ChakraProvider, Heading, Button } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { json } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
   Link,
   Links,
   LiveReload,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   isRouteErrorResponse,
   useLoaderData,
   useNavigation,
   useRouteError,
} from "@remix-run/react";
import { useEffect, useContext } from "react";
import type { Auth0Profile } from "remix-auth-auth0";

import { ResponsiveAppBar } from "./old-app/components/ResponsiveAppBar";
import type { IGataUser } from "./old-app/types/GataUser.type";
import { chakraTheme } from "./styles/chakraTheme";
import { ServerStyleContext, ClientStyleContext } from "./styles/context";
import { authenticator } from "./utils/auth.server";
import { client } from "./utils/client";

export const meta: MetaFunction = () => {
   return [
      {
         title: "Gata",
      },
   ];
};

export const links: LinksFunction = () => {
   return [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      {
         rel: "stylesheet",
         href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
      },
      { rel: "apple-touch-icon", href: "/logo192.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
   ];
};

interface DocumentProps {
   children: React.ReactNode;
}

const Document = withEmotionCache(({ children }: DocumentProps, emotionCache) => {
   const serverStyleData = useContext(ServerStyleContext);
   const clientStyleData = useContext(ClientStyleContext);

   // Only executed on client
   useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <html lang="no">
         <head>
            <meta charSet="utf-8" />
            <meta name="theme-color" content="#000000" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Nettside for gata" />
            <Meta />
            <Links />
            {serverStyleData?.map(({ key, ids, css }) => (
               <style key={key} data-emotion={`${key} ${ids.join(" ")}`} dangerouslySetInnerHTML={{ __html: css }} />
            ))}
         </head>
         <body>
            {children}
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
         </body>
      </html>
   );
});

export default function App() {
   return (
      <Document>
         <ChakraProvider theme={chakraTheme}>
            <Root />
         </ChakraProvider>
      </Document>
   );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const auth = await authenticator.isAuthenticated(request);
   const version = process.env.npm_package_version || "0.0.0";
   if (auth) {
      const user = auth.profile;
      const loggedInUser = await client<IGataUser>("user/loggedin", {
         token: auth.accessToken,
         signal: request.signal,
      }).catch((e) => {
         if (e instanceof Response && e.status === 404) return undefined;
         else {
            throw e;
         }
      });
      return json<LoaderData>({ isAuthenticated: true, loggedInUser, user, version });
   }
   return json<LoaderData>({ isAuthenticated: false, version });
};

type LoaderData = {
   loggedInUser?: IGataUser;
   isAuthenticated: boolean;
   user?: Auth0Profile;
   version: string;
};

function Root() {
   const { loggedInUser, isAuthenticated, user, version } = useLoaderData<typeof loader>();
   const { state } = useNavigation();
   return (
      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
         <ResponsiveAppBar loggedInUser={loggedInUser} isAuthenticated={isAuthenticated} user={user} />
         <Progress size="xs" colorScheme="blue" isIndeterminate={state === "loading"} hasStripe />
         <Container as="main" maxW="6xl" sx={{ mb: 16 }}>
            <Outlet />
         </Container>
         <Container as="footer" sx={{ marginTop: "auto", p: 2, maxW: "6xl", display: "flex", gap: 4 }}>
            <Text>{version}</Text>
            <Button as={Link} to="/privacy" variant="link">
               Privacy
            </Button>
            <Button as={Link} to="/about" variant="link">
               About
            </Button>
         </Container>
      </Box>
   );
}

export function ErrorBoundary() {
   const error = useRouteError();

   useEffect(() => {
      console.log(error);
   }, [error]);

   const getErrorMessage = () => {
      if (isRouteErrorResponse(error)) {
         return (
            <div>
               <Heading>
                  {error.status} {error.statusText}
               </Heading>
               <Text>{error.data.message}</Text>
            </div>
         );
      } else if (error instanceof Error) {
         return (
            <div>
               <Heading>Error</Heading>
               <Text>{error.message}</Text>
               <Text>The stack trace is:</Text>
               <Text as="pre">{error.stack}</Text>
            </div>
         );
      } else {
         return <Heading>Unknown Error</Heading>;
      }
   };

   return (
      <Document>
         <ChakraProvider theme={chakraTheme}>{getErrorMessage()}</ChakraProvider>
      </Document>
   );
}
