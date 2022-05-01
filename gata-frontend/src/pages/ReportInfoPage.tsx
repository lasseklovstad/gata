import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Descendant } from "slate";
import { useGetGataReport, usePutGataReportContent, useSaveGataReport } from "../api/report.api";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { GataReportFormDialog } from "../components/GataReportFormDialog";
import { Loading } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";
import { RichTextEditor } from "../components/RichTextEditor/RichTextEditor";
import { RichTextPreview } from "../components/RichTextEditor/RichTextPreview";
import { useRoles } from "../components/useRoles";
import { IGataReport } from "../types/GataReport.type";

export const ReportInfoPage = () => {
   const { isAdmin } = useRoles();
   const { reportId } = useParams();
   const { reportResponse } = useGetGataReport(reportId!);
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
      text: "Ved å slette referatet mister du all data",
      response: saveResponse,
      onConfirm: async () => {
         const { status } = await deleteReport(reportId!);
         if (status === "success") {
            navigate("/report", { replace: true });
         }
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
            <Typography variant="h1" id="report-page-title">
               {report.title}
            </Typography>
            {isAdmin && (
               <Box>
                  <Button variant="text" startIcon={<Delete />} onClick={openConfirmDelete} sx={{ mr: 1 }}>
                     Slett
                  </Button>
                  <Button variant="contained" startIcon={<Edit />} onClick={() => setIsReportModalOpen(true)}>
                     Rediger info
                  </Button>
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
            />
         )}
         {ConfirmCancelDialog}
         {ConfirmDeleteDialog}
         <Typography variant="body1" gutterBottom>
            {report.description}
         </Typography>
         {!editing && (
            <>
               <Paper sx={{ p: 2 }} onDoubleClick={() => setEditing(true)}>
                  {isAdmin && (
                     <Button variant="outlined" onClick={() => setEditing(true)} sx={{ mb: 1 }}>
                        Start redigering
                     </Button>
                  )}
                  {report.content && <RichTextPreview content={report.content} />}
                  {!report.content && <Typography gutterBottom>Det er ikke lagt til innhold enda.</Typography>}
               </Paper>
            </>
         )}
         {editing && (
            <>
               <RichTextEditor
                  initialContent={report.content}
                  onCancel={openConfirmCancel}
                  onSave={handleSaveContent}
                  saveResponse={putReportResponse}
               />
            </>
         )}
         <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Sist redigert av: {report.lastModifiedBy}, {lastModifiedDate.toLocaleDateString()}{" "}
            {lastModifiedDate.toLocaleTimeString()}
         </Typography>
      </PageLayout>
   );
};
