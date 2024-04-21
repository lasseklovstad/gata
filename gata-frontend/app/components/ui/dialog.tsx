import { ComponentProps, Ref, forwardRef } from "react";
import { Typography } from "./typography";

export const Dialog = forwardRef((props: ComponentProps<"dialog">, ref?: Ref<HTMLDialogElement>) => (
   <dialog
      className="px-8 py-6 rounded-md border border-border backdrop:bg-black/40 max-w-[500px] w-full"
      ref={ref}
      {...props}
   />
));
export const DialogHeading = (props: ComponentProps<typeof Typography>) => <Typography variant="h2" {...props} />;
export const DialogFooter = (props: ComponentProps<"div">) => (
   <div className="mt-4 flex justify-end gap-2" {...props} />
);
