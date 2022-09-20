import * as React from "react";
import { Link } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { useRoles } from "./useRoles";
import { GataRoleType } from "../types/GataRole.type";
import MenuIcon from "@mui/icons-material/Menu";
import {
   Button,
   Container,
   Text,
   Box,
   IconButton,
   Menu,
   MenuItem,
   MenuButton,
   MenuList,
   Flex,
   Img,
} from "@chakra-ui/react";

const pages = [
   { name: "Hjem", url: "" },
   { name: "Min side", url: "mypage", roles: ["Medlem"] },
   { name: "Medlemmer", url: "member", roles: ["Administrator", "Medlem"] },
   { name: "Ansvarsposter", url: "responsibility", roles: ["Administrator", "Medlem"] },
   { name: "Aktuelle dokumenter", url: "report", roles: ["Medlem"] },
   { name: "Arkiv", url: "https://1drv.ms/f/s!Aimiul1gt9LbrA10geM-AnPDKFoY", roles: ["Medlem"] },
];

export const ResponsiveAppBar = () => {
   const { roles } = useRoles();
   const filteredPages = pages.filter((page) => {
      if (!page.roles || page.roles.length === 0) {
         return true;
      }
      for (let pageRole of page.roles) {
         if (roles.includes(pageRole as GataRoleType)) {
            return true;
         }
      }
      return false;
   });

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
                     <MenuButton as={IconButton} icon={<MenuIcon />} />
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

               <UserMenu />
            </Flex>
         </Container>
      </Box>
   );
};
