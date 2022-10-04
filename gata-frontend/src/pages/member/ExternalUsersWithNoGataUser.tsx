import { Heading, List, ListItem } from "@chakra-ui/react";
import { useGetExternalUsersWithNoGataUser } from "../../api/user.api";
import { Loading } from "../../components/Loading";
import { ExternalUsersWithNoGataUserListItem } from "./ExternalUsersWithNoGataUserListItem";
import { IGataUser } from "../../types/GataUser.type";

type ExternalUsersWithNoGataUserProps = {
   onAddUser: (user: IGataUser) => void;
};

export const ExternalUsersWithNoGataUser = ({ onAddUser }: ExternalUsersWithNoGataUserProps) => {
   const { usersResponse, updateExternalUsersWithNoGataUser } = useGetExternalUsersWithNoGataUser();

   const handleAddUser = (newUser: IGataUser) => {
      updateExternalUsersWithNoGataUser((externalUsers) => {
         onAddUser(newUser);
         return externalUsers?.filter((externalUser) => externalUser.id !== newUser.primaryUser.id) || [];
      });
   };

   return (
      <>
         <Heading as="h2" id="external-user-title" size="lg">
            Andre pålogginger
         </Heading>
         <Loading response={usersResponse} />
         <List aria-labelledby="external-user-title">
            {usersResponse.data?.map((user) => {
               return <ExternalUsersWithNoGataUserListItem key={user.id} user={user} onAddUser={handleAddUser} />;
            })}
            {usersResponse.data?.length === 0 && <ListItem>Ingen andre brukere</ListItem>}
         </List>
      </>
   );
};
