import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { RenderElementProps } from "slate-react";
import { SlateImage, Image } from "./Image";

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
      case "native-list-item":
         return (
            <Typography component="li" {...attributes}>
               {children}
            </Typography>
         );
      case "bulleted-list":
         return <ul {...attributes}>{children}</ul>;
      case "numbered-list":
         return <ol {...attributes}>{children}</ol>;
      case "mui-list":
         return <List {...attributes}>{children}</List>;
      case "image":
         return !outsideContext ? (
            <SlateImage attributes={attributes} element={element}>
               {children}
            </SlateImage>
         ) : (
            <Image id={element?.imageId!} size={element?.size} />
         );
      default:
         return (
            <Typography {...attributes} variant="body1">
               {children}
            </Typography>
         );
   }
};
