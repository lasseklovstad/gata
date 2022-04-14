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
   useDeleteResponsibility,
   useDeleteResponsibilityForUser,
   useGetResponisibilies,
   useSaveResponsibilityForUser,
} from "../../api/responsibility.api";
import { Loading } from "../../components/Loading";
import { IGataUser } from "../../types/GataUser.type";
import { Responsibility } from "../../types/Responsibility.type";

type MemberResponsibilityProps = {
   user: IGataUser;
   onChangeResponsibility: (responsibilities: Responsibility[]) => void;
};

export const MemberResponsibility = ({ user, onChangeResponsibility }: MemberResponsibilityProps) => {
   const { responsibilitiesResponse } = useGetResponisibilies();
   const [selectedResp, setSelectedResp] = useState("");
   const { response, postResponsibility } = useSaveResponsibilityForUser(user.id);
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibilityForUser(user.id);
   const handleAddResponsibility = async () => {
      const { status, data } = await postResponsibility(selectedResp);
      if (status === "success" && data) {
         onChangeResponsibility(data);
      }
   };

   const handleDelete = async (resp: Responsibility) => {
      const { status, data } = await deleteResponsibility(resp.id);
      if (status === "success" && data) {
         onChangeResponsibility(data);
      }
   };
   return (
      <>
         <Box>
            <Typography variant="h2">Ansvarsposter</Typography>
            <Box display="flex" alignItems="center" mt={1}>
               <TextField
                  variant="filled"
                  label="Ansvar"
                  placeholder="Velg ansvarspost"
                  select
                  onChange={(ev) => setSelectedResp(ev.target.value)}
                  value={selectedResp}
                  sx={{ width: "200px", mr: 1 }}
               >
                  {responsibilitiesResponse.data?.map((res) => {
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
         </Box>
         <Loading response={response} />
         <Loading response={deleteResponse} />
         <List>
            {user.responsibilities.map((resp) => {
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
            {user.responsibilities.length === 0 && <ListItem>Ingen ansvarsposter</ListItem>}
         </List>
      </>
   );
};
