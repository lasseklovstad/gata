import type { User } from "~/.server/db/user";

export const getPrimaryUser = ({ externalUsers }: User) => {
   const primaryUser = externalUsers.find((u) => u.primaryUser);
   if (!primaryUser) {
      throw new Error("No primary user found!");
   }
   return primaryUser;
};
