import { Box, ButtonGroup, Image as ChakraImage, IconButton, Skeleton } from "@chakra-ui/react";
import { Add, Delete, Remove } from "@mui/icons-material";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import type { Element } from "slate";
import { Transforms } from "slate";
import type { RenderElementProps } from "slate-react";
import { ReactEditor, useFocused, useSelected, useSlate, useSlateStatic } from "slate-react";

import type { IGataReportFile } from "~/old-app/types/GataReportFile.type";

import { replaceSavingImage } from "./withImages";

export const SlateImage = ({ attributes, children, element }: Partial<RenderElementProps>) => {
   const editor = useSlateStatic();
   const path = ReactEditor.findPath(editor, element!);

   const selected = useSelected();
   const focused = useFocused();
   return (
      <div {...attributes}>
         {children}

         <Box contentEditable={false} position="relative">
            <Image id={element.imageId!} selected={selected} focused={focused} size={element?.size} />

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
   savingImageData?: string;
};

export const Image = (props: ImageProps) => {
   if (props.id.startsWith("https")) {
      return <ExternalImage {...props} />;
   }
   return <InternalImage {...props} />;
};

const InternalImage = ({ id, selected = false, focused = false, size = 50 }: ImageProps) => {
   const fetcher = useFetcher<IGataReportFile>();

   useEffect(() => {
      fetcher.load(`/file/${id}`);
   }, [id]);

   const imageSrc = fetcher.data?.data || fetcher.data?.cloudUrl;
   return (
      <>
         {fetcher.state !== "idle" && <Skeleton variant="rectangular" width={400} height={300} />}
         {fetcher.data && (
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

export const SavingImage = ({ oldId }: { oldId: string }) => {
   const fetcher = useFetcher<{ id: string }>({ key: oldId });
   const editor = useSlate();

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data) {
         replaceSavingImage(editor, fetcher.data.id, oldId);
      }
   }, [editor, fetcher, oldId]);
   return <Skeleton variant="rectangular" width={400} height={300} />;
};
