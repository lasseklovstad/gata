import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useId } from "react";

import type { Poll } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

import { PollActiveStatus } from "./PollActiveStatus";
import { PollDelete } from "./PollDelete";

type Props = {
   poll: SerializeFrom<Poll["poll"]>;
   isOrganizer: boolean;
   loggedInUser: User;
   users: User[];
};

export const PollText = ({ poll, loggedInUser, users, isOrganizer }: Props) => {
   const fetcher = useFetcher();
   const tableId = useId();
   const hasVoted = poll.pollVotes.find((vote) => vote.userId === loggedInUser.id);
   const usersThatHasVoted = users.filter(
      (u) => !!poll.pollVotes.find((vote) => vote.userId === u.id) && u.id !== loggedInUser.id
   );

   return (
      <div>
         <div className="flex justify-between">
            <Typography variant="h3" className="mb-2" id={`${tableId}-title`}>
               {poll.name}
            </Typography>
            <PollDelete isActive={poll.isActive} isOrganizer={isOrganizer} pollId={poll.id} />
         </div>
         <PollActiveStatus isActive={poll.isActive} isOrganizer={isOrganizer} pollId={poll.id} />
         <fetcher.Form method={hasVoted ? "PUT" : "POST"}>
            <input hidden value={poll.id} name="pollId" readOnly />
            <input hidden value={loggedInUser.id} name="userId" readOnly />
            <div className="flex justify-end">
               <Button
                  type="submit"
                  name="intent"
                  value="pollDateVote"
                  disabled={!poll.isActive}
                  isLoading={fetcher.state !== "idle" && fetcher.formData?.get("intent") === "pollDateVote"}
               >
                  Lagre
               </Button>
            </div>
         </fetcher.Form>
      </div>
   );
};
