import type { IGataContingent } from "./GataContingent.type";
import type { IGataRole } from "./GataRole.type";

export interface IGataUser {
   id: string;
   externalUserProviders: IExternalUser[];
   primaryUser: IExternalUser;
   isUserAdmin: boolean;
   isUserMember: boolean;
   roles: IGataRole[];
   contingents: IGataContingent[];
   subscribe: boolean;
}

export interface ISimpleGataUser {
   id: string;
   name: string;
   externalUserProviderId: string;
}

export interface IExternalUser {
   email: string;
   id: string;
   lastLogin: string;
   name: string;
   picture: string | null;
   primary: boolean;
}
