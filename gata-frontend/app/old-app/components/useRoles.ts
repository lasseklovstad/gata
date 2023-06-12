import type { IGataUser } from "../types/GataUser.type";

export const isMember = (user?: IGataUser) => {
   return !!user?.isUserMember;
};

export const isAdmin = (user?: IGataUser) => {
   return !!user?.isUserAdmin;
};
