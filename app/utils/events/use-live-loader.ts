import { useEffect } from "react";
import { useLoaderData, useResolvedPath, useRevalidator } from "react-router";
import { useEventSource } from "remix-utils/sse/react";

export function useLiveLoader<T>() {
   const path = useResolvedPath("./stream");
   const data = useEventSource(path.pathname);

   // eslint-disable-next-line @typescript-eslint/unbound-method
   const { revalidate } = useRevalidator();

   useEffect(() => {
      void revalidate();
   }, [data]);

   return useLoaderData<T>();
}
