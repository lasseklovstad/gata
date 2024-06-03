import type { SubmitFunction } from "@remix-run/react";
import { Editor, Element, Transforms } from "slate";

import { reportInfoIntent } from "~/routes/reportInfo.$reportId/intent";

let counter = 0;
const generateSavingImageId = () => `saving-image-${counter++}`;

export const withImages = (editor: Editor, submit: SubmitFunction) => {
   const { isVoid, insertData } = editor;

   editor.isVoid = (element: Element) => {
      return element.type === "image" || element.type === "saving-image" ? true : isVoid(element);
   };

   editor.insertData = (data) => {
      const { files } = data;
      const text = data.getData("text/plain");
      if (!text && files.length > 0) {
         for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            const [mime] = file!.type.split("/");

            if (mime === "image") {
               const reader = new FileReader();
               reader.addEventListener("load", () => {
                  const data = reader.result;
                  const tempId = generateSavingImageId();
                  if (typeof data === "string") {
                     insertSavingImage(editor, tempId);
                     submit(
                        { data, intent: reportInfoIntent.postFileIntent },
                        { method: "POST", fetcherKey: tempId, navigate: false }
                     );
                  }
               });

               reader.readAsDataURL(file!);
            }
         }
      }
      insertData(data);
   };

   return editor;
};

export const insertImage = (editor: Editor, imageId: string | null) => {
   const text = { text: "" };
   const image = [
      { type: "image" as const, imageId, size: 50, children: [text] },
      { type: "body2" as const, children: [text] },
   ];
   Transforms.insertNodes(editor, image);
};

const insertSavingImage = (editor: Editor, imageId: string) => {
   const text = { text: "" };
   const image = [
      { type: "saving-image" as const, imageId, size: 50, children: [text] },
      { type: "body2" as const, children: [text] },
   ];
   Transforms.insertNodes(editor, image);
};

export const replaceSavingImage = (editor: Editor, imageId: string, oldId: string) => {
   const image = { type: "image" as const, imageId };
   Transforms.setNodes(editor, image, {
      at: [],
      match: (n) => {
         return !Editor.isEditor(n) && Element.isElement(n) && n.type === "saving-image" && n.imageId === oldId;
      },
      mode: "all",
   });
};
