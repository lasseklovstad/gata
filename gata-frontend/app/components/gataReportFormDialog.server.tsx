import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";

import { getReportSimple, insertReport, updateReport } from "~/.server/db/report";
import { createAuthenticator } from "~/utils/auth.server";
import { reportSchema } from "~/utils/formSchema";
import { isMember } from "~/utils/roleUtils";

export const gataReportFormDialogLoader = async ({ request, params, context }: LoaderFunctionArgs) => {
   await createAuthenticator(context).getRequiredUser(request);
   return { report: params.reportId ? await getReportSimple(context, params.reportId) : undefined };
};

export const gataReportFormDialogAction = async ({ request, params, context }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);
   if (!isMember(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }
   const form = reportSchema.safeParse(await request.formData());
   if (form.error) {
      return json({ ...form.error.formErrors }, { status: 400 });
   }

   if (request.method === "POST") {
      const [{ reportId }] = await insertReport(context, form.data, loggedInUser);
      console.log("redirect to", reportId);
      return redirect(`/reportInfo/${reportId}`);
   }
   if (request.method === "PUT" && params.reportId) {
      await updateReport(context, params.reportId, form.data, loggedInUser);
      return redirect(`/reportInfo/${params.reportId}`);
   }
};
