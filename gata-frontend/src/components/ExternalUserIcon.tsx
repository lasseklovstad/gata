import { Facebook, Google, Security } from "@mui/icons-material";
import { IExternalUser } from "../types/GataUser.type";
import { SxProps } from "@mui/material";

type ExternalUserIconProps = {
   user: IExternalUser;
   sx?: SxProps;
};

export const ExternalUserIcon = ({ user, sx }: ExternalUserIconProps) => {
   return (
      <>
         {user.id.includes("facebook") && <Facebook color="primary" sx={sx} />}
         {user.id.includes("google") && <Google color="primary" sx={sx} />}
         {user.id.includes("auth0") && <Security color="primary" sx={sx} />}
      </>
   );
};
