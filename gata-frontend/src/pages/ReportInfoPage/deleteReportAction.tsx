import { ActionFunction, redirect } from "react-router-dom";
import { getRequiredAccessToken } from "../../auth0Client";
import { client } from "../../api/client/client";

export const deleteReportAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();

   if (request.method === "DELETE") {
      await client(`report/${params.reportId}`, { method: "DELETE", token });
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};
