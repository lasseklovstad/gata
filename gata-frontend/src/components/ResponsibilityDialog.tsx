import { Save } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useState } from "react";
import { useSaveResponsibility } from "../api/responsibility.api";
import { IResponsibility } from "../types/Responsibility.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";

type ResponsibilityDialogProps = {
   onClose: () => void;
   onSuccess: (responsibility: IResponsibility, type: "update" | "create") => void;
   responsibility: IResponsibility | undefined;
};

export const ResponsibilityDialog = ({ onClose, onSuccess, responsibility }: ResponsibilityDialogProps) => {
   const type = responsibility?.id ? "update" : "create";
   const [name, setName] = useState(responsibility?.name || "");
   const [description, setDescription] = useState(responsibility?.description || "");
   const [error, setError] = useState<string>();
   const { response, postResponsibility, putResponsibility } = useSaveResponsibility();

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();
      if (name) {
         const { status, data } = responsibility?.id
            ? await putResponsibility({ name, description, id: responsibility.id })
            : await postResponsibility({ name, description });
         status === "success" && data && onSuccess(data, type);
      } else {
         setError("Navn må fylles ut");
      }
   };

   return (
      <Dialog open maxWidth="xs" fullWidth>
         <form onSubmit={handleSubmit}>
            <DialogTitle>{type === "update" ? "Rediger Ansvarspost" : "Ny Ansvarspost"}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
               <TextField
                  variant="filled"
                  autoFocus
                  sx={{ mb: 2 }}
                  label="Navn"
                  value={name}
                  inputProps={{ maxLength: 255 }}
                  onChange={(ev) => setName(ev.target.value)}
                  error={!!error}
                  helperText={error}
               />
               <TextField
                  variant="filled"
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 255 }}
                  label="Beskrivelse (Valgfri)"
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
               />
            </DialogContent>
            <DialogActions>
               <Button onClick={onClose}>Avbryt</Button>
               <LoadingButton type="submit" response={response} variant="contained" startIcon={<Save />}>
                  Lagre
               </LoadingButton>
            </DialogActions>
            <ErrorAlert response={response} />
         </form>
      </Dialog>
   );
};
