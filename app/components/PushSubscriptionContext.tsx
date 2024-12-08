import { useFetcher } from "react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { action } from "~/routes/subscribe";

const pushSubscriptionContext = createContext<PushSubscriptionContext | undefined>(undefined);

type PushSubscriptionContext = {
   subscription: PushSubscription | null;
   error: string;
   subscribe: () => Promise<void>;
   unsubscribe: () => Promise<void>;
};

export const PushSubscriptionProvider = ({ children, pwaPublicKey }: { children: ReactNode; pwaPublicKey: string }) => {
   const [subscription, setSubscription] = useState<PushSubscription | null>(null);
   const [error, setError] = useState("");

   const fetcher = useFetcher<typeof action>();

   useEffect(() => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
         void navigator.serviceWorker.ready.then(async (registration) => {
            await registration.pushManager.getSubscription().then((sub) => {
               setSubscription(sub);
            });
         });
      } else {
         setError(
            "Din nettleser støtter ikke pushnotifikasjoner. Prøv å oppdatere til nyeste versjon av nettleseren. Hvis du bruker Iphone må du legge til nettsiden til Hjem-skjerm for å kunne bruke pushnotifkasjoner og påse at du har nyeste versjon av iOS. Spør Lasse..."
         );
      }
   }, []);

   const subscribe = async () => {
      await navigator.serviceWorker.ready.then((registration) => {
         registration.pushManager
            .subscribe({
               userVisibleOnly: true,
               applicationServerKey: pwaPublicKey,
            })
            .then((subscription) => {
               setSubscription(subscription);

               fetcher.submit(JSON.stringify(subscription), {
                  action: "/subscribe",
                  encType: "application/json",
                  preventScrollReset: true,
                  method: "POST",
               });
            })
            .catch((error) => {
               setError(String(error));
            });
      });
   };

   const unsubscribe = async () => {
      if (!subscription) return;
      await subscription
         .unsubscribe()
         .then(() => {
            setSubscription(null);
            fetcher.submit(JSON.stringify(subscription), {
               action: "/subscribe",
               encType: "application/json",
               preventScrollReset: true,
               method: "DELETE",
            });
         })
         .catch((error) => {
            console.error("Failed to unsubscribe the user: ", error);
         });
   };

   return (
      <pushSubscriptionContext.Provider value={{ subscription, error, subscribe, unsubscribe }}>
         {children}
      </pushSubscriptionContext.Provider>
   );
};

export const usePushSubscriptionContext = () => {
   const context = useContext(pushSubscriptionContext);
   if (!context) {
      throw new Error("Could not find context pushSubscriptionContext");
   }
   return context;
};
