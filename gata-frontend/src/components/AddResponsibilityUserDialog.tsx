import { Save } from "@mui/icons-material";
import { useState } from "react";
import { useGetResponisibilies } from "../api/responsibility.api";
import { useSaveResponsibilityForUser } from "../api/user.api";
import { IResponsibilityYear } from "../types/ResponsibilityYear.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";
import {
   Button,
   FormControl,
   FormLabel,
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";

type AddResponsibilityUserDialogProps = {
   onClose: () => void;
   onSuccess: (responsibility: IResponsibilityYear[]) => void;
   userId: string;
};

type IOption = { value: string; label: string };

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export const AddResponsibilityUserDialog = ({ onClose, onSuccess, userId }: AddResponsibilityUserDialogProps) => {
   const { responsibilitiesResponse } = useGetResponisibilies();
   const [selectedResp, setSelectedResp] = useState<IOption | null>();
   const [selectedYear, setSelectedYear] = useState<IOption | null>();
   const { response, postResponsibility } = useSaveResponsibilityForUser(userId);

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();
      if (!selectedResp || !selectedYear) {
         return;
      }
      const { status, data } = await postResponsibility(selectedResp.value, parseInt(selectedYear.value));
      if (status === "success" && data) {
         onSuccess(data);
      }
   };

   const responsibilityOptions = responsibilitiesResponse.data?.map((res) => {
      return { label: res.name, value: res.id };
   });

   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <form onSubmit={handleSubmit}>
               <ModalHeader>Legg til ansvarspost</ModalHeader>
               <ModalBody>
                  <FormControl>
                     <FormLabel>Velg ansvarspost</FormLabel>
                     <Select<IOption, false, never>
                        variant="filled"
                        placeholder="Velg ansvarspost"
                        onChange={(ev) => setSelectedResp(ev)}
                        value={selectedResp}
                        options={responsibilityOptions}
                     />
                  </FormControl>
                  <FormControl>
                     <FormLabel>Velg år</FormLabel>
                     <Select<{ value: string; label: string }, false, never>
                        placeholder="Velg år"
                        onChange={(ev) => setSelectedYear(ev)}
                        value={selectedYear}
                        options={years.map((res) => {
                           return { label: res.toString(), value: res.toString() };
                        })}
                     />
                  </FormControl>
               </ModalBody>
               <ModalFooter gap={2}>
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
