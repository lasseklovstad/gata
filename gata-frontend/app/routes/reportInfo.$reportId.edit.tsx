import { GataReportFormDialog } from "~/old-app/components/GataReportFormDialog";
import {
   gataReportFormDialogLoader,
   gataReportFormDialogAction,
} from "~/old-app/components/gataReportFormDialog.server";

export const loader = gataReportFormDialogLoader;

export const action = gataReportFormDialogAction;

export default function NewNews() {
   return <GataReportFormDialog type="NEWS" />;
}
