import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import { UseClientState } from "../api/client/client.types";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";

type ConfirmDialogProps = {
   onClose: () => void;
   onConfirm: () => Promise<void>;
   title?: string;
   text: string;
   open: boolean;
   response?: UseClientState<unknown>;
   showOnlyOk?: boolean;
};

export const ConfirmDialog = ({ text, onClose, onConfirm, open, response, title, showOnlyOk }: ConfirmDialogProps) => {
   return (
      <Dialog maxWidth="xs" fullWidth open={open}>
         <DialogTitle>{title || "Er du sikker?"}</DialogTitle>
         <DialogContent>{text}</DialogContent>
         <DialogActions>
            {showOnlyOk ? (
               <Button onClick={onClose} variant="contained">
                  Ok
               </Button>
            ) : (
               <>
                  <Button onClick={onClose}>Avbryt</Button>
                  <LoadingButton response={response} variant="contained" onClick={onConfirm}>
                     Jeg er sikker
                  </LoadingButton>
               </>
            )}
         </DialogActions>
         {response && <ErrorAlert response={response} />}
      </Dialog>
   );
};

type UseConfirmDialogProps = {
   onClose?: () => void;
   onConfirm?: () => Promise<boolean | void>; // Return true if you want to close
} & Pick<ConfirmDialogProps, "text" | "response" | "title" | "showOnlyOk">;

export const useConfirmDialog = ({ onConfirm, text, onClose, response, title, showOnlyOk }: UseConfirmDialogProps) => {
   const [open, setOpen] = useState(false);
   const openConfirmDialog = () => setOpen(true);
   const closeConfirmDialog = () => {
      setOpen(false);
      onClose && onClose();
   };

   const handleConfirm = async () => {
      if (onConfirm) {
         const close = await onConfirm();
         close || (close === undefined && closeConfirmDialog());
      } else {
         closeConfirmDialog();
      }
   };

   const ConfirmDialogComponent = (
      <ConfirmDialog
         open={open}
         onClose={closeConfirmDialog}
         onConfirm={handleConfirm}
         text={text}
         title={title}
         response={response}
         showOnlyOk={showOnlyOk}
      />
   );

   return { openConfirmDialog, ConfirmDialogComponent };
};
