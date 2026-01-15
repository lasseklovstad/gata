import { href } from "react-router";

import type { loader } from "~/routes/api.sas-token";

export function getMediaDimensions(file: File): Promise<{ width: number; height: number } | null> {
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

export const fetchTokens = async ({
   eventId,
   reportId,
   numberOfFiles,
}: {
   eventId?: number;
   reportId?: string;
   numberOfFiles: number;
}) => {
   const searchParams = new URLSearchParams({ numberOfFiles: numberOfFiles.toString() });
   if (eventId) {
      searchParams.set("eventId", eventId.toString());
   }
   if (reportId) {
      searchParams.set("reportId", reportId);
   }
   const response = await fetch(href("/api/sas-token") + "?" + searchParams.toString());
   return (await response.json()) as unknown as Awaited<ReturnType<typeof loader>>;
};
