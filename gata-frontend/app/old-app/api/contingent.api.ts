import { useClient } from "./client/useClient";

export const usePublishKontigentReport = () => {
   const [publishContigentResponse, clientFetch] = useClient<string[], never>();

   const publishContigent = () => {
      return clientFetch("contingent/email");
   };

   return { publishContigentResponse, publishContigent };
};
