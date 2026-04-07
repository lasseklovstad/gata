import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ThumbsUp } from "lucide-react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import type { action } from "~/routes/event.$eventId._index/route";
import { cn } from "~/utils";

import { LikeIconMapping } from "./LikeIconMapping";

type Props = {
   targetId: number | string;
   targetIdKey: "messageId" | "cloudId";
   intent: "likeMessage" | "likeImage";
   likes: { type: string; userId: string }[];
   loggedInUserId: string;
   size: "normal" | "small";
   className?: string;
   actionPath?: string;
   inline?: boolean;
};

export const LikeButton = ({
   targetId,
   targetIdKey,
   intent,
   loggedInUserId,
   likes,
   size,
   className,
   actionPath,
   inline = false,
}: Props) => {
   const fetcher = useFetcher<typeof action>();
   const selectedLikeType = likes.find((like) => like.userId === loggedInUserId)?.type;

   const submitLike = (type: string) => {
      if (!type) {
         void fetcher.submit(
            { type: "thumbsUp", intent, [targetIdKey]: targetId },
            { method: "DELETE", action: actionPath }
         );
      } else {
         void fetcher.submit({ type, intent, [targetIdKey]: targetId }, { method: "POST", action: actionPath });
      }
   };

   const reactionTypes = ["thumbsUp", "thumbsDown", "heart", "party", "cry", "angry", "haha"] as const;

   if (inline) {
      return (
         <ToggleGroup
            variant="default"
            type="single"
            aria-label="Velg type"
            value={selectedLikeType}
            onValueChange={submitLike}
            className={cn( className)}
            size={"sm"}
         >
            {reactionTypes.map((type) => {
               const Icon = LikeIconMapping[type];
               return (
                  <ToggleGroupItem key={type} value={type} className="text-lg">
                     {Icon}
                  </ToggleGroupItem>
               );
            })}
         </ToggleGroup>
      );
   }

   return (
      <>
         <Popover className={cn("relative", className)}>
            <PopoverButton
               as={Button}
               variant={size === "normal" ? "outline" : "ghost"}
               size={size === "normal" ? "sm" : "icon"}
               className="flex gap-1"
               isLoading={fetcher.state !== "idle"}
            >
               <ThumbsUp className={size === "normal" ? "size-6" : "size-4"} />
               <span className={size === "normal" ? "" : "sr-only"}>Liker</span>
            </PopoverButton>
            <PopoverPanel anchor="top" className="flex gap-2 p-2 bg-white rounded shadow-lg border [--anchor-gap:8px]">
               {({ close }) => (
                  <ToggleGroup
                     variant="default"
                     type="single"
                     aria-label="Velg type"
                     value={selectedLikeType}
                     onValueChange={(type) => {
                        submitLike(type);
                        close();
                     }}
                  >
                     {reactionTypes.map((type) => {
                        const Icon = LikeIconMapping[type];
                        return (
                           <ToggleGroupItem key={type} value={type} className="text-xl">
                              {Icon}
                           </ToggleGroupItem>
                        );
                     })}
                  </ToggleGroup>
               )}
            </PopoverPanel>
         </Popover>
      </>
   );
};
