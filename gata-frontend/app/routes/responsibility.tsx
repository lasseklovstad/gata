import { Box, Button, Divider, Heading, IconButton, List, ListItem, Text } from "@chakra-ui/react";
import { Add, Delete, Edit } from "@mui/icons-material";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { PageLayout } from "~/components/PageLayout";
import type { IGataUser } from "~/types/GataUser.type";
import type { IResponsibility } from "~/types/Responsibility.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const responsibilities = await client<IResponsibility[]>("responsibility", { token });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   return json({ responsibilities, loggedInUser });
};

export default function ResponsibilityPage() {
   const { responsibilities, loggedInUser } = useLoaderData<typeof loader>();

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
}
