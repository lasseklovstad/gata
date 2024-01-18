import { useCallback, useEffect } from "react";

import { useClient } from "./client/useClient";
import { IGataReportFile, IGataReportFilePayload } from "../types/GataReportFile.type";

export const useGetGataReportFile = (fileId: string) => {
   const [fileResponse, clientFetch] = useClient<IGataReportFile, never>();

   const getReportFile = useCallback(() => {
      return clientFetch(`file/${fileId}`);
   }, [clientFetch, fileId]);

   useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      getReportFile();
   }, [getReportFile]);

   return { fileResponse, getReportFile };
};
export const usePostGataReportFile = (reportId: string) => {
   const [fileResponse, clientFetch] = useClient<IGataReportFile, IGataReportFilePayload>();

   const postReportFile = useCallback(
      (data: string) => {
         return clientFetch("file/cloud", { body: { data, reportId } }).then((response) => response.data);
      },
      [clientFetch, reportId]
   );

   return { fileResponse, postReportFile };
};
