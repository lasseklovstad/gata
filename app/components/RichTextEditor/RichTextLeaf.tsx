import type { RenderLeafProps } from "slate-react";

import { cn } from "~/utils";

export const RichTextLeaf = ({ leaf, attributes, children }: Partial<RenderLeafProps>) => {
   return (
      <span
         {...attributes}
         className={cn(leaf?.bold && "font-bold", leaf?.underline && "underline", leaf?.italic && "italic")}
      >
         {children}
      </span>
   );
};
