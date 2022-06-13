import { useClient } from "./client/useClient";
import { useEffect } from "react";
import { IContingentInfo } from "../types/ContingentInfo.type";

export const usePublishKontigentReport = () => {
   const [publishContigentResponse, clientFetch] = useClient<string[], never>();

   const publishContigent = () => {
      return clientFetch("contingent/email");
   };

   return { publishContigentResponse, publishContigent };
};

export const useGetContingentInfo = () => {
   const [contingentInfoResponse, fetchClient] = useClient<IContingentInfo, never>();
   useEffect(() => {
      fetchClient("contingent");
   }, [fetchClient]);

   return { contingentInfoResponse };
};
