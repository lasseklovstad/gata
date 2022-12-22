import { useClient } from "./client/useClient";

export const useClearUserCache = () => {
   const [cacheResponse, clientFetch] = useClient<never, never>();
   const clearCache = () => {
      return clientFetch("auth0user/update");
   };

   return { cacheResponse, clearCache };
};
