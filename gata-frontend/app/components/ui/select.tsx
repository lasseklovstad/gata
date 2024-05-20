import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "~/utils";

export const Select = ({ className, ...props }: ComponentProps<"select">) => {
   return (
      <div className={cn("relative", className)}>
         <select
            {...props}
            className={
               "block w-full appearance-none rounded-lg border px-3 py-2 text-base focus-visible:ring focus-visible:border"
            }
         />
         <ChevronDown className="pointer-events-none absolute top-3 right-3 size-4 fill-white/60" aria-hidden="true" />
      </div>
   );
};
