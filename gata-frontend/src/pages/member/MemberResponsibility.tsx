import { Add, Delete } from "@mui/icons-material";
import {
   Box,
   IconButton,
   List,
   ListItem,
   ListItemSecondaryAction,
   ListItemText,
   MenuItem,
   TextField,
   Typography,
} from "@mui/material";
import { useState } from "react";
import {
   useDeleteResponsibilityForUser,
   useGetResponisibilies,
   useSaveResponsibilityForUser,
} from "../../api/responsibility.api";
import { Loading } from "../../components/Loading";
import { useRoles } from "../../components/useRoles";
import { IGataUser } from "../../types/GataUser.type";
import { Responsibility } from "../../types/Responsibility.type";

type MemberResponsibilityProps = {
   user: IGataUser;
};

export const MemberResponsibility = ({ user }: MemberResponsibilityProps) => {
   const { isAdmin } = useRoles();
   const { responsibilitiesResponse, getResponsibilities } = useGetResponisibilies();
   const [selectedResp, setSelectedResp] = useState("");
   const { response, postResponsibility } = useSaveResponsibilityForUser(user.id);
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibilityForUser(user.id);

   const availableResponsibilities = responsibilitiesResponse.data?.filter((resp) => !resp.user?.id);
   const userResponsibilities = responsibilitiesResponse.data?.filter((resp) => resp.user?.id === user.id);

   const handleAddResponsibility = async () => {
      if (!selectedResp) {
         return;
      }
      const { status, data } = await postResponsibility(selectedResp);
      if (status === "success" && data) {
         getResponsibilities();
         setSelectedResp("");
      }
   };

   const handleDelete = async (resp: Responsibility) => {
      const { status, data } = await deleteResponsibility(resp.id);
      if (status === "success" && data) {
         getResponsibilities();
      }
   };
   return (
      <>
         <Box>
            <Typography variant="h2">Ansvarsposter</Typography>
            {isAdmin && availableResponsibilities && (
               <Box display="flex" alignItems="center" mt={1}>
                  <TextField
                     variant="filled"
                     label="Velg ansvarspost"
                     placeholder="Velg ansvarspost"
                     select
                     onChange={(ev) => setSelectedResp(ev.target.value)}
                     value={selectedResp}
                     sx={{ width: "200px", mr: 1 }}
                  >
                     <MenuItem value="">Ikke valgt</MenuItem>
                     {availableResponsibilities.map((res) => {
                        return (
                           <MenuItem value={res.id} key={res.id}>
                              {res.name}
                           </MenuItem>
                        );
                     })}
                  </TextField>
                  <IconButton onClick={handleAddResponsibility}>
                     <Add />
                  </IconButton>
               </Box>
            )}
         </Box>

         <Loading response={response} />
         <Loading response={deleteResponse} />
         <List>
            {userResponsibilities?.map((resp) => {
               return (
                  <ListItem divider key={resp.id}>
                     <ListItemText primary={resp.name} secondary={resp.description} />
                     <ListItemSecondaryAction>
                        <IconButton onClick={() => handleDelete(resp)}>
                           <Delete />
                        </IconButton>
                     </ListItemSecondaryAction>
                  </ListItem>
               );
            })}
            {userResponsibilities?.length === 0 && (
               <ListItem>
                  <ListItemText>
                     Ingen ansvarsposter lagt til. {isAdmin && "Velg og trykk på pluss tegnet for å legge til"}
                  </ListItemText>
               </ListItem>
            )}
         </List>
      </>
   );
};
