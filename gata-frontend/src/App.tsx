import "./index.css";
import { Route, Routes } from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import { Home } from "./pages/Home";
import { MemberPage } from "./pages/member/MemberPage";
import { MemberInfoPage } from "./pages/member/MemberInfoPage";
import { ResponsibilityPage } from "./pages/ResponsibilityPage";
import { MyPage } from "./pages/MyPage";
import { ReportPage } from "./pages/ReportPage";
import { ReportInfoPage } from "./pages/ReportInfoPage/ReportInfoPage";
import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, ChakraProvider, Container, extendTheme, Text } from "@chakra-ui/react";

const chakraTheme = extendTheme({
   components: {
      Button: {
         // The styles all button have in common
         baseStyle: {
            textTransform: "uppercase",
         },
         // The default size and variant values
         defaultProps: {
            size: "md",
            colorScheme: "blue",
         },
      },
      Modal: {
         defaultProps: {
            isCentered: true,
         },
      },
   },
});

export const App = () => {
   const { isLoading } = useAuth0();
   if (isLoading) {
      return <Text>Henter bruker...</Text>;
   }
   return (
      <ChakraProvider theme={chakraTheme}>
         <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
            <ResponsiveAppBar />
            <Container maxW="6xl" sx={{ mb: 16 }}>
               <Routes>
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="mypage" element={<MyPage />} />
                  <Route path="report" element={<ReportPage />} />
                  <Route path="report/:reportId" element={<ReportInfoPage />} />
                  <Route path="responsibility" element={<ResponsibilityPage />} />
                  <Route path="member" element={<MemberPage />} />
                  <Route path="member/:memberId" element={<MemberInfoPage />} />
                  <Route index element={<Home />} />
               </Routes>
            </Container>
            <Box as="footer" sx={{ marginTop: "auto", p: 1 }}>
               <Text>Versjon: {APP_VERSION}</Text>
            </Box>
         </Box>
      </ChakraProvider>
   );
};

export default App;
