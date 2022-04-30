import { FormatBold, FormatItalic, FormatUnderlined, Save, ViewList } from "@mui/icons-material";
import { Paper, ToggleButtonGroup, Button, Box, Divider } from "@mui/material";
import { useMemo, useCallback, useRef } from "react";
import { Descendant, createEditor } from "slate";
import { withHistory } from "slate-history";
import { withReact, RenderElementProps, RenderLeafProps, Slate, Editable } from "slate-react";
import { UseClientState } from "../../api/client/client.types";
import { LoadingButton } from "../Loading";
import { BlockButton } from "./BlockButton";
import { MarkButton } from "./MarkButton";
import { toggleMark } from "./RichTextEditor.util";
import { RichTextElement } from "./RichTextElement";
import { RichTextLeaf } from "./RichTextLeaf";

type RichTextEditorProps = {
   onCancel: () => void;
   onSave: (content: Descendant[]) => void;
   initialContent?: string | null;
   saveResponse?: UseClientState<unknown>;
};

export const RichTextEditor = ({ onCancel, onSave, saveResponse, initialContent }: RichTextEditorProps) => {
   const editor = useMemo(() => withHistory(withReact(createEditor())), []);
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
   const content = useRef(initialValue);

   const handleSave = () => {
      console.log(content.current);
      onSave(content.current);
   };

   return (
      <>
         <Slate
            editor={editor}
            value={initialValue}
            onChange={(value) => {
               const isAstChange = editor.operations.some((op) => "set_selection" !== op.type);
               if (isAstChange) {
                  // Save the value to Local Storage.
                  content.current = value;
               }
            }}
         >
            <Paper sx={{ mt: 1 }}>
               <Box
                  sx={{
                     display: "flex",
                     justifyContent: "space-between",
                     flexWrap: "wrap-reverse",
                     alignItems: "center",
                     position: "sticky",
                     top: "66px",
                     zIndex: (theme) => theme.zIndex.drawer + 1,
                     backgroundColor: (theme) => theme.palette.background.paper,
                  }}
               >
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                     <ToggleButtonGroup exclusive aria-label="Velg tekststørrelse" sx={{ p: 1 }}>
                        <BlockButton type="h2">H2</BlockButton>
                        <BlockButton type="h3">H3</BlockButton>
                        <BlockButton type="h4">H4</BlockButton>
                        <BlockButton type="body1">Normal</BlockButton>
                        <BlockButton type="body2">Liten</BlockButton>
                        <BlockButton type="bulleted-list">
                           <ViewList />
                        </BlockButton>
                     </ToggleButtonGroup>
                     <ToggleButtonGroup exclusive aria-label="Velg tekststørrelse" sx={{ p: 1 }}>
                        <MarkButton type="bold">
                           <FormatBold />
                        </MarkButton>
                        <MarkButton type="italic">
                           <FormatItalic />
                        </MarkButton>
                        <MarkButton type="underline">
                           <FormatUnderlined />
                        </MarkButton>
                     </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ p: 1 }}>
                     <Button variant="text" onClick={() => onCancel()} sx={{ mr: 1 }}>
                        Avbryt
                     </Button>
                     <LoadingButton
                        startIcon={<Save />}
                        response={saveResponse}
                        variant="contained"
                        onClick={handleSave}
                        sx={{ mr: 1 }}
                     >
                        Save
                     </LoadingButton>
                  </Box>
               </Box>
               <Divider />
               <Box sx={{ p: 2, minHeight: "600px" }}>
                  <Editable
                     renderElement={renderElement}
                     renderLeaf={renderLeaf}
                     onKeyDown={(event) => {
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
                           case "u": {
                              event.preventDefault();
                              toggleMark(editor, "underline");
                              break;
                           }
                        }
                     }}
                  />
               </Box>
            </Paper>
         </Slate>
      </>
   );
};
