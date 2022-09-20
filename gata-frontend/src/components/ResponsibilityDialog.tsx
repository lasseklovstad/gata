import { Save } from "@mui/icons-material";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalContent,
   ModalOverlay,
   Textarea,
   Button,
   ModalFooter,
   FormControl,
   FormLabel,
   FormErrorMessage,
   Input,
} from "@chakra-ui/react";
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
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <form onSubmit={handleSubmit}>
               <ModalHeader>{type === "update" ? "Rediger Ansvarspost" : "Ny Ansvarspost"}</ModalHeader>
               <ModalBody sx={{ display: "flex", flexDirection: "column" }}>
                  <FormControl isInvalid={!!error} mb={2}>
                     <FormLabel>Navn</FormLabel>
                     <Input variant="filled" value={name} onChange={(ev) => setName(ev.target.value)} />
                     <FormErrorMessage>{error}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                     <FormLabel>Beskrivelse</FormLabel>
                     <Textarea
                        variant="filled"
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                     />
                  </FormControl>
               </ModalBody>
               <ModalFooter>
                  <LoadingButton type="submit" response={response} leftIcon={<Save />}>
                     Lagre
                  </LoadingButton>
                  <Button onClick={onClose} variant="ghost">
                     Avbryt
                  </Button>
               </ModalFooter>
               <ErrorAlert response={response} />
            </form>
         </ModalContent>
      </Modal>
   );
};
