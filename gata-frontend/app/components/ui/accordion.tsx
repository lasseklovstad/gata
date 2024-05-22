import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "~/utils";

export const Accordion = ({ className, ...props }: ComponentProps<"details">) => {
   return <details className={cn("group", className)} {...props} />;
};

export const AccordionHeading = ({ className, children, ...props }: ComponentProps<"summary">) => (
   <summary
      className={cn("p-2 hover:cursor-pointer hover:bg-slate-100 flex items-center justify-between gap-2", className)}
      {...props}
   >
      {children}
      <ChevronDown className="group-open:rotate-180 transition-transform" />
   </summary>
);

export const AccordionBody = ({ className, ...props }: ComponentProps<"div">) => (
   <div className={cn("p-2 mb-2", className)} {...props} />
);
