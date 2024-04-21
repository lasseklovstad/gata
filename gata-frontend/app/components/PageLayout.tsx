import type { ReactNode } from "react";

type PageLayoutProps = {
   children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => {
   return <div className="py-4 md:px-4 px-0">{children}</div>;
};
