import { extendTheme } from "@chakra-ui/react";

export const chakraTheme = extendTheme({
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
