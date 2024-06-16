import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { useId } from "react";

import type { Poll as PollType } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";

import { PollActiveStatus } from "./PollActiveStatus";
import { PollFormList } from "./PollFormList";
import { PollFormTable } from "./PollFormTable";
import { PollMenu } from "./PollMenu";

type Props = {
   poll: SerializeFrom<PollType["poll"]>;
   isOrganizer: boolean;
   loggedInUser: User;
   users: User[];
};

export const Poll = ({ poll, loggedInUser, users, isOrganizer }: Props) => {
   const fetcher = useFetcher();
   const tableId = useId();
   const hasVoted = poll.pollVotes.find((vote) => vote.userId === loggedInUser.id);
   const type = poll.canSelectMultiple ? "checkbox" : "radio";

   return (
      <div>
         <div className="flex justify-between">
            <Typography variant="h3" className="mb-2" id={`${tableId}-title`}>
               {poll.name}
            </Typography>
            {isOrganizer ? <PollMenu poll={poll} /> : null}
         </div>
         {poll.isAnonymous ? <Typography variant="mutedText">Denne avstemningen er anonym</Typography> : null}

         <fetcher.Form method={hasVoted ? "PUT" : "POST"}>
            <input hidden value={poll.id} name="pollId" readOnly />
            <input hidden value={loggedInUser.id} name="userId" readOnly />
            <input hidden value="pollVote" name="intent" readOnly />
            <div className="hidden md:block">
               <PollFormTable
                  isAnonymous={poll.isAnonymous}
                  disabled={!poll.isActive}
                  loggedInUser={loggedInUser}
                  options={poll.pollOptions.map((option) => ({
                     ...option,
                     numberOfVotes: poll.pollVotes.filter((vote) => vote.pollOptionId === option.id).length,
                  }))}
                  pollVotes={poll.pollVotes}
                  users={users}
                  type={type}
                  numberOfVotes={poll.numberOfVotes}
                  onChange={(e) => fetcher.submit(e.target.form, { method: hasVoted ? "PUT" : "POST" })}
                  renderOptionHeader={(option) => {
                     if (poll.type === "text") {
                        return option.textOption;
                     }
                     return (
                        <>
                           <Typography variant="largeText">
                              {formatDate(option.textOption, "iiii", { locale: nb })}
                           </Typography>
                           <Typography>{formatDate(option.textOption, "dd.MMMM yyyy", { locale: nb })}</Typography>
                        </>
                     );
                  }}
               />
            </div>
         </fetcher.Form>
         <fetcher.Form>
            <input hidden value={poll.id} name="pollId" readOnly />
            <input hidden value={loggedInUser.id} name="userId" readOnly />
            <input hidden value="pollVote" name="intent" readOnly />
            <div className="block md:hidden">
               <PollFormList
                  isAnonymous={poll.isAnonymous}
                  disabled={!poll.isActive}
                  loggedInUser={loggedInUser}
                  options={poll.pollOptions.map((option) => ({
                     ...option,
                     numberOfVotes: poll.pollVotes.filter((vote) => vote.pollOptionId === option.id).length,
                  }))}
                  pollVotes={poll.pollVotes}
                  users={users}
                  type={type}
                  numberOfVotes={poll.numberOfVotes}
                  onChange={(e) => fetcher.submit(e.target.form, { method: hasVoted ? "PUT" : "POST" })}
                  renderOptionHeader={(option) => {
                     if (poll.type === "text") {
                        return option.textOption;
                     }
                     return formatDate(option.textOption, "dd.MMMM yyyy", { locale: nb });
                  }}
               />
            </div>
         </fetcher.Form>
         <PollActiveStatus isActive={poll.isActive} />
      </div>
   );
};
