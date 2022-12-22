import { ISimpleGataUser } from "./GataUser.type";

export interface IGataReport {
   id: string;
   title: string;
   description: string;
   createdDate: string;
   lastModifiedDate: string;
   lastModifiedBy: string | null;
   content: string | null;
   type: GataReportType;
   createdBy?: ISimpleGataUser;
}

export interface IGataReportSimple {
   id: string;
   title: string;
   description: string;
   createdDate: string;
   lastModifiedDate: string;
   lastModifiedBy: string | null;
   type: GataReportType;
}

export interface IGataReportPayload {
   title: string;
   description: string;
   type: GataReportType;
}

export type GataReportType = "DOCUMENT" | "NEWS";
