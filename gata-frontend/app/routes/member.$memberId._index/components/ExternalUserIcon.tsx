import type { IExternalUser } from "../../../types/GataUser.type";
import { Facebook, Mail, Shield } from "lucide-react";

type ExternalUserIconProps = {
   user: IExternalUser;
};

export const ExternalUserIcon = ({ user }: ExternalUserIconProps) => {
   return (
      <>
         {user.id.includes("facebook") && <Facebook />}
         {user.id.includes("google") && <Mail />}
         {user.id.includes("auth0") && <Shield />}
      </>
   );
};
