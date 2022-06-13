import { Editor, Element, Transforms } from "slate";

export const withImages = (editor: Editor, saveImage: (data: string) => Promise<{ id: string } | undefined>) => {
   const { isVoid, insertData } = editor;

   editor.isVoid = (element: Element) => {
      return element.type === "image" ? true : isVoid(element);
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
                  saveImage(url as string).then((body) => {
                     if (body) {
                        insertImage(editor, body.id);
                     }
                  });
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
