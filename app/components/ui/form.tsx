import type { ReactNode } from "react";
import { createContext, forwardRef, useContext, useId } from "react";

import { Label } from "~/components/ui/label";
import { cn } from "~/utils";
import type { TransformedError } from "~/utils/validateUtils";
import { isTransformErrors } from "~/utils/validateUtils";

type FormContextValue = {
   errors?: Record<string, string[]> | TransformedError[];
};

const FormContext = createContext<FormContextValue | undefined>(undefined);

const FormProvider = ({
   children,
   errors,
   className,
}: { children: ReactNode; className?: string } & FormContextValue) => {
   return (
      <div className={cn("space-y-4", className)}>
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
   error: string[] | undefined;
};

const FormItemContext = createContext<FormItemContextValue | undefined>(undefined);

const FormItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { name: string }>(
   ({ className, name, ...props }, ref) => {
      const id = useId();
      const formContext = useContext(FormContext);
      const getError = () => {
         if (!formContext?.errors) return undefined;
         if (isTransformErrors(formContext.errors)) {
            // name[0]
            // nameField = name
            // nameIndex = 0
            const arrayFormNameRegex = /^(.*)\[(\d+)\]/i;
            const match = arrayFormNameRegex.exec(name);
            const nameField = match && match[1];
            const indexField = match && match[2];
            let errors: string[] = [];
            if (nameField && indexField) {
               const index = Number(indexField);
               errors = formContext.errors
                  .filter((error) => {
                     // When there are only errors on first field and that is the only field, xod omits the index
                     if (index === 0 && error.path.length === 1) {
                        return error.path[0] === nameField;
                     } else {
                        return error.path[0] === nameField && error.path[1] === index;
                     }
                  })
                  .map((error) => error.message);
            } else {
               errors = formContext.errors.filter((error) => error.path[0] === name).map((error) => error.message);
            }
            return errors.length > 0 ? errors : undefined;
         }
         return formContext.errors[name];
      };
      const error = getError();

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

export const FormFieldset = forwardRef<React.ElementRef<"fieldset">, React.ComponentPropsWithoutRef<"fieldset">>(
   ({ className, ...props }, ref) => {
      const { error, formMessageId } = useFormField();

      return <fieldset ref={ref} aria-invalid={error ? "true" : "false"} aria-describedby={formMessageId} {...props} />;
   }
);
FormFieldset.displayName = "FormFieldset";

export const FormLegend = forwardRef<React.ElementRef<"legend">, React.ComponentPropsWithoutRef<"legend">>(
   ({ className, ...props }, ref) => {
      const { error } = useFormField();

      return (
         <legend ref={ref} className={cn("text-sm font-medium", !!error && "text-destructive", className)} {...props} />
      );
   }
);
FormLabel.displayName = "FormLegend";

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
      const body = error ? error.join(", ") : children;

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
