import "react-day-picker/dist/style.css";
import "./tailwind.css";

import os from "os";
import path from "path";

import { createFsFileStorage } from "@remix-run/file-storage/fs";
import { type FileUpload, parseFormData } from "@remix-run/form-data-parser";
import * as Sentry from "@sentry/react-router";
import PullToRefresh from "pulltorefreshjs";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
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
   useRouteLoaderData,
} from "react-router";
import { z } from "zod";

import type { Route } from "./+types/root";
import {
   getOptionalUserFromExternalUserId,
   getUserByName,
   updateExternalUserLastSeen,
   updateUser,
} from "./.server/db/user";
import { PushSubscriptionProvider } from "./components/PushSubscriptionContext";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar/ResponsiveAppBar";
import { Button } from "./components/ui/button";
import { Typography } from "./components/ui/typography";
import { getRequiredUser, getUserSession } from "./utils/auth.server";
import { getEnv } from "./utils/env.server";
import { badRequest } from "./utils/responseUtils";
import { profileSchema } from "./utils/schemas/profileSchema";
import { useRevalidateOnFocus } from "./utils/useRevalidateOnFocus";
import { transformErrorResponse } from "./utils/validateUtils";

declare global {
   interface Window {
      __swNotificationNavigateListenerReady?: boolean;
      __swNotificationPendingUrls?: string[];
   }
}

const SW_NOTIFICATION_PENDING_URLS_STORAGE_KEY = "sw-notification-pending-urls";

function readPendingUrlsFromStorage() {
   try {
      const raw = sessionStorage.getItem(SW_NOTIFICATION_PENDING_URLS_STORAGE_KEY);
      if (!raw) {
         return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
         return [];
      }
      return parsed.filter((value): value is string => typeof value === "string");
   } catch {
      return [];
   }
}

function writePendingUrlsToStorage(urls: string[]) {
   try {
      if (urls.length === 0) {
         sessionStorage.removeItem(SW_NOTIFICATION_PENDING_URLS_STORAGE_KEY);
         return;
      }
      sessionStorage.setItem(SW_NOTIFICATION_PENDING_URLS_STORAGE_KEY, JSON.stringify(urls));
   } catch {
      // Ignore storage failures; in-memory buffering still handles this session.
   }
}

function consumePendingNotificationUrls() {
   const inMemoryUrls = window.__swNotificationPendingUrls ?? [];
   const persistedUrls = readPendingUrlsFromStorage();
   const pendingUrls = [...inMemoryUrls, ...persistedUrls];
   window.__swNotificationPendingUrls = [];
   writePendingUrlsToStorage([]);
   return pendingUrls;
}

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
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
   ];
};

const Document = ({ children, env = {} }: { children: React.ReactNode; env?: Record<string, string | undefined> }) => {
   return (
      <html lang="no">
         <head>
            <meta charSet="utf-8" />
            <meta name="theme-color" content="#000000" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Nettside for gata" />
            <meta name="apple-mobile-web-app-title" content="Gata" />
            <Meta />
            <Links />
         </head>
         <body>
            {children}
            <script
               dangerouslySetInnerHTML={{
                  __html: `window.ENV = ${JSON.stringify(env)}`,
               }}
            />
            <ScrollRestoration />
            <Scripts />
         </body>
      </html>
   );
};

export function Layout({ children }: ComponentProps<never>) {
   const data = useLoaderData<typeof loader | null>();
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
   return <Document env={data?.ENV}>{children}</Document>;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
   const auth0User = await getUserSession(request);
   if (auth0User) {
      // Record activity here rather than on login: the 400-day session cookie
      // means actual logins are rare, so this is what keeps "Sist aktiv" fresh.
      await updateExternalUserLastSeen(auth0User.id);
   }
   const loggedInUser = auth0User ? (await getOptionalUserFromExternalUserId(auth0User.id)) || undefined : undefined;

   return {
      auth0User,
      loggedInUser,
      ENV: getEnv(),
   };
};

export const action = async ({ request }: Route.ActionArgs) => {
   const loggedInUser = await getRequiredUser(request);

   const formData = await parseFormData(
      request,
      {
         maxFileSize: 20 * 1024 * 1024,
      },
      createTempUploadHandler("profile-pictures")
   );

   const intent = formData.get("intent");

   if (intent === "updateProfile") {
      const formResult = await profileSchema
         .superRefine(async (profile, ctx) => {
            const existingUser = await getUserByName(profile.name);
            if (existingUser && loggedInUser.id !== existingUser.id) {
               ctx.addIssue({
                  path: ["name"],
                  code: z.ZodIssueCode.custom,
                  message: "Du kan ikke ha samme navn som en annen bruker",
               });
               return z.NEVER;
            }
            return profile;
         })
         .safeParseAsync(formData);
      if (!formResult.success) {
         return transformErrorResponse(formResult.error);
      }
      const form = formResult.data;
      if (form.picture) {
         await updateUser(loggedInUser.id, {
            name: form.name,
            picture: form.picture,
            originalPicture: form.originalPicture,
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

export default function App({ loaderData: { auth0User, loggedInUser, ENV } }: Route.ComponentProps) {
   useRevalidateOnFocus();
   const navigate = useNavigate();

   useEffect(() => {
      function navigateFromServiceWorkerUrl(url: string) {
         try {
            const parsedUrl = new URL(url, window.location.origin);
            void navigate(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
         } catch {
            console.error("Invalid service worker navigation URL", url);
         }
      }

      function onServiceWorkerNavigation(event: WindowEventMap["sw-notification-navigate"]) {
         navigateFromServiceWorkerUrl(event.detail.url);
      }

      window.addEventListener("sw-notification-navigate", onServiceWorkerNavigation);
      window.__swNotificationNavigateListenerReady = true;

      const pendingUrls = consumePendingNotificationUrls();
      for (const pendingUrl of pendingUrls) {
         navigateFromServiceWorkerUrl(pendingUrl);
      }

      return () => {
         window.__swNotificationNavigateListenerReady = false;
         window.removeEventListener("sw-notification-navigate", onServiceWorkerNavigation);
      };
   }, [navigate]);

   return (
      <PushSubscriptionProvider pwaPublicKey={ENV.PWA_PUBLIC_KEY}>
         <div className="flex flex-col min-h-lvh">
            <ResponsiveAppBar isLoggedIn={!!auth0User} loggedInUser={loggedInUser} />
            <main className="mb-8 max-w-[1000px] w-full me-auto ms-auto px-4">
               <Outlet />
            </main>
            <footer className="p-4 flex gap-4 max-w-[1000px] w-full ms-auto me-auto mt-auto items-center flex-wrap">
               <Button variant="link" as={Link} to="/privacy">
                  Privacy
               </Button>
               <Button variant="link" as={Link} to="/about">
                  About
               </Button>
               <Typography variant="smallText">Versjon: {ENV.COMMIT_SHA}</Typography>
            </footer>
         </div>
      </PushSubscriptionProvider>
   );
}

function createTempUploadHandler(prefix: string) {
   const directory = path.join(os.tmpdir(), prefix);
   const fileStorage = createFsFileStorage(directory);

   async function uploadHandler(fileUpload: FileUpload) {
      if (fileUpload.fieldName === "picture" && fileUpload.type.startsWith("image/")) {
         const key = new Date().getTime().toString(36);
         await fileStorage.set(key, fileUpload);
         return fileStorage.get(key);
      }

      // Ignore any files we don't recognize the name of...
   }
   return uploadHandler;
}

export const useRootLoader = () => {
   return useRouteLoaderData<typeof loader>("root");
};

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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
      // you only want to capture non 404-errors that reach the boundary
      Sentry.captureException(error);
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
