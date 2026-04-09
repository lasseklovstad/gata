import { Image, Trash } from "lucide-react";
import { useId, useState } from "react";
import { useFetcher } from "react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { notifyParticipantsImagesIsUploaded } from "~/.server/data-layer/gataEvent";
import {
   deleteEventCloudinaryImage,
   getEvent,
   getEventCloudinaryImages,
   insertAzureBlob,
} from "~/.server/db/gataEvent";
import { CloudImageCheckbox } from "~/components/CloudImageCheckbox";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { Typography } from "~/components/ui/typography";
import { UploadMedia } from "~/components/UploadMedia";
import { getRequiredUser } from "~/utils/auth.server";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";

import type { Route } from "./+types/route";
import { uploadFilesIntent, UploadFilesSchema } from "./uploadFilesAction";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const [cloudinaryImages, event] = await Promise.all([getEventCloudinaryImages(eventId), getEvent(eventId)]);
   return { cloudinaryImages, event, loggedInUser };
};

const deleteImagesSchema = zfd.formData({
   image: zfd.repeatable(z.array(z.string())),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);

   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   const event = await getEvent(eventId);

   if (intent === uploadFilesIntent) {
      const form = UploadFilesSchema.parse(formdata);
      await insertAzureBlob(
         eventId,
         form.files.map((file) => ({
            cloudId: file.id,
            cloudUrl: file.url,
            height: file.height ?? 0,
            width: file.width ?? 0,
            type: file.type,
         }))
      );
      await notifyParticipantsImagesIsUploaded(loggedInUser, eventId);
      return { ok: true };
   }

   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "deleteImages") {
      const { image } = deleteImagesSchema.parse(formdata);
      for (const cloudId of image) {
         await deleteEventCloudinaryImage(cloudId);
      }
      return { ok: true };
   }

   throw badRequest("Intent not found " + intent);
};

export default function EventImages({ loaderData: { cloudinaryImages, event, loggedInUser } }: Route.ComponentProps) {
   const [mode, setMode] = useState<"default" | "mark">("default");

   const fetcher = useFetcher<typeof action>();
   const formId = useId();
   const isOrganizer = isUserOrganizer(event, loggedInUser);

   return (
      <div className="flex flex-col gap-2">
         <Typography variant="h3" className="flex gap-2 items-center flex-wrap">
            <Image />
            Last opp bilder og video
         </Typography>
         <UploadMedia eventId={event.id} />
         {cloudinaryImages.length === 0 ? (
            <Typography>Ingen bilder lastet opp enda...</Typography>
         ) : (
            <div className="flex gap-2">
               <Toggle
                  variant="outline"
                  pressed={mode === "mark"}
                  disabled={!isOrganizer}
                  onPressedChange={(pressed) => setMode(pressed ? "mark" : "default")}
               >
                  Marker
               </Toggle>
               {mode === "mark" ? (
                  <Button type="submit" form={formId} isLoading={fetcher.state !== "idle"}>
                     <Trash />
                     <span className="sr-only">Slett markerte bilder</span>
                  </Button>
               ) : null}
            </div>
         )}
         {mode === "mark" ? (
            <>
               <fetcher.Form method="DELETE" id={formId}>
                  <input name="intent" value="deleteImages" hidden readOnly />
                  <ul className="flex gap-2 flex-wrap">
                     {cloudinaryImages.map((image) => (
                        <li key={image.cloudId} className="h-[160px]">
                           <CloudImageCheckbox cloudImage={image} />
                        </li>
                     ))}
                  </ul>
               </fetcher.Form>
            </>
         ) : (
            <CloudImageGallery cloudImages={cloudinaryImages} eventId={event.id} loggedInUserId={loggedInUser.id} />
         )}
      </div>
   );
}
