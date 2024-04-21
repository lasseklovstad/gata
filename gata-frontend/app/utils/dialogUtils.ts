import { useRef, useEffect } from "react";

type UseDialogProps = {
   defaultOpen: boolean;
};

export const useDialog = ({ defaultOpen }: UseDialogProps) => {
   const dialogRef = useRef<HTMLDialogElement>(null);

   useEffect(() => {
      if (dialogRef.current && defaultOpen && !dialogRef.current.open) {
         dialogRef.current.showModal();
      }
   }, []);

   return { dialogRef };
};
