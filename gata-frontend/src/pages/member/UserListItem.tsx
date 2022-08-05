import { Link } from "react-router-dom";
import { Avatar, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { IGataUser } from "../../types/GataUser.type";

type UserListItemProps = {
   user: IGataUser;
};

export const UserListItem = ({ user }: UserListItemProps) => {
   return (
      <ListItemButton divider component={Link} to={user.id}>
         <ListItemIcon>
            <Avatar src={user.picture} />
         </ListItemIcon>
         <ListItemText
            primary={user.name}
            secondary={`Sist innlogget: ${new Date(user.lastLogin).toLocaleDateString()}`}
         />
      </ListItemButton>
   );
};
