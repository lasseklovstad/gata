import { LoaderFunction, json } from "@remix-run/node";
import { client } from "~/old-app/api/client/client";
import type { IGataReportFile } from "~/old-app/types/GataReportFile.type";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const response = await client<IGataReportFile>(`file/${params.fileId}`, { token });
   return json(response);
};
