import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { useGetExternalUsersWithNoGataUser } from "../../api/user.api";
import { Loading } from "../../components/Loading";
import { ExternalUsersWithNoGataUserListItem } from "./ExternalUsersWithNoGataUserListItem";
import { IGataUser } from "../../types/GataUser.type";

type ExternalUsersWithNoGataUserProps = {
   onAddUser: (user: IGataUser) => void;
};

export const ExternalUsersWithNoGataUser = ({ onAddUser }: ExternalUsersWithNoGataUserProps) => {
   const { usersResponse, updateExternalUsers } = useGetExternalUsersWithNoGataUser();

   const handleAddUser = (newUser: IGataUser) => {
      updateExternalUsers((externalUsers) => {
         onAddUser(newUser);
         return externalUsers?.filter((externalUser) => externalUser.id !== newUser.primaryUser.id) || [];
      });
   };

   return (
      <>
         <Typography variant="h2" id="external-user-title">
            Andre pålogginger
         </Typography>
         <Loading response={usersResponse} />
         <List aria-labelledby="external-user-title">
            {usersResponse.data?.map((user) => {
               return <ExternalUsersWithNoGataUserListItem key={user.id} user={user} onAddUser={handleAddUser} />;
            })}
            {usersResponse.data?.length === 0 && (
               <ListItem>
                  <ListItemText>Ingen andre brukere</ListItemText>
               </ListItem>
            )}
         </List>
      </>
   );
};
