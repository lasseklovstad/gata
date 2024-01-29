import { Email } from "@mui/icons-material";

import { usePublishReport } from "../../api/report.api";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { LoadingButton } from "../../components/Loading";

type PublishButtonProps = {
   reportId: string;
   reportEmails: string[]
};

export const PublishButton = ({ reportId, reportEmails }: PublishButtonProps) => {
   const { publishReport, publishResponse } = usePublishReport(reportId!);
   const { openConfirmDialog: openConfirmBeforePublish, ConfirmDialogComponent: ConfirmBeforePublishDialog } =
      useConfirmDialog({
         text: `Er du sikker du vil sende e-post til disse brukerne: ${reportEmails.join(", ")}?`,
         onConfirm: async () => {
            await publish();
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
            variant="ghost"
            leftIcon={<Email />}
            onClick={openConfirmBeforePublish}
            sx={{ mr: 1 }}
         >
            Publiser
         </LoadingButton>
      </>
   );
};
