import { Box, Heading, List, ListItem, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { Link, Outlet } from "@remix-run/react";

import { NewsItem } from "./NewsItem";
import { PageLayout } from "../../components/PageLayout";
import type { IGataReport } from "../../types/GataReport.type";
import type { IGataUser } from "../../types/GataUser.type";
import type { Page } from "../../types/Page.type";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { useId } from "react";

type NewsProps = {
   reportPage: Page<IGataReport>;
   loggedInUser: IGataUser;
};

export const News = ({ reportPage, loggedInUser }: NewsProps) => {
   const titleId = useId();
   return (
      <PageLayout>
         <div className="flex items-center justify-between flex-wrap mb-4">
            <Typography variant="h1" id={titleId}>
               Nyheter
            </Typography>
            <Button asChild>
               <Link to="new">
                  <Plus className="mr-1" />
                  Opprett
               </Link>
            </Button>
         </div>
         <ul aria-labelledby={titleId}>
            {reportPage.content.map((report) => {
               return (
                  <li key={report.id}>
                     <NewsItem report={report} loggedInUser={loggedInUser} />
                  </li>
               );
            })}
            {reportPage.totalElements === 0 && (
               <li>
                  <Text>Det finnes ingen nyheter</Text>
               </li>
            )}
         </ul>
         <Outlet />
      </PageLayout>
   );
};
