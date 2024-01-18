import { ActionFunction, redirect } from "react-router-dom";

import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";

export const deleteResponsibilityYearAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();

   if (request.method === "DELETE") {
      await client(`user/${params.memberId}/responsibilityyear/${params.responsibilityYearId}`, {
         method: "DELETE",
         token,
      });
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};
