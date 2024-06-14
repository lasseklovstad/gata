import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { useId } from "react";

import type { Poll } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";
import { AvatarUser } from "~/components/AvatarUser";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Typography } from "~/components/ui/typography";
import { PollActiveStatus } from "./PollActiveStatus";
import { PollDelete } from "./PollDelete";

type Props = {
   poll: SerializeFrom<Poll["poll"]>;
   isOrganizer: boolean;
   loggedInUser: User;
   users: User[];
};

export const PollDate = ({ poll, loggedInUser, users, isOrganizer }: Props) => {
   const fetcher = useFetcher();
   const tableId = useId();
   const formId = useId();
   const hasVoted = poll.pollVotes.find((vote) => vote.userId === loggedInUser.id);
   const usersThatHasVoted = users.filter(
      (u) => !!poll.pollVotes.find((vote) => vote.userId === u.id) && u.id !== loggedInUser.id
   );

   const type = poll.canSelectMultiple ? "checkbox" : "radio";

   return (
      <div>
         <Typography variant="h3" className="mb-2" id={`${tableId}-title`}>
            {poll.name}
         </Typography>
         <PollActiveStatus isActive={poll.isActive} isOrganizer={isOrganizer} pollId={poll.id} />
         <fetcher.Form id={formId} method={hasVoted ? "PUT" : "POST"}>
            <input hidden value={poll.id} name="pollId" readOnly />
            <input hidden value={loggedInUser.id} name="userId" readOnly />
            <div className="overflow-x-auto mb-4 w-full">
               <table className="w-full" aria-labelledby={`${tableId}-title`}>
                  <thead>
                     <tr>
                        <th className="p-2 text-center bg-primary/10 w-32">Brukere</th>
                        {poll.pollOptions.map((option) => {
                           if (!option.dateOption) {
                              throw new Error("Poll date expcected date option");
                           }
                           return (
                              <th
                                 className="text-center bg-primary/10 p-2"
                                 key={option.id}
                                 id={`${tableId}-option-${option.id}`}
                              >
                                 <Typography variant="largeText">
                                    {formatDate(option.dateOption, "iiii", { locale: nb })}
                                 </Typography>
                                 <Typography>
                                    {formatDate(option.dateOption, "dd.MMMM yyyy", { locale: nb })}
                                 </Typography>
                              </th>
                           );
                        })}
                     </tr>
                     <tr>
                        <th className="p-2 border-b text-center bg-primary/10">
                           <span className="sr-only">Resultat</span>
                        </th>
                        {poll.pollOptions.map((option) => {
                           const result = poll.pollVotes.filter((vote) => vote.pollOptionId === option.id).length;
                           return (
                              <th className="text-center bg-primary/10 border-b p-2" key={option.id}>
                                 {result}
                              </th>
                           );
                        })}
                     </tr>
                  </thead>
                  <tbody>
                     {usersThatHasVoted.map((user) => {
                        return (
                           <tr key={user.id}>
                              <th align="center" className="border-b p-2" id={`${tableId}-user-${user.id}`}>
                                 <AvatarUser user={user} className="size-10" />
                              </th>
                              {poll.pollOptions.map((option) => {
                                 if (!option.dateOption) {
                                    throw new Error("Poll date expcected date option");
                                 }
                                 const checked = !!poll.pollVotes.find(
                                    (vote) => vote.pollOptionId === option.id && user.id === vote.userId
                                 );
                                 return (
                                    <td key={option.id} className="border-b p-2" align="center">
                                       <input
                                          defaultChecked={checked}
                                          disabled
                                          className="cursor-pointer size-6"
                                          type={type}
                                          aria-labelledby={`${tableId}-user-${user.id} ${tableId}-option-${option.id}`}
                                       />
                                    </td>
                                 );
                              })}
                           </tr>
                        );
                     })}
                     <tr>
                        <th align="center" className="border-b p-2" id={`${tableId}-user-${loggedInUser.id}`}>
                           <AvatarUser user={loggedInUser} className="size-10" />
                        </th>
                        {poll.pollOptions.map((option) => {
                           if (!option.dateOption) {
                              throw new Error("Poll date expcected date option");
                           }
                           const checked = !!poll.pollVotes.find(
                              (vote) => vote.pollOptionId === option.id && loggedInUser.id === vote.userId
                           );
                           return (
                              <td key={option.id} className="border-b p-2" align="center">
                                 <input
                                    name="options"
                                    defaultChecked={checked}
                                    value={option.id}
                                    className="cursor-pointer size-6"
                                    type={type}
                                    disabled={!poll.isActive}
                                    aria-labelledby={`${tableId}-user-${loggedInUser.id} ${tableId}-option-${option.id}`}
                                 />
                              </td>
                           );
                        })}
                     </tr>
                  </tbody>
               </table>
            </div>
         </fetcher.Form>
         <div className="flex justify-end gap-2">
            <PollDelete isActive={poll.isActive} isOrganizer={isOrganizer} pollId={poll.id} />
            <Button
               type="submit"
               name="intent"
               value="pollDateVote"
               form={formId}
               disabled={!poll.isActive}
               isLoading={fetcher.state !== "idle" && fetcher.formData?.get("intent") === "pollDateVote"}
            >
               Lagre
            </Button>
         </div>
      </div>
   );
};
