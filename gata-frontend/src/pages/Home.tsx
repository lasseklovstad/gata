import { Typography } from "@mui/material";
import { PageLayout } from "../components/PageLayout";
import { useAuth0 } from "@auth0/auth0-react";
import { News } from "../components/News";
import { useRoles } from "../components/useRoles";

export const Home = () => {
   const { isAuthenticated } = useAuth0();
   const { isMember } = useRoles();
   if (isAuthenticated) {
      if (isMember) {
         return <News />;
      } else {
         return (
            <PageLayout>
               <Typography variant="h1">Velkommen</Typography>
               <Typography>Du må være medlem for å se nyheter</Typography>
            </PageLayout>
         );
      }
   } else {
      return (
         <PageLayout>
            <Typography variant="h1">Velkommen</Typography>
            <Typography>Logg inn for å se noe</Typography>
         </PageLayout>
      );
   }
};
