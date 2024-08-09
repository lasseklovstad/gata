import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import { intervalToDuration } from "date-fns";
import { Vote } from "lucide-react";
import { useEffect, useId } from "react";
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
import { AvatarUserButton } from "~/components/AvatarUser";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";
import { createAuthenticator } from "~/utils/auth.server";
import { formatDateTime, getDateWithTimeZone } from "~/utils/date.utils";
import { emitter } from "~/utils/events/emitter.server";
import { useLiveLoader } from "~/utils/events/use-live-loader";
import { badRequest } from "~/utils/responseUtils";
import { createEventMessageSchema, likeMessageSchema, newEventMessageReplySchema } from "~/utils/schemas/eventSchema";
import { transformErrorResponse } from "~/utils/validateUtils";

import { LikeButton } from "./LikeButton";
import { Likes } from "./Likes";
import { NewMessageForm } from "./NewMessageForm";
import { ReplyMessageForm } from "./ReplyMessageForm";
import { UploadImages } from "../../components/UploadImages";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const [polls, cloudinaryImages, messages] = await Promise.all([
      getEventPollsSimple(eventId),
      getEventCloudinaryImages(eventId),
      getEventMessages(eventId),
   ]);
   return { polls, cloudinaryImages, eventId, messages, loggedInUser };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const loggendInUser = await createAuthenticator().getRequiredUser(request);
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   const formData = await request.formData();
   const intent = formData.get("intent");

   const startEmit = () => emitter.emit(`event-${eventId}-activities`);

   if (intent === "createMessage") {
      const parsedForm = createEventMessageSchema.safeParse(formData);
      if (!parsedForm.success) {
         return transformErrorResponse(parsedForm.error);
      }
      const { message } = parsedForm.data;
      const messageId = await insertEventMessage(eventId, loggendInUser.id, message);
      await notifyParticipantsNewPostCreated(loggendInUser, eventId, messageId);
      startEmit();
      return { ok: true } as const;
   }
   if (intent === "replyMessage") {
      const parsedForm = newEventMessageReplySchema.safeParse(formData);
      if (!parsedForm.success) {
         return transformErrorResponse(parsedForm.error);
      }
      const { reply, messageId } = parsedForm.data;
      const replyId = await insertEventMessageReply(loggendInUser.id, messageId, reply);
      await notifyParticipantsReplyToPost(loggendInUser, eventId, messageId, replyId);
      startEmit();
      return { ok: true } as const;
   }
   if (intent === "likeMessage") {
      const { messageId, type } = likeMessageSchema.parse(formData);
      if (request.method === "POST") {
         await insertMessageLike(loggendInUser.id, messageId, type);
         await notifyParticipantLikeOnPost(loggendInUser, eventId, messageId);
      } else {
         await deleteMessageLike(loggendInUser.id, messageId);
      }
      startEmit();
      return { ok: true } as const;
   }
};

export default function EventActivities() {
   const { polls, cloudinaryImages, eventId, messages, loggedInUser } = useLiveLoader<typeof loader>();
   const [searchParams] = useSearchParams();
   const activePollsTitleId = useId();
   const activePolls = polls.filter((p) => p.poll.isActive);

   const messageId = searchParams.get("messageId");
   useEffect(() => {
      // Focus message when a user has clicked notification
      if (messageId) {
         document.getElementById(`message-${messageId}`)?.scrollIntoView();
      }
   }, [messageId]);

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
         <UploadImages eventId={eventId} />
         <CloudImageGallery cloudImages={cloudinaryImages.slice(0, 8)} />
         {cloudinaryImages.length ? (
            <Button variant="outline" as={Link} to="images">
               Se alle bilder
            </Button>
         ) : null}
         <NewMessageForm />
         <ul className="flex flex-col gap-2 w-full" aria-label="Innlegg">
            {messages.map(({ message }) => (
               <li
                  key={message.id}
                  id={`message-${message.id}`}
                  className={cn(
                     "flex flex-col gap-2 p-4 w-full whitespace-pre-line border rounded shadow-sm",
                     message.id.toString() === messageId && "outline outline-primary outline-offset-2"
                  )}
               >
                  <div className="flex gap-2 items-center">
                     <AvatarUserButton className="size-10" user={message.user} />
                     <div>
                        {message.user.name}
                        <Typography variant="mutedText">{formatDateTime(message.dateTime)}</Typography>
                     </div>
                  </div>
                  <div className="p-1">{message.message}</div>
                  <div className="border-b-2 py-2">
                     <Likes likes={message.likes} size="normal" />
                  </div>
                  <div>
                     <LikeButton
                        messageId={message.id}
                        loggInUserId={loggedInUser.id}
                        likes={message.likes}
                        size="normal"
                     />
                  </div>
                  <ul className="flex flex-col gap-2" aria-label="Kommentarer">
                     {message.replies.map(({ reply }) => {
                        const timeSince = getTimeDifference(reply.dateTime);
                        return (
                           <li
                              key={reply.id}
                              id={`message-${reply.id}`}
                              className={cn(
                                 reply.id.toString() === messageId && "outline outline-primary outline-offset-4 rounded"
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
                                          loggInUserId={loggedInUser.id}
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
                  <ReplyMessageForm messageId={message.id} />
               </li>
            ))}
         </ul>
      </div>
   );
}

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
