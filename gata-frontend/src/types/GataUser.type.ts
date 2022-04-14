import { IGataRole } from "./GataRole.type";
import { Responsibility } from "./Responsibility.type";

export interface IGataUser {
   email: string;
   externalUserProviderId: string;
   id: string;
   name: string;
   picture: string;
   responsibilities: Responsibility[];
   isUserAdmin: boolean;
   isUserMember: boolean;
   roles: IGataRole[];
}
