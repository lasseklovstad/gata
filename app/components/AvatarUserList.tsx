import type { User } from "~/.server/db/user";
import { cn } from "~/utils";

import { AvatarUser } from "./AvatarUser";

type Props = {
   users: Pick<User, "picture" | "id" | "name">[];
   className?: string;
   "aria-label": string;
};

export const AvatarUserList = ({ users, className, "aria-label": ariaLabel }: Props) => {
   return (
      <ul aria-label={ariaLabel} className={cn("flex flex-row-reverse h-6 ml-3", className)}>
         {users.map((user) => (
            <li key={user.id}>
               <AvatarUser user={user} className="size-6 shadow -ml-3" />
            </li>
         ))}
      </ul>
   );
};
