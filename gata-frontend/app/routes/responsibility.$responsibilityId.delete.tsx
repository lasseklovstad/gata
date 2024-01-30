import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { RouteConfirmFormDialog } from "~/old-app/RouteConfirmFormDialog";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);

   if (request.method === "DELETE") {
      await client(`responsibility/${params.responsibilityId}`, { method: "DELETE", token });
      return redirect("/responsibility");
   }
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette dokumentet mister du all data" backTo=".." method="delete" />;
}
