import { useFetcher } from "react-router";
import { Minus, Plus, Trash } from "lucide-react";
import { useEffect } from "react";
import type { Element } from "slate";
import { Transforms } from "slate";
import type { RenderElementProps } from "slate-react";
import { ReactEditor, useFocused, useSelected, useSlate, useSlateStatic } from "slate-react";

import type { loader as fileLoader } from "~/routes/file.$fileId";
import type { action as fileAction } from "~/routes/reportInfo.$reportId/route";
import { cn } from "~/utils";

import { replaceSavingImage } from "./withImages";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export const SlateImage = ({ attributes, children, element }: Partial<RenderElementProps>) => {
   const editor = useSlateStatic();
   const path = ReactEditor.findPath(editor, element!);

   const selected = useSelected();
   const focused = useFocused();
   return (
      <div {...attributes}>
         {children}

         <div contentEditable={false} className="relative">
            <Image id={element?.imageId ?? ""} selected={selected} focused={focused} size={element?.size} />

            <Button
               size="icon"
               onMouseDown={(ev: React.MouseEvent) => ev.preventDefault()}
               onClick={() => {
                  Transforms.removeNodes(editor, { at: path });
               }}
               className={cn(selected && focused ? undefined : "hidden", "absolute top-[0.5em] left-[0.5em] z-50")}
               aria-label="Slett bilde"
            >
               <Trash />
            </Button>
            <div
               className={cn(
                  selected && focused ? undefined : "hidden",
                  "absolute top-[0.5em] right-[0.5em] z-50 space-x-2"
               )}
            >
               {element?.size && element.size > 10 && (
                  <Button
                     size="icon"
                     onMouseDown={(ev: React.MouseEvent) => ev.preventDefault()}
                     onClick={() => {
                        Transforms.setNodes<Element>(editor, { type: "image", size: (element.size || 0) - 10 });
                     }}
                     aria-label="Reduser størrelse"
                  >
                     <Minus />
                  </Button>
               )}
               {element?.size && element.size < 100 && (
                  <Button
                     size="icon"
                     onMouseDown={(ev: React.MouseEvent) => ev.preventDefault()}
                     onClick={() => {
                        Transforms.setNodes<Element>(editor, { type: "image", size: (element.size || 0) + 10 });
                     }}
                     aria-label="Øk størrelse"
                  >
                     <Plus />
                  </Button>
               )}
            </div>
         </div>
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
   const fetcher = useFetcher<typeof fileLoader>();

   const { load } = fetcher;
   useEffect(() => {
      load(`/file/${id}`);
   }, [id, load]);

   const imageSrc = fetcher.data?.data || fetcher.data?.cloudUrl;
   return (
      <>
         {fetcher.state !== "idle" && <Skeleton className="w-[400px] h-[300px]" />}
         {fetcher.data && <ExternalImage id={imageSrc ?? ""} size={size} selected={selected} focused={focused} />}
      </>
   );
};

const ExternalImage = ({ id, selected = false, focused = false, size = 50 }: ImageProps) => {
   return (
      <object data={id} className={cn(selected && focused && "ring", "block my-1")} style={{ width: `${size}%` }}>
         <img src="/image404.png" alt="Not found" />
      </object>
   );
};

export const SavingImage = ({ oldId }: { oldId: string }) => {
   const fetcher = useFetcher<typeof fileAction>({ key: oldId });
   const editor = useSlate();

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data && fetcher.data.intent === "post-file") {
         replaceSavingImage(editor, fetcher.data.file.id, oldId);
      }
   }, [editor, fetcher, oldId]);

   return <Skeleton className="w-[400px] h-[300px]" />;
};
