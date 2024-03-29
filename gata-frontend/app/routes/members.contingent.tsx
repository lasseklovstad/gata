import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher, useNavigate } from "@remix-run/react";

import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = () => {
   // Todo: Hent ut brukere som ikke har betalt kontingent
   return {};
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const emails = await client<string[]>("contingent/email", {
      token,
      baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
   });
   return { ok: true, emails };
};

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
