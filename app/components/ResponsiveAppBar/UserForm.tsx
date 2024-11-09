import { Mail } from "lucide-react";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";

import type { User } from "~/.server/db/user";

import { PushSubscription } from "./PushSubscription";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type Props = {
   user: User;
   crop: Point;
   setCrop: (crop: Point) => void;
   zoom: number;
   setZoom: (zoom: number) => void;
   area: Area | undefined;
   setArea: (area: Area) => void;
   picture: string | undefined;
   setPicture: (value: string | undefined) => void;
};

export const UserForm = ({ user, area, crop, picture, setCrop, setPicture, setZoom, zoom, setArea }: Props) => {
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
         <PushSubscription />
      </>
   );
};
