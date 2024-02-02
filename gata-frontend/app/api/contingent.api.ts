import type { IContingentInfo } from "~/types/ContingentInfo.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getContingentInfo = (options: RequestOptions) => {
   return client<IContingentInfo>("contingent", options);
};
