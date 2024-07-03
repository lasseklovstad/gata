import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

if ("serviceWorker" in navigator) {
   navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
         console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
         console.error("Service Worker registration failed:", error);
      });
}

startTransition(() => {
   hydrateRoot(
      document,
      <StrictMode>
         <RemixBrowser />
      </StrictMode>
   );
});
