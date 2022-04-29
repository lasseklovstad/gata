import "./index.css";
import { Routes, Route } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import { Box, Container, createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@mui/material";
import { Home } from "./pages/Home";
import { AdminPageLayout } from "./pages/admin/AdminPageLayout";
import { MemberPage } from "./pages/member/MemberPage";
import { Admin } from "./pages/admin/Admin";
import { MemberInfoPage } from "./pages/member/MemberInfoPage";
import { ResponsibilityPage } from "./pages/ResponsibilityPage";
import { MyPage } from "./pages/MyPage";

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
         <Box sx={{ display: "flex", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
            <CssBaseline />
            <ResponsiveAppBar />
            <Container maxWidth="md">
               <Routes>
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="mypage" element={<MyPage />} />
                  <Route path="admin" element={<AdminPageLayout />}>
                     <Route path="responsibility" element={<ResponsibilityPage />} />
                     <Route path="member" element={<MemberPage />} />
                     <Route path="member/:memberId" element={<MemberInfoPage />} />
                     <Route index element={<Admin />} />
                  </Route>
                  <Route path="" element={<Home />} />
               </Routes>
            </Container>
         </Box>
      </ThemeProvider>
   );
};

export default App;
