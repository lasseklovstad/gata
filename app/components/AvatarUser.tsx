import { User as UserIcon } from "lucide-react";

import type { User } from "~/.server/db/user";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type Props = {
   user?: Pick<User, "picture" | "name">;
   className?: string;
};

export const AvatarUser = ({ user, className }: Props) => {
   return (
      <Avatar className={className}>
         <AvatarImage src={user?.picture || undefined} alt={user?.name || ""} />
         <AvatarFallback>
            <img src="/no-profile.jpg" alt="" />
         </AvatarFallback>
      </Avatar>
   );
};
