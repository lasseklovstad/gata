import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

import type { IGataReportFile } from "~/types/GataReportFile.type";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const response = await client<IGataReportFile>(`file/${params.fileId}`, {
      token,
      baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
   });
   return json(response);
};
