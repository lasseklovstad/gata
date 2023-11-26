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
import { useState } from "react";
import {
   ActionFunction,
   json,
   LoaderFunction,
   redirect,
   useFetcher,
   useLoaderData,
   useNavigate,
} from "react-router-dom";

import { client } from "../api/client/client";
import { getRequiredAccessToken } from "../auth0Client";
import { GataReportType, IGataReportSimple } from "../types/GataReport.type";

export const gataReportFormDialogLoader: LoaderFunction = async ({ request: { signal }, params }) => {
   const token = await getRequiredAccessToken();
   if (params.reportId) {
      const report = await client<IGataReportSimple>(`report/${params.reportId}/simple`, {
         token,
         signal,
      });
      return json<GataReportFormDialogLoaderData>({ report });
   }
   return json<GataReportFormDialogLoaderData>({ report: undefined });
};

export const gataReportFormDialogAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();
   const body = Object.fromEntries(await request.formData());
   if (!body.title) {
      return json({ error: { title: "Tittel må fylles ut" } }, { status: 400 });
   }

   if (request.method === "POST") {
      const response = await client<IGataReportSimple>("report", { method: "POST", body, token });
      return redirect(`/reportInfo/${response.id}`);
   }
   if (request.method === "PUT") {
      await client(`report/${params.reportId}`, { method: "PUT", body, token });
      return redirect(`/reportInfo/${params.reportId}`);
   }
};

interface GataReportFormDialogLoaderData {
   report: IGataReportSimple | undefined;
}

type GataReportFormDialogProps = {
   type?: GataReportType;
};

export const GataReportFormDialog = ({ type }: GataReportFormDialogProps) => {
   const { report } = useLoaderData() as GataReportFormDialogLoaderData;
   const fetcher = useFetcher<{ error: { title: string } }>();
   const navigate = useNavigate();
   const method = report ? "put" : "post";
   const [title, setTitle] = useState(report?.title || "");
   const [description, setDescription] = useState(report?.description || "");
   const error = fetcher.data?.error;

   const onClose = () => navigate("..");

   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <fetcher.Form method={method}>
               <ModalHeader>{method === "put" ? "Rediger informasjon" : "Nytt dokument"}</ModalHeader>
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
