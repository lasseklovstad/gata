import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

declare global {
   interface WindowEventMap {
      "sw-notification-navigate": CustomEvent<{ url: string }>;
   }

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
      // Ignore storage failures; in-memory buffering still protects startup races.
   }
}

function getPendingUrls() {
   if (!window.__swNotificationPendingUrls) {
      window.__swNotificationPendingUrls = readPendingUrlsFromStorage();
   }
   return window.__swNotificationPendingUrls;
}

function queuePendingNavigationUrl(url: string) {
   const pendingUrls = getPendingUrls();
   pendingUrls.push(url);
   writePendingUrlsToStorage(pendingUrls);
}

function dispatchServiceWorkerNavigation(url: string) {
   window.dispatchEvent(new CustomEvent("sw-notification-navigate", { detail: { url } }));
}

function scheduleFallbackNavigation(url: string) {
   window.setTimeout(() => {
      if (window.__swNotificationNavigateListenerReady) {
         return;
      }
      const pendingUrls = getPendingUrls();
      if (!pendingUrls.includes(url)) {
         return;
      }
      window.location.assign(url);
   }, 1500);
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (typeof event.data?.url !== "string") {
         return;
      }

      if (window.__swNotificationNavigateListenerReady) {
         dispatchServiceWorkerNavigation(event.data.url);
         return;
      }

      queuePendingNavigationUrl(event.data.url);
      scheduleFallbackNavigation(event.data.url);
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
