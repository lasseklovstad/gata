import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import {
   deletePoll,
   getEvent,
   getEventPolls,
   getIsPollActive,
   insertDatePollVote,
   insertNewTextPoll,
   updateDatePollVote,
   updatePoll,
} from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";

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

const pollVoteSchema = zfd.formData({
   pollId: zfd.numeric(),
   userId: zfd.text(),
   options: zfd.repeatable(z.array(z.coerce.number())),
});

const pollUpdateSchema = zfd.formData({
   pollId: zfd.numeric(),
   name: zfd.text(z.string()),
   canAddSuggestions: zfd.checkbox(),
   isFinished: zfd.checkbox(),
});

const pollDeleteSchema = zfd.formData({
   pollId: zfd.numeric(),
});

const newPollSchema = zfd.formData({
   name: zfd.text(z.string()),
   // format: yyyy-MM-dd
   dateOption: zfd.repeatable(z.array(z.string().date())),
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

   if (intent === "pollVote") {
      const pollVoteForm = pollVoteSchema.parse(formdata);
      const isPollActive = await getIsPollActive(pollVoteForm.pollId);
      if (!isPollActive) {
         throw badRequest("Avstemning er ikke aktiv lenger");
      }
      request.method === "POST" ? await insertDatePollVote(pollVoteForm) : await updateDatePollVote(pollVoteForm);
      return { ok: true };
   }

   const event = await getEvent(eventId);
   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "updatePoll") {
      const updatePollForm = pollUpdateSchema.safeParse(formdata);
      if (!updatePollForm.success) {
         return { ...updatePollForm.error.formErrors, ok: false };
      }
      const { pollId, isFinished, ...pollValues } = updatePollForm.data;
      await updatePoll(pollId, { ...pollValues, isActive: !isFinished });
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
         return { ...newPollForm.error.formErrors, ok: false };
      }
      const { dateOption, textOption, ...poll } = newPollForm.data;
      await insertNewTextPoll(eventId, poll, poll.type === "text" ? textOption : dateOption);
      return { ok: true };
   }
   throw badRequest("Intent not found " + intent);
};

/**
 * DONE -- Lag PollText ferdig
 * Legg til mulig for bilder
 * DONE --Rediger poll
 * Rediger event
 * Slett event
 * Legg til event arrangører
 * Legg til om man kan komme
 * Legg til notificasjon i appen?
 * Legg til kommentarer
 * Legg til at brukere kan legge til alternativer
 * DONE --Anonym avstemning bør skjule hvilke brukere som har stemt.
 * DONE --mobilvisning
 * Opplasting av bilder bør kunne velg cloud eller lagre i db.
 * Vise liste over arrangementer på forsiden
 * Bør vise notifikasjon hvis en bruker ikke har sett på et arrangement
 * Lag e2e tester
 * Det kan være tabs med avstemninger/bilder/meldinger
 * en oversikt finnes på forside som linker til avstemningene.
 * DU får notifikasjon på de hvis du ikke ha sett en avstemning. Notifikasjonen forsvinner når du har stemt. Når avstemningen er ferdig forsvinner den.
 * Når du sier du deltar får du notifaksjon når noe skjer. Legger til bilder, ny avstemning, ny melding osv...
 * Hvis du har huket av på deltat men ikke har vært inne på en uke får du ny  notifikasjon og itilleg en mail om at det har skjedd noe.
 * Når du går inn resettes denne.
 * Alle notifikasjonene kan lagres på brukern og vises. slik som facebook.
 * Det blei mye greier men notifkasjonsgreine kan man avvente da.
 * Innlogging kan vare en måned.
 */

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
