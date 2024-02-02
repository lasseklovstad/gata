import { Box, Button, Divider, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { ListItemLink } from "~/components/ListItemLink";
import { PageLayout } from "~/components/PageLayout";
import { isAdmin } from "~/utils/roleUtils";
import type { IGataReportSimple } from "~/types/GataReport.type";
import type { IGataUser } from "~/types/GataUser.type";
import type { Page } from "~/types/Page.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const reports = await client<Page<IGataReportSimple>>(`report/simple?page=0&type=DOCUMENT`, { token });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   return json({ reports, loggedInUser });
};

export default function ReportPage() {
   const { loggedInUser, reports } = useLoaderData<typeof loader>();
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
}
