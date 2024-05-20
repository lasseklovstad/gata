import { Facebook, Mail, Shield } from "lucide-react";

import type { IExternalUser } from "../../../types/GataUser.type";

type ExternalUserIconProps = {
   user: IExternalUser;
};

export const ExternalUserIcon = ({ user }: ExternalUserIconProps) => {
   return (
      <>
         {/* eslint-disable-next-line deprecation/deprecation */}
         {user.id.includes("facebook") && <Facebook />}
         {user.id.includes("google") && <Mail />}
         {user.id.includes("auth0") && <Shield />}
      </>
   );
};
