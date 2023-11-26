import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { chakraTheme } from "./chakraTheme";

const container = document.getElementById("root");
if (container) {
   const root = createRoot(container);
   root.render(
      <ChakraProvider theme={chakraTheme}>
         <App />
      </ChakraProvider>
   );
}
