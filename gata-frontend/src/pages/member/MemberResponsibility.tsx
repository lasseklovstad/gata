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
import { useEffect, useState } from "react";
import { useGetResponisibilies } from "../../api/responsibility.api";
import {
   useDeleteResponsibilityForUser,
   useGetUserResponsitbilityYears,
   useSaveResponsibilityForUser,
} from "../../api/user.api";
import { Loading } from "../../components/Loading";
import { useRoles } from "../../components/useRoles";
import { IGataUser } from "../../types/GataUser.type";
import { IResponsibilityYear } from "../../types/ResponsibilityYear.type";

type MemberResponsibilityProps = {
   user: IGataUser;
};

export const MemberResponsibility = ({ user }: MemberResponsibilityProps) => {
   const { isAdmin } = useRoles();
   const { responsibilitiesResponse } = useGetResponisibilies();
   const { responsibilityYearResponse } = useGetUserResponsitbilityYears(user.id);
   const [userResponsibilities, setUserResponsibilities] = useState<IResponsibilityYear[]>();
   const [selectedResp, setSelectedResp] = useState("");
   const { response, postResponsibility } = useSaveResponsibilityForUser(user.id);
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibilityForUser(user.id);

   useEffect(() => {
      setUserResponsibilities(responsibilityYearResponse.data);
   }, [responsibilityYearResponse.data]);

   const handleAddResponsibility = async () => {
      if (!selectedResp) {
         return;
      }
      const today = new Date();
      const { status, data } = await postResponsibility(selectedResp, today.getFullYear());
      if (status === "success" && data) {
         setUserResponsibilities(data);
         setSelectedResp("");
      }
   };

   const handleDelete = async (responsibilityYearId: string) => {
      const { status, data } = await deleteResponsibility(responsibilityYearId);
      if (status === "success" && data) {
         setUserResponsibilities(data);
      }
   };
   return (
      <>
         <Box>
            <Typography variant="h2">Ansvarsposter</Typography>
            {isAdmin && responsibilitiesResponse.data && (
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
                     {responsibilitiesResponse.data.map((res) => {
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
            {userResponsibilities?.map(({ responsibility, id, year }) => {
               return (
                  <ListItem divider key={id}>
                     <ListItemText primary={responsibility.name} secondary={year} />
                     <ListItemSecondaryAction>
                        <IconButton onClick={() => handleDelete(id)}>
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
