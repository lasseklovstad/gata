import type { V2_MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import React from "react";

export const meta: V2_MetaFunction = () => {
   return [{ title: "Gata" }];
};

export default function App() {
   return (
      <html lang="no">
         <head>
            <meta charSet="utf-8" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta name="description" content="Nettside for gata" />
            <link rel="apple-touch-icon" href="/logo192.png" />
            <link rel="manifest" href="/manifest.json" />
            <Meta />
            <Links />
         </head>
         <body>
            <div id="root">
               <Outlet />
            </div>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
         </body>
      </html>
   );
}
