import { IGataRole } from "./GataRole.type";
import { IGataContingent } from "./GataContingent.type";

export interface IGataUser {
   email: string;
   externalUserProviderId: string;
   id: string;
   name: string;
   picture: string;
   isUserAdmin: boolean;
   isUserMember: boolean;
   roles: IGataRole[];
   contingents: IGataContingent[];
   subscribe: boolean;
   lastLogin: string;
}
