import { IAuth0Role } from "./Auth0Role.type";

export interface IAuth0User {
   email: string;
   name: string;
   user_id: string;
   picture: string;
   roles: IAuth0Role[];
}
