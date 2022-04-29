import { Add, Delete, Edit } from "@mui/icons-material";
import { Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useDeleteResponsibility, useGetResponisibilies } from "../api/responsibility.api";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { Loading } from "../components/Loading";
import { ResponsibilityDialog } from "../components/ResponsibilityDialog";
import { useRoles } from "../components/useRoles";
import { IResponsibility } from "../types/Responsibility.type";

export const ResponsibilityPage = () => {
   const { isAdmin } = useRoles();
   const { responsibilitiesResponse } = useGetResponisibilies();
   const [responsibilities, setResponsibilities] = useState<IResponsibility[]>([]);
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedResp, setSelectedResp] = useState<IResponsibility>();
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibility();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister du ansvarsposten",
      response: deleteResponse,
      onConfirm: async () => {
         if (selectedResp) {
            const { status } = await deleteResponsibility(selectedResp);
            if (status === "success") {
               setResponsibilities(responsibilities.filter((resp) => resp.id !== selectedResp.id));
            }
         } else {
            throw new Error("This should not happen");
         }
      },
      onClose: () => {
         setSelectedResp(undefined);
      },
   });

   const handleDelete = (resp: IResponsibility) => {
      setSelectedResp(resp);
      openConfirmDialog();
   };

   const closeModal = () => {
      setSelectedResp(undefined);
      setModalOpen(false);
   };

   const openModal = (resp?: IResponsibility) => {
      setSelectedResp(resp);
      setModalOpen(true);
   };

   const handleSuccess = (responsibility: IResponsibility, type: "update" | "create") => {
      setModalOpen(false);
      if (type === "update") {
         setResponsibilities(responsibilities.map((res) => (res.id === responsibility.id ? responsibility : res)));
      }
      if (type === "create") {
         setResponsibilities([...responsibilities, responsibility]);
      }
   };

   useEffect(() => {
      responsibilitiesResponse.data && setResponsibilities(responsibilitiesResponse.data);
   }, [responsibilitiesResponse.data]);

   return (
      <>
         {ConfirmDialogComponent}
         <Box display="flex" justifyContent="space-between" flexWrap="wrap" alignItems="center">
            <Typography variant="h1">Ansvarsposter</Typography>
            {isAdmin && (
               <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
                  Legg til
               </Button>
            )}
         </Box>
         <Loading response={responsibilitiesResponse} />
         {responsibilitiesResponse.status === "success" && (
            <List>
               {responsibilities.map((resp) => {
                  const { name, id, description } = resp;
                  return (
                     <ListItem key={id} divider>
                        <ListItemText primary={name} secondary={description} />
                        {isAdmin && (
                           <ListItemSecondaryAction>
                              <IconButton onClick={() => openModal(resp)}>
                                 <Edit />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(resp)}>
                                 <Delete />
                              </IconButton>
                           </ListItemSecondaryAction>
                        )}
                     </ListItem>
                  );
               })}
               {responsibilities.length === 0 && <ListItem>Ingen ansvarsposter, trykk legg til for å lage ny</ListItem>}
            </List>
         )}
         {modalOpen && (
            <ResponsibilityDialog
               onClose={() => closeModal()}
               onSuccess={handleSuccess}
               responsibility={selectedResp}
            />
         )}
      </>
   );
};
