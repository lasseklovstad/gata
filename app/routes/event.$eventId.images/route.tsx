import { Cloud, CloudUpload, Image, Trash } from "lucide-react";
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
   insertCloudinaryImage,
   updateEvent,
} from "~/.server/db/gataEvent";
import { generateZip } from "~/.server/services/cloudinaryService";
import { CloudImageCheckbox } from "~/components/CloudImageCheckbox";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { Typography } from "~/components/ui/typography";
import { UploadMedia } from "~/components/UploadMedia";
import { getRequiredUser } from "~/utils/auth.server";
import { getCloudinaryUploadFolder } from "~/utils/file.utils";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { migrateCloudinaryImagesToBlob } from "~/utils/migrateCloudinaryImages.server";
import { isCloudinaryFilePart, uploadFilesToCloudinaryAndGetMultiformParts } from "~/utils/multipartUtils";
import { badRequest } from "~/utils/responseUtils";

import type { Route } from "./+types/route";
import { DownloadZip } from "./DownloadZip";
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

const migrateToBlockIntent = "migrateToBlob";
const migrateToBlockSchema = zfd.formData({
   intent: zfd.text(z.literal(migrateToBlockIntent)),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const folder = `${getCloudinaryUploadFolder()}/event-${eventId}`;
   const contentType = request.headers.get("Content-Type");
   const isMultipart = contentType?.includes("multipart/form-data");

   if (request.method === "POST" && isMultipart) {
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
      // TODO:
      // await notifyParticipantsImagesIsUploaded(loggedInUser, eventId);
      return { ok: true };
   }

   if (intent === migrateToBlockIntent) {
      migrateToBlockSchema.parse(formdata);
      const cloudinaryImages = await getEventCloudinaryImages(eventId);
      const progress = await migrateCloudinaryImagesToBlob(eventId, cloudinaryImages);
      return { ok: true, progress };
   }

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
         await deleteEventCloudinaryImage(cloudId);
      }
      return { ok: true };
   }

   throw badRequest("Intent not found " + intent);
};

export default function EventImages({ loaderData: { cloudinaryImages, event, loggedInUser } }: Route.ComponentProps) {
   const [mode, setMode] = useState<"default" | "mark">("default");

   const fetcher = useFetcher<typeof action>();
   const migrateFetcher = useFetcher<typeof action>();
   const formId = useId();
   const isOrganizer = isUserOrganizer(event, loggedInUser);

   // Check if there are any Cloudinary images that need migration
   const cloudinaryImagesToMigrate = cloudinaryImages.filter((img) => img.cloudUrl.includes("res.cloudinary.com"));
   const hasMigrationNeeded = cloudinaryImagesToMigrate.length > 0;

   // Get migration progress from fetcher
   const migrationProgress = migrateFetcher.data?.progress as
      | { total: number; completed: number; successful: number; failed: number }
      | undefined;
   const isMigrating = migrateFetcher.state !== "idle";

   return (
      <div className="flex flex-col gap-2">
         <div className="flex gap-2 justify-between">
            <Typography variant="h3" className="flex gap-2 items-center flex-wrap">
               <Image />
               Last opp bilder og video
            </Typography>
            <div className="flex gap-2">
               {hasMigrationNeeded ? (
                  <migrateFetcher.Form method="POST">
                     <input type="hidden" name="intent" value={migrateToBlockIntent} />
                     <Button type="submit" variant="outline" disabled={isMigrating}>
                        <CloudUpload className="mr-2" />
                        {isMigrating ? "Migrerer..." : `Migrer ${cloudinaryImagesToMigrate.length} til Blob`}
                     </Button>
                  </migrateFetcher.Form>
               ) : null}
               {isOrganizer ? <DownloadZip event={event} /> : null}
            </div>
         </div>
         {migrationProgress ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
               <Typography variant="h4" className="flex gap-2 items-center mb-2">
                  <Cloud />
                  Migreringsresultat
               </Typography>
               <Typography>
                  Totalt: {migrationProgress.total} | Fullført: {migrationProgress.successful} | Feilet:{" "}
                  {migrationProgress.failed}
               </Typography>
               {migrationProgress.failed > 0 && (
                  <Typography className="text-red-600 mt-2">
                     Noen filer kunne ikke migreres. Sjekk logger for detaljer.
                  </Typography>
               )}
            </div>
         ) : null}
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
