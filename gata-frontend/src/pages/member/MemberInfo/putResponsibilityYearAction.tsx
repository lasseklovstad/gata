import { ActionFunction, redirect } from "react-router-dom";

import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";

export const putResponsibilityYearAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();

   if (request.method === "PUT") {
      const body = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear/${params.responsibilityYearId}/note`, {
         method: "PUT",
         body,
         token,
      });
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};
