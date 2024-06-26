import type { ReactNode } from "react";

import type { User } from "~/.server/db/user";
import { AvatarUserList } from "~/components/AvatarUserList";
import { Label } from "~/components/ui/label";

type Props<OptionType> = {
   renderOptionHeader: (option: OptionType) => ReactNode;
   options: OptionType[];
   type: "checkbox" | "radio";
   disabled: boolean;
   users: User[];
   loggedInUser: User;
   pollVotes: { pollOptionId: number; userId: string }[];
   isAnonymous: boolean;
   numberOfVotes: number;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   id: string;
   describedBy?: string;
};

export const PollFormList = <OptionType extends { id: number; numberOfVotes: number }>({
   options,
   renderOptionHeader,
   type,
   disabled,
   pollVotes,
   loggedInUser,
   users,
   isAnonymous,
   numberOfVotes,
   onChange,
   id,
   describedBy,
}: Props<OptionType>) => {
   const usersThatHasVoted = users.filter((u) => !!pollVotes.find((vote) => vote.userId === u.id));
   return (
      <ul className="space-y-2" aria-labelledby={id} aria-describedby={describedBy}>
         {options.map((option) => {
            const checked = !!pollVotes.find(
               (vote) => vote.pollOptionId === option.id && loggedInUser.id === vote.userId
            );
            const usersSelectedThisOption = usersThatHasVoted.filter((user) =>
               pollVotes.find((vote) => vote.pollOptionId === option.id && user.id === vote.userId)
            );
            const percentOfVotes = (option.numberOfVotes / numberOfVotes) * 100;
            return (
               <li key={option.id} className="py-4 px-2">
                  <Label className="cursor-pointer flex gap-3">
                     <input
                        name="options"
                        defaultChecked={checked}
                        value={option.id}
                        className="cursor-pointer size-6"
                        type={type}
                        disabled={disabled}
                        onChange={onChange}
                     />
                     <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                           {renderOptionHeader(option)}
                           <div className="flex items-center gap-1">
                              {!isAnonymous ? (
                                 <AvatarUserList aria-label="Brukere som har stemt" users={usersSelectedThisOption} />
                              ) : null}
                              <span className="text-xs">{option.numberOfVotes}</span>
                           </div>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                           <div
                              style={{ width: isNaN(percentOfVotes) ? 0 : `${percentOfVotes}%` }}
                              className="bg-primary h-2 transition-all duration-1000"
                           />
                        </div>
                     </div>
                  </Label>
               </li>
            );
         })}
      </ul>
   );
};
