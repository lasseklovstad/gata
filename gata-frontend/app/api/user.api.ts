import type { IGataUser } from "~/types/GataUser.type";
import type { IResponsibilityYear } from "~/types/ResponsibilityYear.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getUser = ({ memberId, ...options }: RequestOptions & { memberId: string | undefined }) => {
   return client<IGataUser>(`user/${memberId}`, options);
};

export const getLoggedInUser = (options: RequestOptions) => {
   return client<IGataUser>("user/loggedin", options);
};

export const getUsers = (options: RequestOptions) => {
   return client<IGataUser[]>("user", options);
};

export const getResponsibilityYears = ({ memberId, ...options }: RequestOptions & { memberId: string | undefined }) => {
   return client<IResponsibilityYear[]>(`user/${memberId}/responsibilityyear`, options);
};
