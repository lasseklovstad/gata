import { writeReadableStreamToWritable } from "@remix-run/node"; // `writeAsyncIterableToWritable` is a Node-only utility
import type { UploadApiResponse } from "cloudinary";
// eslint-disable-next-line import/default
import cloudinary from "cloudinary";

cloudinary.v2.config({
   cloud_name: env.CLOUDINARY_NAME,
   api_key: env.CLOUDINARY_API_KEY,
   api_secret: env.CLOUDINARY_API_SECRET,
});

import { env } from "~/utils/env.server";

export const uploadImage = (data: string, folder: string) => {
   return new Promise<UploadApiResponse>((resolve, reject) => {
      void cloudinary.v2.uploader.upload(data, { folder }, (error, result) => {
         if (error) {
            console.error(error);
            reject(error);
         }
         if (result) {
            resolve(result);
         }
      });
   });
};

export const generateZip = (folderName: string, zipName: string) => {
   const zipUrl = cloudinary.v2.utils.download_zip_url({
      resource_type: "all",
      prefixes: folderName,
      flatten_folders: true,
      target_public_id: zipName,
   });
   return zipUrl;
};

export const deleteImage = (publicId: string) => {
   return new Promise((resolve, reject) => {
      void cloudinary.v2.uploader.destroy(publicId, (error, result) => {
         if (error) {
            reject(error);
         } else {
            resolve(result);
         }
      });
   });
};

export function uploadImageToCloudinary(data: ReadableStream<Uint8Array>, folder: string) {
   const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
         {
            folder,
            resource_type: "auto",
         },
         (error, result) => {
            if (error) {
               console.error(error);
               reject(error);
               return;
            }
            if (result) {
               resolve(result);
            }
         }
      );
      void writeReadableStreamToWritable(data, uploadStream);
   });

   return uploadPromise;
}
