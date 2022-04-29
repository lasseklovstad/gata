import { Add } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useGetUserResponsitbilityYears } from "../api/user.api";
import { IGataUser } from "../types/GataUser.type";
import { IResponsibilityYear } from "../types/ResponsibilityYear.type";
import { AddResponsibilityUserDialog } from "./AddResponsibilityUserDialog";
import { Loading } from "./Loading";
import { ResponsibilityForm } from "./ResponsibilityForm";
import { useRoles } from "./useRoles";

type UserResponsibilityProps = {
   user: IGataUser;
};

export const UserResponsibility = ({ user }: UserResponsibilityProps) => {
   const { isAdmin } = useRoles();
   const { responsibilityYearResponse } = useGetUserResponsitbilityYears(user.id);
   const [userResponsibilities, setUserResponsibilities] = useState<IResponsibilityYear[]>();
   const [expanded, setExpanded] = useState<string>();
   const [addResponsibilityModalOpen, setAddResponsibilityModalOpen] = useState(false);

   useEffect(() => {
      setUserResponsibilities(responsibilityYearResponse.data);
   }, [responsibilityYearResponse.data]);

   const handleExpand = (id: string) => {
      setExpanded(id === expanded ? undefined : id);
   };

   const handleDelete = (id: string) => {
      setUserResponsibilities(userResponsibilities?.filter((r) => r.id !== id));
   };

   const handleChange = (responsibilityYear: IResponsibilityYear) => {
      setUserResponsibilities(
         userResponsibilities?.map((r) => (r.id === responsibilityYear.id ? responsibilityYear : r))
      );
   };

   return (
      <>
         <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: "wrap" }}>
            <Typography variant="h2">Ansvarsposter</Typography>
            {isAdmin && (
               <Button variant="contained" startIcon={<Add />} onClick={() => setAddResponsibilityModalOpen(true)}>
                  Legg til ansvarspost
               </Button>
            )}
         </Box>
         {addResponsibilityModalOpen && (
            <AddResponsibilityUserDialog
               onClose={() => setAddResponsibilityModalOpen(false)}
               onSuccess={(r) => {
                  setUserResponsibilities(r);
                  setAddResponsibilityModalOpen(false);
               }}
               userId={user.id}
            />
         )}
         <Box>
            <Loading response={responsibilityYearResponse} />
            {userResponsibilities?.map((responsibilityYear) => {
               return (
                  <ResponsibilityForm
                     key={responsibilityYear.id}
                     expanded={expanded === responsibilityYear.id}
                     onChange={handleChange}
                     onDelete={handleDelete}
                     onExpand={handleExpand}
                     responsibilityYear={responsibilityYear}
                     user={user}
                  />
               );
            })}
            {userResponsibilities?.length === 0 && (
               <Typography variant="body1">Ingen ansvarsposter lagt til.</Typography>
            )}
         </Box>
      </>
   );
};
