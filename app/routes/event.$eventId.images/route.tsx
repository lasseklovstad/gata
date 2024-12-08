import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { Image, Trash } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { notifyParticipantsImagesIsUploaded } from "~/.server/data-layer/gataEvent";
import {
   deleteEventCloudinaryImage,
   getEvent,
   getEventCloudinaryImages,
   insertCloudinaryImage,
   updateEvent,
} from "~/.server/db/gataEvent";
import { deleteImage, generateZip } from "~/.server/services/cloudinaryService";
import { CloudImageCheckbox } from "~/components/CloudImageCheckbox";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { Typography } from "~/components/ui/typography";
import { UploadMedia } from "~/components/UploadMedia";
import { createAuthenticator } from "~/utils/auth.server";
import { getCloudinaryUploadFolder } from "~/utils/cloudinaryUtils";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { isCloudinaryFilePart, uploadFilesToCloudinaryAndGetMultiformParts } from "~/utils/multipartUtils";
import { badRequest } from "~/utils/responseUtils";

import { DownloadZip } from "./DownloadZip";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const [cloudinaryImages, event] = await Promise.all([getEventCloudinaryImages(eventId), getEvent(eventId)]);
   return { cloudinaryImages, event, loggedInUser };
};

const deleteImagesSchema = zfd.formData({
   image: zfd.repeatable(z.array(z.string())),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;

   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const folder = `${getCloudinaryUploadFolder()}/event-${eventId}`;
   const contentType = request.headers.get("Content-Type");
   const isMulitipart = contentType?.includes("multipart/form-data");

   if (request.method === "POST" && isMulitipart) {
      const parts = await uploadFilesToCloudinaryAndGetMultiformParts(request, { cloudinaryFolder: folder });
      for (const part of parts) {
         if (isCloudinaryFilePart(part)) {
            await insertCloudinaryImage(eventId, {
               cloudId: part.cloudId,
               cloudUrl: part.cloudUrl,
               height: part.height,
               width: part.width,
            });
         }
      }
      await notifyParticipantsImagesIsUploaded(loggedInUser, eventId);

      return { ok: true };
   }

   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   const event = await getEvent(eventId);

   if (intent === "generateZipUrl") {
      const zipUrl = generateZip(folder, event.title);
      await updateEvent(eventId, { zipUrl });
      return { ok: true, zipUrl };
   }

   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "deleteImages") {
      const { image } = deleteImagesSchema.parse(formdata);
      for (const cloudId of image) {
         await deleteImage(cloudId);
         await deleteEventCloudinaryImage(cloudId);
      }
      return { ok: true };
   }

   throw badRequest("Intent not found " + intent);
};

export default function EventImages() {
   const { cloudinaryImages, event, loggedInUser } = useLoaderData<typeof loader>();
   const [mode, setMode] = useState<"default" | "mark">("default");

   const fetcher = useFetcher<typeof action>();
   const formId = useId();
   const isOrganizer = isUserOrganizer(event, loggedInUser);
   return (
      <div className="flex flex-col gap-2">
         <div className="flex gap-2 justify-between">
            <Typography variant="h3" className="flex gap-2 items-center flex-wrap">
               <Image />
               Last opp bilder og video
            </Typography>
            {isOrganizer ? <DownloadZip event={event} /> : null}
         </div>
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
            <CloudImageGallery cloudImages={cloudinaryImages} />
         )}
      </div>
   );
}
