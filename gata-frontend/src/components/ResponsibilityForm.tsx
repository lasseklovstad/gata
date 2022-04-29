import { Delete, ExpandMore } from "@mui/icons-material";
import { Box, Accordion, AccordionSummary, Typography, AccordionDetails, TextField } from "@mui/material";
import { useDeleteResponsibilityForUser } from "../api/user.api";
import { IResponsibilityYear } from "../types/ResponsibilityYear.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";
import { useRoles } from "./useRoles";

type ResponsibilityFormProps = {
   responsibilityYear: IResponsibilityYear;
   expanded: boolean;
   onExpand: (id: string) => void;
   onDelete: (id: string) => void;
   onChange: (responsibilityYear: IResponsibilityYear) => void;
};

export const ResponsibilityForm = ({
   responsibilityYear: { id, year, responsibility, user },
   onExpand,
   expanded,
   onChange,
   onDelete,
}: ResponsibilityFormProps) => {
   const { isAdmin } = useRoles();
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibilityForUser(user.id);
   const handleDelete = async () => {
      const { status, data } = await deleteResponsibility(id);
      if (status === "success" && data) {
         onDelete(id);
      }
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
               <TextField
                  fullWidth
                  variant="filled"
                  multiline
                  minRows={3}
                  label="Notat"
                  placeholder="Skriv hva du har gjort dette året innenfor din ansvarspost"
               />
               <Box sx={{ mt: 2 }}>
                  {isAdmin && (
                     <LoadingButton
                        response={deleteResponse}
                        variant="contained"
                        startIcon={<Delete />}
                        onClick={() => handleDelete()}
                     >
                        Fjern ansvarspost
                     </LoadingButton>
                  )}
               </Box>
               <ErrorAlert response={deleteResponse} />
            </AccordionDetails>
         </Accordion>
      </>
   );
};
