import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

type PageLayoutProps = {
   children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => {
   return (
      <Box py={4} px={{ base: 0, md: 4 }}>
         {children}
      </Box>
   );
};
