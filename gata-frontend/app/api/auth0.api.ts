import type { IExternalUser } from "~/types/GataUser.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getNotMemberUsers = (options: RequestOptions) => {
   return client<IExternalUser[]>("auth0user/nogatauser", options);
};
