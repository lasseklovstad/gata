import { MenuItem, MenuItemProps } from "@mui/material";
import { IExternalUser } from "../types/GataUser.type";
import { ExternalUserIcon } from "./ExternalUserIcon";

type ExternalUserMenuItemProps = {
   user: IExternalUser;
} & MenuItemProps;

export const ExternalUserMenuItem = ({ user, ...menuProps }: ExternalUserMenuItemProps) => {
   return (
      <MenuItem {...menuProps}>
         <ExternalUserIcon sx={{ m: 1 }} user={user} />
         {user.email}
      </MenuItem>
   );
};
