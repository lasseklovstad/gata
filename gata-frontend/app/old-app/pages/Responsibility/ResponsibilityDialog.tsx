import { Save } from "@mui/icons-material";
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
import { useState } from "react";
import { IResponsibility } from "../../types/Responsibility.type";
import {
   ActionFunction,
   json,
   LoaderFunction,
   redirect,
   useFetcher,
   useLoaderData,
   useNavigate,
} from "react-router-dom";
import { client } from "../../api/client/client";
import { getRequiredAccessToken } from "../../auth0Client";

export const responsibilityDialogLoader: LoaderFunction = async ({ request: { signal }, params }) => {
   const token = await getRequiredAccessToken();
   if (params.responsibilityId !== "new") {
      const responsibility = await client<IResponsibility>(`responsibility/${params.responsibilityId}`, {
         token,
         signal,
      });
      return json<ResponsibilityDialogLoaderData>({ responsibility });
   }
   return json<ResponsibilityDialogLoaderData>({ responsibility: undefined });
};

export const responsibilityDialogAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();
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

interface ResponsibilityDialogLoaderData {
   responsibility: IResponsibility | undefined;
}

export const ResponsibilityDialog = () => {
   const navigate = useNavigate();
   const { responsibility } = useLoaderData() as ResponsibilityDialogLoaderData;
   const method = responsibility ? "put" : "post";
   const fetcher = useFetcher<{ error: { name: string } }>();
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
};
