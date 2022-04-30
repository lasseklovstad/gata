import { Add } from "@mui/icons-material";
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetGataReports } from "../api/report.api";
import { GataReportFormDialog } from "../components/GataReportFormDialog";
import { Loading } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";

export const ReportPage = () => {
   const { reportResponse } = useGetGataReports();
   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
   const navigate = useNavigate();
   return (
      <PageLayout>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="h1" id="report-page-title">
               Referat
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setIsReportModalOpen(true)}>
               Opprett
            </Button>
         </Box>
         {isReportModalOpen && (
            <GataReportFormDialog onClose={() => setIsReportModalOpen(false)} onSuccess={(r) => navigate(r.id)} />
         )}
         <Loading response={reportResponse} />
         {reportResponse.data && (
            <List aria-labelledby="report-page-title">
               {reportResponse.data.map((report) => {
                  return (
                     <ListItemButton key={report.id} divider component={Link} to={report.id}>
                        <ListItemText primary={report.title} secondary={report.description} />
                     </ListItemButton>
                  );
               })}
               {reportResponse.data.length === 0 && (
                  <ListItem>
                     <ListItemText>Det finnes ingen referat enda!</ListItemText>
                  </ListItem>
               )}
            </List>
         )}
      </PageLayout>
   );
};
