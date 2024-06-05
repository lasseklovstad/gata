import { Bold, Italic, Underline } from "lucide-react";
import { useSlate } from "slate-react";

import type { MarkType } from "./RichTextEditor.types";
import { getActiveMarks, toggleMark } from "./RichTextEditor.util";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export const TextDecorationGroup = () => {
   const editor = useSlate();

   const activeMarks = getActiveMarks(editor);

   return (
      <ToggleGroup
         type="multiple"
         aria-label="Velg tekststørrelse"
         value={activeMarks}
         onValueChange={(newActiveMarks) => {
            // First toggle the active ones and then toggle the new active ones to get the new state
            [...activeMarks, ...newActiveMarks].forEach((type) => {
               toggleMark(editor, type as MarkType);
            });
         }}
      >
         <ToggleGroupItem value="bold" onMouseDown={(e) => e.preventDefault()}>
            <Bold />
         </ToggleGroupItem>
         <ToggleGroupItem value="italic" onMouseDown={(e) => e.preventDefault()}>
            <Italic />
         </ToggleGroupItem>
         <ToggleGroupItem value="underline" onMouseDown={(e) => e.preventDefault()}>
            <Underline />
         </ToggleGroupItem>
      </ToggleGroup>
   );
};
