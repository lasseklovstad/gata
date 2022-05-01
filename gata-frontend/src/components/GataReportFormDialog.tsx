import { Save } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useState } from "react";
import { useSaveGataReport } from "../api/report.api";
import { IGataReport } from "../types/GataReport.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";

type GataReportFormDialogProps = {
   onClose: () => void;
   onSuccess: (report: IGataReport) => void;
   report?: IGataReport;
};

export const GataReportFormDialog = ({ onClose, onSuccess, report }: GataReportFormDialogProps) => {
   const type = report?.id ? "update" : "create";
   const [title, setTitle] = useState(report?.title || "");
   const [description, setDescription] = useState(report?.description || "");
   const [error, setError] = useState<string>();
   const { saveResponse, postReport, putReport } = useSaveGataReport();

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();
      if (title) {
         const { status, data } = report?.id
            ? await putReport(report.id, { title, description })
            : await postReport({ title, description });
         status === "success" && data && onSuccess(data);
      } else {
         setError("Tittel må fylles ut");
      }
   };

   return (
      <Dialog open maxWidth="xs" fullWidth>
         <form onSubmit={handleSubmit}>
            <DialogTitle>{type === "update" ? "Rediger referat info" : "Nytt referat"}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
               <TextField
                  variant="filled"
                  autoFocus
                  sx={{ mb: 2 }}
                  inputProps={{ maxLength: 255 }}
                  label="Tittel"
                  value={title}
                  onChange={(ev) => setTitle(ev.target.value)}
                  error={!!error}
                  helperText={error}
               />
               <TextField
                  variant="filled"
                  multiline
                  inputProps={{ maxLength: 255 }}
                  rows={3}
                  label="Beskrivelse (Valgfri)"
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
               />
            </DialogContent>
            <DialogActions>
               <Button onClick={onClose}>Avbryt</Button>
               <LoadingButton type="submit" response={saveResponse} variant="contained" startIcon={<Save />}>
                  Lagre
               </LoadingButton>
            </DialogActions>
            <ErrorAlert response={saveResponse} />
         </form>
      </Dialog>
   );
};
