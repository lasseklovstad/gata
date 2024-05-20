import { List, ListOrdered } from "lucide-react";
import { useSlate } from "slate-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { isBlockActive, toggleBlock } from "./RichTextEditor.util";
import { BlockTypes, CustomElement } from "./RichTextEditor.types";

const blockTypes = ["h2", "h3", "h4", "body1", "body2", "bulleted-list", "numbered-list"] as BlockTypes[];

export const TextStyleGroup = () => {
   const editor = useSlate();

   return (
      <ToggleGroup
         variant="outline"
         type="single"
         aria-label="Velg tekststørrelse"
         value={blockTypes.find((type) => isBlockActive(editor, type))}
         onValueChange={(value) => {
            toggleBlock(editor, value as BlockTypes);
         }}
      >
         <ToggleGroupItem value="h2" onMouseDown={(e) => e.preventDefault()}>
            H2
         </ToggleGroupItem>
         <ToggleGroupItem value="h3" onMouseDown={(e) => e.preventDefault()}>
            H3
         </ToggleGroupItem>
         <ToggleGroupItem value="h4" onMouseDown={(e) => e.preventDefault()}>
            H4
         </ToggleGroupItem>
         <ToggleGroupItem value="body1" onMouseDown={(e) => e.preventDefault()}>
            Normal
         </ToggleGroupItem>
         <ToggleGroupItem value="body2" onMouseDown={(e) => e.preventDefault()}>
            Liten
         </ToggleGroupItem>
         <ToggleGroupItem value="bulleted-list" onMouseDown={(e) => e.preventDefault()}>
            <List />
         </ToggleGroupItem>
         <ToggleGroupItem value="numbered-list" onMouseDown={(e) => e.preventDefault()}>
            <ListOrdered />
         </ToggleGroupItem>
      </ToggleGroup>
   );
};
