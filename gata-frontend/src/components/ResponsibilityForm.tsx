import { Delete, ExpandMore, Save } from "@mui/icons-material";
import { Box, Accordion, AccordionSummary, Typography, AccordionDetails, TextField } from "@mui/material";
import { useState } from "react";
import { useDeleteResponsibilityForUser, usePutResponsibilityNote } from "../api/user.api";
import { IGataUser } from "../types/GataUser.type";
import { IResponsibilityYear } from "../types/ResponsibilityYear.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";
import { useRoles } from "./useRoles";
import { useAuth0 } from "@auth0/auth0-react";

type ResponsibilityFormProps = {
   responsibilityYear: IResponsibilityYear;
   user: IGataUser;
   expanded: boolean;
   onExpand: (id: string) => void;
   onDelete: (id: string) => void;
   onChange: (responsibilityYear: IResponsibilityYear) => void;
};

export const ResponsibilityForm = ({
   responsibilityYear: { id, year, responsibility, note },
   onExpand,
   expanded,
   onChange,
   onDelete,
   user,
}: ResponsibilityFormProps) => {
   const { isAdmin } = useRoles();
   const { user: auth0User } = useAuth0();
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibilityForUser(user.id);
   const { putNote, putResponse } = usePutResponsibilityNote(user.id, id);
   const [text, setText] = useState(note.text);
   const lastModifiedDate = new Date(note.lastModifiedDate);
   const canEditNote = auth0User?.sub === user.externalUserProviderId || isAdmin;
   const handleDelete = async () => {
      const { status, data } = await deleteResponsibility(id);
      if (status === "success" && data) {
         onDelete(id);
      }
   };

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();

      const { status, data } = await putNote(text);
      status === "success" && data && onChange(data);
   };

   return (
      <>
         <Accordion expanded={expanded} onChange={() => onExpand(id)}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls={`${id}-content`} id={`${id}-header`}>
               <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Typography>{responsibility.name}</Typography>
                  <Typography sx={{ color: "text.secondary", mr: 2 }}>{year}</Typography>
               </Box>
            </AccordionSummary>
            <AccordionDetails>
               <Typography sx={{ color: "text.secondary" }} gutterBottom>
                  Beskrivelse: {responsibility.description || "Ingen beskrivelse på ansvarspost"}
               </Typography>
               <form onSubmit={handleSubmit}>
                  <TextField
                     fullWidth
                     variant="filled"
                     multiline
                     minRows={3}
                     label="Notat"
                     disabled={!canEditNote}
                     value={text}
                     onChange={(ev) => setText(ev.target.value)}
                     placeholder="Skriv hva du har gjort dette året innenfor din ansvarspost"
                     sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                     Sist redigert av: {note.lastModifiedBy}, {lastModifiedDate.toLocaleDateString()}{" "}
                     {lastModifiedDate.toLocaleTimeString()}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                     {isAdmin && (
                        <LoadingButton
                           sx={{ mr: 1 }}
                           response={deleteResponse}
                           startIcon={<Delete />}
                           onClick={() => handleDelete()}
                        >
                           Fjern ansvarspost
                        </LoadingButton>
                     )}
                     {canEditNote && (
                        <LoadingButton response={putResponse} variant="contained" startIcon={<Save />} type="submit">
                           Lagre
                        </LoadingButton>
                     )}
                  </Box>
               </form>
               <ErrorAlert response={putResponse} />
               <ErrorAlert response={deleteResponse} />
            </AccordionDetails>
         </Accordion>
      </>
   );
};
