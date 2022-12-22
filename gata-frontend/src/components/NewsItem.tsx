import { IGataReport } from "../types/GataReport.type";
import { RichTextPreview } from "./RichTextEditor/RichTextPreview";
import { Link } from "react-router-dom";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { IGataUser } from "../types/GataUser.type";

type NewsItemProps = {
   report: IGataReport;
   loggedInUser: IGataUser;
};

export const NewsItem = ({ report, loggedInUser }: NewsItemProps) => {
   const canEdit = loggedInUser.id === report.createdBy?.id;
   return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-end" }}>
         <Flex alignItems="center" width="100%">
            <Text flex={1}>{report.title}</Text>
            {canEdit && (
               <Button as={Link} to={`/reportInfo/${report.id}`} variant="ghost">
                  Rediger
               </Button>
            )}
         </Flex>
         <Box boxShadow="xs" rounded={4} sx={{ p: { base: 1, md: 2 }, width: "100%" }}>
            {report.content && <RichTextPreview content={report.content} />}
            {!report.content && <Text>Det er ikke lagt til innhold enda.</Text>}
         </Box>
         <Text fontSize="sm" color="gray">
            Dato endret: {new Date(report.lastModifiedDate).toLocaleDateString()}
         </Text>
      </Box>
   );
};
