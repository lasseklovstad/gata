import { Button } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useSlate } from "slate-react";

import type { CustomElement } from "./RichTextEditor.types";
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
      <Button
         {...rest}
         sx={{ textTransform: "none" }}
         colorScheme={isBlockActive(editor, type) ? "blue" : "gray"}
         onMouseDown={(event) => {
            event.preventDefault();
            toggleBlock(editor, type);
         }}
      >
         {children}
      </Button>
   );
};
