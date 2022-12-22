import { Heading, List, ListItem } from "@chakra-ui/react";
import { ExternalUsersWithNoGataUserListItem } from "./ExternalUsersWithNoGataUserListItem";
import { IExternalUser } from "../../../types/GataUser.type";

type ExternalUsersWithNoGataUserProps = {
   externalUsers: IExternalUser[];
};

export const ExternalUsersWithNoGataUser = ({ externalUsers }: ExternalUsersWithNoGataUserProps) => {
   return (
      <>
         <Heading as="h2" id="external-user-title" size="lg">
            Andre pålogginger
         </Heading>
         <List aria-labelledby="external-user-title">
            {externalUsers.map((user) => {
               return <ExternalUsersWithNoGataUserListItem key={user.id} user={user} />;
            })}
            {externalUsers.length === 0 && <ListItem>Ingen andre brukere</ListItem>}
         </List>
      </>
   );
};
