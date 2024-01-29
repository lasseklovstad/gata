import { Box, Button, Heading, IconButton, Text } from "@chakra-ui/react";
import { Delete, Edit, Email } from "@mui/icons-material";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Descendant } from "slate";

import { client } from "~/utils/client";
import { ClientOnly } from "~/old-app/components/ClientOnly";
import { PageLayout } from "~/old-app/components/PageLayout";
import { RichTextEditor } from "~/old-app/components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "~/old-app/components/RichTextEditor/RichTextPreview";
import type { IGataReport } from "~/old-app/types/GataReport.type";
import type { IGataUser } from "~/old-app/types/GataUser.type";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const report = await client<IGataReport>(`report/${params.reportId}`, { token });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   return json<ReportInfoPageLoaderData>({ report, loggedInUser });
};

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const body = JSON.parse(String((await request.formData()).get("content")));
   await client(`report/${params.reportId}/content`, { method: "PUT", body, token });
   return json({});
};

interface ReportInfoPageLoaderData {
   report: IGataReport;
   loggedInUser: IGataUser;
}

export default function ReportInfoPage() {
   const { report, loggedInUser } = useLoaderData() as ReportInfoPageLoaderData;
   const canEdit = report.createdBy?.id === loggedInUser.id;
   const [editing, setEditing] = useState(false);
   const fetcher = useFetcher();
   const [closeEdit, setCloseEdit] = useState(false);

   const handleSaveContent = async (content: Descendant[] | undefined, close: boolean) => {
      if (content) {
         fetcher.submit({ content: JSON.stringify(content) }, { method: "put", action: `/reportInfo/${report.id}` });
         close && setCloseEdit(true);
      } else {
         close && setEditing(false);
      }
   };

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.type === "done") {
         closeEdit && setEditing(false);
         setCloseEdit(false);
      }
   }, [closeEdit, fetcher.state, fetcher.type]);

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
                  reportId={report.id}
               />
            </ClientOnly>
         )}
         <Text fontSize="sm" color="gray" sx={{ mt: 1, mb: 10 }}>
            Sist redigert av: {report.lastModifiedBy}, {lastModifiedDate.toLocaleDateString()}{" "}
            {lastModifiedDate.toLocaleTimeString()}
         </Text>
         <Outlet />
      </PageLayout>
   );
}
