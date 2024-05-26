import { Link, Outlet } from "@remix-run/react";
import { Plus } from "lucide-react";
import { useId } from "react";

import type { User } from "~/.server/db/user";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

import { NewsItem } from "./NewsItem";
import { PageLayout } from "../../components/PageLayout";
import type { IGataReport } from "../../types/GataReport.type";
import type { Page } from "../../types/Page.type";

type NewsProps = {
   reportPage: Page<IGataReport>;
   loggedInUser: User;
};

export const News = ({ reportPage, loggedInUser }: NewsProps) => {
   const titleId = useId();
   return (
      <PageLayout>
         <div className="flex items-center justify-between flex-wrap mb-4">
            <Typography variant="h1" id={titleId}>
               Nyheter
            </Typography>
            <Button as={Link} to="new">
               <Plus className="mr-1" />
               Opprett
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
            {reportPage.totalElements === 0 && <li>Det finnes ingen nyheter</li>}
         </ul>
         <Outlet />
      </PageLayout>
   );
};
