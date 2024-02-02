import { Box, Button, Heading, IconButton, Text } from "@chakra-ui/react";
import { Delete, Edit, Email } from "@mui/icons-material";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Descendant } from "slate";

import { ClientOnly } from "~/components/ClientOnly";
import { PageLayout } from "~/components/PageLayout";
import { RichTextEditor } from "~/components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "~/components/RichTextEditor/RichTextPreview";
import type { IGataReport } from "~/types/GataReport.type";
import type { IGataReportFile, IGataReportFilePayload } from "~/types/GataReportFile.type";
import type { IGataUser } from "~/types/GataUser.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin } from "~/utils/roleUtils";

import { reportInfoIntent } from "./intent";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const report = await client<IGataReport>(`report/${params.reportId}`, { token });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   return json({ report, loggedInUser });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const formData = await request.formData();
   const intent = String(formData.get("intent"));

   switch (intent) {
      case reportInfoIntent.updateContentIntent: {
         const body = JSON.parse(String(formData.get("content")));
         await client(`report/${params.reportId}/content`, { method: "PUT", body, token });
         return json({ ok: true, close: formData.get("close"), intent: reportInfoIntent.updateContentIntent } as const);
      }
      case reportInfoIntent.postFileIntent: {
         const dataBody = String(formData.get("data"));
         const response = await client<IGataReportFile, IGataReportFilePayload>("file/cloud", {
            body: { data: dataBody, reportId: params.reportId! },
            token,
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
      <PageLayout>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <Heading as="h1" id="report-page-title">
               {report.title}
            </Heading>
            {canEdit && (
               <Box>
                  <Button
                     variant="ghost"
                     leftIcon={<Delete />}
                     as={Link}
                     to={`${report.type}/delete`}
                     sx={{ mr: 1, display: { base: "none", md: "inline-flex" } }}
                  >
                     Slett
                  </Button>
                  <Button variant="ghost" leftIcon={<Email />} as={Link} to={"publish"} sx={{ mr: 1 }}>
                     Publiser
                  </Button>
                  <Button
                     variant="ghost"
                     leftIcon={<Edit />}
                     as={Link}
                     to="edit"
                     sx={{ display: { base: "none", md: "inline-flex" } }}
                  >
                     Rediger info
                  </Button>
                  <IconButton
                     variant="ghost"
                     as={Link}
                     to="delete"
                     sx={{ mr: 1, display: { md: "none" } }}
                     icon={<Delete />}
                     aria-label="Slett"
                  />
                  <IconButton
                     variant="ghost"
                     as={Link}
                     to="edit"
                     sx={{ display: { md: "none" } }}
                     icon={<Edit />}
                     aria-label="Rediger"
                  />
               </Box>
            )}
         </Box>
         <Text mb={2}>{report.description}</Text>
         {!editing && (
            <>
               {canEdit && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                     <Button
                        leftIcon={<Edit />}
                        onClick={() => setEditing(true)}
                        sx={{ display: { base: "none", md: "flex" } }}
                     >
                        Rediger innhold
                     </Button>
                     <IconButton
                        variant="ghost"
                        onClick={() => setEditing(true)}
                        sx={{ display: { md: "none" } }}
                        aria-label="Rediger"
                        icon={<Edit />}
                     />
                  </Box>
               )}
               <Box
                  boxShadow="xs"
                  rounded={4}
                  bg="white"
                  sx={{ p: { base: 1, md: 2 } }}
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
                  {!report.content && <Text>Det er ikke lagt til innhold enda.</Text>}
               </Box>
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
         <Text fontSize="sm" color="gray" sx={{ mt: 1, mb: 10 }}>
            Sist redigert av: {report.lastModifiedBy}, {lastModifiedDate.toLocaleDateString("no")}{" "}
            {lastModifiedDate.toLocaleTimeString("no")}
         </Text>
         <Outlet />
      </PageLayout>
   );
}
