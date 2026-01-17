import { Readable } from "stream";

import type { UploadApiResponse } from "cloudinary";
import cloudinary from "cloudinary";

cloudinary.v2.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateZip = (folderName: string, zipName: string) => {
   const zipUrl = cloudinary.v2.utils.download_zip_url({
      resource_type: "all",
      prefixes: folderName,
      flatten_folders: true,
      target_public_id: zipName,
   });
   return zipUrl;
};

export function uploadImageToCloudinary(data: ArrayBuffer, folder: string) {
   const buffer = Buffer.from(data);
   const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
         {
            folder,
            resource_type: "auto",
         },
         (error, result) => {
            if (error) {
               console.error(error);
               reject(error as Error);
               return;
            }
            if (result) {
               resolve(result);
            }
         }
      );
      // Pipe the buffer to Cloudinary
      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
   });

   return uploadPromise;
}
