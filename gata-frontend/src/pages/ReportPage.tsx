import { Add } from "@mui/icons-material";
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Pagination, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDatabaseSize, useGetGataReports } from "../api/report.api";
import { GataReportFormDialog } from "../components/GataReportFormDialog";
import { Loading } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";
import { useRoles } from "../components/useRoles";

export const ReportPage = () => {
   const { isAdmin } = useRoles();
   const [page, setPage] = useState(1);
   const { reportResponse } = useGetGataReports(page, "DOCUMENT");
   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
   const { sizeResponse } = useDatabaseSize();
   const navigate = useNavigate();
   return (
      <PageLayout>
         <Box
            sx={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               flexWrap: "wrap",
            }}
         >
            <Typography variant="h1" id="report-page-title">
               Aktuelle dokumenter
            </Typography>
            <Typography variant="body1">{sizeResponse.data && `(${sizeResponse.data}/ 1GB)`}</Typography>
            {isAdmin && (
               <Button variant="contained" startIcon={<Add />} onClick={() => setIsReportModalOpen(true)}>
                  Opprett
               </Button>
            )}
         </Box>
         {isReportModalOpen && (
            <GataReportFormDialog
               onClose={() => setIsReportModalOpen(false)}
               onSuccess={(r) => navigate(r.id)}
               type="DOCUMENT"
            />
         )}
         <Loading response={reportResponse} />
         {reportResponse.data && (
            <List aria-labelledby="report-page-title">
               {reportResponse.data.content.map((report) => {
                  return (
                     <ListItemButton key={report.id} divider component={Link} to={report.id}>
                        <ListItemText primary={report.title} secondary={report.description} />
                     </ListItemButton>
                  );
               })}
               {reportResponse.data.totalElements === 0 && (
                  <ListItem>
                     <ListItemText>Det finnes ingen dokumenter enda!</ListItemText>
                  </ListItem>
               )}
            </List>
         )}
         <Pagination count={reportResponse.data?.totalPages || 0} page={page} onChange={(_, value) => setPage(value)} />
      </PageLayout>
   );
};
