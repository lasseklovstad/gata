import { useFetcher } from "@remix-run/react";
import { Plus, Trash, User, X } from "lucide-react";

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
      fetcher.submit({ externalUserId: user.id }, { method: "POST" });
   };

   const handleDeleteClick = () => {
      fetcher.submit({ externalUserId: user.id }, { method: "DELETE" });
   };

   return (
      <li className="flex gap-2 items-center p-2">
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

         <Button
            size="icon"
            variant="ghost"
            onClick={handleDeleteClick}
            isLoading={fetcher.state !== "idle"}
            aria-label="Fjern"
         >
            <Trash />
         </Button>
         <Button
            size="icon"
            variant="ghost"
            onClick={handleAddClick}
            isLoading={fetcher.state !== "idle"}
            aria-label="Legg til"
         >
            <Plus />
         </Button>
      </li>
   );
};
