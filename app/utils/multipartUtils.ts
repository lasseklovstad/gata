import { parseMultipartRequest } from "@mjackson/multipart-parser";

import { uploadImageToCloudinary } from "~/.server/services/cloudinaryService";

type CloudinaryFilePart = {
   cloudId: string;
   cloudUrl: string;
   width: number;
   height: number;
   name: "cloudinary-file";
};
type TextPart = { name: string; value: string };

type Part = CloudinaryFilePart | TextPart;

type Options = {
   cloudinaryFolder: string;
};

export const isCloudinaryFilePart = (part: Part): part is CloudinaryFilePart => {
   return part.name === "cloudinary-file";
};

export const uploadFilesToCloudinaryAndGetMultiformParts = async (request: Request, options: Options) => {
   const parts: Part[] = [];
   for await (const part of parseMultipartRequest(request)) {
      const name = part.name;
      if (part.isFile && name === "cloudinary-file") {
         const response = await uploadImageToCloudinary(part.body, options.cloudinaryFolder);
         const { secure_url, public_id, width, height } = response;
         parts.push({ cloudId: public_id, cloudUrl: secure_url, width, height, name });
      } else if (name) {
         parts.push({
            name: part.name,
            value: await part.text(),
         });
      }
   }
   return parts;
};
