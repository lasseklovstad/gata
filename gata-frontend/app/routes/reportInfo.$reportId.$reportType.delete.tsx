import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { RouteConfirmFormDialog } from "~/old-app/RouteConfirmFormDialog";
import { client } from "~/old-app/api/client/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);

   if (request.method === "DELETE") {
      await client(`report/${params.reportId}`, { method: "DELETE", token });
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
