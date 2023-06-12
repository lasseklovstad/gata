import { Avatar, Box, Divider, Flex, Text } from "@chakra-ui/react";
import { IGataUser } from "../../../types/GataUser.type";
import { ListItemLink } from "../../../components/ListItemLink";

type UserListItemProps = {
   user: IGataUser;
};

export const UserListItem = ({ user }: UserListItemProps) => {
   return (
      <ListItemLink to={user.id}>
         <Flex gap={2} p={2}>
            <Avatar src={user.primaryUser.picture || undefined} />
            <Box>
               <Text>{user.primaryUser.name}</Text>
               <Text color="gray" fontSize="sm">
                  Sist innlogget: {new Date(user.primaryUser.lastLogin).toLocaleDateString()}
               </Text>
            </Box>
         </Flex>
         <Divider />
      </ListItemLink>
   );
};
