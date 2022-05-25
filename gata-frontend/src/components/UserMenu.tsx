import { useAuth0 } from "@auth0/auth0-react";
import { Typography, Button, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const UserMenu = () => {
   const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   const location = useLocation();

   const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
   };

   const handleCloseMenu = () => {
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
                  <MenuItem component={Link} to="privacy" onClick={handleCloseMenu}>
                     <Typography textAlign="center">Privacy</Typography>
                  </MenuItem>
               </Menu>
            </>
         )}
         {!isAuthenticated && (
            <>
               <Button
                  onClick={() => loginWithRedirect({ appState: { returnTo: `/${location.hash.replace("#/", "")}` } })}
                  sx={{ my: 2, color: "white", display: "block" }}
               >
                  Logg inn
               </Button>
            </>
         )}
      </>
   );
};
