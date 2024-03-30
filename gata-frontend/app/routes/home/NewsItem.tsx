import { Link } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ClientOnly } from "../../components/ClientOnly";
import { RichTextPreview } from "../../components/RichTextEditor/RichTextPreview";
import type { IGataReport } from "../../types/GataReport.type";
import type { IGataUser } from "../../types/GataUser.type";
import { isAdmin } from "../../utils/roleUtils";

type NewsItemProps = {
   report: IGataReport;
   loggedInUser: IGataUser;
};

export const NewsItem = ({ report, loggedInUser }: NewsItemProps) => {
   const canEdit = loggedInUser.id === report.createdBy?.id || isAdmin(loggedInUser);
   return (
      <div className="flex flex-col w-full items-end">
         <div className="flex items-center justify-between w-full">
            <Typography variant="h2">{report.title}</Typography>
            {canEdit && (
               <Button variant="ghost">
                  <Link to={`/reportInfo/${report.id}`}>Rediger</Link>
               </Button>
            )}
         </div>
         <div className="border-[1.7px] shadow-md rounded-md w-full p-4 ">
            {report.content && (
               <ClientOnly>
                  <RichTextPreview content={report.content} />
               </ClientOnly>
            )}
            {!report.content && <Typography>Det er ikke lagt til innhold enda.</Typography>}
         </div>
         <Typography className="text-gray-600">
            Dato endret: {new Date(report.lastModifiedDate).toLocaleDateString("no")}
         </Typography>
      </div>
   );
};
