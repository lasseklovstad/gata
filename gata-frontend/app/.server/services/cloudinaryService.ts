import { AppLoadContext } from "@remix-run/cloudflare";
import crypto from "crypto";

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

export const uploadImage = async ({ cloudflare: { env } }: AppLoadContext, data: string) => {
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
