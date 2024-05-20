import type { ReactNode } from "react";
import { createContext, forwardRef, useContext, useId } from "react";

import { Label } from "~/components/ui/label";
import { cn } from "~/utils";

type FormContextValue = {
   errors?: Record<string, string>;
};

const FormContext = createContext<FormContextValue | undefined>(undefined);

const FormProvider = ({ children, errors }: { children: ReactNode } & FormContextValue) => {
   return (
      <div className="space-y-2">
         <FormContext.Provider value={{ errors }}>{children}</FormContext.Provider>
      </div>
   );
};

const useFormField = () => {
   const itemContext = useContext(FormItemContext);

   if (!itemContext) {
      throw new Error("useFormField should be used within <FormField>");
   }

   const { id, error, name } = itemContext;

   return {
      id,
      name,
      formItemId: `${id}-form-item`,
      formDescriptionId: `${id}-form-item-description`,
      formMessageId: `${id}-form-item-message`,
      error,
   };
};

type FormItemContextValue = {
   id: string;
   name: string;
   error: string | undefined;
};

const FormItemContext = createContext<FormItemContextValue | undefined>(undefined);

const FormItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { name: string }>(
   ({ className, name, ...props }, ref) => {
      const id = useId();
      const formContext = useContext(FormContext);
      const error = formContext?.errors ? formContext.errors[name] : undefined;

      return (
         <FormItemContext.Provider value={{ id, error, name }}>
            <div ref={ref} className={cn("space-y-2", className)} {...props} />
         </FormItemContext.Provider>
      );
   }
);
FormItem.displayName = "FormItem";

const FormLabel = forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
   ({ className, ...props }, ref) => {
      const { error, formItemId } = useFormField();

      return (
         <Label ref={ref} className={cn(!!error && "text-destructive", className)} htmlFor={formItemId} {...props} />
      );
   }
);
FormLabel.displayName = "FormLabel";

type FormControlProps = {
   render: (props: { name: string; id: string; "aria-describedby": string; "aria-invalid": boolean }) => ReactNode;
};

const FormControl = ({ render }: FormControlProps) => {
   const { formItemId, formDescriptionId, error, formMessageId, name } = useFormField();
   const renderProps = {
      name,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
   };
   return render(renderProps);
};

const FormDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
   ({ className, ...props }, ref) => {
      const { formDescriptionId } = useFormField();

      return (
         <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
      );
   }
);
FormDescription.displayName = "FormDescription";

const FormMessage = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
   ({ className, children, ...props }, ref) => {
      const { error, formMessageId } = useFormField();
      const body = error ? error : children;

      if (!body) {
         return null;
      }

      return (
         <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
            {body}
         </p>
      );
   }
);
FormMessage.displayName = "FormMessage";

export { FormControl, FormDescription, FormItem, FormLabel, FormMessage, FormProvider };
