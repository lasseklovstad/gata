import {
   Button,
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel,
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
   Textarea,
} from "@chakra-ui/react";
import { Image } from "@mui/icons-material";
import { useState } from "react";

type AddImageProps = {
   onAddImage: (url: string) => void;
};

export const AddImage = ({ onAddImage }: AddImageProps) => {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [url, setUrl] = useState("");
   const [error, setError] = useState("");

   const reset = () => {
      setUrl("");
      setDialogOpen(false);
      setError("");
   };

   return (
      <>
         <Button variant="outline" leftIcon={<Image />} onClick={() => setDialogOpen(true)}>
            Bilde
         </Button>
         <Modal isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
            <ModalOverlay />
            <ModalContent>
               <ModalHeader>Legg til bilde</ModalHeader>
               <ModalBody>
                  <FormControl isInvalid={!!error}>
                     <FormLabel>Bilde url</FormLabel>
                     <Textarea
                        variant="filled"
                        placeholder="https://am3pap006files.storage.live.com/y4m9oBPr...."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                     />
                     <FormErrorMessage>{error}</FormErrorMessage>
                     <FormHelperText>Tips: Last opp filer på One Drive og del bilde med å lage en link</FormHelperText>
                  </FormControl>
               </ModalBody>
               <ModalFooter>
                  <Button
                     onClick={() => {
                        if (url.startsWith("https")) {
                           reset();
                           onAddImage(url);
                        } else {
                           setError("Url'en må starte med https");
                        }
                     }}
                  >
                     Lagre
                  </Button>
                  <Button onClick={() => reset()} variant="ghost">
                     Avbryt
                  </Button>
               </ModalFooter>
            </ModalContent>
         </Modal>
      </>
   );
};
