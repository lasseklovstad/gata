import { Link, Outlet } from "@remix-run/react";
import { Plus } from "lucide-react";
import { useId } from "react";

import type { GataReport } from "db/schema";
import type { User } from "~/.server/db/user";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

import { NewsItem } from "./NewsItem";
import { PageLayout } from "../../components/PageLayout";

type NewsProps = {
   reports: Pick<GataReport, "id" | "title" | "content" | "createdBy" | "lastModifiedDate">[];
   loggedInUser: User;
};

export const News = ({ reports, loggedInUser }: NewsProps) => {
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
            {reports.map((report) => {
               return (
                  <li key={report.id}>
                     <NewsItem report={report} loggedInUser={loggedInUser} />
                  </li>
               );
            })}
            {reports.length === 0 && <li>Det finnes ingen nyheter</li>}
         </ul>
         <Outlet />
      </PageLayout>
   );
};
