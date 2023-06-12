import * as React from "react";
import { UserMenu } from "./UserMenu";
import { isAdmin, isMember } from "./useRoles";
import MenuIcon from "@mui/icons-material/Menu";
import {
   Box,
   Button,
   Container,
   Flex,
   IconButton,
   Img,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Text,
} from "@chakra-ui/react";
import type { IGataUser } from "../types/GataUser.type";
import type { Auth0Profile } from "remix-auth-auth0";
import { Link } from "@remix-run/react";

type ResponsiveAppBarProps = {
   loggedInUser: IGataUser | undefined;
   isAuthenticated: boolean;
   user: Auth0Profile | undefined;
};

export const ResponsiveAppBar = ({ loggedInUser, user, isAuthenticated }: ResponsiveAppBarProps) => {
   const isUserMember = isMember(loggedInUser);
   const isUserAdmin = isAdmin(loggedInUser);
   const filteredPages = [
      { name: "Hjem", url: "" },
      { name: "Min side", url: `member/${loggedInUser?.id}`, isMember: true },
      { name: "Medlemmer", url: "member", isMember: true },
      { name: "Ansvarsposter", url: "responsibility", isMember: true },
      { name: "Aktuelle dokumenter", url: "report", isMember: true },
      { name: "Arkiv", url: "https://1drv.ms/f/s!Aimiul1gt9LbrA10geM-AnPDKFoY", isMember: true },
   ].filter((page) => {
      return !page.isMember || isUserMember || isUserAdmin;
   });

   const getRole = () => {
      if (isUserAdmin && isUserMember) {
         return "admin og medlem";
      } else if (isUserMember) {
         return "medlem";
      } else if (isUserAdmin) {
         return "admin";
      }
      return "ingen";
   };

   return (
      <Box as="header" bg="blue.500" boxShadow="xl">
         <Container maxW="6xl" my={2}>
            <Flex align="center">
               <Img
                  src="/logo192.png"
                  height="40px"
                  alt="Hesten blå"
                  sx={{ mr: 2, display: { base: "none", md: "block" } }}
               />

               <Box sx={{ flexGrow: 1, display: { base: "flex", md: "none" } }}>
                  <Menu>
                     <MenuButton as={IconButton} icon={<MenuIcon />} aria-label="Åpne meny" />
                     <MenuList>
                        {filteredPages.map((page) => {
                           if (page.url.startsWith("https")) {
                              return (
                                 <MenuItem key={page.url} as="a" href={page.url} target="_blank">
                                    <Text textAlign="center">{page.name}</Text>
                                 </MenuItem>
                              );
                           }
                           return (
                              <MenuItem key={page.url} as={Link} to={page.url}>
                                 {page.name}
                              </MenuItem>
                           );
                        })}
                        <MenuItem>Rolle: {getRole()}</MenuItem>
                     </MenuList>
                  </Menu>
               </Box>
               <Text sx={{ flexGrow: 1, display: { base: "flex", md: "none" } }}>
                  <img src="/logo192.png" style={{ height: "40px" }} alt="Hesten blå" />
               </Text>
               <Flex sx={{ flexGrow: 1, flexWrap: "wrap", display: { base: "none", md: "flex" }, gap: 1 }}>
                  {filteredPages.map((page) => {
                     if (page.url.startsWith("https")) {
                        return (
                           <Button key={page.url} as="a" href={page.url} target="_blank">
                              {page.name}
                           </Button>
                        );
                     }
                     return (
                        <Button key={page.url} as={Link} to={page.url}>
                           {page.name}
                        </Button>
                     );
                  })}
               </Flex>

               <UserMenu roleText={getRole()} user={user} isAuthenticated={isAuthenticated} />
            </Flex>
         </Container>
      </Box>
   );
};
