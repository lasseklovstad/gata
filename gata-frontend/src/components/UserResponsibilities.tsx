import { Add } from "@mui/icons-material";
import { Accordion, Box, Button, Heading, Text } from "@chakra-ui/react";
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
   const [addResponsibilityModalOpen, setAddResponsibilityModalOpen] = useState(false);

   useEffect(() => {
      setUserResponsibilities(responsibilityYearResponse.data);
   }, [responsibilityYearResponse.data]);

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
         <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Heading as="h2" size="lg">
               Ansvarsposter
            </Heading>
            {isAdmin && (
               <Button leftIcon={<Add />} onClick={() => setAddResponsibilityModalOpen(true)}>
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
            <Box boxShadow="md" rounded={4} bg="white">
               <Accordion allowToggle>
                  {userResponsibilities?.map((responsibilityYear) => {
                     return (
                        <ResponsibilityForm
                           key={responsibilityYear.id}
                           onChange={handleChange}
                           onDelete={handleDelete}
                           responsibilityYear={responsibilityYear}
                           user={user}
                        />
                     );
                  })}
               </Accordion>
            </Box>

            {userResponsibilities?.length === 0 && <Text variant="body1">Ingen ansvarsposter lagt til.</Text>}
         </Box>
      </>
   );
};
