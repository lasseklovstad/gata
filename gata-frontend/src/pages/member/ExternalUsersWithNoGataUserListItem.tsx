import { Alert, AlertTitle, Avatar, Box, Divider, Flex, IconButton, ListItem, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import { IExternalUser, IGataUser } from "../../types/GataUser.type";
import { useCreateUser } from "../../api/user.api";

type ExternalUsersWithNoGataUserListItemProps = {
   user: IExternalUser;
   onAddUser: (user: IGataUser) => void;
};

export const ExternalUsersWithNoGataUserListItem = ({ user, onAddUser }: ExternalUsersWithNoGataUserListItemProps) => {
   const { createUser, userResponse } = useCreateUser(user.id);

   const handleAddClick = async () => {
      const { status, data } = await createUser();
      if (data && status === "success") {
         onAddUser(data);
      }
   };

   return (
      <ListItem>
         <Flex gap={2} p={2}>
            <Avatar src={user.picture} />
            <Box flex={1}>
               <Text>{user.name}</Text>
               <Text color="gray" fontSize="sm">
                  Sist innlogget: {new Date(user.lastLogin).toLocaleDateString()}
               </Text>
            </Box>
            {userResponse.status === "error" && (
               <Alert status="error">
                  <AlertTitle>Det oppstod en feil ved oppretting av bruker</AlertTitle>
                  {userResponse.error?.message}
               </Alert>
            )}
            <IconButton
               onClick={handleAddClick}
               isLoading={userResponse.status === "loading"}
               icon={<Add />}
               aria-label="Legg til"
            />
         </Flex>
         <Divider />
      </ListItem>
   );
};
