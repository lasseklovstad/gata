import type { User } from "~/.server/db/user";

export enum RoleName {
   Member,
   Admin,
}

export const isMember = (user?: User) => {
   return !!user?.roles.some(({ role }) => role.roleName === RoleName.Member);
};

export const isAdmin = (user?: User) => {
   return !!user?.roles.some(({ role }) => role.roleName === RoleName.Admin);
};

export const requireAdminRole = (user: User) => {
   if (!isAdmin(user)) {
      throw new Error("Du har ikke tilgang til denne ressursen");
   }
};

export const requireMemberRole = (user: User) => {
   if (!isMember(user)) {
      throw new Error("Du har ikke tilgang til denne ressursen");
   }
};
