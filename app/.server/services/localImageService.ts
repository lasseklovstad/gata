import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import sharp from "sharp";

import { env } from "~/utils/env.server";

const PRIVATE_PICTURE_ENDPOINT_URL = "/picture";

export const cropProfileImage = async (file: File, region: sharp.Region) => {
   const image = sharp(await file.arrayBuffer());
   const imageMetadata = await image.metadata();
   const newName = `profile/${crypto.randomUUID()}.${imageMetadata.format}`;
   const newImagePath = resolve(`${env.IMAGE_DIR}/${newName}`);

   const profileImagePath = resolve(env.IMAGE_DIR, "profile");
   if (!existsSync(profileImagePath)) {
      mkdirSync(profileImagePath, { recursive: true });
   }
   // Rotate based on Exif
   await image.rotate().extract(region).toFile(newImagePath);
   return `${PRIVATE_PICTURE_ENDPOINT_URL}/${newName}`;
};
