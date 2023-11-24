import { Add } from "@mui/icons-material";
import { Box, Button, Divider, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { getRequiredAuthToken } from "~/utils/auth.server";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { client } from "~/old-app/api/client/client";
import { ListItemLink } from "~/old-app/components/ListItemLink";
import { PageLayout } from "~/old-app/components/PageLayout";
import { isAdmin } from "~/old-app/components/useRoles";
import type { IGataReportSimple } from "~/old-app/types/GataReport.type";
import type { IGataUser } from "~/old-app/types/GataUser.type";
import type { Page } from "~/old-app/types/Page.type";

export const loader: LoaderFunction = async ({ request }) => {
   const token = await getRequiredAuthToken(request);
   const reports = await client<Page<IGataReportSimple>>(`report/simple?page=0&type=DOCUMENT`, { token });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   const databaseSize = await client<string>("report/databasesize", { token });
   return json<ReportPageLoaderData>({ reports, loggedInUser, databaseSize });
};

interface ReportPageLoaderData {
   reports: Page<IGataReportSimple>;
   loggedInUser: IGataUser;
   databaseSize: string;
}

export default function ReportPage() {
   const { loggedInUser, reports, databaseSize } = useLoaderData() as ReportPageLoaderData;
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
            <Text>{parseInt(databaseSize) / 10}% brukt</Text>
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
}
