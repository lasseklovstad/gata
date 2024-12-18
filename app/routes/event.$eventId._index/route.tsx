import { Image, Vote } from "lucide-react";
import { useEffect, useId } from "react";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";

import {
   notifyParticipantLikeOnPost,
   notifyParticipantsNewPostCreated,
   notifyParticipantsReplyToPost,
} from "~/.server/data-layer/gataEvent";
import {
   deleteMessageLike,
   getEventCloudinaryImages,
   getEventMessages,
   getEventPollsSimple,
   insertEventMessage,
   insertEventMessageReply,
   insertMessageLike,
} from "~/.server/db/gataEvent";
import { getAllUsersWithSubscription } from "~/.server/db/pushSubscriptions";
import { AvatarUserButton } from "~/components/AvatarUser";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";
import { getRequiredUser } from "~/utils/auth.server";
import { formatDateTime } from "~/utils/date.utils";
import { emitter } from "~/utils/events/emitter.server";
import { useLiveLoader } from "~/utils/events/use-live-loader";
import { createEventMessageSchema, likeMessageSchema, newEventMessageReplySchema } from "~/utils/schemas/eventSchema";
import { transformErrorResponse } from "~/utils/validateUtils";

import type { Route } from "./+types/route";
import { LikeButton } from "./LikeButton";
import { Likes } from "./Likes";
import { Message } from "./Message";
import { NewMessageForm } from "./NewMessageForm";
import { ReplyList } from "./ReplyList";
import { ReplyMessageForm } from "./ReplyMessageForm";
import { UploadMedia } from "../../components/UploadMedia";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const [polls, cloudinaryImages, messages, usersWithSubscription] = await Promise.all([
      getEventPollsSimple(eventId),
      getEventCloudinaryImages(eventId),
      getEventMessages(eventId),
      getAllUsersWithSubscription(loggedInUser.id),
   ]);
   return { polls, cloudinaryImages, eventId, messages, loggedInUser, usersWithSubscription };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const formData = await request.formData();
   const intent = formData.get("intent");

   const startEmit = () => emitter.emit(`event-${eventId}-activities`);

   if (intent === "createMessage") {
      const parsedForm = createEventMessageSchema.safeParse(formData);
      if (!parsedForm.success) {
         return transformErrorResponse(parsedForm.error);
      }
      const { message } = parsedForm.data;
      const messageId = await insertEventMessage(eventId, loggedInUser.id, message);
      await notifyParticipantsNewPostCreated(loggedInUser, eventId, messageId, message);
      startEmit();
      return { ok: true } as const;
   }
   if (intent === "replyMessage") {
      const parsedForm = newEventMessageReplySchema.safeParse(formData);
      if (!parsedForm.success) {
         return transformErrorResponse(parsedForm.error);
      }
      const { reply, messageId } = parsedForm.data;
      const replyId = await insertEventMessageReply(loggedInUser.id, messageId, reply);
      await notifyParticipantsReplyToPost(loggedInUser, eventId, messageId, replyId, reply);
      startEmit();
      return { ok: true } as const;
   }
   if (intent === "likeMessage") {
      const { messageId, type } = likeMessageSchema.parse(formData);
      if (request.method === "POST") {
         await insertMessageLike(loggedInUser.id, messageId, type);
         await notifyParticipantLikeOnPost(loggedInUser, eventId, messageId, type);
      } else {
         await deleteMessageLike(loggedInUser.id, messageId);
      }
      startEmit();
      return { ok: true } as const;
   }
};

export default function EventActivities({
   loaderData: { polls, cloudinaryImages, eventId, messages, loggedInUser, usersWithSubscription },
}: Route.ComponentProps) {
   useLiveLoader();
   const [searchParams] = useSearchParams();
   const activePollsTitleId = useId();
   const activePolls = polls.filter((p) => p.poll.isActive);

   const focusMessageId = searchParams.get("messageId");
   useEffect(() => {
      // Focus message when a user has clicked notification
      if (focusMessageId) {
         document.getElementById(`message-${focusMessageId}`)?.scrollIntoView();
      }
   }, [focusMessageId]);

   return (
      <div className="flex flex-col gap-4 items-start">
         {activePolls.length > 0 ? (
            <>
               <Typography variant="h3" className="mb-2" id={activePollsTitleId}>
                  Aktive avstemninger
               </Typography>
               <ul className="flex gap-2 flex-wrap" aria-labelledby={activePollsTitleId}>
                  {activePolls.map(({ poll }) => {
                     return (
                        <li key={poll.id} className="bg-orange-100 rounded py-2 px-4 shadow flex">
                           <Link to={`polls?pollId=${poll.id}`} className="w-full text-base flex">
                              <Vote className="mr-2" />
                              {poll.name}
                           </Link>
                        </li>
                     );
                  })}
               </ul>
            </>
         ) : null}
         <Typography variant="h3" className="flex gap-2 items-center flex-wrap">
            <Image />
            Last opp bilder og video
         </Typography>
         <UploadMedia eventId={eventId} />
         <CloudImageGallery cloudImages={cloudinaryImages.slice(0, 8)} />
         {cloudinaryImages.length ? (
            <Button variant="outline" as={Link} to="images">
               Se alle bilder
            </Button>
         ) : null}
         <NewMessageForm usersWithSubscription={usersWithSubscription} />
         <ul className="flex flex-col gap-2 w-full" aria-label="Innlegg">
            {messages.map(({ message }) => (
               <li
                  key={message.id}
                  id={`message-${message.id}`}
                  className={cn(
                     "flex flex-col gap-2 p-4 w-full whitespace-pre-line border rounded shadow-sm",
                     message.id.toString() === focusMessageId && "outline outline-primary outline-offset-2"
                  )}
               >
                  <div className="flex gap-2 items-center">
                     <AvatarUserButton className="size-10" user={message.user} />
                     <div>
                        {message.user.name}
                        <Typography variant="mutedText">{formatDateTime(message.dateTime)}</Typography>
                     </div>
                  </div>
                  <div className="p-1">
                     <Message message={message.message} username={loggedInUser.name} />
                  </div>
                  <div className="border-b-2 py-2">
                     <Likes likes={message.likes} size="normal" />
                  </div>
                  <div>
                     <LikeButton
                        messageId={message.id}
                        loggedInUserId={loggedInUser.id}
                        likes={message.likes}
                        size="normal"
                     />
                  </div>
                  <ReplyList message={message} loggedInUser={loggedInUser} focusMessageId={focusMessageId} />
                  <ReplyMessageForm messageId={message.id} usersWithSubscription={usersWithSubscription} />
               </li>
            ))}
         </ul>
      </div>
   );
}
