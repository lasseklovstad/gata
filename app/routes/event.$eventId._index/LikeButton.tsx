import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ThumbsUp } from "lucide-react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import type { action } from "~/routes/event.$eventId._index/route";
import { cn } from "~/utils";

import { LikeIconMapping } from "./LikeIconMapping";

type Props = {
   messageId: number;
   likes: { type: string; userId: string }[];
   loggedInUserId: string;
   size: "normal" | "small";
   className?: string;
};

export const LikeButton = ({ messageId, loggedInUserId, likes, size, className }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const selectedLikeType = likes.find((like) => like.userId === loggedInUserId)?.type;
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
                        if (!type) {
                           void fetcher.submit(
                              { type: "thumbsUp", intent: "likeMessage", messageId },
                              { method: "DELETE" }
                           );
                        } else {
                           void fetcher.submit({ type: type, intent: "likeMessage", messageId }, { method: "POST" });
                        }
                        close();
                     }}
                  >
                     {(["thumbsUp", "thumbsDown", "heart", "party", "cry", "angry", "haha"] as const).map((type) => {
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
