import { Heading, List, ListItem } from "@chakra-ui/react";

import { ExternalUsersWithNoGataUserListItem } from "./ExternalUsersWithNoGataUserListItem";
import type { IExternalUser } from "../../types/GataUser.type";

type Props = {
   externalUsers: IExternalUser[];
};

export const ExternalUsersWithNoGataUser = ({ externalUsers }: Props) => {
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
