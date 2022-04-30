import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export type ListTypes = "numbered-list" | "bulleted-list" | "list-item";
export const LIST_TYPES: ListTypes[] = ["numbered-list", "bulleted-list", "list-item"];

export type CustomElement = {
   type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2" | "paragraph" | ListTypes;
   children: CustomText[];
};

export type MarkType = "bold" | "italic" | "underline";

export type CustomText = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };

declare module "slate" {
   interface CustomTypes {
      Editor: BaseEditor & ReactEditor;
      Element: CustomElement;
      Text: CustomText;
   }
}
