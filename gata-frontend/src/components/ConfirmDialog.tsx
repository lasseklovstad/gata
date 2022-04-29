import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import { UseClientState } from "../api/client/client.types";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";

type ConfirmDialogProps = {
   onClose: () => void;
   onConfirm: () => Promise<void>;
   text: string;
   open: boolean;
   response?: UseClientState<unknown>;
};

export const ConfirmDialog = ({ text, onClose, onConfirm, open, response }: ConfirmDialogProps) => {
   return (
      <Dialog maxWidth="xs" fullWidth open={open}>
         <DialogTitle>Er du sikker?</DialogTitle>
         <DialogContent>{text}</DialogContent>
         <DialogActions>
            <Button onClick={onClose}>Avbryt</Button>
            <LoadingButton response={response} variant="contained" onClick={onConfirm}>
               Jeg er sikker
            </LoadingButton>
         </DialogActions>
         {response && <ErrorAlert response={response} />}
      </Dialog>
   );
};

export const useConfirmDialog = ({
   onConfirm,
   text,
   onClose,
   response,
}: Pick<ConfirmDialogProps, "onConfirm" | "text" | "onClose" | "response">) => {
   const [open, setOpen] = useState(false);
   const openConfirmDialog = () => setOpen(true);
   const closeConfirmDialog = () => {
      setOpen(false);
      onClose();
   };

   const handleConfirm = async () => {
      await onConfirm();
      closeConfirmDialog();
   };

   const ConfirmDialogComponent = (
      <ConfirmDialog
         open={open}
         onClose={closeConfirmDialog}
         onConfirm={handleConfirm}
         text={text}
         response={response}
      />
   );

   return { openConfirmDialog, ConfirmDialogComponent };
};
