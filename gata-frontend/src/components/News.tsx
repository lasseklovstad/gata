import { Link, Outlet } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { Add } from "@mui/icons-material";
import { NewsItem } from "./NewsItem";
import { Box, Button, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { Page } from "../types/Page.type";
import { IGataReport } from "../types/GataReport.type";
import { IGataUser } from "../types/GataUser.type";

type NewsProps = {
   reportPage: Page<IGataReport>;
   loggedInUser: IGataUser;
};

export const News = ({ reportPage, loggedInUser }: NewsProps) => {
   return (
      <PageLayout>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <Heading as="h1" id="news-page-title">
               Nyheter
            </Heading>
            <Button leftIcon={<Add />} as={Link} to="new">
               Opprett
            </Button>
         </Box>
         <List aria-labelledby="news-page-title">
            {reportPage.content.map((report) => {
               return (
                  <ListItem key={report.id}>
                     <NewsItem report={report} loggedInUser={loggedInUser} />
                  </ListItem>
               );
            })}
            {reportPage.totalElements === 0 && (
               <ListItem>
                  <Text>Det finnes ingen nyheter</Text>
               </ListItem>
            )}
         </List>
         <Outlet />
      </PageLayout>
   );
};
