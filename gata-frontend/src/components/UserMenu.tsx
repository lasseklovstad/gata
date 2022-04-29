import { useAuth0 } from "@auth0/auth0-react";
import { Typography, Button, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useState } from "react";

export const UserMenu = () => {
   const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

   const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
      console.log("open");
      setAnchorEl(event.currentTarget);
   };

   const handleCloseMenu = () => {
      console.log("close");
      setAnchorEl(null);
   };

   const handleLogout = () => {
      logout({ returnTo: window.location.origin });
      handleCloseMenu();
   };

   return (
      <>
         {isAuthenticated && (
            <>
               <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenMenu}
                  color="inherit"
               >
                  <Avatar src={user?.picture} />
               </IconButton>
               <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                     vertical: "bottom",
                     horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                     vertical: "top",
                     horizontal: "left",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
               >
                  <MenuItem onClick={handleLogout}>
                     <Typography textAlign="center">Logg ut</Typography>
                  </MenuItem>
               </Menu>
            </>
         )}
         {!isAuthenticated && (
            <>
               <Button onClick={() => loginWithRedirect()} sx={{ my: 2, color: "white", display: "block" }}>
                  Logg inn
               </Button>
            </>
         )}
      </>
   );
};
