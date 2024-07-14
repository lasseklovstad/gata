import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { formatDate, intervalToDuration } from "date-fns";
import { Vote } from "lucide-react";
import { useId } from "react";
import { z } from "zod";

import {
   deleteMessageLike,
   getEventCloudinaryImages,
   getEventMessages,
   getEventPollsSimple,
   insertEventMessage,
   insertEventMessageReply,
   insertMessageLike,
} from "~/.server/db/gataEvent";
import { AvatarUser } from "~/components/AvatarUser";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { badRequest } from "~/utils/responseUtils";
import { createEventMessageSchema, likeMessageSchema, newEventMessageReplySchema } from "~/utils/schemas/eventSchema";

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
   if (intent === "createMessage") {
      const { message } = createEventMessageSchema.parse(formData);
      await insertEventMessage(eventId, loggendInUser.id, message);
      return { ok: true };
   }
   if (intent === "replyMessage") {
      const { reply, messageId } = newEventMessageReplySchema.parse(formData);
      await insertEventMessageReply(loggendInUser.id, messageId, reply);
      return { ok: true };
   }
   if (intent === "likeMessage") {
      const { messageId, type } = likeMessageSchema.parse(formData);
      request.method === "POST"
         ? await insertMessageLike(loggendInUser.id, messageId, type)
         : await deleteMessageLike(loggendInUser.id, messageId);
      return { ok: true };
   }
};

export default function EventActivities() {
   const { polls, cloudinaryImages, eventId, messages, loggedInUser } = useLoaderData<typeof loader>();
   const activePollsTitleId = useId();
   const activePolls = polls.filter((p) => p.poll.isActive);

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
         <ul className="flex flex-col gap-2 w-full">
            {messages.map(({ message }) => (
               <li
                  key={message.id}
                  className="flex flex-col gap-2 p-4 w-full whitespace-pre-line border rounded shadow-sm"
               >
                  <div className="flex gap-2 items-center">
                     <AvatarUser className="size-10" user={message.user} />
                     <div>
                        {message.user.name}
                        <Typography variant="mutedText">{formatDate(message.dateTime, "dd.MM.yyyy HH:mm")}</Typography>
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
                  <ul className="flex flex-col gap-2">
                     {message.replies.map(({ reply }) => {
                        const timeSince = getTimeDifference(reply.dateTime);
                        return (
                           <li key={reply.id}>
                              <div className="flex gap-2">
                                 <AvatarUser className="size-8" user={message.user} />
                                 <div>
                                    <div className="p-2 bg-gray-200 rounded-xl">
                                       <Typography variant="mutedText">{reply.user.name}</Typography>
                                       {reply.message}

                                       <Likes likes={reply.likes} size="small" />
                                    </div>

                                    <div className="flex">
                                       <Typography variant="mutedText">{timeSince}</Typography>
                                       <LikeButton
                                          messageId={reply.id}
                                          loggInUserId={loggedInUser.id}
                                          likes={reply.likes}
                                          size="small"
                                          className="-mt-2"
                                       />
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
   const targetDate = new Date(dateString);
   const now = new Date();

   const duration = intervalToDuration({ start: targetDate, end: now });

   if (duration.days && duration.days > 0) {
      return `${duration.days} dager siden`;
   } else if (duration.hours && duration.hours > 0) {
      return `${duration.hours} timer siden`;
   } else if (duration.minutes && duration.minutes > 0) {
      return `${duration.minutes} minutter siden`;
   } else if (duration.seconds && duration.seconds > 0) {
      return `${duration.seconds} sekunder siden`;
   }
}
