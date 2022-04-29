import { Link, Outlet, useLocation } from "react-router-dom";
import { Box, Toolbar, Tabs, Tab } from "@mui/material";

const pages = [
   { name: "Velkommen", url: "/admin" },
   { name: "Medlem", url: "member" },
   { name: "Ansvarsposter", url: "responsibility" },
];

export const AdminPageLayout = () => {
   const location = useLocation();
   return (
      <>
         <Box component="main">
            <Toolbar />
            <Box sx={{ display: "flex", borderBottom: 1, borderColor: "divider", mb: 1 }}>
               <Tabs value={location.pathname.split("/")[2] || "/admin"}>
                  {pages.map(({ name, url }) => {
                     return <Tab key={name} value={url} label={name} component={Link} to={url} />;
                  })}
               </Tabs>
            </Box>
            <Outlet />
         </Box>
      </>
   );
};
