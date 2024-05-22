import { Link } from "@remix-run/react";
import { Check, User, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Typography } from "~/components/ui/typography";

import type { IGataUser } from "../../types/GataUser.type";
import { isMember } from "../../utils/roleUtils";

type UserListItemProps = {
   user: IGataUser;
   isLoggedInUserAdmin: boolean;
};

export const UserListItem = ({ user, isLoggedInUserAdmin }: UserListItemProps) => {
   const isCurrentContingentPaid = user.contingents.find((c) => c.year === new Date().getFullYear())?.isPaid;
   return (
      <li className="hover:bg-blue-50">
         <Link to={`/member/${user.id}`}>
            <div className="flex gap-4 p-2 items-center">
               <Avatar>
                  <AvatarImage src={user.primaryUser.picture || undefined} alt={user.primaryUser.name} />
                  <AvatarFallback>
                     <User />
                  </AvatarFallback>
               </Avatar>
               <div>
                  <Typography variant="largeText">{user.primaryUser.name}</Typography>
                  <Typography variant="smallText" className="text-gray-500">
                     Sist innlogget: {new Date(user.primaryUser.lastLogin).toLocaleDateString("no")}
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
