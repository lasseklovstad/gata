import { Facebook, Google, Security } from "@mui/icons-material";
import { IExternalUser } from "../types/GataUser.type";
import { Icon, IconProps } from "@chakra-ui/react";

type ExternalUserIconProps = {
   user: IExternalUser;
} & IconProps;

export const ExternalUserIcon = ({ user, ...iconProps }: ExternalUserIconProps) => {
   return (
      <>
         {user.id.includes("facebook") && <Icon as={Facebook} color="blue.500" {...iconProps} />}
         {user.id.includes("google") && <Icon as={Google} color="blue.500" {...iconProps} />}
         {user.id.includes("auth0") && <Icon as={Security} color="blue.500" {...iconProps} />}
      </>
   );
};
