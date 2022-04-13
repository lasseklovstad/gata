import { Container, Toolbar } from "@mui/material";
import { ReactNode } from "react";

type PageLayoutProps = {
   children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => {
   return (
      <Container component="main">
         <Toolbar sx={{ minHeight: "64px", mb: 1 }} />
         {children}
      </Container>
   );
};
