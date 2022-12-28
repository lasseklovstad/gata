import "./index.css";
import { RouterProvider } from "react-router-dom";
import * as React from "react";
import { router } from "./router";

export const App = () => {
   return <RouterProvider router={router} />;
};

export default App;
