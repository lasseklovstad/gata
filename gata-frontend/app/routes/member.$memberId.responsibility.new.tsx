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
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { Select } from "chakra-react-select";
import { useState } from "react";

import type { IResponsibility } from "~/types/Responsibility.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const responsibilities = await client<IResponsibility[]>("responsibility", {
      token,
   });
   return json({ responsibilities });
};

type IOption = { value: string; label: string };

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export default function AddResponsibilityUserDialog() {
   const { responsibilities } = useLoaderData<typeof loader>();
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
}
