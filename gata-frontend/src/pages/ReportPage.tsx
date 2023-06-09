import { Add } from "@mui/icons-material";
import { Box, Button, List, ListItem, Heading, Text, Divider } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabaseSize, useGetGataReports } from "../api/report.api";
import { GataReportFormDialog } from "../components/GataReportFormDialog";
import { Loading } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";
import { useRoles } from "../components/useRoles";
import { ListItemLink } from "../components/ListItemLink";

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
            <Heading variant="h1" id="report-page-title">
               Aktuelle dokumenter
            </Heading>
            <Text>{sizeResponse.data && `${parseInt(sizeResponse.data) / 10} % brukt`}</Text>
            {isAdmin && (
               <Button leftIcon={<Add />} onClick={() => setIsReportModalOpen(true)}>
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
                     <ListItemLink key={report.id} to={report.id}>
                        <Box py={2}>
                           <Text>{report.title}</Text>
                           <Text color="gray" fontSize="sm">
                              {report.description}
                           </Text>
                        </Box>
                        <Divider />
                     </ListItemLink>
                  );
               })}
               {reportResponse.data.totalElements === 0 && (
                  <ListItem>
                     <Text>Det finnes ingen dokumenter enda!</Text>
                  </ListItem>
               )}
            </List>
         )}
      </PageLayout>
   );
};
