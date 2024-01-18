import { Box, Button, Divider, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import { Link, LoaderFunction, Outlet, json, useLoaderData } from "react-router-dom";

import { client } from "../../api/client/client";
import { getRequiredAccessToken } from "../../auth0Client";
import { ListItemLink } from "../../components/ListItemLink";
import { PageLayout } from "../../components/PageLayout";
import { isAdmin } from "../../components/useRoles";
import { IGataReportSimple } from "../../types/GataReport.type";
import { IGataUser } from "../../types/GataUser.type";
import { Page } from "../../types/Page.type";

export const reportPageLoader: LoaderFunction = async ({ request: { signal } }) => {
   const token = await getRequiredAccessToken();
   const reports = await client<Page<IGataReportSimple>>(`report/simple?page=0&type=DOCUMENT`, { token, signal });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token, signal });
   return json<ReportPageLoaderData>({ reports, loggedInUser });
};

interface ReportPageLoaderData {
   reports: Page<IGataReportSimple>;
   loggedInUser: IGataUser;
}

export const ReportPage = () => {
   const { loggedInUser, reports } = useLoaderData() as ReportPageLoaderData;
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
            {isAdmin(loggedInUser) && (
               <Button leftIcon={<Add />} as={Link} to="new">
                  Opprett
               </Button>
            )}
         </Box>
         <List aria-labelledby="report-page-title">
            {reports.content.map((report) => {
               return (
                  <ListItemLink key={report.id} to={`/reportInfo/${report.id}`}>
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
            {reports.totalElements === 0 && (
               <ListItem>
                  <Text>Det finnes ingen dokumenter enda!</Text>
               </ListItem>
            )}
         </List>
         <Outlet />
      </PageLayout>
   );
};
