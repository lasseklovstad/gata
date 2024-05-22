import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, TriangleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "~/utils";

import { Typography } from "./typography";

const alertVariants = cva(
   "relative w-full p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
   {
      variants: {
         variant: {
            default: "bg-background text-foreground",
            destructive: "bg-destructive/30 [&>svg]:text-destructive",
            success: "bg-green-500/30 [&>svg]:text-green-500",
            warning: "bg-yellow-500/30 [&>svg]:text-yellow-800",
         },
      },
      defaultVariants: {
         variant: "default",
      },
   }
);

const Alert = React.forwardRef<
   HTMLDivElement,
   React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => (
   <div
      ref={ref}
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
   >
      {variant === "destructive" ? <AlertCircle /> : null}
      {variant === "warning" ? <TriangleAlert /> : null}
      {variant === "success" ? <CheckCircle /> : null}
      {children}
   </div>
));
Alert.displayName = "Alert";

export const AlertAction = ({ className, ...props }: React.ComponentProps<"div">) => {
   return <div className={cn("absolute top-4 right-4", className)} {...props} />;
};

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
   ({ className, ...props }, ref) => (
      <Typography variant="h5" ref={ref} className={cn("mb-1 font-medium text-base", className)} {...props} />
   )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
   ({ className, ...props }, ref) => (
      <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
   )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
