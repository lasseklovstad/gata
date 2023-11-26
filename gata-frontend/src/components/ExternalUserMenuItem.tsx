import { ExternalUserIcon } from "./ExternalUserIcon";
import { IExternalUser } from "../types/GataUser.type";

type ExternalUserMenuItemProps = {
   user: IExternalUser;
   value: string | number;
   disabled?: boolean;
};

export const ExternalUserMenuItem = ({ user, ...menuProps }: ExternalUserMenuItemProps) => {
   return (
      <option {...menuProps}>
         <ExternalUserIcon sx={{ m: 1 }} user={user} />
         {user.email}
      </option>
   );
};
