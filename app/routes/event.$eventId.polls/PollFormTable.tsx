import type { ReactNode } from "react";

import type { User } from "~/.server/db/user";
import { AvatarUser } from "~/components/AvatarUser";

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

export const PollFormTable = <OptionType extends { id: number; numberOfVotes: number }>({
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
   const usersThatHasVoted = users.filter(
      (u) => !!pollVotes.find((vote) => vote.userId === u.id) && u.id !== loggedInUser.id
   );
   return (
      <div className="overflow-x-auto mb-4 w-full">
         <table className="w-full" aria-labelledby={id} aria-describedby={describedBy}>
            <thead>
               <tr>
                  <th scope="col" className="p-2 text-center bg-primary/10 w-32">
                     Brukere
                  </th>
                  {options.map((option) => {
                     return (
                        <th
                           scope="col"
                           className="text-center bg-primary/10 p-2"
                           key={option.id}
                           id={`${id}-option-${option.id}`}
                        >
                           {renderOptionHeader(option)}
                        </th>
                     );
                  })}
               </tr>
               <tr>
                  <th scope="row" className="p-2 border-b text-center bg-primary/10">
                     <span className="sr-only">Resultat</span>
                  </th>
                  {options.map((option) => {
                     return (
                        <th scope="col" className="text-center bg-primary/10 border-b p-2" key={option.id}>
                           {option.numberOfVotes}/{numberOfVotes}
                        </th>
                     );
                  })}
               </tr>
            </thead>
            <tbody>
               {!isAnonymous
                  ? usersThatHasVoted.map((user) => {
                       return (
                          <tr key={user.id} className="bg-white">
                             <th scope="row" align="center" className="border-b p-2" id={`${id}-user-${user.id}`}>
                                <AvatarUser user={user} className="size-10" />
                             </th>
                             {options.map((option) => {
                                const checked = !!pollVotes.find(
                                   (vote) => vote.pollOptionId === option.id && user.id === vote.userId
                                );
                                return (
                                   <td key={option.id} className="border-b p-2" align="center">
                                      <input
                                         defaultChecked={checked}
                                         disabled
                                         className="cursor-pointer size-6"
                                         type={type}
                                         aria-labelledby={`${id}-option-${option.id}`}
                                      />
                                   </td>
                                );
                             })}
                          </tr>
                       );
                    })
                  : null}
               <tr className="bg-white">
                  <th scope="row" align="center" className="border-b p-2" id={`${id}-user-${loggedInUser.id}`}>
                     <AvatarUser user={loggedInUser} className="size-10" />
                  </th>
                  {options.map((option) => {
                     const checked = !!pollVotes.find(
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
                              disabled={disabled}
                              onChange={onChange}
                              aria-labelledby={`${id}-option-${option.id}`}
                           />
                        </td>
                     );
                  })}
               </tr>
            </tbody>
         </table>
      </div>
   );
};
