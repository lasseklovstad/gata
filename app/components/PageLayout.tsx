import type { ReactNode } from "react";

import { cn } from "~/utils";

type PageLayoutProps = {
   children: ReactNode;
   className?: string;
};

export const PageLayout = ({ children, className }: PageLayoutProps) => {
   return <div className={cn("py-4 md:px-4 px-0", className)}>{children}</div>;
};
