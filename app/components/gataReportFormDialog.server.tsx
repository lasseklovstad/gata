import {
   unstable_defineAction as defineAction,
   unstable_defineLoader as defineLoader,
   redirect,
} from "@remix-run/node";

import { getReportSimple, insertReport, updateReport } from "~/.server/db/report";
import { createAuthenticator } from "~/utils/auth.server";
import { reportSchema } from "~/utils/formSchema";
import { isMember } from "~/utils/roleUtils";
import { transformErrorResponse } from "~/utils/validateUtils";

export const gataReportFormDialogLoader = defineLoader(async ({ request, params }) => {
   await createAuthenticator().getRequiredUser(request);
   return { report: params.reportId ? await getReportSimple(params.reportId) : undefined };
});

export const gataReportFormDialogAction = defineAction(async ({ request, params }) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   if (!isMember(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }
   const form = reportSchema.safeParse(await request.formData());
   if (form.error) {
      return transformErrorResponse(form.error);
   }

   if (request.method === "POST") {
      const [{ reportId }] = await insertReport(form.data, loggedInUser);
      return redirect(`/reportInfo/${reportId}`);
   }
   if (request.method === "PUT" && params.reportId) {
      await updateReport(params.reportId, form.data, loggedInUser);
      return redirect(`/reportInfo/${params.reportId}`);
   }
});
