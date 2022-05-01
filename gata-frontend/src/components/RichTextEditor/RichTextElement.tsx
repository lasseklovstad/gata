import { Delete } from "@mui/icons-material";
import { CardMedia, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Transforms } from "slate";
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlateStatic } from "slate-react";

type RichTextElementProps = {
   outsideContext?: boolean;
} & Partial<RenderElementProps>;

export const RichTextElement = ({ attributes, children, element, outsideContext = false }: RichTextElementProps) => {
   switch (element?.type) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "body1":
      case "body2":
         return (
            <Typography {...attributes} variant={element.type}>
               {children}
            </Typography>
         );
      case "list-item":
         return (
            <ListItem {...attributes} divider>
               <ListItemText>{children}</ListItemText>
            </ListItem>
         );
      case "bulleted-list":
         return <List>{children}</List>;
      case "image":
         return !outsideContext ? (
            <SlateImage attributes={attributes} element={element}>
               {children}
            </SlateImage>
         ) : (
            <Image url={element?.url!} />
         );
      default:
         return (
            <Typography {...attributes} variant="body1">
               {children}
            </Typography>
         );
   }
};

const SlateImage = ({ attributes, children, element }: Partial<RenderElementProps>) => {
   const editor = useSlateStatic();
   const path = ReactEditor.findPath(editor, element!);

   const selected = useSelected();
   const focused = useFocused();
   return (
      <div {...attributes}>
         {children}
         <Box contentEditable={false} position="relative">
            <Image url={element?.url!} selected={selected} focused={focused} />
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
         </Box>
      </div>
   );
};

type ImageProps = {
   url: string;
   selected?: boolean;
   focused?: boolean;
};

const Image = ({ url, selected = false, focused = false }: ImageProps) => {
   return (
      <>
         <CardMedia
            component="img"
            image={url}
            sx={{
               boxShadow: selected && focused ? "0 0 0 3px #B4D5FF" : "none",
               display: "block",
               maxWidth: "50%",
               maxHeight: "20em",
               m: 1,
            }}
         />
      </>
   );
};
