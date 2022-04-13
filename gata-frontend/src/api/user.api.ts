import { useClient } from "./client/useClient";
import { useCallback, useEffect } from "react";
import { IAuth0User } from "../types/Auth0User.type";

export const useGetUsers = () => {
   const [usersResponse, clientFetch] = useClient<IAuth0User[], never>();

   const getUsers = useCallback(() => {
      return clientFetch("user");
   }, [clientFetch]);

   useEffect(() => {
      getUsers();
   }, [getUsers]);

   return { usersResponse, getUsers };
};

export const useGetUser = (userId: string) => {
   const [userResponse, fetchUsers] = useClient<IAuth0User, never>();
   useEffect(() => {
      fetchUsers(`user/${encodeURIComponent(userId)}`);
   }, [fetchUsers, userId]);

   return { userResponse };
};

export const useClearUserCache = () => {
   const [cacheResponse, clientFetch] = useClient<never, never>();
   const clearCache = () => {
      return clientFetch("user/clearcache");
   };

   return { cacheResponse, clearCache };
};
