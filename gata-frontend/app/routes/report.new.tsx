import {
   GataReportFormDialog,
   gataReportFormDialogAction,
   gataReportFormDialogLoader,
} from "~/old-app/components/GataReportFormDialog";

export const loader = gataReportFormDialogLoader;

export const action = gataReportFormDialogAction;

export default function NewNews() {
   return <GataReportFormDialog type="DOCUMENT" />;
}
