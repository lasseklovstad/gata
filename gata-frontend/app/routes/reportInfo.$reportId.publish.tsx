import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader: LoaderFunction = async ({ request }) => {
   const token = await getRequiredAuthToken(request);
   const reportEmails = await client<string[]>(`report/publishemails`, { token });
   return { reportEmails };
};

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const emails = await client<string[]>(`report/${params.reportId}/publish`, {
      token,
   });
   return json({ ok: true, emails });
};

export default function ConfirmDelete() {
   const fetcher = useFetcher<typeof action>();
   const navigate = useNavigate();
   const { reportEmails } = useLoaderData<typeof loader>();
   const onClose = () => navigate("..");

   if (fetcher.data && fetcher.data.ok) {
      return (
         <Modal isOpen onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
               <ModalHeader>Vellykket</ModalHeader>
               <ModalBody>
                  Det ble sent en email til: {fetcher.data.emails.length ? fetcher.data.emails.join(", ") : "Ingen"}
               </ModalBody>
               <ModalFooter>
                  <Button onClick={onClose}>Ok</Button>
               </ModalFooter>
            </ModalContent>
         </Modal>
      );
   }

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
