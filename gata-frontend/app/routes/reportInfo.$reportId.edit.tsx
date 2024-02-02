import { GataReportFormDialog } from "~/components/GataReportFormDialog";
import { gataReportFormDialogLoader, gataReportFormDialogAction } from "~/components/gataReportFormDialog.server";

export const loader = gataReportFormDialogLoader;

export const action = gataReportFormDialogAction;

export default function NewNews() {
   return <GataReportFormDialog type="NEWS" />;
}
