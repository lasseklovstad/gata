import { Box, Button, Heading, IconButton, Text } from "@chakra-ui/react";
import { Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import { ActionFunction, json, Link, LoaderFunction, Outlet, useLoaderData, useSubmit } from "react-router-dom";
import { Descendant } from "slate";

import { PublishButton } from "./PublishButton";
import { client } from "../../api/client/client";
import { usePutGataReportContent } from "../../api/report.api";
import { getRequiredAccessToken } from "../../auth0Client";
import { PageLayout } from "../../components/PageLayout";
import { RichTextEditor } from "../../components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "../../components/RichTextEditor/RichTextPreview";
import { isAdmin } from "../../components/useRoles";
import { IGataReport } from "../../types/GataReport.type";
import { IGataUser } from "../../types/GataUser.type";

export const reportInfoPageLoader: LoaderFunction = async ({ request: { signal }, params }) => {
   const token = await getRequiredAccessToken();
   const report = await client<IGataReport>(`report/${params.reportId}`, { token, signal });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token, signal });
   return json<ReportInfoPageLoaderData>({ report, loggedInUser });
};

export const reportInfoPageAction: ActionFunction = () => {
   return json({});
};

interface ReportInfoPageLoaderData {
   report: IGataReport;
   loggedInUser: IGataUser;
}

export const ReportInfoPage = () => {
   const { report, loggedInUser } = useLoaderData() as ReportInfoPageLoaderData;
   const canEdit = report.createdBy?.id === loggedInUser.id || isAdmin(loggedInUser);
   const [editing, setEditing] = useState(false);
   const submit = useSubmit();

   const { putReportResponse, putReportContent } = usePutGataReportContent(report.id);

   const handleSaveContent = async (content: Descendant[] | undefined, close: boolean) => {
      if (content) {
         const { data } = await putReportContent(content);
         if (data) {
            submit({}, { method: "put", action: `/reportInfo/${report.id}` });
            close && setEditing(false);
         }
      } else {
         close && setEditing(false);
      }
   };
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
                  <PublishButton reportId={report.id} />
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
                  {report.content && <RichTextPreview content={report.content} />}
                  {!report.content && <Text>Det er ikke lagt til innhold enda.</Text>}
               </Box>
            </>
         )}
         {editing && (
            <>
               <RichTextEditor
                  initialContent={report.content}
                  onCancel={() => setEditing(false)}
                  onSave={handleSaveContent}
                  saveResponse={putReportResponse}
                  reportId={report.id}
               />
            </>
         )}
         <Text fontSize="sm" color="gray" sx={{ mt: 1, mb: 10 }}>
            Sist redigert av: {report.lastModifiedBy}, {lastModifiedDate.toLocaleDateString()}{" "}
            {lastModifiedDate.toLocaleTimeString()}
         </Text>
         <Outlet />
      </PageLayout>
   );
};
