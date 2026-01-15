import { captureException } from "@sentry/react-router";
import { Loader2 } from "lucide-react";
import { href, useFetcher } from "react-router";

import { Input } from "~/components/ui/input";
import { Typography } from "~/components/ui/typography";
import type { loader } from "~/routes/api.sas-token";
import type { action } from "~/routes/event.$eventId.images/route";
import { uploadFilesIntent } from "~/routes/event.$eventId.images/uploadFilesAction";
import { fetchTokens, getMediaDimensions } from "~/utils/file.client";
import { uploadNewBlob } from "~/utils/file.utils";

type Props = {
   eventId: number;
};

export const UploadMedia = ({ eventId }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const isLoading = fetcher.state !== "idle";
   const actionPath = `/event/${eventId}/images`;

   const uploadFiles = async (files: FileList | null) => {
      if (files && files.length > 0) {
         const uploadedFiles: { id: string; type: string; width?: number; height?: number; url: string }[] = [];
         const sasTokens = await fetchTokens({ numberOfFiles: files.length, eventId });
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
                  url: token.url,
               });
            } catch (e: unknown) {
               console.error(e);
               captureException(e);
            }
         }
         if (uploadedFiles.length === 0) return;
         const formData = new FormData();
         uploadedFiles.forEach((file, index) => {
            formData.append(`files[${index}].id`, file.id);
            formData.append(`files[${index}].type`, file.type);
            formData.append(`files[${index}].url`, file.url);
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
