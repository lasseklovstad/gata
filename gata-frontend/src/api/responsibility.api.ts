import { useEffect } from "react";
import { Responsibility } from "../types/Responsibility.type";
import { useClient } from "./client/useClient";

export const useGetResponisibilies = () => {
   const [responsibilitiesResponse, clientFetch] = useClient<Responsibility[], never>();
   useEffect(() => {
      clientFetch("responsibility");
   }, [clientFetch]);

   return { responsibilitiesResponse };
};

export const useSaveResponsibility = () => {
   const [response, clientFetch] = useClient<Responsibility, Omit<Responsibility, "id">>();
   const postResponsibility = (body: Omit<Responsibility, "id">) => {
      return clientFetch("responsibility", { method: "POST", body });
   };

   const putResponsibility = (body: Responsibility) => {
      return clientFetch("responsibility", { method: "PUT", body });
   };

   return { response, postResponsibility, putResponsibility };
};

export const useDeleteResponsibility = () => {
   const [deleteResponse, clientFetch] = useClient<Responsibility, Responsibility>();
   const deleteResponsibility = (body: Responsibility) => {
      return clientFetch("responsibility", { method: "DELETE", body });
   };

   return { deleteResponse, deleteResponsibility };
};
