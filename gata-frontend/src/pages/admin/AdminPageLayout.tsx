import { Outlet } from "react-router-dom";
import { Box, Drawer, ListItemButton, List, Toolbar, Tabs, Tab } from "@mui/material";
import { NavLinkStyled } from "../../components/NavLinkStyled";

const drawerWidth = 150;
const pages = [
   { name: "Medlem", url: "member" },
   { name: "Ansvarsposter", url: "responsibility" },
];

export const AdminPageLayout = () => {
   return (
      <>
         <Drawer
            variant="permanent"
            sx={{
               width: drawerWidth,
               flexShrink: 0,
               display: { xs: "none", md: "flex" },
               [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
            }}
         >
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
               <List>
                  {pages.map(({ name, url }) => {
                     return (
                        <ListItemButton key={name} divider component={NavLinkStyled} to={url}>
                           {name}
                        </ListItemButton>
                     );
                  })}
               </List>
            </Box>
         </Drawer>

         <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Box sx={{ display: { xs: "flex", md: "none" }, borderBottom: 1, borderColor: "divider", mb: 1 }}>
               <Tabs>
                  {pages.map(({ name, url }) => {
                     return <Tab key={name} label={name} component={NavLinkStyled} to={url} />;
                  })}
               </Tabs>
            </Box>
            <Outlet />
         </Box>
      </>
   );
};
