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
      case "bulleted-list":
         return <List>{children}</List>;
      case "image":
         return !outsideContext ? (
            <SlateImage attributes={attributes} element={element}>
               {children}
            </SlateImage>
         ) : (
            <Image url={element?.url!} size={element?.size} />
         );
      default:
         return (
            <Typography {...attributes} variant="body1">
               {children}
            </Typography>
         );
   }
};
