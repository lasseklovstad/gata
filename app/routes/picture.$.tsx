import { createReadStream, existsSync, promises } from "node:fs";
import { resolve } from "node:path";

import mime from "mime/lite";

import { getRequiredUser } from "~/utils/auth.server";
import { env } from "~/utils/env.server";

import type { Route } from "./+types/picture.$";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
   await getRequiredUser(request);
   const imagePath = resolve(`${env.IMAGE_DIR}/${params["*"]}`);
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
   const stream = createReadStream(imagePath);
   const readableStream = new ReadableStream({
      start(controller) {
         stream.on("data", (chunk) => controller.enqueue(chunk));
         stream.on("end", () => controller.close());
         stream.on("error", (err) => controller.error(err));
      },
   });
   return new Response(readableStream, { headers });
};
