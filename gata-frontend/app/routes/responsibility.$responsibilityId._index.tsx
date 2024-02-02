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
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";

import type { IResponsibility } from "~/types/Responsibility.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   if (params.responsibilityId !== "new") {
      const responsibility = await client<IResponsibility>(`responsibility/${params.responsibilityId}`, {
         token,
      });
      return json<LoaderData>({ responsibility });
   }
   return json<LoaderData>({ responsibility: undefined });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const body = Object.fromEntries(await request.formData());
   if (!body.name) {
      return json({ error: { name: "Navn må fylles ut" } }, { status: 400 });
   }

   if (request.method === "POST") {
      await client("responsibility", { method: "POST", body, token });
      return redirect("/responsibility");
   }
   if (request.method === "PUT") {
      await client(`responsibility/${params.responsibilityId}`, { method: "PUT", body, token });
      return redirect("/responsibility");
   }
};

type LoaderData = {
   responsibility: IResponsibility | undefined;
};

export default function EditResponsibility() {
   const navigate = useNavigate();
   const { responsibility } = useLoaderData<typeof loader>();
   const method = responsibility ? "put" : "post";
   const fetcher = useFetcher<typeof action>();
   const [name, setName] = useState(responsibility?.name || "");
   const [description, setDescription] = useState(responsibility?.description || "");
   const error = fetcher.data?.error;
   const onClose = () => navigate("..");

   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <fetcher.Form method={method}>
               <ModalHeader>{method === "put" ? "Rediger Ansvarspost" : "Ny Ansvarspost"}</ModalHeader>
               <ModalBody sx={{ display: "flex", flexDirection: "column" }}>
                  <FormControl isInvalid={!!error?.name} mb={2}>
                     <FormLabel>Navn</FormLabel>
                     <Input name="name" variant="filled" value={name} onChange={(ev) => setName(ev.target.value)} />
                     <FormErrorMessage>{error?.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                     <FormLabel>Beskrivelse</FormLabel>
                     <Textarea
                        name="description"
                        variant="filled"
                        value={description}
                        onChange={(ev) => setDescription(ev.target.value)}
                     />
                  </FormControl>
               </ModalBody>
               <ModalFooter>
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
}
