import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Vote } from "lucide-react";
import { useId } from "react";
import { z } from "zod";

import {
   deleteMessageLike,
   getEventCloudinaryImages,
   getEventMessages,
   getEventPollsSimple,
   insertEventMessage,
   insertMessageLike,
} from "~/.server/db/gataEvent";
import { AvatarUser } from "~/components/AvatarUser";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { badRequest } from "~/utils/responseUtils";
import { createEventMessageSchema, likeMessageSchema } from "~/utils/schemas/eventSchema";

import { LikeButton } from "./LikeButton";
import { LikeIconMapping } from "./LikeIconMapping";
import { NewMessageForm } from "./NewMessageForm";
import { UploadImages } from "../../components/UploadImages";
import { formatDate, parse } from "date-fns";
import { ReplyMessageForm } from "./ReplyMessageForm";
import { nb } from "date-fns/locale";
import { Likes } from "./Likes";

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
   console.log(messages);
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
               <li key={message.id} className="flex flex-col p-4 w-full whitespace-pre-line border rounded shadow-sm">
                  <div className="flex gap-2 items-center">
                     <AvatarUser className="size-10" user={message.user} />
                     <div>
                        {message.user.name}
                        <Typography variant="mutedText">{formatDate(message.dateTime, "dd.MM.yyyy HH:mm")}</Typography>
                     </div>
                  </div>
                  <div className="p-1">{message.message}</div>
                  <div>
                     <Likes likes={message.likes} />
                  </div>
                  <div className="my-4">
                     <LikeButton messageId={message.id} loggInUserId={loggedInUser.id} likes={message.likes} />
                  </div>
                  <ReplyMessageForm />
               </li>
            ))}
         </ul>
      </div>
   );
}
