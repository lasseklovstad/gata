import { X } from "lucide-react";
import type { ComponentProps, Ref } from "react";
import { createContext, forwardRef, useContext, useId } from "react";

import { cn } from "~/utils";

import { Button } from "./button";
import { Typography } from "./typography";

type DialogContext = {
   titleId: string;
};

const DialogContext = createContext<DialogContext | undefined>(undefined);

export const Dialog = forwardRef((props: ComponentProps<"dialog">, ref?: Ref<HTMLDialogElement>) => {
   const id = useId();
   const titleId = id + "-title";
   return (
      <DialogContext.Provider value={{ titleId }}>
         <dialog
            id={id}
            aria-labelledby={titleId}
            className="px-8 py-6 rounded-md border border-border backdrop:bg-black/40 max-w-[500px] w-full"
            ref={ref}
            {...props}
         />
      </DialogContext.Provider>
   );
});
export const DialogHeading = (props: ComponentProps<typeof Typography>) => {
   const context = useContext(DialogContext);
   return <Typography id={context?.titleId} variant="h2" {...props} />;
};
export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
   <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />
);

export const DialogCloseButton = ({ onClose }: { onClose: () => void }) => (
   <Button type="button" onClick={onClose} size="icon" variant="secondary" className="m-1 absolute right-0 top-0 z-50">
      <X />
      <span className="sr-only">Lukk</span>
   </Button>
);
