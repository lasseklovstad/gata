import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { RenderElementProps } from "slate-react";

export const RichTextElement = ({ attributes, children, element }: Partial<RenderElementProps>) => {
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
      default:
         return (
            <Typography {...attributes} variant="body1">
               {children}
            </Typography>
         );
   }
};
