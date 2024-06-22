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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const open = () => {
      dialogRef.current?.showModal();
   };

   const close = useCallback(() => {
      dialogRef.current?.close();
   }, []);

   return { dialogRef, open, close };
};
