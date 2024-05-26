import type { ExternalUser } from "db/schema";

export interface ISimpleGataUser {
   id: string;
   name: string;
   externalUserProviderId: string;
}

export type IExternalUser = ExternalUser;
