import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import React, { ComponentProps, ElementType, ForwardedRef, ReactElement, ReactNode, Ref, forwardRef } from "react";

import { cn } from "~/utils";

const buttonVariants = cva(
   "inline-flex items-center justify-center whitespace-nowrap uppercase rounded-md text font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
   {
      variants: {
         variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
         },
         size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
         },
      },
      defaultVariants: {
         variant: "default",
         size: "default",
      },
   }
);

type Props<T extends React.ElementType = "button"> = VariantProps<typeof buttonVariants> &
   ComponentProps<T> & {
      as?: T;
      isLoading?: boolean;
   };

type ButtonComponent = <T extends React.ElementType = "button">(props: Props<T>) => ReactNode;

export const Button: ButtonComponent = forwardRef(
   <T extends React.ElementType = "button">(
      { className, variant, size, as, children, isLoading, ...props }: Props<T>,
      ref?: ForwardedRef<ElementType<T>>
   ) => {
      const Comp = as ?? "button";
      return (
         <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} ref={ref}>
            {size === "icon" ? (
               <>{isLoading ? <Loader2 className=" h-6 w-6 animate-spin" /> : children}</>
            ) : (
               <>
                  {isLoading && <Loader2 className="absolute h-6 w-6 animate-spin" />}
                  {children}
               </>
            )}
         </Comp>
      );
   }
);
