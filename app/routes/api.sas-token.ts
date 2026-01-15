import { z } from "zod";

import { getRequiredUser } from "~/utils/auth.server";
import { createBlobSas } from "~/utils/azure.server";

import type { Route } from "./+types/api.sas-token";

const expireInMin = 5;
const expireInMs = expireInMin * 60 * 1000;

export const loader = async ({ request }: Route.LoaderArgs) => {
   const searchParams = new URL(request.url).searchParams;
   const eventId = z.coerce.number().parse(searchParams.get("eventId"));
   const reportId = z.string().optional().parse(searchParams.get("reportId"));
   const numberOfFiles = z.coerce.number().max(100).parse(searchParams.get("numberOfFiles"));
   await getRequiredUser(request);
   const containerName = process.env.NODE_ENV === "production" ? "gata" : "gata-local";

   return Promise.all(
      Array(numberOfFiles)
         .fill(null)
         .map(async () => {
            const id = crypto.randomUUID();
            const blobName = getBlobName({ eventId, id, reportId });
            return {
               id,
               token: await createBlobSas({
                  accountKey: process.env.AZURE_BLOB_KEY,
                  accountName: process.env.AZURE_BLOB_NAME,
                  containerName,
                  blobName,
                  permissions: "c", // create, no overwrite
                  expiresOn: new Date(new Date().valueOf() + expireInMs),
                  protocol: "https",
               }),
               url: `https://${process.env.AZURE_BLOB_NAME}.blob.core.windows.net/${containerName}/${blobName}`,
            };
         })
   );
};

const getBlobName = ({ eventId, reportId, id }: { eventId?: number; reportId?: string; id: string }) => {
   if (eventId) {
      return `event/${eventId}/${id}`;
   }
   if (reportId) {
      return `report/${reportId}/${id}`;
   }
   throw new Error("Could not generate blobname for token!");
};
