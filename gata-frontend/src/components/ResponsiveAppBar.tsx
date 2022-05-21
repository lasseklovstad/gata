import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { useRoles } from "./useRoles";
import { GataRoleType } from "../types/GataRole.type";

const pages = [
   { name: "Hjem", url: "" },
   { name: "Admin", url: "admin", roles: ["Administrator", "Medlem"] },
   { name: "Min side", url: "mypage", roles: ["Medlem"] },
   { name: "Aktuelle dokumenter", url: "report", roles: ["Medlem"] },
];

export const ResponsiveAppBar = () => {
   const { roles } = useRoles();
   const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

   const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
   };

   const handleCloseNavMenu = () => {
      setAnchorElNav(null);
   };

   return (
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, maxHeight: "64px" }}>
         <Container maxWidth="md">
            <Toolbar disableGutters>
               <Typography variant="h6" noWrap component="div" sx={{ mr: 2, display: { xs: "none", md: "flex" } }}>
                  <img src="logo192.png" style={{ height: "40px" }} alt="Hesten blå" />
               </Typography>

               <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                  <IconButton
                     aria-label="account of current user"
                     aria-controls="menu-appbar"
                     aria-haspopup="true"
                     onClick={handleOpenNavMenu}
                     color="inherit"
                  >
                     <MenuIcon />
                  </IconButton>
                  <Menu
                     id="menu-appbar"
                     anchorEl={anchorElNav}
                     anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                     }}
                     keepMounted
                     transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                     }}
                     open={Boolean(anchorElNav)}
                     onClose={handleCloseNavMenu}
                     sx={{
                        display: { xs: "block", md: "none" },
                     }}
                  >
                     {pages.map((page) => (
                        <MenuItem key={page.url} component={Link} to={page.url} onClick={handleCloseNavMenu}>
                           <Typography textAlign="center">{page.name}</Typography>
                        </MenuItem>
                     ))}
                  </Menu>
               </Box>
               <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
               >
                  <img src="logo192.png" style={{ height: "40px" }} alt="Hesten blå" />
               </Typography>
               <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                  {pages
                     .filter((page) => {
                        if (!page.roles || page.roles.length === 0) {
                           return true;
                        }
                        for (let pageRole of page.roles) {
                           if (roles.includes(pageRole as GataRoleType)) {
                              return true;
                           }
                        }
                        return false;
                     })
                     .map((page) => (
                        <Button
                           key={page.url}
                           component={Link}
                           to={page.url}
                           onClick={handleCloseNavMenu}
                           sx={{ my: 2, color: "white", display: "block" }}
                        >
                           {page.name}
                        </Button>
                     ))}
               </Box>

               <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
                  <UserMenu />
               </Box>
            </Toolbar>
         </Container>
      </AppBar>
   );
};
