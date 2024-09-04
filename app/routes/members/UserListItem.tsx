import { Link } from "@remix-run/react";
import { Check, X, Bell, BellOff, MailCheck, MailMinus } from "lucide-react";

import type { User } from "~/.server/db/user";
import { AvatarUser } from "~/components/AvatarUser";
import { Typography } from "~/components/ui/typography";

import { isMember } from "../../utils/roleUtils";

type UserListItemProps = {
   user: User;
   isLoggedInUserAdmin: boolean;
   isPushSubscribed: boolean;
};

export const UserListItem = ({ user, isLoggedInUserAdmin, isPushSubscribed }: UserListItemProps) => {
   const isCurrentContingentPaid = user.contingents.find((c) => c.year === new Date().getFullYear())?.isPaid;
   return (
      <li className="hover:bg-blue-50">
         <Link to={`/member/${user.id}`}>
            <div className="flex gap-4 p-2 items-center">
               <AvatarUser user={user} />
               <div>
                  <Typography variant="largeText" className="flex gap-2">
                     {user.name}
                     {isPushSubscribed ? (
                        <Bell className="text-primary" aria-label="Abonnerer på pushvarsler" />
                     ) : (
                        <BellOff className="text-gray-500" aria-label="Abonnerer på pushvarsler" />
                     )}
                     {user.subscribe ? (
                        <MailCheck className="text-primary" aria-label="Abonnerer på mail" />
                     ) : (
                        <MailMinus className="text-gray-500" aria-label="Abonnerer ikke på mail" />
                     )}
                  </Typography>
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
