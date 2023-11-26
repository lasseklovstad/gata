import { Box, IconButton, Skeleton, Image as ChakraImage, ButtonGroup } from "@chakra-ui/react";
import { Add, Delete, Remove } from "@mui/icons-material";
import { Transforms, Element } from "slate";
import { RenderElementProps, useSlateStatic, ReactEditor, useSelected, useFocused } from "slate-react";

import { useGetGataReportFile } from "../../api/file.api";

export const SlateImage = ({ attributes, children, element }: Partial<RenderElementProps>) => {
   const editor = useSlateStatic();
   const path = ReactEditor.findPath(editor, element!);

   const selected = useSelected();
   const focused = useFocused();
   return (
      <div {...attributes}>
         {children}

         <Box contentEditable={false} position="relative">
            <Image id={element?.imageId || ""} selected={selected} focused={focused} size={element?.size} />

            <IconButton
               onMouseDown={(ev) => ev.preventDefault()}
               onClick={() => {
                  Transforms.removeNodes(editor, { at: path });
               }}
               sx={{
                  display: selected && focused ? undefined : "none",
                  position: "absolute",
                  top: "0.5em",
                  left: "0.5em",
                  zIndex: 100,
               }}
               icon={<Delete />}
               aria-label="Slett bilde"
            />
            <ButtonGroup
               sx={{
                  display: selected && focused ? undefined : "none",
                  position: "absolute",
                  top: "0.5em",
                  right: "0.5em",
                  zIndex: 100,
               }}
            >
               {element?.size && element.size > 10 && (
                  <IconButton
                     onMouseDown={(ev) => ev.preventDefault()}
                     onClick={() => {
                        Transforms.setNodes<Element>(editor, { type: "image", size: (element?.size || 0) - 10 });
                     }}
                     icon={<Remove />}
                     aria-label="Reduser størrelse"
                  />
               )}
               {element?.size && element.size < 100 && (
                  <IconButton
                     onMouseDown={(ev) => ev.preventDefault()}
                     onClick={() => {
                        Transforms.setNodes<Element>(editor, { type: "image", size: (element?.size || 0) + 10 });
                     }}
                     icon={<Add />}
                     aria-label="Øk størrelse"
                  />
               )}
            </ButtonGroup>
         </Box>
      </div>
   );
};

type ImageProps = {
   id: string;
   selected?: boolean;
   focused?: boolean;
   size?: number;
};

export const Image = (props: ImageProps) => {
   if (props.id.startsWith("https")) {
      return <ExternalImage {...props} />;
   }
   return <InternalImage {...props} />;
};

const InternalImage = ({ id, selected = false, focused = false, size = 50 }: ImageProps) => {
   const { fileResponse } = useGetGataReportFile(id);
   const imageSrc = fileResponse.data?.data || fileResponse.data?.cloudUrl;
   return (
      <>
         {fileResponse.status === "loading" && <Skeleton variant="rectangular" width={400} height={300} />}
         {fileResponse.data && (
            <ChakraImage
               src={imageSrc}
               sx={{
                  boxShadow: selected && focused ? "0 0 0 3px #B4D5FF" : "none",
                  display: "block",
                  width: `${size}%`,
                  mt: 1,
                  mb: 1,
               }}
            />
         )}
      </>
   );
};

const ExternalImage = ({ id, selected = false, focused = false, size = 50 }: ImageProps) => {
   return (
      <ChakraImage
         src={id}
         sx={{
            boxShadow: selected && focused ? "0 0 0 3px #B4D5FF" : "none",
            display: "block",
            width: `${size}%`,
            mt: 1,
            mb: 1,
         }}
      />
   );
};
