import { Minus, Plus, Trash } from "lucide-react";
import type { Element } from "slate";
import { Transforms } from "slate";
import type { RenderElementProps } from "slate-react";
import { ReactEditor, useFocused, useSelected, useSlateStatic } from "slate-react";

import { cn } from "~/utils";
import { transformCloudflare } from "~/utils/file.utils";

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

export const Image = ({ id, selected = false, focused = false, size = 50 }: ImageProps) => {
   return (
      <img
         src={transformCloudflare(id, 1200)}
         alt=""
         className={cn(selected && focused && "ring", "block my-1 max-md:!w-full")}
         style={{ width: `${size}%` }}
      />
   );
};

export const SavingImage = () => {
   return <Skeleton className="w-[400px] h-[300px]" />;
};
