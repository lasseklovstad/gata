import type { IResponsibilityYear } from "~/types/ResponsibilityYear.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getResponsibilityYears = ({ memberId, ...options }: RequestOptions & { memberId: string | undefined }) => {
   return client<IResponsibilityYear[]>(`user/${memberId}/responsibilityyear`, options);
};
