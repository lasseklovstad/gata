import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

if ("serviceWorker" in navigator) {
   navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
         console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
         console.error("Service Worker registration failed:", error);
      });

   // Listen to service worker messages sent via postMessage()
   navigator.serviceWorker.addEventListener("message", (event: MessageEvent<{ url: string }>) => {
      if ("url" in event.data) {
         window.location.href = event.data.url;
      }
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
