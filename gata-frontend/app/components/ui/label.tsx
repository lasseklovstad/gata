import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
   React.ElementRef<"label">,
   React.ComponentPropsWithoutRef<"label"> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => <label ref={ref} className={cn(labelVariants(), className)} {...props} />);

export { Label };
