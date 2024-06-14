import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import {
   deletePoll,
   getEvent,
   getEventPolls,
   insertDatePollVote,
   insertNewDatePoll,
   insertNewTextPoll,
   toggleActive,
   updateDatePollVote,
} from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Button, ButtonResponsive } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";
import { badRequest } from "~/utils/responseUtils";

import { PollDate } from "./PollDate";
import { PollText } from "./PollText";
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
   const [event, polls, users] = await Promise.all([getEvent(eventId), getEventPolls(eventId), getUsers()]);
   return { event, polls, loggedInUser, users };
};

const pollVoteSchema = zfd.formData({
   pollId: zfd.numeric(),
   userId: zfd.text(),
   options: zfd.repeatable(z.array(z.coerce.number())),
});

const pollToggleActiveSchema = zfd.formData({
   pollId: zfd.numeric(),
});

const pollDeleteSchema = zfd.formData({
   pollId: zfd.numeric(),
});

const newPollSchema = zfd.formData({
   name: zfd.text(z.string()),
   // format: YYYY-MM-DD
   dateOption: zfd.repeatable(z.array(z.coerce.date())),
   textOption: zfd.repeatable(z.array(z.string())),
   isAnonymous: zfd.checkbox(),
   canAddSuggestions: zfd.checkbox(),
   canSelectMultiple: zfd.checkbox(),
   type: zfd.text(z.enum(["text", "date"])),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;

   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   if (intent === "pollDateVote") {
      const pollVoteForm = pollVoteSchema.parse(formdata);
      request.method === "POST" ? await insertDatePollVote(pollVoteForm) : await updateDatePollVote(pollVoteForm);
      return { ok: true };
   }
   if (intent === "toggleActive") {
      const event = await getEvent(eventId);
      if (event.createdBy !== loggedInUser.id) {
         throw badRequest("Du har ikke tilgang til å endre denne ressursen");
      }
      const { pollId } = pollToggleActiveSchema.parse(formdata);
      await toggleActive(pollId);
      return { ok: true };
   }
   if (intent === "deletePoll") {
      const event = await getEvent(eventId);
      if (event.createdBy !== loggedInUser.id) {
         throw badRequest("Du har ikke tilgang til å endre denne ressursen");
      }
      const { pollId } = pollDeleteSchema.parse(formdata);
      await deletePoll(pollId);
      return { ok: true };
   }
   if (intent === "newPoll") {
      const event = await getEvent(eventId);
      if (event.createdBy !== loggedInUser.id) {
         throw badRequest("Du har ikke tilgang til å endre denne ressursen");
      }
      const newPollForm = newPollSchema.safeParse(formdata);
      if (!newPollForm.success) {
         return { ...newPollForm.error.formErrors, ok: false };
      }
      const { dateOption, textOption, ...poll } = newPollForm.data;
      if (poll.type === "date") {
         await insertNewDatePoll(eventId, poll, dateOption);
         return { ok: true };
      }
      await insertNewTextPoll(eventId, poll, textOption);
      return { ok: true };
   }
   throw badRequest("Intent not found " + intent);
};

/**
 * Lag PollText ferdig
 * Legg til mulig for bilder
 * Rediger poll
 * Rediger event
 * Slett event
 * Legg til event arrangører
 * Legg til om man kan komme
 * Legg til notificasjon i appen?
 * Legg til kommentarer
 * Legg til at brukere kan legge til alternativer
 * Anonym avstemning bør skjule hvilke brukere som har stemt.
 * mobilvisning
 * Opplasting av bilder bør kunne velg cloud eller lagre i db.
 * Vise liste over arrangementer på forsiden
 * Bør vise notifikasjon hvis en bruker ikke har sett på et arrangement
 * Lag e2e tester
 */

export default function EventPage() {
   const { event, polls, loggedInUser, users } = useLoaderData<typeof loader>();

   const isOrganizer = event.createdBy === loggedInUser.id;
   return (
      <PageLayout>
         <Typography variant="h1">{event.title}</Typography>
         <Typography variant="mutedText">
            Opprettet av {event.createdByUser?.primaryUser.name ?? "Ukjent bruker"}
         </Typography>
         <div className="bg-primary/5 rounded my-2 p-2">
            <Typography>{event.description}</Typography>
            {event.startDate ? <Typography>Start tidspunkt: {event.startDate}</Typography> : null}
         </div>
         <div>
            <div className="flex justify-between items-center mb-4">
               <Typography variant="h2">Avstemninger</Typography>
               {isOrganizer ? <PollNew /> : null}
            </div>
            <div className="space-y-4">
               {polls.map(({ poll }) => {
                  if (poll.type === "date") {
                     return (
                        <PollDate
                           key={poll.id}
                           poll={poll}
                           loggedInUser={loggedInUser}
                           users={users}
                           isOrganizer={isOrganizer}
                        />
                     );
                  }
                  return (
                     <PollText
                        key={poll.id}
                        poll={poll}
                        loggedInUser={loggedInUser}
                        users={users}
                        isOrganizer={isOrganizer}
                     />
                  );
               })}
            </div>
         </div>
      </PageLayout>
   );
}
