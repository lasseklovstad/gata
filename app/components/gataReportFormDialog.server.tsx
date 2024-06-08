import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { getReportSimple, insertReport, updateReport } from "~/.server/db/report";
import { createAuthenticator } from "~/utils/auth.server";
import { reportSchema } from "~/utils/formSchema";
import { isMember } from "~/utils/roleUtils";

export const gataReportFormDialogLoader = async ({ request, params }: LoaderFunctionArgs) => {
   await createAuthenticator().getRequiredUser(request);
   return { report: params.reportId ? await getReportSimple(params.reportId) : undefined };
};

export const gataReportFormDialogAction = async ({ request, params }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   if (!isMember(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }
   const form = reportSchema.safeParse(await request.formData());
   if (form.error) {
      return json({ ...form.error.formErrors }, { status: 400 });
   }

   if (request.method === "POST") {
      const [{ reportId }] = await insertReport(form.data, loggedInUser);
      return redirect(`/reportInfo/${reportId}`);
   }
   if (request.method === "PUT" && params.reportId) {
      await updateReport(params.reportId, form.data, loggedInUser);
      return redirect(`/reportInfo/${params.reportId}`);
   }
};
