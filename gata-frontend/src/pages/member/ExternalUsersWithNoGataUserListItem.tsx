import {
   Alert,
   AlertTitle,
   Avatar,
   CircularProgress,
   IconButton,
   ListItem,
   ListItemIcon,
   ListItemText,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { IExternalUser, IGataUser } from "../../types/GataUser.type";
import { useCreateUser } from "../../api/user.api";

type ExternalUsersWithNoGataUserListItemProps = {
   user: IExternalUser;
   onAddUser: (user: IGataUser) => void;
};

export const ExternalUsersWithNoGataUserListItem = ({ user, onAddUser }: ExternalUsersWithNoGataUserListItemProps) => {
   const { createUser, userResponse } = useCreateUser(user.id);

   const handleAddClick = async () => {
      const { status, data } = await createUser();
      if (data && status === "success") {
         onAddUser(data);
      }
   };

   return (
      <ListItem
         divider
         secondaryAction={
            <IconButton onClick={handleAddClick}>
               {userResponse.status !== "loading" ? <Add /> : <CircularProgress size={20} />}
            </IconButton>
         }
      >
         <ListItemIcon>
            <Avatar src={user.picture} />
         </ListItemIcon>
         <ListItemText
            primary={user.name}
            secondary={`Sist innlogget: ${new Date(user.lastLogin).toLocaleDateString()}`}
         />
         {userResponse.status === "error" && (
            <Alert severity="error">
               <AlertTitle>Det oppstod en feil ved oppretting av bruker</AlertTitle>
               {userResponse.error?.message}
            </Alert>
         )}
      </ListItem>
   );
};
