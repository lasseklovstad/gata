import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

type ConfirmDialogProps = {
   onClose: () => void;
   onConfirm: () => Promise<void>;
   text: string;
   open: boolean;
};

export const ConfirmDialog = ({ text, onClose, onConfirm, open }: ConfirmDialogProps) => {
   return (
      <Dialog maxWidth="xs" fullWidth open={open}>
         <DialogTitle>Er du sikker?</DialogTitle>
         <DialogContent>{text}</DialogContent>
         <DialogActions>
            <Button onClick={() => onClose()}>Avbryt</Button>
            <Button variant="contained" onClick={() => onConfirm()}>
               Ja
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export const useConfirmDialog = ({
   onConfirm,
   text,
   onClose,
}: Pick<ConfirmDialogProps, "onConfirm" | "text" | "onClose">) => {
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
      <ConfirmDialog open={open} onClose={closeConfirmDialog} onConfirm={handleConfirm} text={text} />
   );

   return { openConfirmDialog, ConfirmDialogComponent };
};
