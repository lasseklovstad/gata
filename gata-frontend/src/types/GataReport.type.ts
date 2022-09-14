import { ISimpleGataUser } from "./GataUser.type";

export interface IGataReport {
   id: string;
   title: string;
   description: string;
   createdDate: string;
   lastModifiedDate: string;
   lastModifiedBy: string;
   content: string | null;
   type: GataReportType;
   createdBy?: ISimpleGataUser;
}

export interface IGataReportPayload {
   title: string;
   description: string;
   type: GataReportType;
}

export type GataReportType = "DOCUMENT" | "NEWS";
