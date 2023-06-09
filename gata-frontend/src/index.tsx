import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";

const container = document.getElementById("root");
if (container) {
   const root = createRoot(container);
   root.render(
      <BrowserRouter>
         <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN || ""}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ""}
            audience={import.meta.env.VITE_AUTH0_AUDIENCE}
            redirectUri={window.location.origin}
         >
            <App />
         </Auth0Provider>
      </BrowserRouter>
   );
}
