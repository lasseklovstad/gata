import { Typography } from "~/components/ui/typography";

import { LikeIconMapping } from "./LikeIconMapping";

type Props = {
   likes: { type: string }[];
};

export const Likes = ({ likes }: Props) => {
   return (
      <ul className="flex gap-2">
         {[...new Set(likes.map((l) => l.type))].map((like) => {
            const Icon = LikeIconMapping[like as keyof typeof LikeIconMapping];
            return (
               <li key={like} className="flex gap-1 items-center">
                  {Icon}
                  <Typography variant="largeText">{likes.filter((l) => l.type === like).length}</Typography>
               </li>
            );
         })}
      </ul>
   );
};
