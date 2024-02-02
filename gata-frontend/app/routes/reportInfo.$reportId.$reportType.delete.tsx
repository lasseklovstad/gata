import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);

   if (request.method === "DELETE") {
      await client(`report/${params.reportId}`, { method: "DELETE", token });
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
