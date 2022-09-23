import { Delete, Save } from "@mui/icons-material";
import {
   Box,
   AccordionIcon,
   Textarea,
   AccordionPanel,
   AccordionItem,
   AccordionButton,
   Text,
   FormControl,
   FormLabel,
   Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDeleteResponsibilityForUser, usePutResponsibilityNote } from "../api/user.api";
import { IGataUser } from "../types/GataUser.type";
import { IResponsibilityYear } from "../types/ResponsibilityYear.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";
import { useRoles } from "./useRoles";
import { useAuth0 } from "@auth0/auth0-react";
import { useConfirmDialog } from "./ConfirmDialog";

type ResponsibilityFormProps = {
   responsibilityYear: IResponsibilityYear;
   user: IGataUser;
   onDelete: (id: string) => void;
   onChange: (responsibilityYear: IResponsibilityYear) => void;
};

export const ResponsibilityForm = ({
   responsibilityYear: { id, year, responsibility, note },
   onChange,
   onDelete,
   user,
}: ResponsibilityFormProps) => {
   const { isAdmin } = useRoles();
   const { user: auth0User } = useAuth0();
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibilityForUser(user.id);
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister brukeren ansvarsposten",
      response: deleteResponse,
      onConfirm: async () => {
         const { status, data } = await deleteResponsibility(id);
         if (status === "success" && data) {
            onDelete(id);
         }
      },
   });

   const { putNote, putResponse } = usePutResponsibilityNote(user.id, id);
   const [text, setText] = useState(note.text);
   const lastModifiedDate = new Date(note.lastModifiedDate);
   const canEditNote = auth0User?.sub === user.primaryUser.id || isAdmin;

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();

      const { status, data } = await putNote(text);
      status === "success" && data && onChange(data);
   };

   return (
      <>
         {ConfirmDialogComponent}
         <AccordionItem>
            <AccordionButton>
               <Flex flex={1}>
                  <Text as="h3" fontSize="lg">
                     {responsibility.name}
                  </Text>
               </Flex>
               <Text sx={{ color: "text.secondary", mr: 2 }}>{year}</Text>
               <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
               <Text color="gray">Beskrivelse: {responsibility.description || "Ingen beskrivelse på ansvarspost"}</Text>
               <form onSubmit={handleSubmit}>
                  <FormControl>
                     <FormLabel>Notat</FormLabel>
                     <Textarea
                        variant="filled"
                        disabled={!canEditNote}
                        value={text}
                        onChange={(ev) => setText(ev.target.value)}
                        placeholder="Skriv hva du har gjort dette året innenfor din ansvarspost"
                        sx={{ mb: 1 }}
                     />
                  </FormControl>
                  <Text fontSize="sm" color="gray">
                     Sist redigert av: {note.lastModifiedBy}, {lastModifiedDate.toLocaleDateString()}{" "}
                     {lastModifiedDate.toLocaleTimeString()}
                  </Text>
                  <Box sx={{ mt: 2 }}>
                     {isAdmin && (
                        <LoadingButton
                           sx={{ mr: 1 }}
                           response={deleteResponse}
                           leftIcon={<Delete />}
                           onClick={() => openConfirmDialog()}
                           variant="ghost"
                        >
                           Fjern ansvarspost
                        </LoadingButton>
                     )}
                     {canEditNote && (
                        <LoadingButton response={putResponse} leftIcon={<Save />} type="submit">
                           Lagre
                        </LoadingButton>
                     )}
                  </Box>
               </form>
               <ErrorAlert response={putResponse} />
               <ErrorAlert response={deleteResponse} />
            </AccordionPanel>
         </AccordionItem>
      </>
   );
};
