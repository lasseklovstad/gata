import type { User } from "~/.server/db/user";

enum RoleName {
   Member,
   Admin,
}

export const isMember = (user?: User) => {
   return !!user?.roles.some(({ role }) => role.roleName === RoleName.Member);
};

export const isAdmin = (user?: User) => {
   return !!user?.roles.some(({ role }) => role.roleName === RoleName.Admin);
};
