import { useCallback, useEffect, useRef, useState } from "react";
import { client } from "./client";
import { ClientConfigType, RequestBodyBase, UseClientState } from "./client.types";
import { useAuth0 } from "@auth0/auth0-react";

export type DefaultResponseTypes = Record<string, any> | number | string | boolean;

export const useClient = <ResponseBody extends DefaultResponseTypes, RequestBody extends RequestBodyBase>() => {
   const [clientState, setClientState] = useState<UseClientState<ResponseBody>>({
      status: "idle",
   });

   const updateData = (callback: ResponseBody | ((data: ResponseBody | undefined) => ResponseBody)) => {
      if (typeof callback === "function") {
         setClientState((state) => ({ ...state, data: callback(state.data) }));
      } else {
         setClientState((state) => ({ ...state, data: callback }));
      }
   };

   const { getAccessTokenSilently, isAuthenticated } = useAuth0();
   const controller = useRef<AbortController>();
   const fetchClient = useCallback(
      async (url: string, config?: Omit<ClientConfigType<RequestBody>, "signal">) => {
         setClientState({
            status: "loading",
         });
         controller.current = new AbortController();
         const token = isAuthenticated ? await getAccessTokenSilently() : undefined;
         return client<ResponseBody, RequestBody>(url, {
            ...config,
            signal: controller.current.signal,
            token,
         })
            .then((data) => {
               const state = {
                  error: undefined,
                  data,
                  status: "success" as const,
               };
               setClientState(state);
               return state;
            })
            .catch((error: Error) => {
               const state = {
                  error: error,
                  status: "error" as const,
                  data: undefined,
               };
               setClientState(state);
               return state;
            });
      },
      [getAccessTokenSilently, isAuthenticated]
   );

   useEffect(() => {
      return () => {
         controller.current?.abort();
      };
   }, []);

   return [clientState, fetchClient, updateData] as const;
};
