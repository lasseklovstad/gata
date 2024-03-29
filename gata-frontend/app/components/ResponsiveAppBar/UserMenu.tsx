import { Text, Button, IconButton, Menu, MenuItem, Avatar, MenuList, MenuButton } from "@chakra-ui/react";
import { Form, Link } from "@remix-run/react";
import type { Auth0Profile } from "remix-auth-auth0";

type UserMenuProps = {
   roleText: string;
   isAuthenticated: boolean;
   user: Auth0Profile | undefined;
};

export const UserMenu = ({ roleText, user, isAuthenticated }: UserMenuProps) => {
   const photo = user && user.photos && user.photos[0] ? user.photos[0].value : "";
   return (
      <>
         {isAuthenticated && (
            <>
               <Menu>
                  <MenuButton aria-label="Åpne meny" as={IconButton} icon={<Avatar src={photo} size="sm" />} />
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
            <Form method="POST" action="/login">
               <Button type="submit" sx={{ my: 2 }}>
                  Logg inn
               </Button>
            </Form>
         )}
      </>
   );
};
