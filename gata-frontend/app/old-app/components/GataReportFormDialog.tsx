import {
   Button,
   FormControl,
   FormErrorMessage,
   FormLabel,
   Input,
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
   Textarea,
} from "@chakra-ui/react";
import { Save } from "@mui/icons-material";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";

import type { gataReportFormDialogLoader, gataReportFormDialogAction } from "./gataReportFormDialog.server";
import type { GataReportType } from "../types/GataReport.type";

type GataReportFormDialogProps = {
   type?: GataReportType;
};

export const GataReportFormDialog = ({ type }: GataReportFormDialogProps) => {
   const { report } = useLoaderData<typeof gataReportFormDialogLoader>();
   const fetcher = useFetcher<typeof gataReportFormDialogAction>();
   const navigate = useNavigate();
   const method = report ? "PUT" : "POST";
   const [title, setTitle] = useState(report?.title || "");
   const [description, setDescription] = useState(report?.description || "");
   const error = fetcher.data?.error;

   const onClose = () => navigate("..");

   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <fetcher.Form method={method}>
               <ModalHeader>{method === "PUT" ? "Rediger informasjon" : "Nytt dokument"}</ModalHeader>
               <ModalBody sx={{ display: "flex", flexDirection: "column" }}>
                  <FormControl isInvalid={!!error?.title} isRequired>
                     <FormLabel>Tittel</FormLabel>
                     <Input name="title" variant="filled" value={title} onChange={(ev) => setTitle(ev.target.value)} />
                     <FormErrorMessage>{error?.title}</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                     <FormLabel>Beskrivelse (Valgfri)</FormLabel>
                     <Textarea
                        name="description"
                        variant="filled"
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                     />
                  </FormControl>
                  <input hidden value={report?.type || type} readOnly name="type" />
               </ModalBody>
               <ModalFooter gap={2}>
                  <Button type="submit" isLoading={fetcher.state !== "idle"} leftIcon={<Save />}>
                     Lagre
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
