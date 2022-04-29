import { useClient } from "./client/useClient";
import { useCallback, useEffect } from "react";
import { IGataUser } from "../types/GataUser.type";
import {
   IResponsibilityNotePayload,
   IResponsibilityYear,
   IResponsibilityYearPayload,
} from "../types/ResponsibilityYear.type";

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

export const useGetLoggedInUser = () => {
   const [userResponse, fetchUsers] = useClient<IGataUser, never>();
   useEffect(() => {
      fetchUsers("user/loggedin");
   }, [fetchUsers]);

   return { userResponse };
};

export const useGetUser = (userId: string) => {
   const [userResponse, fetchUsers] = useClient<IGataUser, never>();
   useEffect(() => {
      fetchUsers(`user/${userId}`);
   }, [fetchUsers, userId]);

   return { userResponse };
};

export const useClearUserCache = () => {
   const [cacheResponse, clientFetch] = useClient<never, never>();
   const clearCache = () => {
      return clientFetch("auth0user/update");
   };

   return { cacheResponse, clearCache };
};

export const useGetUserResponsitbilityYears = (userId: string) => {
   const [responsibilityYearResponse, fetchUsers] = useClient<IResponsibilityYear[], never>();
   useEffect(() => {
      fetchUsers(`user/${userId}/responsibilityyear`);
   }, [fetchUsers, userId]);

   return { responsibilityYearResponse };
};

export const useSaveResponsibilityForUser = (userId: string) => {
   const [response, clientFetch] = useClient<IResponsibilityYear[], IResponsibilityYearPayload>();
   const postResponsibility = (responsibilityId: string, year: number) => {
      return clientFetch(`user/${userId}/responsibilityyear`, { method: "POST", body: { responsibilityId, year } });
   };

   return { response, postResponsibility };
};

export const useDeleteResponsibilityForUser = (userId: string) => {
   const [deleteResponse, clientFetch] = useClient<IResponsibilityYear[], never>();
   const deleteResponsibility = (responsibilityYearId: string) => {
      return clientFetch(`user/${userId}/responsibilityyear/${responsibilityYearId}`, { method: "DELETE" });
   };

   return { deleteResponse, deleteResponsibility };
};

export const usePutResponsibilityNote = (userId: string, responsibilityYearId: string) => {
   const [putResponse, clientFetch] = useClient<IResponsibilityYear, IResponsibilityNotePayload>();
   const putNote = (text: string) => {
      return clientFetch(`user/${userId}/responsibilityyear/${responsibilityYearId}/note`, {
         method: "PUT",
         body: { text },
      });
   };

   return { putResponse, putNote };
};
