import {
   FormatBold,
   FormatItalic,
   FormatListBulleted,
   FormatListNumbered,
   FormatUnderlined,
   Save,
} from "@mui/icons-material";
import { Box, Button, ButtonGroup, Divider } from "@chakra-ui/react";
import { useCallback, useMemo, useRef } from "react";
import { createEditor, Descendant } from "slate";
import { withHistory } from "slate-history";
import { Editable, RenderElementProps, RenderLeafProps, Slate, withReact } from "slate-react";
import { UseClientState } from "../../api/client/client.types";
import { Loading, LoadingButton } from "../Loading";
import { BlockButton } from "./BlockButton";
import { insertImage, withImages } from "./withImages";
import { MarkButton } from "./MarkButton";
import { insertTab, toggleMark } from "./RichTextEditor.util";
import { RichTextElement } from "./RichTextElement";
import { RichTextLeaf } from "./RichTextLeaf";
import { usePostGataReportFile } from "../../api/file.api";
import { AddImage } from "./AddImage";

type RichTextEditorProps = {
   onCancel: () => void;
   onSave: (content: Descendant[] | undefined, close: boolean) => void;
   initialContent?: string | null;
   saveResponse: UseClientState<unknown>;
   reportId: string;
};

export const RichTextEditor = ({ onCancel, onSave, saveResponse, initialContent, reportId }: RichTextEditorProps) => {
   const { postReportFile, fileResponse } = usePostGataReportFile(reportId);
   const editor = useMemo(() => withImages(withHistory(withReact(createEditor())), postReportFile), [postReportFile]);
   const renderElement = useCallback((props: RenderElementProps) => <RichTextElement {...props} />, []);
   const renderLeaf = useCallback((props: RenderLeafProps) => {
      return <RichTextLeaf {...props} />;
   }, []);
   const initialValue = useMemo(() => {
      const contentParsed = (initialContent && JSON.parse(initialContent)) || [];
      return contentParsed.length
         ? contentParsed
         : [
              {
                 type: "body1",
                 children: [{ text: "Skriv noe lurt!" }],
              },
           ];
   }, [initialContent]);
   const content = useRef<Descendant[]>();

   const handleSave = (close: boolean) => {
      onSave(content.current, close);
   };

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
            <Box boxShadow="xl" sx={{ mt: 1 }}>
               <Box
                  bg="white"
                  zIndex={1}
                  sx={{
                     display: "flex",
                     justifyContent: "space-between",
                     flexWrap: "wrap-reverse",
                     alignItems: "center",
                     position: "sticky",
                     top: "0",
                  }}
               >
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                     <ButtonGroup isAttached aria-label="Velg tekststørrelse" sx={{ p: 1 }}>
                        <BlockButton type="h2">H2</BlockButton>
                        <BlockButton type="h3">H3</BlockButton>
                        <BlockButton type="h4">H4</BlockButton>
                        <BlockButton type="body1">Normal</BlockButton>
                        <BlockButton type="body2">Liten</BlockButton>
                        <BlockButton type="bulleted-list">
                           <FormatListBulleted />
                        </BlockButton>
                        <BlockButton type="numbered-list">
                           <FormatListNumbered />
                        </BlockButton>
                     </ButtonGroup>

                     <ButtonGroup isAttached aria-label="Velg tekststørrelse" sx={{ p: 1 }}>
                        <MarkButton type="bold">
                           <FormatBold />
                        </MarkButton>
                        <MarkButton type="italic">
                           <FormatItalic />
                        </MarkButton>
                        <MarkButton type="underline">
                           <FormatUnderlined />
                        </MarkButton>
                     </ButtonGroup>
                     <AddImage
                        onAddImage={(url) => {
                           insertImage(editor, url);
                        }}
                     />
                     <Loading response={fileResponse} />
                     <Loading response={saveResponse} />
                  </Box>
                  <Box sx={{ p: 1 }}>
                     <Button variant="ghost" onClick={() => onCancel()} sx={{ mr: 1 }}>
                        Avbryt
                     </Button>
                     <LoadingButton
                        leftIcon={<Save />}
                        response={saveResponse}
                        onClick={() => handleSave(true)}
                        sx={{ mr: 1 }}
                     >
                        Lagre
                     </LoadingButton>
                  </Box>
               </Box>
               <Divider />
               <Box sx={{ p: 2, minHeight: "600px" }}>
                  <Editable
                     aria-label="Rediger innhold"
                     style={{ minHeight: "600px" }}
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
               </Box>
            </Box>
         </Slate>
      </>
   );
};
