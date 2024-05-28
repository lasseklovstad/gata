import { useFetcher } from "@remix-run/react";
import { Plus, User } from "lucide-react";

import type { ExternalUser } from "db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

type ExternalUsersWithNoGataUserListItemProps = {
   user: ExternalUser;
};

export const ExternalUsersWithNoGataUserListItem = ({ user }: ExternalUsersWithNoGataUserListItemProps) => {
   const fetcher = useFetcher();

   const handleAddClick = () => {
      fetcher.submit({ externalUserId: user.id }, { method: "post" });
   };

   return (
      <li className="flex gap-4 items-center p-2">
         <Avatar>
            <AvatarImage src={user.picture || undefined} alt="" />
            <AvatarFallback>
               <User />
            </AvatarFallback>
         </Avatar>
         <div className="flex-grow">
            <Typography variant="largeText">{user.name}</Typography>
            <Typography variant="smallText" className="text-gray-500">
               Sist innlogget: {new Date(user.lastLogin ?? "").toLocaleDateString("no")}
            </Typography>
         </div>
         <Button size="icon" onClick={handleAddClick} isLoading={fetcher.state !== "idle"} aria-label="Legg til">
            <Plus />
         </Button>
      </li>
   );
};
