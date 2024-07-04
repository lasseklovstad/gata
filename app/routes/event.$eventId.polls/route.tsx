import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";

import { addPollVoteAndNotify, createNewPoll, updatePollAndNotify } from "~/.server/data-layer/eventPoll";
import { deletePoll, getEvent, getEventPolls, getIsPollActive, insertPollOptions } from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";
import {
   addPollOptionsSchema,
   newPollSchema,
   pollDeleteSchema,
   pollUpdateSchema,
   pollVoteSchema,
} from "~/utils/schemas/eventPollSchema";
import { transformErrorResponse } from "~/utils/validateUtils";

import { Poll } from "./Poll";
import { PollNew } from "./PollNew";

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
   const [event, polls, users] = await Promise.all([
      getEvent(eventId),
      getEventPolls(eventId, loggedInUser),
      getUsers(),
   ]);
   const pollId = new URL(request.url).searchParams.get("pollId");
   const filteredPolls = pollId ? polls.filter((p) => p.pollId.toString() === pollId) : polls;
   return { event, polls: filteredPolls, loggedInUser, users };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;

   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   if (intent === "pollVote") {
      const pollVoteForm = pollVoteSchema.parse(formdata);
      const isPollActive = await getIsPollActive(pollVoteForm.pollId);
      if (!isPollActive) {
         throw badRequest("Avstemning er ikke aktiv lenger");
      }
      await addPollVoteAndNotify(loggedInUser, eventId, pollVoteForm);
      return { ok: true };
   }

   if (intent === "addPollOptions") {
      const formParsed = addPollOptionsSchema.safeParse(formdata);
      if (!formParsed.success) {
         return transformErrorResponse(formParsed.error);
      }
      const { pollId, dateOption, textOption, type } = formParsed.data;
      const isPollActive = await getIsPollActive(pollId);
      if (!isPollActive) {
         throw badRequest("Avstemning er ikke aktiv lenger");
      }
      await insertPollOptions(pollId, type === "date" ? dateOption : textOption);
      return { ok: true };
   }

   const event = await getEvent(eventId);
   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "updatePoll") {
      const updatePollForm = pollUpdateSchema.safeParse(formdata);
      if (!updatePollForm.success) {
         return transformErrorResponse(updatePollForm.error);
      }
      await updatePollAndNotify(loggedInUser, eventId, updatePollForm.data);
      return { ok: true };
   }

   if (intent === "deletePoll") {
      const { pollId } = pollDeleteSchema.parse(formdata);
      await deletePoll(pollId);
      return { ok: true };
   }
   if (intent === "newPoll") {
      const newPollForm = newPollSchema.safeParse(formdata);
      if (!newPollForm.success) {
         return transformErrorResponse(newPollForm.error);
      }
      await createNewPoll(loggedInUser, eventId, newPollForm.data);
      return { ok: true };
   }
   throw badRequest("Intent not found " + intent);
};

export default function EventPage() {
   const { event, polls, loggedInUser, users } = useLoaderData<typeof loader>();

   const isOrganizer = isUserOrganizer(event, loggedInUser);
   return (
      <div>
         <div className="flex justify-between items-center mb-4">
            <Typography variant="h2">Avstemninger</Typography>
            {isOrganizer ? <PollNew /> : null}
         </div>
         <div className="space-y-8">
            {polls.length === 0 ? (
               <Typography>Ingen avstmeninger lagt til enda...</Typography>
            ) : (
               polls.map(({ poll }) => {
                  return (
                     <Poll
                        key={poll.id}
                        poll={poll}
                        loggedInUser={loggedInUser}
                        users={users}
                        isOrganizer={isOrganizer}
                     />
                  );
               })
            )}
         </div>
      </div>
   );
}
