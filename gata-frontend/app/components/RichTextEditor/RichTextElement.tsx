import type { RenderElementProps } from "slate-react";

import { Typography } from "../ui/typography";
import { Image, SavingImage, SlateImage } from "./Image";

type RichTextElementProps = {
   outsideContext?: boolean;
} & Partial<RenderElementProps>;

const getVariant = (type: string) => {
   if (type === "h2") {
      return "3xl";
   }
   if (type === "h3") {
      return "2xl";
   }
   if (type === "h4") {
      return "xl";
   }
   if (type === "body2") {
      return "sm";
   }
   return "md";
};

export const RichTextElement = ({ attributes, children, element, outsideContext = false }: RichTextElementProps) => {
   switch (element?.type) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
         return (
            <Typography variant={element.type} {...attributes} className="mb-2">
               {children}
            </Typography>
         );
      case "body1":
         return <Typography {...attributes}>{children}</Typography>;
      case "body2":
         return (
            <Typography {...attributes} variant="smallText">
               {children}
            </Typography>
         );
      case "list-item":
      case "native-list-item":
         return (
            <li {...attributes} className="ml-6">
               {children}
            </li>
         );
      case "bulleted-list":
         return (
            <ul {...attributes} className="list-disc">
               {children}
            </ul>
         );
      case "numbered-list":
         return (
            <ol {...attributes} className="list-decimal">
               {children}
            </ol>
         );
      case "saving-image":
         return !outsideContext ? <SavingImage oldId={element.imageId!} /> : null;
      case "image":
         return !outsideContext ? (
            <SlateImage attributes={attributes} element={element}>
               {children}
            </SlateImage>
         ) : (
            <Image id={element?.imageId || ""} size={element?.size} />
         );
      default:
         return <Typography {...attributes}>{children}</Typography>;
   }
};
