import { useAuth0 } from "@auth0/auth0-react";
import { GataRoleType } from "../types/GataRole.type";

const namespace = "http://gataersamla.no";

export const useRoles = () => {
   const { user } = useAuth0();
   const roles: GataRoleType[] = user ? user[`${namespace}/roles`] : [];
   const isAdmin = roles.includes("Administrator");
   const isMember = roles.includes("Medlem");

   return { isAdmin, isMember, roles };
};
