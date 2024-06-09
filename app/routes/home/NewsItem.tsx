import { Link } from "@remix-run/react";
import { Edit } from "lucide-react";

import type { GataReport } from "db/schema";
import type { User } from "~/.server/db/user";
import { ButtonResponsive } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

import { ClientOnly } from "../../components/ClientOnly";
import { RichTextPreview } from "../../components/RichTextEditor/RichTextPreview";
import { isAdmin } from "../../utils/roleUtils";

type NewsItemProps = {
   report: Pick<GataReport, "id" | "title" | "content" | "createdBy" | "lastModifiedDate">;
   loggedInUser: User;
};

export const NewsItem = ({ report, loggedInUser }: NewsItemProps) => {
   const canEdit = loggedInUser.id === report.createdBy || isAdmin(loggedInUser);
   return (
      <div className="flex flex-col w-full items-end gap-2">
         <div className="flex items-center justify-between w-full">
            <Typography variant="h2">{report.title}</Typography>
            {canEdit && (
               <ButtonResponsive
                  variant="ghost"
                  as={Link}
                  to={`/reportInfo/${report.id}`}
                  label="Rediger"
                  icon={<Edit />}
               />
            )}
         </div>
         <div className="border rounded-md w-full p-4 ">
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
