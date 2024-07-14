import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { ThumbsUp } from "lucide-react";

import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

import { LikeIconMapping } from "./LikeIconMapping";

type Props = {
   messageId: number;
   likes: { type: string; userId: string }[];
   loggInUserId: string;
};

export const LikeButton = ({ messageId, loggInUserId, likes }: Props) => {
   const fetcher = useFetcher();
   const selectedLikeType = likes.find((like) => like.userId === loggInUserId)?.type;
   return (
      <>
         <Popover className="relative">
            <PopoverButton as={Button} variant="outline" className="flex gap-1" isLoading={fetcher.state !== "idle"}>
               <ThumbsUp />
               <span>Liker</span>
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
                           fetcher.submit({ type: "thumbsUp", intent: "likeMessage", messageId }, { method: "DELETE" });
                        } else {
                           fetcher.submit({ type: type, intent: "likeMessage", messageId }, { method: "POST" });
                        }
                        close();
                     }}
                  >
                     {(["thumbsUp", "thumbsDown", "heart", "party", "cry", "angry"] as const).map((type) => {
                        const Icon = LikeIconMapping[type];
                        return (
                           <ToggleGroupItem key={type} value={type}>
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
