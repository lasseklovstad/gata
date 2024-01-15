import { Editor, Transforms, Element, Text, Node } from "slate";

import type { BlockTypes } from "./BlockButton";
import { ListTypes, LIST_TYPES, MarkType } from "./RichTextEditor.types";

const getIsListType = (type: BlockTypes): type is ListTypes => {
   return LIST_TYPES.includes(type as ListTypes);
};

export const toggleBlock = (editor: Editor, type: BlockTypes) => {
   const isActive = isBlockActive(editor, type);
   const isList = getIsListType(type);

   Transforms.unwrapNodes(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && LIST_TYPES.includes(n.type as ListTypes),
      split: true,
   });
   if (isList) {
      Transforms.setNodes<Element>(editor, { type: isActive ? "body1" : "list-item" });
   } else {
      Transforms.setNodes<Element>(editor, { type: isActive ? "body1" : type });
   }

   if (!isActive && isList) {
      const block = { type, children: [] };
      Transforms.wrapNodes(editor, block);
   }
};

export const isBlockActive = (editor: Editor, format: BlockTypes) => {
   const { selection } = editor;
   if (!selection) return false;

   const [match] = Array.from(
      Editor.nodes(editor, {
         at: Editor.unhangRange(editor, selection),
         match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
      })
   );

   return !!match;
};

export const isMarkActive = (editor: Editor, type: MarkType) => {
   const marks = Editor.marks(editor);
   return marks ? marks[type] === true : false;
};

export const toggleMark = (editor: Editor, type: MarkType) => {
   const isActive = isMarkActive(editor, type);

   if (isActive) {
      Editor.removeMark(editor, type);
   } else {
      Editor.addMark(editor, type, true);
   }
};

export const insertTab = (editor: Editor) => {
   const [match] = Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === "list-item",
   });
   if (match) {
      Transforms.wrapNodes(editor, { type: "nested-list", children: [] }, { at: match[1] });
   } else {
      Editor.insertText(editor, "    ");
   }
};

export const endListIfEmptyListItem = (editor: Editor) => {
   const [match1] = Editor.nodes<Element>(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === "list-item",
   });

   Node.

   return false;
};
