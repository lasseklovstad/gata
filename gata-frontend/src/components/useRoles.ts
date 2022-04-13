import { useAuth0 } from "@auth0/auth0-react";

const namespace = "http://gataersamla.no";

export const useRoles = () => {
   const { user } = useAuth0();
   const isAdmin = user && user[`${namespace}/roles`].includes("Administrator");
   const isMember = user && user[`${namespace}/roles`].includes("Medlem");

   return { isAdmin, isMember };
};
