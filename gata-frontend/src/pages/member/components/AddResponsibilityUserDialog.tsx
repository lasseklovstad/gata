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
import { Save } from "@mui/icons-material";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { json, Link, LoaderFunction, useFetcher, useLoaderData, useNavigate } from "react-router-dom";

import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";
import { IResponsibility } from "../../../types/Responsibility.type";

export const addResponsibilityUserDialogLoader: LoaderFunction = async ({ request: { signal } }) => {
   const token = await getRequiredAccessToken();
   const responsibilities = await client<IResponsibility[]>("responsibility", {
      token,
      signal,
   });
   return json<AddResponsibilityUserDialogLoaderData>({ responsibilities });
};

interface AddResponsibilityUserDialogLoaderData {
   responsibilities: IResponsibility[];
}

type IOption = { value: string; label: string };

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export const AddResponsibilityUserDialog = () => {
   const { responsibilities } = useLoaderData() as AddResponsibilityUserDialogLoaderData;
   const navigate = useNavigate();
   const [selectedResp, setSelectedResp] = useState<IOption | null>();
   const [selectedYear, setSelectedYear] = useState<IOption | null>();
   const fetcher = useFetcher();

   const responsibilityOptions = responsibilities.map((res) => {
      return { label: res.name, value: res.id };
   });

   return (
      <Modal isOpen onClose={() => navigate("..")}>
         <ModalOverlay />
         <ModalContent>
            <fetcher.Form method="post" action="..">
               <ModalHeader>Legg til ansvarspost</ModalHeader>
               <ModalBody>
                  <FormControl>
                     <FormLabel>Velg ansvarspost</FormLabel>
                     <Select<IOption, false, never>
                        name="responsibilityId"
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
                        name="year"
                        onChange={(ev) => setSelectedYear(ev)}
                        value={selectedYear}
                        options={years.map((res) => {
                           return { label: res.toString(), value: res.toString() };
                        })}
                     />
                  </FormControl>
               </ModalBody>
               <ModalFooter gap={2}>
                  <Button type="submit" isLoading={fetcher.state !== "idle"} leftIcon={<Save />}>
                     Lagre
                  </Button>
                  <Button as={Link} to=".." variant="ghost">
                     Avbryt
                  </Button>
               </ModalFooter>
            </fetcher.Form>
         </ModalContent>
      </Modal>
   );
};
