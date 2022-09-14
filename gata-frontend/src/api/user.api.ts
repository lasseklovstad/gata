import { useClient } from "./client/useClient";
import { useCallback, useEffect } from "react";
import { IExternalUser, IGataUser } from "../types/GataUser.type";
import {
   IResponsibilityNotePayload,
   IResponsibilityYear,
   IResponsibilityYearPayload,
} from "../types/ResponsibilityYear.type";
import { IGataContingent, IGataContingentPayload } from "../types/GataContingent.type";

export const useGetUsers = () => {
   const [usersResponse, clientFetch, updateUser] = useClient<IGataUser[], never>();

   const getUsers = useCallback(() => {
      return clientFetch("user");
   }, [clientFetch]);

   useEffect(() => {
      getUsers();
   }, [getUsers]);

   return { usersResponse, getUsers, updateUser };
};

export const useDeleteUser = (userId: string) => {
   const [deleteUserResponse, clientFetch] = useClient<never, never>();

   const deleteUser = () => {
      return clientFetch(`user/${userId}`, { method: "DELETE" });
   };

   return { deleteUserResponse, deleteUser };
};

export const useCreateUser = (externalUserId: string) => {
   const [userResponse, clientFetch] = useClient<IGataUser, { externalUserId: string }>();

   const createUser = () => {
      return clientFetch("user", { method: "POST", body: { externalUserId } });
   };

   return { userResponse, createUser };
};

export const useGetExternalUsersWithNoGataUser = () => {
   const [usersResponse, clientFetch, updateExternalUsers] = useClient<IExternalUser[], never>();

   const getUsers = useCallback(() => {
      return clientFetch("auth0user/nogatauser");
   }, [clientFetch]);

   useEffect(() => {
      getUsers();
   }, [getUsers]);

   return { usersResponse, getUsers, updateExternalUsers };
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

export const usePostContingent = (userId: string) => {
   const [postResponse, clientFetch] = useClient<IGataContingent[], IGataContingentPayload>();
   const postContingent = (year: string, isPaid: boolean) => {
      return clientFetch(`user/${userId}/contingent`, {
         method: "POST",
         body: { year, isPaid },
      });
   };

   return { postResponse, postContingent };
};

export const useUpdateSubscribe = () => {
   const [updateSubrscribeResponse, clientFetch] = useClient<IGataUser, never>();
   const updateSubrscribe = (userId: string) => {
      return clientFetch(`user/${userId}/subscribe`, {
         method: "PUT",
      });
   };

   return { updateSubrscribeResponse, updateSubrscribe };
};
