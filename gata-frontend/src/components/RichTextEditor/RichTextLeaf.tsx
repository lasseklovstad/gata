import { Text } from "@chakra-ui/react";
import { RenderLeafProps } from "slate-react";

export const RichTextLeaf = ({ leaf, attributes, children }: Partial<RenderLeafProps>) => {
   return (
      <Text
         {...attributes}
         as="span"
         variant="inherit"
         fontWeight={leaf?.bold ? "bold" : "normal"}
         sx={{ textDecoration: leaf?.underline ? "underline" : "none", fontStyle: leaf?.italic ? "italic" : "none" }}
      >
         {children}
      </Text>
   );
};
