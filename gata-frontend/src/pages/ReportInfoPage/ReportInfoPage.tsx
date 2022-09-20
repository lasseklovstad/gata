import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, IconButton, Text, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Descendant } from "slate";
import { useGetGataReport, usePutGataReportContent, useSaveGataReport } from "../../api/report.api";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { GataReportFormDialog } from "../../components/GataReportFormDialog";
import { Loading } from "../../components/Loading";
import { PageLayout } from "../../components/PageLayout";
import { RichTextEditor } from "../../components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "../../components/RichTextEditor/RichTextPreview";
import { IGataReport } from "../../types/GataReport.type";
import { PublishButton } from "./PublishButton";

export const ReportInfoPage = () => {
   const { reportId } = useParams();
   const { reportResponse, canEdit } = useGetGataReport(reportId!);
   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
   const [editing, setEditing] = useState(false);
   const { openConfirmDialog: openConfirmCancel, ConfirmDialogComponent: ConfirmCancelDialog } = useConfirmDialog({
      text: "Ved å avbryte mister du alle endringene",
      onConfirm: async () => {
         setEditing(false);
      },
   });
   const { saveResponse, deleteReport } = useSaveGataReport();

   const navigate = useNavigate();
   const { openConfirmDialog: openConfirmDelete, ConfirmDialogComponent: ConfirmDeleteDialog } = useConfirmDialog({
      text: "Ved å slette dokumentet mister du all data",
      response: saveResponse,
      onConfirm: async () => {
         const { status } = await deleteReport(reportId!);
         if (status === "success") {
            navigate(report?.type === "NEWS" ? "/" : "/report", { replace: true });
            return true;
         }
         return false;
      },
   });

   const { putReportResponse, putReportContent } = usePutGataReportContent(reportId!);

   const [report, setReport] = useState<IGataReport>();

   useEffect(() => {
      setReport(reportResponse.data);
   }, [reportResponse.data]);

   const handleSaveContent = async (content: Descendant[] | undefined, close: boolean) => {
      if (content) {
         const { data } = await putReportContent(content);
         if (data) {
            setReport(data);
            close && setEditing(false);
         }
      } else {
         close && setEditing(false);
      }
   };

   if (!report || reportResponse.status !== "success") {
      return (
         <PageLayout>
            <Loading response={reportResponse} />
         </PageLayout>
      );
   }
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
                     onClick={openConfirmDelete}
                     sx={{ mr: 1, display: { base: "none", md: "inline-flex" } }}
                  >
                     Slett
                  </Button>
                  <PublishButton reportId={reportId!} />
                  <Button
                     variant="ghost"
                     leftIcon={<Edit />}
                     onClick={() => setIsReportModalOpen(true)}
                     sx={{ display: { base: "none", md: "inline-flex" } }}
                  >
                     Rediger info
                  </Button>
                  <IconButton
                     variant="ghost"
                     onClick={openConfirmDelete}
                     sx={{ mr: 1, display: { md: "none" } }}
                     icon={<Delete />}
                     aria-label="Slett"
                  />
                  <IconButton
                     variant="ghost"
                     onClick={() => setIsReportModalOpen(true)}
                     sx={{ display: { md: "none" } }}
                     icon={<Edit />}
                     aria-label="Rediger"
                  />
               </Box>
            )}
         </Box>
         {isReportModalOpen && report && (
            <GataReportFormDialog
               onClose={() => setIsReportModalOpen(false)}
               onSuccess={(r) => {
                  setReport(r);
                  setIsReportModalOpen(false);
               }}
               report={report}
               type={report.type}
            />
         )}
         {ConfirmCancelDialog}
         {ConfirmDeleteDialog}
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
                  onDoubleClick={() => setEditing(true)}
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
                  onCancel={openConfirmCancel}
                  onSave={handleSaveContent}
                  saveResponse={putReportResponse}
                  reportId={reportId!!}
               />
            </>
         )}
         <Text fontSize="sm" color="gray" sx={{ mt: 1, mb: 10 }}>
            Sist redigert av: {report.lastModifiedBy}, {lastModifiedDate.toLocaleDateString()}{" "}
            {lastModifiedDate.toLocaleTimeString()}
         </Text>
      </PageLayout>
   );
};
