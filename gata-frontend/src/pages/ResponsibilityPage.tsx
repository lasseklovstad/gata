import { Add, Delete, Edit } from "@mui/icons-material";
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   List,
   ListItem,
   ListItemSecondaryAction,
   ListItemText,
   TextField,
   Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useDeleteResponsibility, useGetResponisibilies, useSaveResponsibility } from "../api/responsibility.api";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { Loading } from "../components/Loading";
import { useRoles } from "../components/useRoles";
import { Responsibility } from "../types/Responsibility.type";

export const ResponsibilityPage = () => {
   const { isAdmin } = useRoles();
   const { responsibilitiesResponse } = useGetResponisibilies();
   const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedResp, setSelectedResp] = useState<Responsibility>();
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibility();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister du ansvarsposten",
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

   const handleDelete = (resp: Responsibility) => {
      setSelectedResp(resp);
      openConfirmDialog();
   };

   const closeModal = () => {
      setSelectedResp(undefined);
      setModalOpen(false);
   };

   const openModal = (resp?: Responsibility) => {
      setSelectedResp(resp);
      setModalOpen(true);
   };

   const handleSuccess = (responsibility: Responsibility, type: "update" | "create") => {
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
         <Loading response={deleteResponse} />
         <Box display="flex" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="h1">Ansvarsposter</Typography>
            {isAdmin && (
               <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
                  Legg til
               </Button>
            )}
         </Box>
         <Loading response={responsibilitiesResponse} />
         <List>
            {responsibilities.map((resp) => {
               const { name, id, description, user } = resp;
               return (
                  <ListItem key={id} divider>
                     <ListItemText primary={`${name} ${user ? `(${user.name})` : ""}`} secondary={description} />
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

type ResponsibilityDialogProps = {
   onClose: () => void;
   onSuccess: (responsibility: Responsibility, type: "update" | "create") => void;
   responsibility: Responsibility | undefined;
};

const ResponsibilityDialog = ({ onClose, onSuccess, responsibility }: ResponsibilityDialogProps) => {
   const type = responsibility?.id ? "update" : "create";
   const [name, setName] = useState(responsibility?.name || "");
   const [description, setDescription] = useState(responsibility?.description || "");
   const [error, setError] = useState<string>();
   const { response, postResponsibility, putResponsibility } = useSaveResponsibility();

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();
      if (name) {
         const { status, data } = responsibility?.id
            ? await putResponsibility({ name, description, id: responsibility.id })
            : await postResponsibility({ name, description });
         status === "success" && data && onSuccess(data, type);
      } else {
         setError("Navn må fylles ut");
      }
   };

   return (
      <Dialog open maxWidth="xs" fullWidth>
         <form onSubmit={handleSubmit}>
            <DialogTitle>{type === "update" ? "Rediger Ansvarspost" : "Ny Ansvarspost"}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
               <TextField
                  variant="filled"
                  sx={{ mb: 2 }}
                  label="Navn"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  error={!!error}
                  helperText={error}
               />
               <TextField
                  variant="filled"
                  multiline
                  rows={3}
                  maxRows={10}
                  label="Beskrivelse (Valgfri)"
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
               />
            </DialogContent>
            <DialogActions>
               <Button onClick={onClose}>Avbryt</Button>
               <Button type="submit" variant="contained" disabled={response.status === "loading"}>
                  Lagre
               </Button>
            </DialogActions>
            <Loading response={response} />
         </form>
      </Dialog>
   );
};
