import { Editor, Element, Transforms } from "slate";

export const withImages = (editor: Editor) => {
   const { isVoid } = editor;

   editor.isVoid = (element: Element) => {
      return element.type === "image" ? true : isVoid(element);
   };

   editor.insertData = (data) => {
      const { files } = data;
      const text = data.getData("text/plain");

      if (files && files.length > 0) {
         for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            const reader = new FileReader();
            const [mime] = file!.type.split("/");

            if (mime === "image") {
               reader.addEventListener("load", () => {
                  const url = reader.result;
                  insertImage(editor, url as string);
               });

               reader.readAsDataURL(file!);
            }
         }
      } else {
         insertImage(editor, text);
      }
   };

   return editor;
};

const insertImage = (editor: Editor, url: string | null) => {
   const text = { text: "" };
   const image = { type: "image" as const, url, children: [text] };
   Transforms.insertNodes(editor, image);
};
