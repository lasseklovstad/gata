import { Button } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useSlate } from "slate-react";

import type { MarkType } from "./RichTextEditor.types";
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
      <Button
         {...rest}
         sx={{ textTransform: "none" }}
         colorScheme={isMarkActive(editor, type) ? "blue" : "gray"}
         onMouseDown={(event) => {
            event.preventDefault();
            toggleMark(editor, type);
         }}
      >
         {children}
      </Button>
   );
};
