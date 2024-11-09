import type { SerializeFrom } from "@remix-run/node";
import { intervalToDuration } from "date-fns";
import { useState } from "react";

import { AvatarUserButton } from "~/components/AvatarUser";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";
import { getDateWithTimeZone } from "~/utils/date.utils";

import { LikeButton } from "./LikeButton";
import { Likes } from "./Likes";
import type { loader } from "./route";

type Props = {
   message: SerializeFrom<typeof loader>["messages"][number]["message"];
   focusMessageId: string | null;
   loggedInUserId: string;
};

export const ReplyList = ({ message, focusMessageId, loggedInUserId }: Props) => {
   const [replyStartIndex, setReplyStartIndex] = useState(message.replies.length > 5 ? message.replies.length - 5 : 0);
   return (
      <ul className="flex flex-col gap-2" aria-label="Kommentarer">
         {replyStartIndex > 0 ? (
            <li>
               <Button size="sm" variant="ghost" onClick={() => setReplyStartIndex(0)}>
                  Se tidligere kommentarer
               </Button>
            </li>
         ) : message.replies.length > 5 ? (
            <li>
               <Button size="sm" variant="ghost" onClick={() => setReplyStartIndex(message.replies.length - 5)}>
                  Skjul tidligere kommentarer
               </Button>
            </li>
         ) : null}
         {message.replies.slice(replyStartIndex).map(({ reply }) => {
            const timeSince = getTimeDifference(reply.dateTime);
            return (
               <li
                  key={reply.id}
                  id={`message-${reply.id}`}
                  className={cn(
                     reply.id.toString() === focusMessageId && "outline outline-primary outline-offset-4 rounded"
                  )}
               >
                  <div className="flex gap-2">
                     <AvatarUserButton className="size-8" user={reply.user} />
                     <div>
                        <div className="p-2 bg-gray-200 rounded-xl">
                           <Typography variant="mutedText">{reply.user.name}</Typography>
                           {reply.message}

                           <Likes likes={reply.likes} size="small" />
                        </div>

                        <div className="flex">
                           <LikeButton
                              messageId={reply.id}
                              loggedInUserId={loggedInUserId}
                              likes={reply.likes}
                              size="small"
                              className="-mt-2"
                           />
                           <Typography variant="mutedText">{timeSince}</Typography>
                        </div>
                     </div>
                  </div>
               </li>
            );
         })}
      </ul>
   );
};

function getTimeDifference(dateString: string) {
   const now = new Date();

   const duration = intervalToDuration({ start: getDateWithTimeZone(dateString), end: now });

   if (duration.days && duration.days > 0) {
      return `${duration.days} dager siden`;
   } else if (duration.hours && duration.hours > 0) {
      return `${duration.hours} timer siden`;
   } else if (duration.minutes && duration.minutes > 0) {
      return `${duration.minutes} minutter siden`;
   } else if (duration.seconds && duration.seconds >= 0) {
      return `${duration.seconds} sekunder siden`;
   }
   return "Nå";
}
