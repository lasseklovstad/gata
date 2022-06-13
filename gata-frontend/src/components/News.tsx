import { useState } from "react";
import { useGetGataReports } from "../api/report.api";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { Box, Button, List, ListItem, ListItemText, Pagination, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { GataReportFormDialog } from "./GataReportFormDialog";
import { Loading } from "./Loading";
import { NewsItem } from "./NewsItem";

export const News = () => {
   const [page, setPage] = useState(1);
   const { reportResponse } = useGetGataReports(page, "NEWS");
   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
   const navigate = useNavigate();
   return (
      <PageLayout>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="h1" id="news-page-title">
               Nyheter
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setIsReportModalOpen(true)}>
               Opprett
            </Button>
         </Box>
         {isReportModalOpen && (
            <GataReportFormDialog
               onClose={() => setIsReportModalOpen(false)}
               onSuccess={(r) => navigate(`/report/${r.id}`)}
               type="NEWS"
            />
         )}
         <Loading response={reportResponse} />
         {reportResponse.data && (
            <List aria-labelledby="news-page-title">
               {reportResponse.data.content.map((report) => {
                  return (
                     <ListItem key={report.id} disableGutters>
                        <NewsItem simpleReport={report} />
                     </ListItem>
                  );
               })}
               {reportResponse.data.totalElements === 0 && (
                  <ListItem>
                     <ListItemText>Det finnes ingen nyheter</ListItemText>
                  </ListItem>
               )}
            </List>
         )}
         <Pagination count={reportResponse.data?.totalPages || 0} page={page} onChange={(_, value) => setPage(value)} />
      </PageLayout>
   );
};
