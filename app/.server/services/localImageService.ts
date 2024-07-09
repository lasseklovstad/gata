import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import sharp from "sharp";

import { env } from "~/utils/env.server";

const PRIVATE_PICTURE_ENDPOINT_URL = "/picture";

export const cropProfileImage = async (filepath: string, region: sharp.Region) => {
   const image = sharp(resolve(filepath));
   const imageMetadata = await image.metadata();
   const newName = `profile/${crypto.randomUUID()}.${imageMetadata.format}`;
   const newImagePath = resolve(`${env.IMAGE_DIR}/${newName}`);

   const profileImagePath = resolve(env.IMAGE_DIR, "profile");
   if (!existsSync(profileImagePath)) {
      mkdirSync(profileImagePath);
   }

   await image.extract(region).toFile(newImagePath);
   console.log("newImagePath", newImagePath);
   return `${PRIVATE_PICTURE_ENDPOINT_URL}/${newName}`;
};
