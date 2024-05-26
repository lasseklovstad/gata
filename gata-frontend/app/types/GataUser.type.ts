import type { ExternalUser } from "db/schema";
import type { User } from "~/.server/db/user";

export type IGataUser = User;

export interface ISimpleGataUser {
   id: string;
   name: string;
   externalUserProviderId: string;
}

export type IExternalUser = ExternalUser;
