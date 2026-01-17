import { type SubmitFunction } from "react-router";
import { Editor, Element, Transforms } from "slate";

import { reportInfoIntent } from "~/routes/reportInfo.$reportId/intent";
import { fetchTokens, getMediaDimensions } from "~/utils/file.client";
import { uploadNewBlob } from "~/utils/file.utils";

let counter = 0;
const generateSavingImageId = () => `saving-image-${counter++}`;

export const withImages = (editor: Editor, submit: SubmitFunction, reportId: string) => {
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

            if (file && mime === "image") {
               const tempId = generateSavingImageId();
               insertSavingImage(editor, tempId);
               const uploadImage = async () => {
                  const sasTokens = await fetchTokens({ numberOfFiles: 1, reportId });
                  const token = sasTokens[0];
                  const uploadResponse = await uploadNewBlob(file, token);
                  const dimensions = await getMediaDimensions(file);
                  const formData = new FormData();
                  formData.set("intent", reportInfoIntent.postFileIntent);
                  formData.set("id", token.id);
                  formData.set("url", token.url);
                  formData.set("type", uploadResponse.type);
                  if (dimensions) {
                     formData.set("width", dimensions.width.toString());
                     formData.set("height", dimensions.height.toString());
                  }
                  void submit(formData, { method: "POST", fetcherKey: tempId, navigate: false });
                  replaceSavingImage(editor, token.url, tempId);
               };

               void uploadImage();
            }
         }
      }
      insertData(data);
   };

   return editor;
};

const insertSavingImage = (editor: Editor, imageId: string) => {
   const text = { text: "" };
   const image = [
      { type: "saving-image" as const, imageId, size: 50, children: [text] },
      { type: "body2" as const, children: [text] },
   ];
   Transforms.insertNodes(editor, image);
};

const replaceSavingImage = (editor: Editor, imageId: string, oldId: string) => {
   const image = { type: "image" as const, imageId };
   Transforms.setNodes(editor, image, {
      at: [],
      match: (n) => {
         return !Editor.isEditor(n) && Element.isElement(n) && n.type === "saving-image" && n.imageId === oldId;
      },
      mode: "all",
   });
};
