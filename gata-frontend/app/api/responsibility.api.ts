import type { IResponsibility } from "~/types/Responsibility.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getResponsibilities = (options: RequestOptions) => {
   return client<IResponsibility[]>("responsibility", options);
};
