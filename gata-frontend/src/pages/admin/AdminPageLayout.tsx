import { Outlet } from "react-router-dom";
import { Box, Drawer, ListItemButton, List, Toolbar } from "@mui/material";
import { NavLinkStyled } from "../../components/NavLinkStyled";

const drawerWidth = 150;
export const AdminPageLayout = () => {
   return (
      <>
         <Drawer
            variant="permanent"
            sx={{
               width: drawerWidth,
               flexShrink: 0,
               [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
            }}
         >
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
               <List>
                  <ListItemButton divider component={NavLinkStyled} to="member">
                     Medlem
                  </ListItemButton>
                  <ListItemButton divider component={NavLinkStyled} to="responsibility">
                     Ansvarsposter
                  </ListItemButton>
               </List>
            </Box>
         </Drawer>
         <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Outlet />
         </Box>
      </>
   );
};
