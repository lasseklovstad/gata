import { Box, Button, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import { Link, Outlet } from "@remix-run/react";

import { NewsItem } from "./NewsItem";
import { PageLayout } from "../../components/PageLayout";
import type { IGataReport } from "../../types/GataReport.type";
import type { IGataUser } from "../../types/GataUser.type";
import type { Page } from "../../types/Page.type";

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
