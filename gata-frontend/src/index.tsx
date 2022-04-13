import reportWebVitals from "./reportWebVitals";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { HashRouter } from "react-router-dom";

const container = document.getElementById("root");
if (container) {
   const root = createRoot(container);
   root.render(
      <HashRouter>
         <Auth0Provider
            domain={process.env.REACT_APP_AUTH0_DOMAIN || ""}
            clientId={process.env.REACT_APP_AUTH0_CLIENT_ID || ""}
            audience={process.env.REACT_APP_AUTH0_AUDIENCE}
            redirectUri={window.location.origin}
         >
            <App />
         </Auth0Provider>
      </HashRouter>
   );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
