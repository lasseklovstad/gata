import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { client } from "~/old-app/api/client/client";
import type { IGataReportFile, IGataReportFilePayload } from "~/old-app/types/GataReportFile.type";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const dataBody = String((await request.formData()).get("data"));
   const response = await client<IGataReportFile, IGataReportFilePayload>("file/cloud", {
      body: { data: dataBody, reportId: params.reportId! },
      token,
   });
   return json(response);
};
