import { ActionFunction, redirect } from "react-router-dom";
import { client } from "../../api/client/client";
import { getRequiredAccessToken } from "../../auth0Client";

export const deleteResponsibilityAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();

   if (request.method === "DELETE") {
      await client(`responsibility/${params.responsibilityId}`, { method: "DELETE", token });
      return redirect("/responsibility");
   }
};
