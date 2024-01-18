import { Box, Button, Divider, Heading, IconButton, List, ListItem, Text } from "@chakra-ui/react";
import { Add, Delete, Edit } from "@mui/icons-material";
import { json, Link, LoaderFunction, Outlet, useLoaderData } from "react-router-dom";

import { client } from "../../api/client/client";
import { getRequiredAccessToken } from "../../auth0Client";
import { PageLayout } from "../../components/PageLayout";
import { isAdmin } from "../../components/useRoles";
import { IGataUser } from "../../types/GataUser.type";
import { IResponsibility } from "../../types/Responsibility.type";

export const responsibilityPageLoader: LoaderFunction = async ({ request: { signal } }) => {
   const token = await getRequiredAccessToken();
   const responsibilities = await client<IResponsibility[]>("responsibility", { token, signal });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token, signal });
   return json<ResponsibilityPageLoaderData>({ responsibilities, loggedInUser });
};

interface ResponsibilityPageLoaderData {
   responsibilities: IResponsibility[];
   loggedInUser: IGataUser;
}

export const ResponsibilityPage = () => {
   const { responsibilities, loggedInUser } = useLoaderData() as ResponsibilityPageLoaderData;

   return (
      <PageLayout>
         <Box display="flex" justifyContent="space-between" flexWrap="wrap" alignItems="center">
            <Heading as="h1">Ansvarsposter</Heading>
            {isAdmin(loggedInUser) && (
               <Button leftIcon={<Add />} as={Link} to="new">
                  Legg til
               </Button>
            )}
         </Box>
         <List my={4}>
            {responsibilities.map((resp) => {
               const { name, id, description } = resp;
               return (
                  <ListItem key={id}>
                     <Box display="flex" py={2}>
                        <Box flex={1}>
                           <Text>{name}</Text>
                           <Text color="gray" fontSize="sm">
                              {description}
                           </Text>
                        </Box>
                        {isAdmin(loggedInUser) && (
                           <>
                              <IconButton variant="ghost" as={Link} to={id} icon={<Edit />} aria-label="Rediger" />
                              <IconButton
                                 variant="ghost"
                                 as={Link}
                                 to={`${id}/delete`}
                                 icon={<Delete />}
                                 aria-label="Slett"
                              />
                           </>
                        )}
                     </Box>
                     <Divider />
                  </ListItem>
               );
            })}
            {responsibilities.length === 0 && <ListItem>Ingen ansvarsposter, trykk legg til for å lage ny</ListItem>}
         </List>
         <Outlet />
      </PageLayout>
   );
};
