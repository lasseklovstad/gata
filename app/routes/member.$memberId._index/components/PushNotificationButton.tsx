import { useFetcher } from "@remix-run/react";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

type Props = {
   publicKey: string;
};

export const PushNotificationButton = ({ publicKey }: Props) => {
   const [subscription, setSubscription] = useState<PushSubscription | null>(null);
   const [error, setError] = useState("");
   const fetcher = useFetcher();

   useEffect(() => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
         void navigator.serviceWorker.ready.then(async (registration) => {
            await registration.pushManager.getSubscription().then((sub) => {
               console.log(sub);
               setSubscription(sub);
            });
         });
      }
   }, []);

   const subscribe = async () => {
      await navigator.serviceWorker.ready.then((registration) => {
         registration.pushManager
            .subscribe({
               userVisibleOnly: true,
               applicationServerKey: publicKey,
            })
            .then((subscription) => {
               setSubscription(subscription);
               console.log("User is subscribed:", subscription);

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

   return (
      <div className="space-y-4">
         {subscription !== null ? (
            <Button
               onClick={async () => {
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
               }}
               isLoading={fetcher.state !== "idle"}
            >
               <BellOff className="mr-2" /> Skru av sidenotifikasjoner
            </Button>
         ) : (
            <Button onClick={subscribe} isLoading={fetcher.state !== "idle"}>
               <Bell className="mr-2" /> Skru på sidenotifikasjoner
            </Button>
         )}
         {error ? (
            <Alert variant="warning">
               <AlertTitle>Kunne ikke skru på notifikasjoner</AlertTitle>
               <AlertDescription>
                  Det ser ut som du må resette instillinger for tillatelser for denne nettsiden. {error}
               </AlertDescription>
            </Alert>
         ) : null}
      </div>
   );
};
