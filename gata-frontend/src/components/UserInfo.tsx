import { Box, Typography } from "@mui/material";
import { IGataUser } from "../types/GataUser.type";

type UserInfoProps = {
   user: IGataUser;
};

export const UserInfo = ({ user }: UserInfoProps) => {
   return (
      <>
         <Box m={1}>
            <Typography variant="body1">
               <strong>Navn:</strong> {user.name}
            </Typography>
            <Typography variant="body1">
               <strong>Email:</strong> {user.email}
            </Typography>
         </Box>
      </>
   );
};
