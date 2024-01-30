import { Avatar, Box, Divider, Flex, Text } from "@chakra-ui/react";
import { Check, Clear } from "@mui/icons-material";

import { ListItemLink } from "../../../components/ListItemLink";
import { isMember } from "../../../components/useRoles";
import type { IGataUser } from "../../../types/GataUser.type";

type UserListItemProps = {
   user: IGataUser;
   isLoggedInUserAdmin: boolean;
};

export const UserListItem = ({ user, isLoggedInUserAdmin }: UserListItemProps) => {
   const isCurrentContingentPaid = user.contingents.find((c) => c.year === new Date().getFullYear())?.isPaid;
   return (
      <ListItemLink to={`/member/${user.id}`}>
         <Flex gap={2} p={2}>
            <Avatar src={user.primaryUser.picture || undefined} />
            <Box>
               <Text>{user.primaryUser.name}</Text>
               <Text color="gray" fontSize="sm">
                  Sist innlogget: {new Date(user.primaryUser.lastLogin).toLocaleDateString()}
               </Text>
               {isLoggedInUserAdmin && isMember(user) && (
                  <Text
                     fontSize="sm"
                     color={isCurrentContingentPaid ? "green" : "red"}
                     alignItems="center"
                     display="flex"
                  >
                     {isCurrentContingentPaid ? (
                        <>
                           <Check /> Betalt kontigent
                        </>
                     ) : (
                        <>
                           <Clear /> Ikke betalt kontigent
                        </>
                     )}
                  </Text>
               )}
            </Box>
         </Flex>
         <Divider />
      </ListItemLink>
   );
};
