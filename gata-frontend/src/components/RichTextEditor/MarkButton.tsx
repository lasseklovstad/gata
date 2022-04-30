import { ToggleButton } from "@mui/material";
import { ReactNode } from "react";
import { useSlate } from "slate-react";
import { MarkType } from "./RichTextEditor.types";
import { isMarkActive, toggleMark } from "./RichTextEditor.util";

type MarkButtonProps = {
   type: MarkType;
   children: ReactNode;
   className?: string;
};

export const MarkButton = (props: MarkButtonProps) => {
   const { type, children, ...rest } = props;
   const editor = useSlate();
   return (
      <ToggleButton
         {...rest}
         sx={{ textTransform: "none" }}
         size="small"
         value={type}
         selected={isMarkActive(editor, type)}
         onMouseDown={(event) => {
            event.preventDefault();
            toggleMark(editor, type);
         }}
      >
         {children}
      </ToggleButton>
   );
};
