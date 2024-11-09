import { useFetcher } from "@remix-run/react";
import { Bell, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";

import type { User } from "~/.server/db/user";
import type { action } from "~/routes/subscribe";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type Props = {
   user: User;
   pwaPublicKey: string;
   crop: Point;
   setCrop: (crop: Point) => void;
   zoom: number;
   setZoom: (zoom: number) => void;
   area: Area | undefined;
   setArea: (area: Area) => void;
   picture: string | undefined;
   setPicture: (value: string | undefined) => void;
};

export const UserForm = ({
   user,
   pwaPublicKey,
   area,
   crop,
   picture,
   setCrop,
   setPicture,
   setZoom,
   zoom,
   setArea,
}: Props) => {
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
      <>
         <FormItem name="name">
            <FormLabel>Navn</FormLabel>
            <FormControl render={(props) => <Input {...props} defaultValue={user.name} autoComplete="off" />} />
            <FormMessage />
         </FormItem>
         <FormItem name="picture">
            <FormLabel>Last opp nytt bilde</FormLabel>
            <FormControl
               render={(props) => (
                  <Input
                     {...props}
                     className="w-fit"
                     type="file"
                     name="picture"
                     accept="image/*"
                     onChange={(e) => {
                        if (e.target.files?.length) {
                           setPicture(URL.createObjectURL(e.target.files[0]));
                        } else {
                           setPicture(undefined);
                        }
                     }}
                  />
               )}
            />
            <FormMessage />
            <FormDescription>Bilder som lastes her er kun synlig for oss i Gata</FormDescription>
         </FormItem>

         {picture ? (
            <div className="relative w-[200px] h-[200px]">
               <Cropper
                  image={picture}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  cropShape="round"
                  maxZoom={10}
                  zoomSpeed={0.3}
                  onCropAreaChange={(area, areaPx) => setArea(areaPx)}
               />
            </div>
         ) : null}

         <input hidden readOnly value={area?.x ?? 0} name="pictureCropX" />
         <input hidden readOnly value={area?.y ?? 0} name="pictureCropY" />
         <input hidden readOnly value={area?.width ?? 0} name="pictureCropWidth" />
         <input hidden readOnly value={area?.height ?? 0} name="pictureCropHeight" />

         <FormItem name="emailSubscription" className="border p-2 flex justify-between items-center rounded">
            <div>
               <FormLabel className="flex gap-2 items-center">
                  <Mail /> E-post
               </FormLabel>
               <FormDescription>
                  Få tilsendt e-post hvis en bruker velger å publisere en nyhet eller nytt dokument
               </FormDescription>
            </div>
            <FormControl render={(props) => <Switch {...props} defaultChecked={user.subscribe} />} />
         </FormItem>
         <FormItem name="pushSubscription" className="border p-2 flex justify-between items-center rounded">
            <div>
               <FormLabel className="flex gap-2 items-center">
                  <Bell /> Push notifikasjoner
               </FormLabel>
               <FormDescription>
                  Få tilsendt push notifikasjoner på enheten ved feks. endringer i et arrangement du deltar på
               </FormDescription>
            </div>
            <FormControl
               render={(props) => (
                  <Switch
                     {...props}
                     checked={subscription !== null}
                     onCheckedChange={(checked) => {
                        if (checked) {
                           void subscribe();
                        } else {
                           void unsubscribe();
                        }
                     }}
                  />
               )}
            />
         </FormItem>
         {error ? (
            <Alert variant="warning">
               <AlertTitle>Kunne ikke skru på notifikasjoner</AlertTitle>
               <AlertDescription>
                  Det ser ut som du må resette instillinger for tillatelser for denne nettsiden. {error}
               </AlertDescription>
            </Alert>
         ) : null}
      </>
   );
};
