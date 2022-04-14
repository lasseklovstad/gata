import { useEffect } from "react";
import { Responsibility } from "../types/Responsibility.type";
import { useClient } from "./client/useClient";

export const useGetResponisibilies = () => {
   const [responsibilitiesResponse, clientFetch] = useClient<Responsibility[], never>();
   useEffect(() => {
      clientFetch("responsibility");
   }, [clientFetch]);

   const getResponsibilities = () => {
      return clientFetch("responsibility");
   };

   return { responsibilitiesResponse, getResponsibilities };
};

export const useSaveResponsibility = () => {
   const [response, clientFetch] = useClient<Responsibility, Omit<Responsibility, "id" | "user">>();
   const postResponsibility = (body: Omit<Responsibility, "id" | "user">) => {
      return clientFetch("responsibility", { method: "POST", body });
   };

   const putResponsibility = (body: Omit<Responsibility, "user">) => {
      return clientFetch("responsibility", { method: "PUT", body });
   };

   return { response, postResponsibility, putResponsibility };
};

export const useDeleteResponsibility = () => {
   const [deleteResponse, clientFetch] = useClient<Responsibility, Omit<Responsibility, "user">>();
   const deleteResponsibility = (body: Responsibility) => {
      return clientFetch("responsibility", { method: "DELETE", body });
   };

   return { deleteResponse, deleteResponsibility };
};

export const useSaveResponsibilityForUser = (userId: string) => {
   const [response, clientFetch] = useClient<Responsibility[], never>();
   const postResponsibility = (responsibilityId: string) => {
      return clientFetch(`responsibility/${responsibilityId}/user/${userId}`, { method: "POST" });
   };

   return { response, postResponsibility };
};

export const useDeleteResponsibilityForUser = (userId: string) => {
   const [deleteResponse, clientFetch] = useClient<Responsibility[], never>();
   const deleteResponsibility = (responsibilityId: string) => {
      return clientFetch(`responsibility/${responsibilityId}/user/${userId}`, { method: "DELETE" });
   };

   return { deleteResponse, deleteResponsibility };
};
