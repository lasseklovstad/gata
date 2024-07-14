import { cn } from "~/utils";

import { LikeIconMapping } from "./LikeIconMapping";

type Props = {
   likes: { type: string }[];
   size: "small" | "normal";
};

export const Likes = ({ likes, size }: Props) => {
   return (
      <ul className="flex gap-2">
         {[...new Set(likes.map((l) => l.type))].map((like) => {
            const Icon = LikeIconMapping[like as keyof typeof LikeIconMapping];
            return (
               <li key={like} className={cn("flex gap-1 items-center", size === "normal" ? "text-lg" : "text-sm")}>
                  {Icon}
                  {likes.filter((l) => l.type === like).length}
               </li>
            );
         })}
      </ul>
   );
};
