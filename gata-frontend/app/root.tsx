import { ChakraProvider, Heading, Text } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
   Link,
   Links,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   isRouteErrorResponse,
   useLoaderData,
   useNavigation,
   useRouteError,
} from "@remix-run/react";
import type { ComponentProps } from "react";
import { useContext, useEffect } from "react";
import type { Auth0Profile } from "remix-auth-auth0";
import "./tailwind.css";

import { getLoggedInUser } from "./api/user.api";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar/ResponsiveAppBar";
import { Button } from "./components/ui/button";
import { chakraTheme } from "./styles/chakraTheme";
import { ClientStyleContext, ServerStyleContext } from "./styles/context";
import type { IGataUser } from "./types/GataUser.type";
import { createAuthenticator } from "./utils/auth.server";

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
         </body>
      </html>
   );
});

export function Layout({ children }: ComponentProps<never>) {
   return (
      <Document>
         <ChakraProvider theme={chakraTheme}>{children}</ChakraProvider>
      </Document>
   );
}

export default function App() {
   const { loggedInUser, isAuthenticated, user } = useLoaderData<typeof loader>();
   const { state } = useNavigation();
   return (
      <div className="flex flex-col min-h-lvh">
         <ResponsiveAppBar loggedInUser={loggedInUser} isAuthenticated={isAuthenticated} user={user} />
         <main className="mb-8 max-w-[1000px] w-full me-auto ms-auto px-4">
            <Outlet />
         </main>
         <footer className="p-4 flex gap-4 max-w-[1000px] w-full ms-auto me-auto mt-auto">
            <Button variant="link" as={Link} to="/privacy">
               Privacy
            </Button>
            <Button variant="link" as={Link} to="/about">
               About
            </Button>
         </footer>
      </div>
   );
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const auth = await createAuthenticator(context).authenticator.isAuthenticated(request);
   const signal = request.signal;
   if (auth) {
      const user = auth.profile;
      const token = auth.accessToken;
      const loggedInUser = await getLoggedInUser({
         token,
         signal,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      }).catch((e) => {
         if (e instanceof Response && e.status === 404) return undefined;
         if (e instanceof Response && e.status === 401) {
            throw redirect("/logout");
         } else {
            throw e;
         }
      });
      return json<LoaderData>({ isAuthenticated: true, loggedInUser, user });
   }
   return json<LoaderData>({ isAuthenticated: false });
};

type LoaderData = {
   loggedInUser?: IGataUser;
   isAuthenticated: boolean;
   user?: Auth0Profile;
};

export function ErrorBoundary() {
   const error = useRouteError();

   useEffect(() => {
      console.log(error);
   }, [error]);

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
}
