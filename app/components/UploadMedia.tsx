import { Loader2 } from "lucide-react";
import { href, useFetcher } from "react-router";

import { Input } from "~/components/ui/input";
import { Typography } from "~/components/ui/typography";
import type { loader } from "~/routes/api.sas-token";
import type { action } from "~/routes/event.$eventId.images/route";
import { uploadFilesIntent } from "~/routes/event.$eventId.images/uploadFilesAction";

type Props = {
   eventId: number;
};

export const UploadMedia = ({ eventId }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const isLoading = fetcher.state !== "idle";
   const actionPath = `/event/${eventId}/images`;

   function getMediaDimensions(file: File): Promise<{ width: number; height: number } | null> {
      if (file.type.startsWith("image/")) {
         return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
               URL.revokeObjectURL(img.src);
               resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
               URL.revokeObjectURL(img.src);
               resolve(null);
            };
            img.src = URL.createObjectURL(file);
         });
      }

      if (file.type.startsWith("video/")) {
         return new Promise((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
               URL.revokeObjectURL(video.src);
               resolve({ width: video.videoWidth, height: video.videoHeight });
            };
            video.onerror = () => {
               URL.revokeObjectURL(video.src);
               resolve(null);
            };
            video.src = URL.createObjectURL(file);
         });
      }

      return Promise.resolve(null);
   }

   async function uploadNewBlob(file: File, { token, id }: { token: string; id: string }) {
      const res = await fetch(token, {
         method: "PUT",
         headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type || "application/octet-stream",
         },
         body: file,
      });
      if (res.status === 409) {
         throw new Error("Blob already exists (conflict).");
      }
      if (!res.ok) {
         throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
      }
      return { id, type: file.type.toString() };
   }

   const uploadFiles = async (files: FileList | null) => {
      if (files && files.length > 0) {
         const uploadedFiles: { id: string; type: string; width?: number; height?: number }[] = [];
         const formData = new FormData();
         const response = await fetch(
            href("/api/sas-token") +
               "?" +
               new URLSearchParams({
                  eventId: eventId.toString(),
                  numberOfFiles: files.length.toString(),
               }).toString()
         );
         const sasTokens = (await response.json()) as unknown as Awaited<ReturnType<typeof loader>>;
         for (let i = 0; i < files.length; i++) {
            try {
               const file = files.item(i);
               const token = sasTokens[i];
               // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
               if (!token) {
                  throw new Error("Could not find token");
               }
               if (!file) {
                  throw new Error("Could not find file");
               }
               const dimensions = await getMediaDimensions(file);
               const uploadResponse = await uploadNewBlob(file, token);
               uploadedFiles.push({
                  ...uploadResponse,
                  ...(dimensions && { width: dimensions.width, height: dimensions.height }),
               });
            } catch (e: unknown) {
               console.error(e);
            }
         }
         if (uploadedFiles.length === 0) return;
         uploadedFiles.forEach((file, index) => {
            formData.append(`files[${index}].id`, file.id);
            formData.append(`files[${index}].type`, file.type);
            if (file.width !== undefined) {
               formData.append(`files[${index}].width`, file.width.toString());
            }
            if (file.height !== undefined) {
               formData.append(`files[${index}].height`, file.height.toString());
            }
         });
         formData.set("intent", uploadFilesIntent);
         await fetcher.submit(formData, { method: "POST", action: actionPath });
      }
   };
   return (
      <>
         <div className="flex gap-2 items-center flex-wrap max-w-full">
            <Input
               onChange={(event) => {
                  const files = event.target.files;
                  void uploadFiles(files).then(() => (event.target.value = ""));
               }}
               className="w-fit"
               type="file"
               multiple
               accept="image/*,video/*"
               disabled={isLoading}
            />
            {isLoading ? (
               <Typography variant="largeText" className="flex gap-2 items-center">
                  <Loader2 className="text-primary size-8 animate-spin" /> Laster opp bilder/video...
               </Typography>
            ) : null}
         </div>
      </>
   );
};
