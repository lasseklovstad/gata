import "./index.css";
import { Routes, Route } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import { Box, createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@mui/material";
import { Home } from "./pages/Home";
import { AdminPageLayout } from "./pages/admin/AdminPageLayout";
import { MemberPage } from "./pages/Members";
import { Admin } from "./pages/admin/Admin";
import { MemberInfoPage } from "./pages/MemberInfoPage";

let theme = createTheme({
   typography: {
      h1: {
         fontSize: "3rem",
      },
      h2: {
         fontSize: "2rem",
      },
      h3: {
         fontSize: "1.8rem",
      },
   },
});
theme = responsiveFontSizes(theme);

export const App = () => {
   return (
      <ThemeProvider theme={theme}>
         <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <ResponsiveAppBar />
            <Routes>
               <Route path="privacy" element={<Privacy />} />
               <Route path="admin" element={<AdminPageLayout />}>
                  <Route path="responsibility" element="responsibility" />
                  <Route path="member" element={<MemberPage />} />
                  <Route path="member/:memberId" element={<MemberInfoPage />} />
                  <Route index element={<Admin />} />
               </Route>
               <Route path="" element={<Home />} />
            </Routes>
         </Box>
      </ThemeProvider>
   );
};

export default App;
