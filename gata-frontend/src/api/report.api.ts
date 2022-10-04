import { useCallback, useEffect } from "react";
import { Descendant } from "slate";
import { GataReportType, IGataReport, IGataReportPayload } from "../types/GataReport.type";
import { useClient } from "./client/useClient";
import { Page } from "../types/Page.type";
import { useRoles } from "../components/useRoles";

export const useGetGataReports = (page: number, type: GataReportType) => {
   const [reportResponse, clientFetch] = useClient<Page<IGataReport>, never>();

   useEffect(() => {
      clientFetch(`report?page=${page - 1}&type=${type}`);
   }, [clientFetch, page, type]);

   return { reportResponse };
};

export const useGetGataReport = (id: string) => {
   const { isAdmin, user } = useRoles();
   const [reportResponse, clientFetch] = useClient<IGataReport, never>();
   const hasCreated = user?.externalUserProviders.find(
      (externalUser) => externalUser.id === reportResponse.data?.createdBy?.externalUserProviderId
   );
   const isNews = reportResponse.data?.type === "NEWS";
   const canEdit = isAdmin || (hasCreated && isNews);
   const getReport = useCallback(() => {
      return clientFetch(`report/${id}`);
   }, [clientFetch, id]);

   useEffect(() => {
      getReport();
   }, [getReport]);

   return { reportResponse, getReport, canEdit };
};

export const useDatabaseSize = () => {
   const [sizeResponse, clientFetch] = useClient<string, never>();

   const getDatabaseSize = useCallback(() => {
      return clientFetch("report/databasesize");
   }, [clientFetch]);

   useEffect(() => {
      getDatabaseSize();
   }, [getDatabaseSize]);

   return { sizeResponse, getDatabaseSize };
};

export const useGetReportEmails = () => {
   const [emailsResponse, clientFetch] = useClient<string[], never>();

   useEffect(() => {
      clientFetch(`report/publishemails`);
   }, [clientFetch]);

   return { emailsResponse };
};

export const usePublishReport = (id: string) => {
   const [publishResponse, clientFetch] = useClient<string[], never>();

   const publishReport = () => {
      return clientFetch(`report/${id}/publish`);
   };

   return { publishResponse, publishReport };
};

export const useSaveGataReport = () => {
   const [saveResponse, clientFetch] = useClient<IGataReport, IGataReportPayload>();

   const putReport = (id: string, body: IGataReportPayload) => {
      return clientFetch(`report/${id}`, { method: "PUT", body });
   };

   const postReport = (body: IGataReportPayload) => {
      return clientFetch("report", { method: "POST", body });
   };

   const deleteReport = (id: string) => {
      return clientFetch(`report/${id}`, { method: "DELETE" });
   };

   return { saveResponse, putReport, postReport, deleteReport };
};

export const usePutGataReportContent = (id: string) => {
   const [putReportResponse, clientFetch] = useClient<IGataReport, Descendant[]>();

   const putReportContent = (body: Descendant[]) => {
      return clientFetch(`report/${id}/content`, { method: "PUT", body });
   };

   return { putReportResponse, putReportContent };
};
