import { useFetcher } from "@remix-run/react";
import { Bell, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

import type { User } from "~/.server/db/user";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type Props = {
   user: User;
   pwaPublicKey: string;
};

export const UserForm = ({ user, pwaPublicKey }: Props) => {
   const [subscription, setSubscription] = useState<PushSubscription | null>(null);
   const [error, setError] = useState("");
   const fetcher = useFetcher();
   const [picture, setPicture] = useState<string>();
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [area, setArea] = useState<Area>();

   useEffect(() => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
         void navigator.serviceWorker.ready.then(async (registration) => {
            await registration.pushManager.getSubscription().then((sub) => {
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
            <FormLabel>Bilde</FormLabel>
            <FormControl
               render={(props) => (
                  <Input
                     {...props}
                     className="w-fit"
                     type="file"
                     name="image"
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
         </FormItem>
         <div className="relative w-[200px] h-[200px]">
            <Cropper
               image={picture ?? user.originalPicture ?? user.picture}
               crop={crop}
               zoom={zoom}
               aspect={1}
               onCropChange={setCrop}
               onZoomChange={setZoom}
               cropShape="round"
               maxZoom={10}
               onCropAreaChange={(area, areaPx) => setArea(areaPx)}
            />
         </div>
         <input hidden readOnly value={area?.x ?? 0} name="pictureCropX" />
         <input hidden readOnly value={area?.y ?? 0} name="pictureCropY" />
         <input hidden readOnly value={area?.width ?? 0} name="pictureCropWidth" />
         <input hidden readOnly value={area?.height ?? 0} name="pictureCropHeight" />
         <FormItem name="pictureZoom" className="space-y-0">
            <FormLabel>Zoom</FormLabel>
            <FormControl
               render={(props) => (
                  <Input
                     {...props}
                     type="range"
                     defaultValue={0}
                     min={1}
                     max={10}
                     className="p-0"
                     step={0.1}
                     onChange={({ target: { value } }) => setZoom(Number(value))}
                  />
               )}
            />
            <FormMessage />
         </FormItem>
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
                     onCheckedChange={async (checked) => {
                        await (checked ? subscribe() : unsubscribe());
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
