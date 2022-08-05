import { useConfirmDialog } from "../../components/ConfirmDialog";
import { useGetReportEmails, usePublishReport } from "../../api/report.api";
import { Email } from "@mui/icons-material";
import { LoadingButton } from "../../components/Loading";

type PublishButtonProps = {
   reportId: string;
};

export const PublishButton = ({ reportId }: PublishButtonProps) => {
   const { publishReport, publishResponse } = usePublishReport(reportId!);
   const { emailsResponse } = useGetReportEmails();
   const emails = emailsResponse.data || [];
   const { openConfirmDialog: openConfirmBeforePublish, ConfirmDialogComponent: ConfirmBeforePublishDialog } =
      useConfirmDialog({
         text: `Er du sikker du vil sende e-post til disse brukerne: ${emails.join(", ")}?`,
         onConfirm: async () => {
            publish();
         },
      });
   const { openConfirmDialog: openConfirmPublish, ConfirmDialogComponent: ConfirmPublishDialog } = useConfirmDialog({
      text: `Det ble sent en email til: ${
         publishResponse.data && publishResponse.data.length ? publishResponse.data?.join(", ") : "Ingen"
      }`,
      title: "Vellykket",
      showOnlyOk: true,
   });

   const publish = async () => {
      const { data } = await publishReport();
      data && openConfirmPublish();
   };

   return (
      <>
         {ConfirmPublishDialog}
         {ConfirmBeforePublishDialog}
         <LoadingButton
            response={publishResponse}
            variant="text"
            startIcon={<Email />}
            onClick={openConfirmBeforePublish}
            sx={{ mr: 1 }}
         >
            Publiser
         </LoadingButton>
      </>
   );
};
