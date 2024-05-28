import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { deleteReport } from "~/.server/db/report";
import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { createAuthenticator } from "~/utils/auth.server";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   await createAuthenticator(context).getRequiredUser(request);

   if (request.method === "DELETE" && params.reportId) {
      await deleteReport(context, params.reportId);
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
