import type { CloudinaryImage } from "db/schema";

export const getIsVideo = (image: CloudinaryImage) => {
   return image.type?.startsWith("video");
};

export async function uploadNewBlob(file: Blob, { token, id }: { token: string; id: string }) {
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

export const transformCloudflare = (url: string, width = 400) => {
   if (url.includes("blob.core.windows.net")) {
      return `https://gataersamla.no/cdn-cgi/image/width=${width},format=auto/${url}`;
   }
   return url;
};
