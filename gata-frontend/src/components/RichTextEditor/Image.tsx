import { Add, Delete, Remove } from "@mui/icons-material";
import { Box, IconButton, CardMedia } from "@mui/material";
import { Transforms, Element } from "slate";
import { RenderElementProps, useSlateStatic, ReactEditor, useSelected, useFocused } from "slate-react";

export const SlateImage = ({ attributes, children, element }: Partial<RenderElementProps>) => {
   const editor = useSlateStatic();
   const path = ReactEditor.findPath(editor, element!);

   const selected = useSelected();
   const focused = useFocused();
   return (
      <div {...attributes}>
         {children}

         <Box contentEditable={false} position="relative">
            <Image url={element?.url!} selected={selected} focused={focused} size={element?.size} />

            <IconButton
               onMouseDown={(ev) => ev.preventDefault()}
               onClick={(ev) => {
                  Transforms.removeNodes(editor, { at: path });
               }}
               sx={{
                  display: selected && focused ? undefined : "none",
                  position: "absolute",
                  top: "0.5em",
                  left: "0.5em",
                  zIndex: 100,
               }}
            >
               <Delete />
            </IconButton>
            {element?.size && element.size > 10 && (
               <IconButton
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={(ev) => {
                     Transforms.setNodes<Element>(editor, { type: "image", size: (element?.size || 0) - 10 });
                  }}
                  sx={{
                     display: selected && focused ? undefined : "none",
                     position: "absolute",
                     top: "0.5em",
                     right: "2em",
                     zIndex: 100,
                  }}
               >
                  <Remove />
               </IconButton>
            )}
            {element?.size && element.size < 100 && (
               <IconButton
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={(ev) => {
                     Transforms.setNodes<Element>(editor, { type: "image", size: (element?.size || 0) + 10 });
                  }}
                  sx={{
                     display: selected && focused ? undefined : "none",
                     position: "absolute",
                     top: "0.5em",
                     right: "0.5em",
                     zIndex: 100,
                  }}
               >
                  <Add />
               </IconButton>
            )}
         </Box>
      </div>
   );
};

type ImageProps = {
   url: string;
   selected?: boolean;
   focused?: boolean;
   size?: number;
};

export const Image = ({ url, selected = false, focused = false, size = 50 }: ImageProps) => {
   return (
      <>
         <CardMedia
            component="img"
            image={url}
            sx={{
               boxShadow: selected && focused ? "0 0 0 3px #B4D5FF" : "none",
               display: "block",
               maxWidth: `${size}%`,
               m: 1,
            }}
         />
      </>
   );
};
