import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";

import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

import type { IGataReportSimple } from "../types/GataReport.type";

export const gataReportFormDialogLoader = async ({ request, params, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   if (params.reportId) {
      const report = await client<IGataReportSimple>(`report/${params.reportId}/simple`, {
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return json<GataReportFormDialogLoaderData>({ report });
   }
   return json<GataReportFormDialogLoaderData>({ report: undefined });
};

export const gataReportFormDialogAction = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const body = Object.fromEntries(await request.formData());
   if (!body.title) {
      return json({ error: { title: "Tittel må fylles ut" } }, { status: 400 });
   }

   if (request.method === "POST") {
      const response = await client<IGataReportSimple>("report", {
         method: "POST",
         body,
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return redirect(`/reportInfo/${response.id}`);
   }
   if (request.method === "PUT") {
      await client(`report/${params.reportId}`, {
         method: "PUT",
         body,
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return redirect(`/reportInfo/${params.reportId}`);
   }
};

interface GataReportFormDialogLoaderData {
   report: IGataReportSimple | undefined;
}
