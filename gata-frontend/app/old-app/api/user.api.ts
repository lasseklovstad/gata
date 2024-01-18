import { client } from "./client/client";
import { getAccessToken } from "../auth0Client";
import { IGataUser } from "../types/GataUser.type";

export const getLoggedInUser = async (signal: AbortSignal) => {
   const token = await getAccessToken();
   return client<IGataUser>("user/loggedin", { signal, token });
};

export const createLoggedInUser = async (signal: AbortSignal) => {
   const token = await getAccessToken();
   return client("user/loggedin/create", { signal, token, method: "POST" });
};
