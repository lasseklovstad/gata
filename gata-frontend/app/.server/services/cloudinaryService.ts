import { AppLoadContext } from "@remix-run/cloudflare";
import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (context: AppLoadContext, data: string) => {
   // Configure Cloudinary with your credentials
   cloudinary.config({
      cloud_name: context.cloudflare.env.CLOUDINARY_NAME,
      api_key: context.cloudflare.env.CLOUDINARY_API_KEY,
      api_secret: context.cloudflare.env.CLOUDINARY_API_SECRET,
   });
   const result = await cloudinary.uploader.upload(data);
   return result;
};
