import { useClient } from "./client/useClient";
import { useCallback, useEffect } from "react";
import { IAuth0User } from "../types/Auth0User.type";
import { Responsibility } from "../types/Responsibility.type";
import { IGataUser } from "../types/GataUser.type";

export const useGetUsers = () => {
   const [usersResponse, clientFetch] = useClient<IGataUser[], never>();

   const getUsers = useCallback(() => {
      return clientFetch("user");
   }, [clientFetch]);

   useEffect(() => {
      getUsers();
   }, [getUsers]);

   return { usersResponse, getUsers };
};

export const useGetUser = (userId: string) => {
   const [userResponse, fetchUsers] = useClient<IGataUser, never>();
   useEffect(() => {
      fetchUsers(`user/${userId}`);
   }, [fetchUsers, userId]);

   return { userResponse };
};

export const useGetUserResponsitbility = (userId: string) => {
   const [responsibilityResponse, fetchUsers] = useClient<Responsibility[], never>();
   useEffect(() => {
      fetchUsers(`responsibility/user/${userId}`);
   }, [fetchUsers, userId]);

   return { responsibilityResponse };
};

export const useClearUserCache = () => {
   const [cacheResponse, clientFetch] = useClient<never, never>();
   const clearCache = () => {
      return clientFetch("auth0user/update");
   };

   return { cacheResponse, clearCache };
};
