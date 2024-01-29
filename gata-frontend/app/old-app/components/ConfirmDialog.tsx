import { Modal, ModalBody, ModalFooter, ModalHeader, ModalOverlay, Button, ModalContent } from "@chakra-ui/react";
import { useState } from "react";

import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";
import { UseClientState } from "../../utils/client.types";

type ConfirmDialogProps = {
   onClose: () => void;
   onConfirm: () => Promise<void>;
   title?: string;
   text: string;
   open: boolean;
   response?: UseClientState<unknown>;
   showOnlyOk?: boolean;
};

const ConfirmDialog = ({ text, onClose, onConfirm, open, response, title, showOnlyOk }: ConfirmDialogProps) => {
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
                     <LoadingButton response={response} onClick={onConfirm}>
                        Jeg er sikker
                     </LoadingButton>
                     <Button onClick={onClose} variant="ghost">
                        Avbryt
                     </Button>
                  </>
               )}
            </ModalFooter>
            {response && <ErrorAlert response={response} />}
         </ModalContent>
      </Modal>
   );
};

type UseConfirmDialogProps = {
   onClose?: () => void;
   onConfirm?: () => Promise<boolean | void> | void; // Return true if you want to close
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
