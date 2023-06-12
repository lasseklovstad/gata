import { Text, Button, IconButton, Menu, MenuItem, Avatar, MenuList, MenuButton } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import type { Auth0Profile } from "remix-auth-auth0";

type UserMenuProps = {
   roleText: string;
   isAuthenticated: boolean;
   user: Auth0Profile | undefined;
};

export const UserMenu = ({ roleText, user, isAuthenticated }: UserMenuProps) => {
   return (
      <>
         {isAuthenticated && (
            <>
               <Menu>
                  <MenuButton aria-label="Åpne meny" as={IconButton} icon={<Avatar src={user?.picture} size="sm" />} />
                  <MenuList>
                     <MenuItem as={Link} to="logout">
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
               <Button as={Link} to="login" sx={{ my: 2, color: "white", display: "block" }}>
                  Logg inn
               </Button>
            </>
         )}
      </>
   );
};
