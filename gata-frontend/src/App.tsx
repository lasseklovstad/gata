import React from 'react';
import './index.css';
import {Routes, Route} from "react-router-dom";
import {Privacy} from "./components/Privacy";
import {ResponsiveAppBar} from "./components/ResponsiveAppBar";
import {Box, createTheme, CssBaseline, responsiveFontSizes, ThemeProvider} from "@mui/material";
import {Home} from "./pages/Home";
import {Admin} from "./pages/admin/Admin";
import {MemberPage} from "./pages/Members";

let theme = createTheme({
    typography:{
        h1: {
            fontSize: "3rem"
        },
        h2: {
            fontSize: "2rem"
        }
    }
});
theme = responsiveFontSizes(theme);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <ResponsiveAppBar/>
                <Routes>
                    <Route path={"privacy"} element={<Privacy/>}/>
                    <Route path={"admin"} element={<Admin/>}>
                        <Route path={"responsibility"} element={"responsibility"}/>
                        <Route path={"member"} element={<MemberPage/>}/>
                    </Route>
                    <Route path={""} element={<Home/>}/>
                </Routes>
            </Box>
        </ThemeProvider>
    );
}

export default App;
