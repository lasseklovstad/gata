import "./index.css";
import { Route, Routes } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import { Box, Container, createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@mui/material";
import { Home } from "./pages/Home";
import { MemberPage } from "./pages/member/MemberPage";
import { MemberInfoPage } from "./pages/member/MemberInfoPage";
import { ResponsibilityPage } from "./pages/ResponsibilityPage";
import { MyPage } from "./pages/MyPage";
import { ReportPage } from "./pages/ReportPage";
import { ReportInfoPage } from "./pages/ReportInfoPage/ReportInfoPage";
import Typography from "@mui/material/Typography";
import * as React from "react";

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
      h4: {
         fontSize: "1.6rem",
      },
      h5: {
         fontSize: "1.4rem",
      },
      h6: {
         fontSize: "1.2rem",
      },
   },
});
theme = responsiveFontSizes(theme);

export const App = () => {
   return (
      <ThemeProvider theme={theme}>
         <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
            <CssBaseline />
            <ResponsiveAppBar />
            <Container maxWidth="md" sx={{ mb: 16 }}>
               <Routes>
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="mypage" element={<MyPage />} />
                  <Route path="report" element={<ReportPage />} />
                  <Route path="report/:reportId" element={<ReportInfoPage />} />
                  <Route path="responsibility" element={<ResponsibilityPage />} />
                  <Route path="member" element={<MemberPage />} />
                  <Route path="member/:memberId" element={<MemberInfoPage />} />
                  <Route path="*" element={<Home />} />
               </Routes>
            </Container>
            <Box component="footer" sx={{ marginTop: "auto", p: 1 }}>
               <Typography>Versjon: {APP_VERSION}</Typography>
            </Box>
         </Box>
      </ThemeProvider>
   );
};

export default App;
