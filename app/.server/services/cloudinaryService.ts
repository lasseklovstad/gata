import crypto from "node:crypto";

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

const generateSignature = (paramsToSign: Record<string, string | number>, apiSecret: string) => {
   const paramsString = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key].toString()}`)
      .join("&");

   return crypto
      .createHash("sha256")
      .update(paramsString + apiSecret)
      .digest("hex");
};

export const uploadImage = async (data: string) => {
   const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_NAME}/image/upload`;
   const formData = new FormData();
   formData.set("file", data);
   formData.set("api_key", env.CLOUDINARY_API_KEY);

   const timestamp = Math.floor(Date.now() / 1000);
   const paramsToSign = {
      timestamp,
   };

   const signature = generateSignature(paramsToSign, env.CLOUDINARY_API_SECRET);
   formData.set("signature", signature);
   formData.set("timestamp", timestamp.toString());

   const response = await fetch(url, {
      method: "POST",
      body: formData,
   });

   if (!response.ok) {
      const result = await response.json();
      console.error(JSON.stringify(result));
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
   }

   const result = await response.json();
   return result as { public_id: string; secure_url: string };
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
