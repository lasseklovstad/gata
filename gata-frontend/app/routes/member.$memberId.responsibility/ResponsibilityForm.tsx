import { Link, useFetcher } from "@remix-run/react";
import { Save, Trash } from "lucide-react";
import { useState } from "react";

import type { User } from "~/.server/db/user";
import { Accordion, AccordionBody, AccordionHeading } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Typography } from "~/components/ui/typography";

import type { IResponsibilityYear } from "../../types/ResponsibilityYear.type";
import { isAdmin } from "../../utils/roleUtils";

type ResponsibilityFormProps = {
   responsibilityYear: IResponsibilityYear;
   user: User;
   loggedInUser: User;
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
         <Accordion>
            <AccordionHeading>
               <div className="flex justify-between flex-1 items-center">
                  <Typography variant="largeText">{responsibility.name}</Typography>
                  <Typography variant="mutedText">{year}</Typography>
               </div>
            </AccordionHeading>
            <AccordionBody>
               <Typography>Beskrivelse: {responsibility.description || "Ingen beskrivelse på ansvarspost"}</Typography>
               <fetcher.Form method="put" action={id}>
                  <FormItem name="text">
                     <FormLabel>Notat</FormLabel>
                     <FormControl
                        render={(props) => (
                           <Textarea
                              {...props}
                              disabled={!canEditNote}
                              value={text}
                              onChange={(ev) => setText(ev.target.value)}
                              placeholder="Skriv hva du har gjort dette året innenfor din ansvarspost"
                           />
                        )}
                     />
                     <FormDescription>
                        Sist redigert av: {note.lastModifiedBy}, {lastModifiedDate.toLocaleDateString("no")}{" "}
                        {lastModifiedDate.toLocaleTimeString("no")}
                     </FormDescription>
                  </FormItem>
                  <div className="flex gap-2 mt-4">
                     {isAdmin(loggedInUser) && (
                        <Button as={Link} to={`${id}/delete`}>
                           <Trash className="mr-2" />
                           Fjern ansvarspost
                        </Button>
                     )}
                     {canEditNote && (
                        <Button isLoading={fetcher.state !== "idle"} type="submit">
                           <Save className="mr-2" />
                           Lagre
                        </Button>
                     )}
                  </div>
               </fetcher.Form>
            </AccordionBody>
         </Accordion>
      </>
   );
};
