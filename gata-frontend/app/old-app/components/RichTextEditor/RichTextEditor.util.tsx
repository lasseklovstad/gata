import { Editor, Transforms, Element, Text } from "slate";
import { BlockTypes } from "./BlockButton";
import { ListTypes, LIST_TYPES, MarkType } from "./RichTextEditor.types";

const getIsListType = (type: BlockTypes): type is ListTypes => {
   return LIST_TYPES.includes(type as ListTypes);
};

const getIsMuiListType = (type: BlockTypes): type is ListTypes => {
   return type === "mui-list";
};

export const toggleBlock = (editor: Editor, type: BlockTypes) => {
   const isActive = isBlockActive(editor, type);
   const isList = getIsListType(type);
   const isMuiList = getIsMuiListType(type);

   Transforms.unwrapNodes(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && LIST_TYPES.includes(n.type as ListTypes),
      split: true,
   });
   if (isList) {
      Transforms.setNodes<Element>(editor, { type: isActive ? "body1" : isMuiList ? "list-item" : "native-list-item" });
   } else {
      Transforms.setNodes<Element>(editor, { type: isActive ? "body1" : type });
   }

   if (!isActive && isList) {
      const block = { type: type, children: [] };
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
   Transforms.setNodes(
      editor,
      { [type]: isMarkActive(editor, type) ? false : true },
      // Apply it to text nodes, and split the text node up if the
      // selection is overlapping only part of it.
      { match: (n) => Text.isText(n), split: true }
   );
};

export const insertTab = (editor: Editor) => {
   Editor.insertText(editor, "    ");
};
