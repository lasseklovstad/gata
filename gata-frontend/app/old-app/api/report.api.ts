import { useClient } from "./client/useClient";

export const usePublishReport = (id: string) => {
   const [publishResponse, clientFetch] = useClient<string[], never>();

   const publishReport = () => {
      return clientFetch(`report/${id}/publish`);
   };

   return { publishResponse, publishReport };
};
