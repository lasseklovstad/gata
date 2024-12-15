import { z } from "zod";

import { addPollVoteAndNotify, createNewPoll, updatePollAndNotify } from "~/.server/data-layer/eventPoll";
import { deletePoll, getEvent, getEventPolls, getIsPollActive, insertPollOptions } from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";
import { getRequiredUser } from "~/utils/auth.server";
import { emitter } from "~/utils/events/emitter.server";
import { useLiveLoader } from "~/utils/events/use-live-loader";
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

import type { Route } from "./+types/route";
import { Poll } from "./Poll";
import { PollNew } from "./PollNew";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const [event, polls, users] = await Promise.all([
      getEvent(eventId),
      getEventPolls(eventId, loggedInUser),
      getUsers(),
   ]);
   const pollId = new URL(request.url).searchParams.get("pollId");
   const filteredPolls = pollId ? polls.filter((p) => p.pollId.toString() === pollId) : polls;
   return { event, polls: filteredPolls, loggedInUser, users };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   const startEmit = () => emitter.emit(`event-${eventId}-polls`);

   if (intent === "pollVote") {
      const pollVoteForm = pollVoteSchema.parse(formdata);
      const isPollActive = await getIsPollActive(pollVoteForm.pollId);
      if (!isPollActive) {
         throw badRequest("Avstemning er ikke aktiv lenger");
      }
      await addPollVoteAndNotify(loggedInUser, eventId, pollVoteForm);
      startEmit();
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
      startEmit();
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
      startEmit();
      return { ok: true };
   }

   if (intent === "deletePoll") {
      const { pollId } = pollDeleteSchema.parse(formdata);
      await deletePoll(pollId);
      startEmit();
      return { ok: true };
   }
   if (intent === "newPoll") {
      const newPollForm = newPollSchema.safeParse(formdata);
      if (!newPollForm.success) {
         return transformErrorResponse(newPollForm.error);
      }
      await createNewPoll(loggedInUser, eventId, newPollForm.data);
      startEmit();
      return { ok: true };
   }
   throw badRequest("Intent not found " + intent);
};

export default function EventPage({ loaderData: { event, polls, loggedInUser, users } }: Route.ComponentProps) {
   useLiveLoader();
   const isOrganizer = isUserOrganizer(event, loggedInUser);
   return (
      <div>
         <div className="flex justify-between items-center mb-4">
            <Typography variant="h2">Avstemninger</Typography>
            {isOrganizer ? <PollNew /> : null}
         </div>
         <div className="space-y-8">
            {polls.length === 0 ? (
               <Typography>Ingen avstemninger lagt til enda...</Typography>
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
