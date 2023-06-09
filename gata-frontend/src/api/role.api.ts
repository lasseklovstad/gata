import { useClient } from "./client/useClient";
import { useEffect } from "react";
import { IAuth0User } from "../types/Auth0User.type";
import { IGataRole } from "../types/GataRole.type";
import { IGataUser } from "../types/GataUser.type";

export const useGetRoles = () => {
   const [rolesResponse, clientFetch] = useClient<IGataRole[], never>();
   useEffect(() => {
      clientFetch("role");
   }, [clientFetch]);

   return { rolesResponse };
};

export const useGetUsersFromRole = (roleId: string) => {
   const [usersResponse, clientFetch] = useClient<IAuth0User[], never>();
   useEffect(() => {
      clientFetch(`role/${roleId}/users`);
   }, [clientFetch, roleId]);

   return { usersResponse };
};

type IPostRoleBody = {
   roles: string[];
   userId: string;
};

export const useUpdateUserRoles = (userId: string) => {
   const [postRoleResponse, clientFetch] = useClient<IGataUser, IPostRoleBody>();
   const postRole = (roleId: string) => {
      return clientFetch(`role/${roleId}/user/${userId}`, { method: "POST" });
   };

   const deleteRole = (roleId: string) => {
      return clientFetch(`role/${roleId}/user/${userId}`, { method: "DELETE" });
   };

   return { postRoleResponse, postRole, deleteRole };
};
