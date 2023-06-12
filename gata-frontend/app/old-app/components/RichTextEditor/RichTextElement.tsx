import { Heading, ListItem, OrderedList, Text, UnorderedList } from "@chakra-ui/react";
import { RenderElementProps } from "slate-react";
import { SlateImage, Image } from "./Image";

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
            <Heading as={element.type} {...attributes} fontSize={getVariant(element.type)} mb={2}>
               {children}
            </Heading>
         );
      case "body1":
      case "body2":
         return (
            <Text {...attributes} fontSize={getVariant(element.type)}>
               {children}
            </Text>
         );
      case "list-item":
         return <ListItem {...attributes}>{children}</ListItem>;
      case "native-list-item":
         return (
            <Text as="li" {...attributes}>
               {children}
            </Text>
         );
      case "bulleted-list":
         return (
            <UnorderedList p={2} {...attributes}>
               {children}
            </UnorderedList>
         );
      case "numbered-list":
         return (
            <OrderedList p={2} {...attributes}>
               {children}
            </OrderedList>
         );
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
            <Text {...attributes} variant="body1">
               {children}
            </Text>
         );
   }
};
