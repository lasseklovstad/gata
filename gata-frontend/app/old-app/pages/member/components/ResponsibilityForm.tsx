import {
   AccordionButton,
   AccordionIcon,
   AccordionItem,
   AccordionPanel,
   Box,
   Button,
   Flex,
   FormControl,
   FormLabel,
   Text,
   Textarea,
} from "@chakra-ui/react";
import { Delete, Save } from "@mui/icons-material";
import { useState } from "react";
import { Link, useFetcher } from "react-router-dom";

import { isAdmin } from "../../../components/useRoles";
import { IGataUser } from "../../../types/GataUser.type";
import { IResponsibilityYear } from "../../../types/ResponsibilityYear.type";

type ResponsibilityFormProps = {
   responsibilityYear: IResponsibilityYear;
   user: IGataUser;
   loggedInUser: IGataUser;
};

export const ResponsibilityForm = ({
   responsibilityYear: { id, year, responsibility, note },
   user,
   loggedInUser,
}: ResponsibilityFormProps) => {
   const fetcher = useFetcher();
   const [text, setText] = useState(note.text);
   const lastModifiedDate = new Date(note.lastModifiedDate);
   const canEditNote = loggedInUser.id === user.id || isAdmin(loggedInUser);

   return (
      <>
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
               <fetcher.Form method="put" action={id}>
                  <FormControl>
                     <FormLabel>Notat</FormLabel>
                     <Textarea
                        variant="filled"
                        name="text"
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
                     {isAdmin(loggedInUser) && (
                        <Button sx={{ mr: 1 }} leftIcon={<Delete />} as={Link} to={`${id}/delete`}>
                           Fjern ansvarspost
                        </Button>
                     )}
                     {canEditNote && (
                        <Button isLoading={fetcher.state !== "idle"} leftIcon={<Save />} type="submit">
                           Lagre
                        </Button>
                     )}
                  </Box>
               </fetcher.Form>
            </AccordionPanel>
         </AccordionItem>
      </>
   );
};
