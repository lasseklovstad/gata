import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";

import { LikeIconMapping } from "./LikeIconMapping";

type Props = {
   likes: {
      type: string;
      user: {
         picture: string;
         name: string;
      };
   }[];
   size: "small" | "normal";
};

export const Likes = ({ likes, size }: Props) => {
   return (
      <ul className="flex gap-2" aria-label="Reaksjoner">
         {[...new Set(likes.map((l) => l.type))].map((like) => {
            const likesOfCurrentType = likes.filter((l) => l.type === like);
            const Icon = LikeIconMapping[like as keyof typeof LikeIconMapping];
            return (
               <li key={like} className={cn("flex gap-1 items-center", size === "normal" ? "text-lg" : "text-sm")}>
                  <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger>
                           <span>
                              {Icon}
                              {likesOfCurrentType.length}
                           </span>
                        </TooltipTrigger>
                        <TooltipContent>
                           <Typography>{likesOfCurrentType.map((l) => l.user.name).join(",")}</Typography>
                        </TooltipContent>
                     </Tooltip>
                  </TooltipProvider>
               </li>
            );
         })}
      </ul>
   );
};
