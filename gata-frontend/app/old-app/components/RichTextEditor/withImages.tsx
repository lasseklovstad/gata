import { Editor, Element, Text, Transforms } from "slate";

let counter = 0;
const generateId = () => (counter++).toString();

export const withImages = (editor: Editor) => {
   const { isVoid, insertData } = editor;

   editor.isVoid = (element: Element) => {
      return element.type === "image" || element.type === "saving-image" ? true : isVoid(element);
   };

   editor.insertData = (data) => {
      const { files } = data;
      const text = data.getData("text/plain");
      if (!text && files && files.length > 0) {
         for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            const reader = new FileReader();
            const [mime] = file!.type.split("/");

            if (mime === "image") {
               reader.addEventListener("load", () => {
                  const url = reader.result;
                  console.log(url);
                  typeof url === "string" && insertSavingImage(editor, generateId(), url);
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

export const insertSavingImage = (editor: Editor, imageId: string, data: string) => {
   const text = { text: "" };
   const image = [
      { type: "saving-image" as const, imageId, savingImageData: data, size: 50, children: [text] },
      { type: "body2" as const, children: [text] },
   ];
   Transforms.insertNodes(editor, image);
};

export const replaceSavingImage = (editor: Editor, imageId: string, oldId: string) => {
   const image = { type: "image" as const, imageId };
   Transforms.setNodes(editor, image, {
      at: [],
      match: (n) => {
         console.log("Node", n);
         return !Editor.isEditor(n) && Element.isElement(n) && n.type === "saving-image" && n.imageId === oldId;
      },
      mode: "all",
   });
};
