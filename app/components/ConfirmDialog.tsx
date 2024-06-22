import { useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { Dialog, DialogFooter, DialogHeading } from "./ui/dialog";
import { Typography } from "./ui/typography";

type ConfirmDialogProps = {
   onClose: () => void;
   onConfirm: () => Promise<void> | void;
   title?: string;
   text: string;
   open: boolean;
   showOnlyOk?: boolean;
   disabled?: boolean;
   isLoading?: boolean;
};

export const ConfirmDialog = ({
   text,
   onClose,
   onConfirm,
   open,
   title,
   showOnlyOk,
   isLoading,
   disabled,
}: ConfirmDialogProps) => {
   const ref = useRef<HTMLDialogElement>(null);

   useEffect(() => {
      if (!ref.current) return;
      if (open) {
         ref.current.showModal();
      } else {
         ref.current.close();
      }
   }, [open]);

   return (
      <Dialog ref={ref} onClose={onClose}>
         <DialogHeading>{title || "Er du sikker?"}</DialogHeading>
         <Typography>{text}</Typography>
         <DialogFooter>
            {showOnlyOk ? (
               <Button onClick={onClose} isLoading={isLoading} disabled={disabled}>
                  Ok
               </Button>
            ) : (
               <>
                  <Button onClick={onConfirm} isLoading={isLoading} disabled={disabled}>
                     Jeg er sikker
                  </Button>
                  <Button onClick={onClose} variant="ghost">
                     Avbryt
                  </Button>
               </>
            )}
         </DialogFooter>
      </Dialog>
   );
};

type UseConfirmDialogProps = {
   onClose?: () => void;
   onConfirm?: () => Promise<boolean | void> | void; // Return true if you want to close
} & Pick<ConfirmDialogProps, "text" | "title" | "showOnlyOk">;

export const useConfirmDialog = ({ onConfirm, text, onClose, title, showOnlyOk }: UseConfirmDialogProps) => {
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
         showOnlyOk={showOnlyOk}
      />
   );

   return { openConfirmDialog, ConfirmDialogComponent };
};
