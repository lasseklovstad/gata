import { useEffect } from "react";
import { useResolvedPath, useRevalidator } from "react-router";
import { useEventSource } from "remix-utils/sse/react";

export function useLiveLoader() {
   const path = useResolvedPath("./stream");
   const data = useEventSource(path.pathname);

   const { revalidate } = useRevalidator();

   useEffect(() => {
      void revalidate();
   }, [data]);
}
