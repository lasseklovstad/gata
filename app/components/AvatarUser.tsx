import { UserIcon } from "lucide-react";

import type { User } from "~/.server/db/user";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Props = {
   user: User;
   className?: string;
};

export const AvatarUser = ({ user, className }: Props) => {
   return (
      <Avatar className={className}>
         <AvatarImage src={user.primaryUser.picture || undefined} alt={user.primaryUser.name} />
         <AvatarFallback>
            <UserIcon />
         </AvatarFallback>
      </Avatar>
   );
};
