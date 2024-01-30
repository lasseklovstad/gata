import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

import { ClientOnly } from "./ClientOnly";
import { RichTextPreview } from "./RichTextEditor/RichTextPreview";
import { isAdmin } from "./useRoles";
import type { IGataReport } from "../types/GataReport.type";
import type { IGataUser } from "../types/GataUser.type";

type NewsItemProps = {
   report: IGataReport;
   loggedInUser: IGataUser;
};

export const NewsItem = ({ report, loggedInUser }: NewsItemProps) => {
   const canEdit = loggedInUser.id === report.createdBy?.id || isAdmin(loggedInUser);
   return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-end" }}>
         <Flex alignItems="center" width="100%">
            <Heading flex={1} as="h2" size="md">
               {report.title}
            </Heading>
            {canEdit && (
               <Button as={Link} to={`/reportInfo/${report.id}`} variant="ghost">
                  Rediger
               </Button>
            )}
         </Flex>
         <Box boxShadow="xs" rounded={4} sx={{ p: { base: 1, md: 2 }, width: "100%" }}>
            {report.content && (
               <ClientOnly>
                  <RichTextPreview content={report.content} />
               </ClientOnly>
            )}
            {!report.content && <Text>Det er ikke lagt til innhold enda.</Text>}
         </Box>
         <Text fontSize="sm" color="gray">
            Dato endret: {new Date(report.lastModifiedDate).toLocaleDateString()}
         </Text>
      </Box>
   );
};
