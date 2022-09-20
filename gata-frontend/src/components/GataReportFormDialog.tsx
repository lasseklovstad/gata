import { Save } from "@mui/icons-material";
import { useState } from "react";
import { useSaveGataReport } from "../api/report.api";
import { GataReportType, IGataReport } from "../types/GataReport.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";
import {
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
   Button,
   FormControl,
   FormLabel,
   Input,
   FormHelperText,
   Textarea,
   FormErrorMessage,
} from "@chakra-ui/react";

type GataReportFormDialogProps = {
   onClose: () => void;
   onSuccess: (report: IGataReport) => void;
   report?: IGataReport;
   type: GataReportType;
};

export const GataReportFormDialog = ({ onClose, onSuccess, report, type }: GataReportFormDialogProps) => {
   const formType = report?.id ? "update" : "create";
   const [title, setTitle] = useState(report?.title || "");
   const [description, setDescription] = useState(report?.description || "");
   const [error, setError] = useState<string>();
   const { saveResponse, postReport, putReport } = useSaveGataReport();

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();
      if (title) {
         const { status, data } = report?.id
            ? await putReport(report.id, { title, description, type })
            : await postReport({ title, description, type });
         status === "success" && data && onSuccess(data);
      } else {
         setError("Tittel må fylles ut");
      }
   };

   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <form onSubmit={handleSubmit}>
               <ModalHeader>{formType === "update" ? "Rediger informasjon" : "Nytt dokument"}</ModalHeader>
               <ModalBody sx={{ display: "flex", flexDirection: "column" }}>
                  <FormControl isInvalid={!!error} isRequired>
                     <FormLabel>Tittel</FormLabel>
                     <Input variant="filled" value={title} onChange={(ev) => setTitle(ev.target.value)} />
                     <FormErrorMessage>{error}</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                     <FormLabel>Beskrivelse (Valgfri)</FormLabel>
                     <Textarea
                        variant="filled"
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                     />
                  </FormControl>
               </ModalBody>
               <ModalFooter gap={2}>
                  <LoadingButton type="submit" response={saveResponse} leftIcon={<Save />}>
                     Lagre
                  </LoadingButton>
                  <Button onClick={onClose} variant="ghost">
                     Avbryt
                  </Button>
               </ModalFooter>
               <ErrorAlert response={saveResponse} />
            </form>
         </ModalContent>
      </Modal>
   );
};
