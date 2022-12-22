import { Avatar, Box, Divider, Flex, IconButton, ListItem, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import { IExternalUser } from "../../../types/GataUser.type";
import { useFetcher } from "react-router-dom";

type ExternalUsersWithNoGataUserListItemProps = {
   user: IExternalUser;
};

export const ExternalUsersWithNoGataUserListItem = ({ user }: ExternalUsersWithNoGataUserListItemProps) => {
   const fetcher = useFetcher();

   const handleAddClick = () => {
      fetcher.submit({ externalUserId: user.id }, { method: "post" });
   };

   return (
      <ListItem>
         <Flex gap={2} p={2}>
            <Avatar src={user.picture || undefined} />
            <Box flex={1} overflow="hidden">
               <Text>{user.name}</Text>
               <Text color="gray" fontSize="sm">
                  Sist innlogget: {new Date(user.lastLogin).toLocaleDateString()}
               </Text>
            </Box>
            <IconButton
               onClick={handleAddClick}
               isLoading={fetcher.state !== "idle"}
               icon={<Add />}
               aria-label="Legg til"
            />
         </Flex>
         <Divider />
      </ListItem>
   );
};
