import type { ExternalUser } from "db/schema";
import { Typography } from "~/components/ui/typography";

import { ExternalUsersWithNoGataUserListItem } from "./ExternalUsersWithNoGataUserListItem";

type Props = {
   externalUsers: ExternalUser[];
};

export const ExternalUsersWithNoGataUser = ({ externalUsers }: Props) => {
   return (
      <>
         <Typography variant="h2" id="external-user-title">
            Andre pålogginger
         </Typography>
         <ul aria-labelledby="external-user-title" className="divide-y">
            {externalUsers.map((user) => {
               return <ExternalUsersWithNoGataUserListItem key={user.id} user={user} />;
            })}
            {externalUsers.length === 0 && <li>Ingen andre brukere</li>}
         </ul>
      </>
   );
};
