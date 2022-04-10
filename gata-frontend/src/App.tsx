import React from 'react';
import './App.css';
import {LoginButton} from "./components/LoginButton";
import {useGetRole} from "./api/role.api";
import {useAuth0} from "@auth0/auth0-react";
import {Routes, Route} from "react-router-dom";
import {Privacy} from "./components/Privacy";

function App() {
    const {getRoles} = useGetRole();
    const {user} = useAuth0();

    return (
        <div className="App">
            <LoginButton/>
            <button onClick={() => getRoles()}>Fetch roles</button>
            {user?.email}
            <Routes>
                <Route path={"privacy"} element={<Privacy/>}/>
            </Routes>
        </div>
    );
}

export default App;
