import type { CloudinaryImage } from "db/schema";

export const getCloudinaryUploadFolder = () => {
   return process.env.NODE_ENV === "production" ? "gata" : "gata-local";
};

export const getIsVideo = (image: CloudinaryImage) => {
   // Todo: Remove video regexp.
   const videoRegexp = /.*\/video\/upload\/.*/;
   return videoRegexp.test(image.cloudUrl) || image.type?.startsWith("video");
};

export async function uploadNewBlob(file: File, { token, id }: { token: string; id: string }) {
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
