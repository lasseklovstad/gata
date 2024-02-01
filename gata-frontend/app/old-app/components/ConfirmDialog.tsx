import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useState } from "react";

type ConfirmDialogProps = {
   onClose: () => void;
   onConfirm: () => Promise<void>;
   title?: string;
   text: string;
   open: boolean;
   showOnlyOk?: boolean;
};

const ConfirmDialog = ({ text, onClose, onConfirm, open, title, showOnlyOk }: ConfirmDialogProps) => {
   return (
      <Modal isOpen={open} onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <ModalHeader>{title || "Er du sikker?"}</ModalHeader>
            <ModalBody>{text}</ModalBody>
            <ModalFooter gap={2}>
               {showOnlyOk ? (
                  <Button onClick={onClose}>Ok</Button>
               ) : (
                  <>
                     <Button onClick={onConfirm}>Jeg er sikker</Button>
                     <Button onClick={onClose} variant="ghost">
                        Avbryt
                     </Button>
                  </>
               )}
            </ModalFooter>
         </ModalContent>
      </Modal>
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
