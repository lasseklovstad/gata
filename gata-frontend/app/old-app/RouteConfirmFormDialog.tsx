import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import type { FormProps } from "@remix-run/react";
import { useFetcher, useNavigate } from "@remix-run/react";

type RouteConfirmFormDialogProps = {
   title?: string;
   text: string;
   backTo: string;
} & Pick<FormProps, "method" | "action">;

export const RouteConfirmFormDialog = ({
   text,
   backTo,
   title = "Er du sikker?",
   method,
   action,
}: RouteConfirmFormDialogProps) => {
   const navigate = useNavigate();
   const fetcher = useFetcher();
   const onClose = () => navigate(backTo);

   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <fetcher.Form method={method} action={action}>
               <ModalHeader>{title}</ModalHeader>
               <ModalBody>{text}</ModalBody>
               <ModalFooter gap={2}>
                  <Button type="submit" isLoading={fetcher.state !== "idle"}>
                     Jeg er sikker
                  </Button>
                  <Button onClick={onClose} variant="ghost">
                     Avbryt
                  </Button>
               </ModalFooter>
            </fetcher.Form>
         </ModalContent>
      </Modal>
   );
};
