import type { LoaderFunctionArgs } from "react-router";
import { href, redirect } from "react-router";

import { insertReportAndNotify } from "~/.server/data-layer/report";
import { getReportSimple, updateReport } from "~/.server/db/report";
import { getRequiredUser } from "~/utils/auth.server";
import { reportSchema } from "~/utils/formSchema";
import { RoleName } from "~/utils/roleUtils";
import { transformErrorResponse } from "~/utils/validateUtils";

export const gataReportFormDialogLoader = async ({ request, params }: LoaderFunctionArgs) => {
   await getRequiredUser(request);
   return { report: params.reportId ? await getReportSimple(params.reportId) : undefined };
};

export const gataReportFormDialogAction = async ({ request, params }: LoaderFunctionArgs) => {
   const loggedInUser = await getRequiredUser(request, [RoleName.Member]);
   const form = reportSchema.safeParse(await request.formData());
   if (form.error) {
      return transformErrorResponse(form.error);
   }

   if (request.method === "POST") {
      const { id } = await insertReportAndNotify(form.data, loggedInUser);
      return redirect(href("/reportInfo/:reportId", { reportId: id }));
   }
   if (request.method === "PUT" && params.reportId) {
      await updateReport(params.reportId, form.data, loggedInUser);
      return redirect(href("/reportInfo/:reportId", { reportId: params.reportId }));
   }
};
