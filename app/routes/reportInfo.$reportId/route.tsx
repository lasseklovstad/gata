import { Edit, Mail, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, Outlet, useFetcher, useLoaderData } from "react-router";
import type { Descendant } from "slate";

import { getReport, updateReportContent } from "~/.server/db/report";
import { insertReportFile } from "~/.server/db/reportFile";
import { uploadImage } from "~/.server/services/cloudinaryService";
import { ClientOnly } from "~/components/ClientOnly";
import { PageLayout } from "~/components/PageLayout";
import { RichTextEditor } from "~/components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "~/components/RichTextEditor/RichTextPreview";
import { ButtonResponsive } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { getCloudinaryUploadFolder } from "~/utils/cloudinaryUtils";
import { formatDateTime } from "~/utils/date.utils";
import { isAdmin } from "~/utils/roleUtils";

import { reportInfoIntent } from "./intent";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
   return [{ title: `${data?.report.title} - Gata` }];
};

export const loader = async ({ request, params: { reportId } }: LoaderFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   if (!reportId) throw new Error("ReportId id required");
   const [report] = await Promise.all([getReport(reportId)]);
   return { report, loggedInUser };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const formData = await request.formData();
   const intent = String(formData.get("intent"));

   if (!params.reportId) {
      throw new Error("Report id is required");
   }

   switch (intent) {
      case reportInfoIntent.updateContentIntent: {
         await updateReportContent(params.reportId, String(formData.get("content")), loggedInUser);
         return { ok: true, close: String(formData.get("close")), intent: reportInfoIntent.updateContentIntent };
      }
      case reportInfoIntent.postFileIntent: {
         const data = String(formData.get("data"));
         const folder = `${getCloudinaryUploadFolder()}/report-${params.reportId}`;
         const { public_id, secure_url } = await uploadImage(data, folder);
         const [file] = await insertReportFile({
            reportId: params.reportId,
            cloudId: public_id,
            cloudUrl: secure_url,
         });
         return {
            ok: true,
            file,
            intent: reportInfoIntent.postFileIntent,
         };
      }
      default: {
         throw new Response(`Invalid intent "${intent}"`, { status: 400 });
      }
   }
};

export default function ReportInfoPage() {
   const { report, loggedInUser } = useLoaderData<typeof loader>();
   const canEdit = report.createdBy === loggedInUser.id || isAdmin(loggedInUser);
   const [editing, setEditing] = useState(false);
   const fetcher = useFetcher<typeof action>();

   const handleSaveContent = (content: Descendant[] | undefined, close: boolean) => {
      if (content) {
         void fetcher.submit(
            {
               content: JSON.stringify(content),
               close: close ? "true" : "false",
               intent: reportInfoIntent.updateContentIntent,
            },
            { method: "PUT", action: `/reportInfo/${report.id}` }
         );
      } else {
         if (close) {
            setEditing(false);
         }
      }
   };

   useEffect(() => {
      if (
         fetcher.state === "idle" &&
         fetcher.data &&
         fetcher.data.intent === reportInfoIntent.updateContentIntent &&
         fetcher.data.close === "true"
      ) {
         setEditing(false);
      }
   }, [fetcher.data, fetcher.state]);

   return (
      <>
         <PageLayout className="space-y-2">
            <div className="flex justify-between items-center flex-wrap">
               <Typography variant="h2" id="report-page-title">
                  {report.title}
               </Typography>
               {canEdit && (
                  <div className="flex gap-2">
                     <ButtonResponsive variant="ghost" as={Link} to="publish" label="Publiser" icon={<Mail />} />
                     <ButtonResponsive
                        variant="ghost"
                        as={Link}
                        to={`${report.type}/delete`}
                        label="Slett"
                        icon={<Trash />}
                     />
                     <ButtonResponsive variant="ghost" as={Link} to="edit" label="Rediger" icon={<Edit />} />
                  </div>
               )}
            </div>
            <Typography className="mb-2">{report.description}</Typography>
            {!editing && (
               <>
                  {canEdit && (
                     <div className="flex justify-end">
                        <ButtonResponsive onClick={() => setEditing(true)} label="Rediger innhold" icon={<Edit />} />
                     </div>
                  )}
                  <div
                     className="border rounded bg-background p-1 md:p-2"
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
               Sist redigert av: {report.lastModifiedBy}, {formatDateTime(report.lastModifiedDate)}
            </Typography>
         </PageLayout>
         <Outlet />
      </>
   );
}
