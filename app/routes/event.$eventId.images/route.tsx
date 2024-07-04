import {
   unstable_composeUploadHandlers,
   unstable_createMemoryUploadHandler,
   unstable_parseMultipartFormData,
   type ActionFunctionArgs,
   type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Trash } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { notifyParticipantsImagesIsUploaded } from "~/.server/data-layer/gataEvent";
import {
   deleteEventCloudinaryImage,
   getEvent,
   getEventCloudinaryImages,
   insertCloudinaryImage,
} from "~/.server/db/gataEvent";
import { deleteImage, uploadImageToCloudinary } from "~/.server/services/cloudinaryService";
import { CloudImageCheckbox } from "~/components/CloudImageCheckbox";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { Typography } from "~/components/ui/typography";
import { UploadImages } from "~/components/UploadImages";
import { createAuthenticator } from "~/utils/auth.server";
import { getCloudinaryUploadFolder } from "~/utils/cloudinaryUtils";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";

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

   if (request.method === "POST") {
      const uploadHandler = unstable_composeUploadHandlers(
         // our custom upload handler
         async ({ name, data }) => {
            if (name !== "image") {
               return undefined;
            }
            const folder = `${getCloudinaryUploadFolder()}/event-${eventId}`;
            const { secure_url, public_id, width, height } = await uploadImageToCloudinary(data, folder);
            await insertCloudinaryImage(eventId, { cloudId: public_id, cloudUrl: secure_url, width, height });
            return secure_url;
         },
         // fallback to memory for everything else
         unstable_createMemoryUploadHandler()
      );

      await unstable_parseMultipartFormData(request, uploadHandler);
      await notifyParticipantsImagesIsUploaded(loggedInUser, eventId);

      return { ok: true };
   }

   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   const event = await getEvent(eventId);
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
   const fetcher = useFetcher();
   const formId = useId();
   const isOrganizer = isUserOrganizer(event, loggedInUser);
   return (
      <div className="space-y-2">
         <UploadImages eventId={event.id} />
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
                  <ul className="sm:flex gap-2 flex-wrap grid">
                     {cloudinaryImages.map((image) => (
                        <li key={image.cloudId} className="h-full sm:h-[160px]">
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
