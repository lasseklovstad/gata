import { LoaderFunction, json } from "@remix-run/node";

import type { IGataReportFile } from "~/old-app/types/GataReportFile.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader: LoaderFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const response = await client<IGataReportFile>(`file/${params.fileId}`, { token });
   return json(response);
};
