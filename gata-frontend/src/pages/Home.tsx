import { Typography } from "@mui/material";
import { PageLayout } from "../components/PageLayout";

export const Home = () => {
   return (
      <>
         <PageLayout>
            <Typography variant="h1">Hjem</Typography>
            <Typography variant="body1">
               Dette en nettside for medlemer i gata. Logg deg inn for å se om du er medlem.
            </Typography>
         </PageLayout>
      </>
   );
};
