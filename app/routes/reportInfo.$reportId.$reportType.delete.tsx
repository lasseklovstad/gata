import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteReport } from "~/.server/db/report";
import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { createAuthenticator } from "~/utils/auth.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
   await createAuthenticator().getRequiredUser(request);

   if (request.method === "DELETE" && params.reportId) {
      await deleteReport(params.reportId);
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
