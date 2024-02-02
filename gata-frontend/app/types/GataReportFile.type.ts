export interface IGataReportFile {
   id: string;
   data?: string;
   cloudId?: string;
   cloudUrl?: string;
}

export interface IGataReportFilePayload {
   data: string;
   reportId: string;
}
