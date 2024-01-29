import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";

import { client } from "~/utils/client";
import type { IGataReportFile, IGataReportFilePayload } from "~/old-app/types/GataReportFile.type";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
   const token = await getRequiredAuthToken(request);
   const reportEmails = await client<string[]>(`report/publishemails`, { token });
   return { reportEmails };
};

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const response = await client<IGataReportFile, IGataReportFilePayload>(`report/${params.reportId}/publish`, {
      token,
   });
   return json(response);
};

export default function ConfirmDelete() {
   const fetcher = useFetcher();
   const navigate = useNavigate();
   const { reportEmails } = useLoaderData<typeof loader>();
   const onClose = () => navigate("..");
   return (
      <Modal isOpen onClose={onClose}>
         <ModalOverlay />
         <ModalContent>
            <fetcher.Form method="DELETE">
               <ModalHeader>Er du sikker?</ModalHeader>
               <ModalBody>Er du sikker du vil sende e-post til disse brukerne: {reportEmails.join(", ")}?</ModalBody>
               <ModalFooter gap={2}>
                  <Button type="submit" isLoading={fetcher.state !== "idle"}>
                     Jeg er sikker
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
