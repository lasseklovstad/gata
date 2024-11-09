import "react-day-picker/dist/style.css";
import "./tailwind.css";

import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
   NodeOnDiskFile,
   unstable_composeUploadHandlers,
   unstable_createFileUploadHandler,
   unstable_createMemoryUploadHandler,
   unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
   Link,
   Links,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   isRouteErrorResponse,
   useLoaderData,
   useNavigate,
   useRouteError,
   useRouteLoaderData,
} from "@remix-run/react";
import PullToRefresh from "pulltorefreshjs";
import type { ComponentProps } from "react";
import { useEffect } from "react";

import { getOptionalUserFromExternalUserId, updateUser } from "./.server/db/user";
import { cropProfileImage } from "./.server/services/localImageService";
import { PushSubscriptionProvider } from "./components/PushSubscriptionContext";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar/ResponsiveAppBar";
import { Button } from "./components/ui/button";
import { Typography } from "./components/ui/typography";
import { createAuthenticator } from "./utils/auth.server";
import { env } from "./utils/env.server";
import { badRequest } from "./utils/responseUtils";
import { profileSchema } from "./utils/schemas/profileSchema";
import { useRevalidateOnFocus } from "./utils/useRevalidateOnFocus";
import { transformErrorResponse } from "./utils/validateUtils";

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
   useEffect(() => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!standalone) {
         return; // not standalone; no pull to refresh needed
      }

      PullToRefresh.init({
         mainElement: "body",
         instructionsRefreshing: "Laster inn siden på nytt",
         instructionsReleaseToRefresh: "Slipp for å laste inn på nytt",
         instructionsPullToRefresh: "Dra for å laste inn på nytt",
         onRefresh() {
            window.location.reload();
         },
      });
      return () => {
         PullToRefresh.destroyAll();
      };
   }, []);
   return <Document>{children}</Document>;
}

export default function App() {
   const { auth0User, loggedInUser, version, pwaPublicKey } = useLoaderData<typeof loader>();
   const navigate = useNavigate();
   useRevalidateOnFocus();

   useEffect(() => {
      if (!("serviceWorker" in navigator)) return;
      const sessionStorageKey = "serviceWorkerNavigateUrl";
      function navigateOnMessage(event: MessageEvent<{ url: string }>) {
         if ("url" in event.data) {
            if (loggedInUser) {
               sessionStorage.removeItem(sessionStorageKey);
               navigate(event.data.url);
            } else {
               sessionStorage.setItem(sessionStorageKey, event.data.url);
            }
         }
      }
      if (loggedInUser) {
         const url = sessionStorage.getItem(sessionStorageKey);
         if (url) {
            sessionStorage.removeItem(sessionStorageKey);
            navigate(url);
         }
      }
      navigator.serviceWorker.addEventListener("message", navigateOnMessage);
      return () => {
         navigator.serviceWorker.removeEventListener("message", navigateOnMessage);
      };
   }, [navigate, loggedInUser]);

   return (
      <PushSubscriptionProvider pwaPublicKey={pwaPublicKey}>
         <div className="flex flex-col min-h-lvh">
            <ResponsiveAppBar isLoggedIn={!!auth0User} loggedInUser={loggedInUser} />
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
      </PushSubscriptionProvider>
   );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const auth0User = await createAuthenticator().authenticator.isAuthenticated(request);
   const loggedInUser = auth0User ? (await getOptionalUserFromExternalUserId(auth0User.id)) || undefined : undefined;
   const version = env.VERSION;
   const pwaPublicKey = env.PWA_PUBLIC_KEY;
   return {
      auth0User,
      loggedInUser,
      version,
      pwaPublicKey,
   };
};

export const action = async ({ request }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
         maxPartSize: 5_000_000,
         file: ({ filename }) => filename,
      }),
      // parse everything else into memory
      unstable_createMemoryUploadHandler()
   );
   const formData = await unstable_parseMultipartFormData(request, uploadHandler);

   const intent = formData.get("intent");

   if (intent === "updateProfile") {
      const formResult = profileSchema.safeParse(formData);
      if (!formResult.success) {
         return transformErrorResponse(formResult.error);
      }
      const form = formResult.data;
      if (form.picture instanceof NodeOnDiskFile) {
         const newName = await cropProfileImage(form.picture.getFilePath(), {
            height: form.pictureCropHeight,
            width: form.pictureCropWidth,
            left: form.pictureCropX,
            top: form.pictureCropY,
         });
         await updateUser(loggedInUser.id, {
            name: form.name,
            picture: newName,
            subscribe: form.emailSubscription,
         });
      } else {
         await updateUser(loggedInUser.id, {
            name: form.name,
            subscribe: form.emailSubscription,
         });
      }
      return { ok: true };
   }

   throw badRequest("Invalid intent");
};

export const useRootLoader = () => {
   return useRouteLoaderData<typeof loader>("root");
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
