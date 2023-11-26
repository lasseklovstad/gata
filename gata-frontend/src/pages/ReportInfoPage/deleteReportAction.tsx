import { ActionFunction, redirect } from "react-router-dom";

import { client } from "../../api/client/client";
import { getRequiredAccessToken } from "../../auth0Client";

export const deleteReportAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();

   if (request.method === "DELETE") {
      await client(`report/${params.reportId}`, { method: "DELETE", token });
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};
