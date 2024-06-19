import { writeAsyncIterableToWritable } from "@remix-run/node"; // `writeAsyncIterableToWritable` is a Node-only utility
import type { UploadApiResponse } from "cloudinary";
// eslint-disable-next-line import/default
import cloudinary from "cloudinary";

cloudinary.v2.config({
   cloud_name: env.CLOUDINARY_NAME,
   api_key: env.CLOUDINARY_API_KEY,
   api_secret: env.CLOUDINARY_API_SECRET,
});

import { env } from "~/utils/env.server";

export const uploadImage = async (data: string, folder: string) => {
   return new Promise<UploadApiResponse>((resolve, reject) => {
      void cloudinary.v2.uploader.upload(data, { folder }, (error, result) => {
         if (error) {
            reject(error);
         }
         if (result) {
            resolve(result);
         }
         throw new Error("Cloudinary upload failed");
      });
   });
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

export function uploadImageToCloudinary(data: AsyncIterable<Uint8Array>, folder: string) {
   const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
         {
            folder,
         },
         (error, result) => {
            if (error) {
               reject(error);
               return;
            }
            if (result) {
               resolve(result);
            }
         }
      );
      void writeAsyncIterableToWritable(data, uploadStream);
   });

   return uploadPromise;
}
