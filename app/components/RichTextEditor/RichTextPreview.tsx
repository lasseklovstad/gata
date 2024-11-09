import { useMemo } from "react";
import type { Descendant } from "slate";
import { Element } from "slate";

import { RichTextElement } from "./RichTextElement";
import { RichTextLeaf } from "./RichTextLeaf";

type RichTextPreviewProps = {
   content: string;
};

export const RichTextPreview = ({ content }: RichTextPreviewProps) => {
   const contentParsed = useMemo(
      (): Descendant[] =>
         // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
         (content && (JSON.parse(content) as Descendant[])) || [
            {
               type: "body1",
               children: [{ text: "A line of text in a paragraph." }],
            },
         ],
      [content]
   );

   const getElement = (element: Descendant, index: number) => {
      if (Element.isElement(element)) {
         return (
            <RichTextElement key={index} element={element} outsideContext>
               {element.children.map((child, j) => {
                  return getElement(child, j);
               })}
            </RichTextElement>
         );
      }
      return (
         <RichTextLeaf key={index} leaf={element}>
            {element.text || <br />}
         </RichTextLeaf>
      );
   };

   return (
      <>
         {contentParsed.map((element, i) => {
            return getElement(element, i);
         })}
      </>
   );
};
