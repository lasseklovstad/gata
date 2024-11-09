import { useRef, useEffect, useCallback } from "react";

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

   const open = () => {
      dialogRef.current?.showModal();
   };

   const close = useCallback(() => {
      dialogRef.current?.close();
   }, []);

   return { dialogRef, open, close };
};
