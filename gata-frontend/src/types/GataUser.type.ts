import { IGataRole } from "./GataRole.type";
import { IResponsibility } from "./Responsibility.type";

export interface IGataUser {
   email: string;
   externalUserProviderId: string;
   id: string;
   name: string;
   picture: string;
   isUserAdmin: boolean;
   isUserMember: boolean;
   roles: IGataRole[];
}
