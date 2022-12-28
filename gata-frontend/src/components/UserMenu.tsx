import { User } from "@auth0/auth0-spa-js";
import { Text, Button, IconButton, Menu, MenuItem, Avatar, MenuList, MenuButton } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { loginWithRedirect, logout } from "../auth0Client";

type UserMenuProps = {
   roleText: string;
   isAuthenticated: boolean;
   user: User | undefined;
};

export const UserMenu = ({ roleText, user, isAuthenticated }: UserMenuProps) => {
   const handleLogout = () => {
      logout();
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
               <Button onClick={() => loginWithRedirect()} sx={{ my: 2, color: "white", display: "block" }}>
                  Logg inn
               </Button>
            </>
         )}
      </>
   );
};
