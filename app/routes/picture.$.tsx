import { createReadStream, existsSync, promises } from "node:fs";
import { resolve } from "node:path";

import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import mime from "mime/lite";

import { createAuthenticator } from "~/utils/auth.server";
import { env } from "~/utils/env.server";

export const loader = defineLoader(async ({ request, params }) => {
   await createAuthenticator().getRequiredUser(request);
   console.log("PictureId", params["*"]);
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
   // @ts-ignore
   return new Response(createReadStream(imagePath), { headers });
});
