import React from 'react';
import './index.css';
import {Routes, Route} from "react-router-dom";
import {Privacy} from "./components/Privacy";
import {ResponsiveAppBar} from "./components/ResponsiveAppBar";
import {Container, createTheme, responsiveFontSizes, ThemeProvider} from "@mui/material";
import {Home} from "./pages/Home";
import {Member} from "./pages/Member";
let theme = createTheme();
theme = responsiveFontSizes(theme);
function App() {
    return (
        <ThemeProvider theme={theme}>
            <ResponsiveAppBar/>
            <Container component={"main"}>
                <Routes>
                    <Route path={"privacy"} element={<Privacy/>}/>
                    <Route path={"member"} element={<Member/>}/>
                    <Route path={""} element={<Home/>}/>
                </Routes>
            </Container>

        </ThemeProvider>
    );
}

export default App;
