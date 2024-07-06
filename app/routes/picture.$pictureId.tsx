import { createReadStream, existsSync, promises } from "node:fs";
import { resolve } from "node:path";

import { type LoaderFunctionArgs } from "@remix-run/node";
import mime from "mime/lite";

import { env } from "~/utils/env.server";

export const loader = async ({ params: { pictureId } }: LoaderFunctionArgs) => {
   const imagePath = resolve(`${env.IMAGE_DIR}/${pictureId}`);
   if (!existsSync(imagePath)) {
      throw new Response("Not Found", {
         status: 404,
      });
   }

   const stat = await promises.stat(imagePath);
   const mimeType = mime.getType(imagePath) || "application/octet-stream";

   const headers = new Headers();
   headers.set("Content-Type", mimeType);
   headers.set("Content-Length", stat.size.toString());
   // @ts-ignore
   return new Response(createReadStream(imagePath), { headers });
};
