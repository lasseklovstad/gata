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
   navigator.serviceWorker.addEventListener("message", (event) => {
      if ("url" in event.data) {
         window.location.href = event.data.url;
      }
   });
}

startTransition(() => {
   hydrateRoot(
      document,
      <StrictMode>
         <HydratedRouter />
      </StrictMode>
   );
});
