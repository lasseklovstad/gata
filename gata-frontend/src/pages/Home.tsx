import { PageLayout } from "../components/PageLayout";
import { useAuth0 } from "@auth0/auth0-react";
import { News } from "../components/News";
import { useRoles } from "../components/useRoles";
import { Heading, Text } from "@chakra-ui/react";

export const Home = () => {
   const { isAuthenticated } = useAuth0();
   const { isMember } = useRoles();
   if (isAuthenticated) {
      if (isMember) {
         return <News />;
      } else {
         return (
            <PageLayout>
               <Heading as="h1">Velkommen</Heading>
               <Text>Du må være medlem for å se nyheter</Text>
            </PageLayout>
         );
      }
   } else {
      return (
         <PageLayout>
            <Heading as="h1">Velkommen</Heading>
            <Text>Logg inn for å se noe</Text>
         </PageLayout>
      );
   }
};
