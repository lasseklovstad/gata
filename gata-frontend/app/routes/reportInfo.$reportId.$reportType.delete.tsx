import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);

   if (request.method === "DELETE") {
      await client(`report/${params.reportId}`, {
         method: "DELETE",
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
