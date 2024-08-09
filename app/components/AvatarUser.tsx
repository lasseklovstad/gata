import { Image } from "@unpic/react";

import type { User } from "~/.server/db/user";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/utils";
import { useDialog } from "~/utils/dialogUtils";

import { Button } from "./ui/button";
import { Dialog, DialogCloseButton } from "./ui/dialog";

type Props = {
   user?: Pick<User, "picture" | "name">;
   className?: string;
};

export const AvatarUser = ({ user, className }: Props) => {
   return (
      <>
         <Avatar className={className}>
            <AvatarImage src={user?.picture || undefined} alt={user?.name || ""} />
            <AvatarFallback>
               <img src="/no-profile.jpg" alt="" />
            </AvatarFallback>
         </Avatar>
      </>
   );
};

export const AvatarUserButton = ({ user, className }: Props) => {
   const { dialogRef, close, open } = useDialog({ defaultOpen: false });

   return (
      <>
         <Button size="icon" variant="ghost" onClick={open} className="w-fit">
            <Avatar className={className}>
               <AvatarImage src={user?.picture || undefined} alt={user?.name || ""} />
               <AvatarFallback>
                  <img src="/no-profile.jpg" alt="" />
               </AvatarFallback>
            </Avatar>
         </Button>

         <Dialog ref={dialogRef} className="backdrop:bg-black/80 relative w-[400px] h-[400px]">
            <DialogCloseButton onClose={close} />
            <Image
               unstyled
               className={cn("max-h-screen object-contain")}
               src={user?.picture || ""}
               alt=""
               width={400}
               height={400}
            />
         </Dialog>
      </>
   );
};
