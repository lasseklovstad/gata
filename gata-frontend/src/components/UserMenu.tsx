import { useAuth0 } from "@auth0/auth0-react";
import { Text, Button, IconButton, Menu, MenuItem, Avatar, MenuList, MenuButton } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

type UserMenuProps = {
   roleText: string;
};

export const UserMenu = ({ roleText }: UserMenuProps) => {
   const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
   const location = useLocation();

   const handleLogout = () => {
      logout({ returnTo: window.location.origin });
   };

   return (
      <>
         {isAuthenticated && (
            <>
               <Menu>
                  <MenuButton aria-label="Åpne meny" as={IconButton} icon={<Avatar src={user?.picture} size="sm" />} />
                  <MenuList>
                     <MenuItem onClick={handleLogout}>
                        <Text textAlign="center">Logg ut</Text>
                     </MenuItem>
                     <MenuItem as={Link} to="privacy">
                        <Text textAlign="center">Privacy</Text>
                     </MenuItem>
                     <MenuItem>Rolle: {roleText}</MenuItem>
                  </MenuList>
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
