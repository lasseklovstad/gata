import { unstable_defineLoader as defineLoader } from "@remix-run/node";

import { getReportFile } from "~/.server/db/reportFile";
import { createAuthenticator } from "~/utils/auth.server";

export const loader = defineLoader(async ({ request, params }) => {
   if (!params.fileId) {
      throw new Error("File id is required");
   }
   await createAuthenticator().getRequiredUser(request);
   return await getReportFile(params.fileId);
});
