import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useNavigate } from "@remix-run/react";

import { client } from "~/utils/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
   return {};
};

export const action: ActionFunction = async ({ request }) => {
   const token = await getRequiredAuthToken(request);
   const emails = await client<string[]>("contingent/email", {
      token,
   });
   return { ok: true, emails };
};

/**
 * useConfirmDialog({
         text: `Det ble sent en email til: ${
            publishContigentResponse.data && publishContigentResponse.data.length
               ? publishContigentResponse.data?.join(", ")
               : "Ingen"
         }`,
         title: "Vellykket",
         showOnlyOk: true,
      });
 */

export default function ConfirmDelete() {
   const fetcher = useFetcher<typeof action>();
   const navigate = useNavigate();
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
            <fetcher.Form method="POST">
               <ModalHeader>Er du sikker?</ModalHeader>
               <ModalBody>Er du sikker du vil sende e-post til alle brukere som ikke har betalt?</ModalBody>
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
