import React, {useEffect, useState} from 'react';
import './App.css';
import {LoginButton} from "./components/LoginButton";
import {useGetRole} from "./api/role.api";
import {useAuth0} from "@auth0/auth0-react";

function App() {
    const {getRoles} = useGetRole();
    const {user} = useAuth0();

  return (
    <div className="App">
      <LoginButton/>
      <button onClick={()=>getRoles()}>Fetch roles</button>
        {user?.email}
    </div>
  );
}

export default App;
