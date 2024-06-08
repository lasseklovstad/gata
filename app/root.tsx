import type { LinksFunction, LoaderFunctionArgs, MetaFunction, SerializeFrom } from "@remix-run/node";
import {
   Link,
   Links,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   isRouteErrorResponse,
   useLoaderData,
   useRouteError,
   useRouteLoaderData,
} from "@remix-run/react";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import "./tailwind.css";

import { getOptionalUserFromExternalUserId } from "./.server/db/user";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar/ResponsiveAppBar";
import { Button } from "./components/ui/button";
import { Typography } from "./components/ui/typography";
import { createAuthenticator } from "./utils/auth.server";
import { env } from "./utils/env.server";

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

const Document = ({ children }: DocumentProps) => {
   return (
      <html lang="no">
         <head>
            <meta charSet="utf-8" />
            <meta name="theme-color" content="#000000" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Nettside for gata" />
            <Meta />
            <Links />
         </head>
         <body>
            {children}
            <ScrollRestoration />
            <Scripts />
         </body>
      </html>
   );
};

export function Layout({ children }: ComponentProps<never>) {
   return <Document>{children}</Document>;
}

export default function App() {
   const { auth0User, loggedInUser, version } = useLoaderData<typeof loader>();
   return (
      <div className="flex flex-col min-h-lvh">
         <ResponsiveAppBar auth0User={auth0User} loggedInUser={loggedInUser} />
         <main className="mb-8 max-w-[1000px] w-full me-auto ms-auto px-4">
            <Outlet />
         </main>
         <footer className="p-4 flex gap-4 max-w-[1000px] w-full ms-auto me-auto mt-auto items-center">
            <Button variant="link" as={Link} to="/privacy">
               Privacy
            </Button>
            <Button variant="link" as={Link} to="/about">
               About
            </Button>
            Versjon: {version}
         </footer>
      </div>
   );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const auth0User = await createAuthenticator().authenticator.isAuthenticated(request);
   const loggedInUser = auth0User
      ? (await getOptionalUserFromExternalUserId(auth0User.profile.id ?? "")) || undefined
      : undefined;
   const version = env.VERSION;
   return { auth0User, loggedInUser, version };
};

export const useRootLoader = () => {
   return useRouteLoaderData("root") as SerializeFrom<typeof loader>;
};

export function ErrorBoundary() {
   const error = useRouteError();

   useEffect(() => {
      console.log(JSON.stringify(error));
   }, [error]);

   if (isRouteErrorResponse(error)) {
      return (
         <div>
            <Typography variant="h1">
               {error.status} {error.statusText}
            </Typography>
            <Typography>{error.data}</Typography>
         </div>
      );
   } else if (error instanceof Error) {
      return (
         <div>
            <Typography variant="h1">Error</Typography>
            <Typography>{error.message}</Typography>
            <Typography>The stack trace is:</Typography>
            <Typography as="pre">{error.stack}</Typography>
         </div>
      );
   } else {
      return <Typography variant="h1">Unknown Error</Typography>;
   }
}
