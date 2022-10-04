import { useState } from "react";
import { useGetGataReports } from "../api/report.api";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { Add } from "@mui/icons-material";
import { GataReportFormDialog } from "./GataReportFormDialog";
import { Loading } from "./Loading";
import { NewsItem } from "./NewsItem";
import { Box, Button, Heading, List, ListItem, Text } from "@chakra-ui/react";

export const News = () => {
   const [page] = useState(1);
   const { reportResponse } = useGetGataReports(page, "NEWS");
   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
   const navigate = useNavigate();
   return (
      <PageLayout>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <Heading as="h1" id="news-page-title">
               Nyheter
            </Heading>
            <Button leftIcon={<Add />} onClick={() => setIsReportModalOpen(true)}>
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
                     <ListItem key={report.id}>
                        <NewsItem simpleReport={report} />
                     </ListItem>
                  );
               })}
               {reportResponse.data.totalElements === 0 && (
                  <ListItem>
                     <Text>Det finnes ingen nyheter</Text>
                  </ListItem>
               )}
            </List>
         )}
      </PageLayout>
   );
};
