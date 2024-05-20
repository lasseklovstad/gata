import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { Edit, Mail, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import type { Descendant } from "slate";

import { getReport } from "~/api/report.api";
import { getLoggedInUser } from "~/api/user.api";
import { ClientOnly } from "~/components/ClientOnly";
import { PageLayout } from "~/components/PageLayout";
import { RichTextEditor } from "~/components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "~/components/RichTextEditor/RichTextPreview";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import type { IGataReportFile, IGataReportFilePayload } from "~/types/GataReportFile.type";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin } from "~/utils/roleUtils";

import { reportInfoIntent } from "./intent";

export const loader = async ({ request, params: { reportId }, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const signal = request.signal;
   const [loggedInUser, report] = await Promise.all([
      getLoggedInUser({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getReport({ token, signal, reportId, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);
   return json({ report, loggedInUser });
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const formData = await request.formData();
   const intent = String(formData.get("intent"));

   switch (intent) {
      case reportInfoIntent.updateContentIntent: {
         const body = JSON.parse(String(formData.get("content")));
         await client(`report/${params.reportId}/content`, {
            method: "PUT",
            body,
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
         return json({ ok: true, close: formData.get("close"), intent: reportInfoIntent.updateContentIntent } as const);
      }
      case reportInfoIntent.postFileIntent: {
         const dataBody = String(formData.get("data"));
         const response = await client<IGataReportFile, IGataReportFilePayload>("file/cloud", {
            body: { data: dataBody, reportId: params.reportId! },
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
         return json({ ok: true, file: response, intent: reportInfoIntent.postFileIntent } as const);
      }
      default: {
         throw new Response(`Invalid intent "${intent}"`, { status: 400 });
      }
   }
};

export default function ReportInfoPage() {
   const { report, loggedInUser } = useLoaderData<typeof loader>();
   const canEdit = report.createdBy?.id === loggedInUser.id || isAdmin(loggedInUser);
   const [editing, setEditing] = useState(false);
   const fetcher = useFetcher<typeof action>();

   const handleSaveContent = (content: Descendant[] | undefined, close: boolean) => {
      if (content) {
         fetcher.submit(
            {
               content: JSON.stringify(content),
               close: close ? "true" : "false",
               intent: reportInfoIntent.updateContentIntent,
            },
            { method: "PUT", action: `/reportInfo/${report.id}` }
         );
      } else {
         close && setEditing(false);
      }
   };

   useEffect(() => {
      if (
         fetcher.state === "idle" &&
         fetcher.data &&
         fetcher.data.ok &&
         fetcher.data.intent === reportInfoIntent.updateContentIntent &&
         fetcher.data.close === "true"
      ) {
         setEditing(false);
      }
   }, [fetcher.data, fetcher.state]);

   const lastModifiedDate = new Date(report.lastModifiedDate);

   return (
      <>
         <PageLayout className="space-y-2">
            <div className="flex justify-between items-center flex-wrap">
               <Typography variant="h2" id="report-page-title">
                  {report.title}
               </Typography>
               {canEdit && (
                  <div className="flex gap-2">
                     <Button variant="ghost" as={Link} to={`${report.type}/delete`} className="md:flex hidden">
                        <Trash className="mr-2" />
                        Slett
                     </Button>
                     <Button variant="ghost" as={Link} to={"publish"}>
                        <Mail className="mr-2" />
                        Publiser
                     </Button>
                     <Button variant="ghost" as={Link} to="edit" className="md:flex hidden">
                        <Edit className="mr-2" />
                        Rediger info
                     </Button>
                     <Button variant="ghost" size="icon" as={Link} to="delete" className="md:hidden" aria-label="Slett">
                        <Trash />
                     </Button>
                     <Button variant="ghost" size="icon" as={Link} to="edit" className="md:hidden" aria-label="Rediger">
                        <Edit />
                     </Button>
                  </div>
               )}
            </div>
            <Typography className="mb-2">{report.description}</Typography>
            {!editing && (
               <>
                  {canEdit && (
                     <div className="flex justify-end">
                        <Button onClick={() => setEditing(true)} className="md:flex hidden">
                           <Edit className="mr-2" />
                           Rediger innhold
                        </Button>
                        <Button size="icon" onClick={() => setEditing(true)} className="md:hidden" aria-label="Rediger">
                           <Edit />
                        </Button>
                     </div>
                  )}
                  <div
                     className="shadow border rounded bg-background p-1 md:p-2"
                     onDoubleClick={() => {
                        if (canEdit) {
                           setEditing(true);
                        }
                     }}
                  >
                     {report.content && (
                        <ClientOnly>
                           <RichTextPreview content={report.content} />
                        </ClientOnly>
                     )}
                     {!report.content && <Typography>Det er ikke lagt til innhold enda.</Typography>}
                  </div>
               </>
            )}
            {editing && (
               <ClientOnly>
                  <RichTextEditor
                     initialContent={report.content}
                     onCancel={() => setEditing(false)}
                     onSave={handleSaveContent}
                     isLoading={fetcher.state !== "idle"}
                  />
               </ClientOnly>
            )}
            <Typography variant="mutedText" className="mt-1 mb-10">
               Sist redigert av: {report.lastModifiedBy}, {lastModifiedDate.toLocaleDateString("no")}{" "}
               {lastModifiedDate.toLocaleTimeString("no")}
            </Typography>
         </PageLayout>
         <Outlet />
      </>
   );
}
