import { Link, Outlet } from "@remix-run/react";
import { Plus, Calendar } from "lucide-react";
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
   events: { id: number; title: string }[];
};

export const News = ({ reports, loggedInUser, events }: NewsProps) => {
   const titleId = useId();
   return (
      <PageLayout>
         <div className="flex items-center justify-between flex-wrap mb-4 gap-2">
            <Typography variant="h1" id={titleId}>
               Nyheter
            </Typography>

            <Button as={Link} to="new">
               <Plus className="mr-1" />
               Opprett
            </Button>
         </div>
         <ul className="flex gap-2 flex-wrap mb-2">
            {events.map((event) => (
               <li key={event.id} className="bg-orange-100 rounded py-2 px-4 shadow flex">
                  <Link to={`/event/${event.id}`} className="w-full text-base flex">
                     <Calendar className="mr-2" />
                     {event.title}
                  </Link>
               </li>
            ))}
            <li>
               <Button as={Link} to="new-event" variant="ghost">
                  <Plus className="mr-1" />
                  Nytt arrangement
               </Button>
            </li>
         </ul>
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
