import { client } from "./client/client";
import { useClient } from "./client/useClient";
import { getAccessToken } from "../auth0Client";
import { IGataUser } from "../types/GataUser.type";

export const useClearUserCache = () => {
   const [cacheResponse, clientFetch] = useClient<never, never>();
   const clearCache = () => {
      return clientFetch("auth0user/update");
   };

   return { cacheResponse, clearCache };
};

export const getLoggedInUser = async (signal: AbortSignal) => {
   const token = await getAccessToken();
   return client<IGataUser>("user/loggedin", { signal, token });
};

export const createLoggedInUser = async (signal: AbortSignal) => {
   const token = await getAccessToken();
   return client("user/loggedin/create", { signal, token, method: "POST" });
};
