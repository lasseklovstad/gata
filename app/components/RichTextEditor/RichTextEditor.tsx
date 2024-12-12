import { Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSubmit } from "react-router";
import { createEditor } from "slate";
import type { Descendant } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import type { RenderElementProps, RenderLeafProps } from "slate-react";

import { AddImage } from "./AddImage";
import { insertTab, toggleMark } from "./RichTextEditor.util";
import { RichTextElement } from "./RichTextElement";
import { RichTextLeaf } from "./RichTextLeaf";
import { TextDecorationGroup } from "./TextDecorationGroup";
import { TextStyleGroup } from "./TextStyleGroup";
import { insertImage, withImages } from "./withImages";
import { Button } from "../ui/button";

type RichTextEditorProps = {
   onCancel: () => void;
   onSave: (content: Descendant[] | undefined, close: boolean) => void;
   initialContent?: string | null;
   isLoading: boolean;
};

export const RichTextEditor = ({ onCancel, onSave, isLoading, initialContent }: RichTextEditorProps) => {
   const submitImage = useSubmit();
   const editor = useMemo(() => withImages(withHistory(withReact(createEditor())), submitImage), [submitImage]);
   const renderElement = useCallback((props: RenderElementProps) => <RichTextElement {...props} />, []);
   const renderLeaf = useCallback((props: RenderLeafProps) => {
      return <RichTextLeaf {...props} />;
   }, []);
   const initialValue = useMemo((): Descendant[] => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const contentParsed = (initialContent && (JSON.parse(initialContent) as Descendant[])) || [];
      return contentParsed.length
         ? contentParsed
         : [
              {
                 type: "body1",
                 children: [{ text: "Skriv noe lurt!" }],
              },
           ];
   }, [initialContent]);
   const content = useRef(initialValue);

   const handleSave = useCallback(
      (close: boolean) => {
         if (JSON.stringify(content.current) === initialContent && !close) return;
         onSave(content.current, close);
      },
      [initialContent, onSave]
   );

   useEffect(() => {
      const interval = setInterval(() => {
         handleSave(false);
      }, 5000);
      return () => clearInterval(interval);
   }, [handleSave]);

   return (
      <>
         <Slate
            editor={editor}
            initialValue={initialValue}
            onChange={(value) => {
               const isAstChange = editor.operations.some((op) => "set_selection" !== op.type);
               if (isAstChange) {
                  // Save the value to Local Storage.
                  content.current = value;
               }
            }}
         >
            <div className="shadow mt-1 divide-y">
               <div className="bg-background p-1 z-10 sticky top-0 flex flex-wrap-reverse items-center justify-between">
                  <div className="flex p-1 gap-2 flex-wrap items-center">
                     <TextStyleGroup />
                     <TextDecorationGroup />
                     <AddImage
                        onAddImage={(url) => {
                           insertImage(editor, url);
                        }}
                     />
                     {isLoading && <Loader2 className=" h-6 w-6 animate-spin" />}
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" onClick={() => onCancel()}>
                        Avbryt
                     </Button>
                     <Button isLoading={isLoading} onClick={() => handleSave(true)}>
                        <Save className="mr-2" />
                        Lagre
                     </Button>
                  </div>
               </div>
               <div className="p-2 min-[600px]:">
                  <Editable
                     aria-label="Rediger innhold"
                     style={{ minHeight: "600px", padding: "6px" }}
                     renderElement={renderElement}
                     renderLeaf={renderLeaf}
                     onKeyDown={(event) => {
                        switch (event.key) {
                           case "Escape": {
                              event.preventDefault();
                              onCancel();
                              break;
                           }
                           case "Tab": {
                              event.preventDefault();
                              insertTab(editor);
                              break;
                           }
                        }

                        if (!event.ctrlKey) {
                           return;
                        }

                        switch (event.key) {
                           case "b":
                           case "f": {
                              event.preventDefault();
                              toggleMark(editor, "bold");
                              break;
                           }
                           case "i":
                           case "k": {
                              event.preventDefault();
                              toggleMark(editor, "italic");
                              break;
                           }
                           case "s": {
                              event.preventDefault();
                              handleSave(false);
                              break;
                           }
                           case "u": {
                              event.preventDefault();
                              toggleMark(editor, "underline");
                              break;
                           }
                        }
                     }}
                  />
               </div>
            </div>
         </Slate>
      </>
   );
};
