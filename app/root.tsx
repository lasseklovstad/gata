import "react-day-picker/dist/style.css";
import "./tailwind.css";

import { resolve } from "node:path";
import sharp from "sharp";

import type {
   ActionFunctionArgs,
   LinksFunction,
   LoaderFunctionArgs,
   MetaFunction,
   SerializeFrom,
} from "@remix-run/node";
import {
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
import mime from "mime/lite";
import PullToRefresh from "pulltorefreshjs";
import type { ComponentProps } from "react";
import { useEffect } from "react";

import { getOptionalUserFromExternalUserId, updateUser } from "./.server/db/user";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar/ResponsiveAppBar";
import { Button } from "./components/ui/button";
import { Typography } from "./components/ui/typography";
import { createAuthenticator } from "./utils/auth.server";
import { env } from "./utils/env.server";
import { badRequest } from "./utils/responseUtils";
import { profileSchema } from "./utils/schemas/profileSchema";

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
      // eslint-disable-next-line import/no-named-as-default-member
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
         // eslint-disable-next-line import/no-named-as-default-member
         PullToRefresh.destroyAll();
      };
   }, []);
   return <Document>{children}</Document>;
}

export default function App() {
   const { auth0User, loggedInUser, version, pwaPublicKey } = useLoaderData<typeof loader>();
   const navigate = useNavigate();

   useEffect(() => {
      if (!("serviceWorker" in navigator)) return;
      function navigateOnMessage(event: MessageEvent) {
         if ("url" in event.data) {
            navigate(event.data.url);
         }
      }
      navigator.serviceWorker.addEventListener("message", navigateOnMessage);
      return () => {
         navigator.serviceWorker.removeEventListener("message", navigateOnMessage);
      };
   }, [navigate]);

   return (
      <div className="flex flex-col min-h-lvh">
         <ResponsiveAppBar auth0User={auth0User} loggedInUser={loggedInUser} pwaPublicKey={pwaPublicKey} />
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
   const pwaPublicKey = env.PWA_PUBLIC_KEY;
   return { auth0User, loggedInUser, version, pwaPublicKey };
};

export const action = async ({ request }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
         maxPartSize: 5_000_000,
         directory: env.IMAGE_DIR,
         file: ({ filename }) => filename,
      }),
      // parse everything else into memory
      unstable_createMemoryUploadHandler()
   );
   const formData = await unstable_parseMultipartFormData(request, uploadHandler);

   const intent = formData.get("intent");

   if (intent === "updateProfile") {
      const form = profileSchema.parse(formData);
      console.log(form);
      const imagePath = resolve(`${env.IMAGE_DIR}/${form.image.name}`);

      const image = sharp(imagePath);
      const imageMetadata = await image.metadata();
      const newName = `${crypto.randomUUID()}.${imageMetadata.format}`;
      const newImagePath = resolve(`${env.IMAGE_DIR}/${newName}`);
      await image
         .extract({
            left: form.pictureCropX,
            top: form.pictureCropY,
            width: form.pictureCropWidth,
            height: form.pictureCropHeight,
         })
         .toFile(newImagePath);
      await updateUser(loggedInUser.id, {
         name: form.name,
         picture: `/picture/${newName}`,
         originalPicture: `/picture/${form.image.name}`,
         subscribe: form.emailSubscription,
      });
      return { ok: true };
   }

   return badRequest("Invalid intent");
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
