import { useEffect } from "react";
import { IResponsibility } from "../types/Responsibility.type";
import { useClient } from "./client/useClient";

export const useGetResponisibilies = () => {
   const [responsibilitiesResponse, clientFetch] = useClient<IResponsibility[], never>();
   useEffect(() => {
      clientFetch("responsibility");
   }, [clientFetch]);

   const getResponsibilities = () => {
      return clientFetch("responsibility");
   };

   return { responsibilitiesResponse, getResponsibilities };
};

export const useSaveResponsibility = () => {
   const [response, clientFetch] = useClient<IResponsibility, Omit<IResponsibility, "id" | "user">>();
   const postResponsibility = (body: Omit<IResponsibility, "id" | "user">) => {
      return clientFetch("responsibility", { method: "POST", body });
   };

   const putResponsibility = (body: Omit<IResponsibility, "user">) => {
      return clientFetch("responsibility", { method: "PUT", body });
   };

   return { response, postResponsibility, putResponsibility };
};

export const useDeleteResponsibility = () => {
   const [deleteResponse, clientFetch] = useClient<IResponsibility, Omit<IResponsibility, "user">>();
   const deleteResponsibility = (body: IResponsibility) => {
      return clientFetch("responsibility", { method: "DELETE", body });
   };

   return { deleteResponse, deleteResponsibility };
};
