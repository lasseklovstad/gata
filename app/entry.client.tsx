import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

declare global {
   interface WindowEventMap {
      "sw-notification-navigate": CustomEvent<{ url: string }>;
   }
}

if ("serviceWorker" in navigator) {
   navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
         console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
         console.error("Service Worker registration failed:", error);
      });

   // Forward service-worker notification URLs to app-level router navigation.
   navigator.serviceWorker.addEventListener("message", (event: MessageEvent<{ url?: unknown }>) => {
      if (typeof event.data?.url !== "string") {
         return;
      }
      window.dispatchEvent(new CustomEvent("sw-notification-navigate", { detail: { url: event.data.url } }));
   });
}

Sentry.init({
   dsn: ENV.SENTRY_DSN,
   // Adds request headers and IP for users, for more info visit:
   // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
   sendDefaultPii: true,
   integrations: [],
   environment: ENV.MODE,
});

startTransition(() => {
   hydrateRoot(
      document,
      <StrictMode>
         <HydratedRouter />
      </StrictMode>
   );
});
