import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

import type { IGataReportSimple } from "../types/GataReport.type";

export const gataReportFormDialogLoader = async ({ request, params }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   if (params.reportId) {
      const report = await client<IGataReportSimple>(`report/${params.reportId}/simple`, {
         token,
      });
      return json<GataReportFormDialogLoaderData>({ report });
   }
   return json<GataReportFormDialogLoaderData>({ report: undefined });
};

export const gataReportFormDialogAction = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const body = Object.fromEntries(await request.formData());
   if (!body.title) {
      return json({ error: { title: "Tittel må fylles ut" } }, { status: 400 });
   }

   if (request.method === "POST") {
      const response = await client<IGataReportSimple>("report", { method: "POST", body, token });
      return redirect(`/reportInfo/${response.id}`);
   }
   if (request.method === "PUT") {
      await client(`report/${params.reportId}`, { method: "PUT", body, token });
      return redirect(`/reportInfo/${params.reportId}`);
   }
};

interface GataReportFormDialogLoaderData {
   report: IGataReportSimple | undefined;
}
