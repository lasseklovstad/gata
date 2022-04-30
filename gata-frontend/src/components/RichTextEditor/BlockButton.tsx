import { ToggleButton } from "@mui/material";
import { ReactNode } from "react";
import { useSlate } from "slate-react";
import { CustomElement } from "./RichTextEditor.types";
import { isBlockActive, toggleBlock } from "./RichTextEditor.util";

export type BlockTypes = CustomElement["type"];

type BlockButtonProps = {
   type: BlockTypes;
   children: ReactNode;
   className?: string;
};

export const BlockButton = (props: BlockButtonProps) => {
   const { type, children, ...rest } = props;
   const editor = useSlate();
   return (
      <ToggleButton
         {...rest}
         sx={{ textTransform: "none" }}
         size="small"
         value={type}
         selected={isBlockActive(editor, type)}
         onMouseDown={(event) => {
            event.preventDefault();
            toggleBlock(editor, type);
         }}
      >
         {children}
      </ToggleButton>
   );
};
