import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import type { IGataReportFile, IGataReportFilePayload } from "~/old-app/types/GataReportFile.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const dataBody = String((await request.formData()).get("data"));
   const response = await client<IGataReportFile, IGataReportFilePayload>("file/cloud", {
      body: { data: dataBody, reportId: params.reportId! },
      token,
   });
   return json(response);
};
