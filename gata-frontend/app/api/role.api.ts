import type { IGataRole } from "~/types/GataRole.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getRoles = (options: RequestOptions) => {
   return client<IGataRole[]>("role", options);
};
