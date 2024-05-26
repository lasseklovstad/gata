import { Link } from "@remix-run/react";
import { Check, X, User as UserIcon } from "lucide-react";

import type { User } from "~/.server/db/user";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Typography } from "~/components/ui/typography";
import { getPrimaryUser } from "~/utils/userUtils";

import { isMember } from "../../utils/roleUtils";

type UserListItemProps = {
   user: User;
   isLoggedInUserAdmin: boolean;
};

export const UserListItem = ({ user, isLoggedInUserAdmin }: UserListItemProps) => {
   const isCurrentContingentPaid = user.contingents.find((c) => c.year === new Date().getFullYear())?.isPaid;
   return (
      <li className="hover:bg-blue-50">
         <Link to={`/member/${user.id}`}>
            <div className="flex gap-4 p-2 items-center">
               <Avatar>
                  <AvatarImage src={getPrimaryUser(user).picture || undefined} alt={getPrimaryUser(user).name ?? ""} />
                  <AvatarFallback>
                     <UserIcon />
                  </AvatarFallback>
               </Avatar>
               <div>
                  <Typography variant="largeText">{getPrimaryUser(user).name}</Typography>
                  <Typography variant="smallText" className="text-gray-500">
                     Sist innlogget: {new Date(getPrimaryUser(user).lastLogin ?? "").toLocaleDateString("no")}
                  </Typography>
                  {isLoggedInUserAdmin && isMember(user) && (
                     <Typography
                        variant="smallText"
                        className={`${isCurrentContingentPaid ? "text-green-500" : "text-red-500"} flex items-center`}
                     >
                        {isCurrentContingentPaid ? (
                           <>
                              <Check /> Betalt kontigent
                           </>
                        ) : (
                           <>
                              <X /> Ikke betalt kontigent
                           </>
                        )}
                     </Typography>
                  )}
               </div>
            </div>
         </Link>
      </li>
   );
};
