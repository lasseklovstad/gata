import { IGataReport } from "../types/GataReport.type";
import { useGetGataReport } from "../api/report.api";
import { RichTextPreview } from "./RichTextEditor/RichTextPreview";
import { Link } from "react-router-dom";
import { Text, Box, Button } from "@chakra-ui/react";

type NewsItemProps = {
   simpleReport: IGataReport;
};

export const NewsItem = ({ simpleReport }: NewsItemProps) => {
   const { reportResponse, canEdit } = useGetGataReport(simpleReport.id);
   return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-end" }}>
         {canEdit && (
            <Button as={Link} to={`report/${simpleReport.id}`} variant="ghost">
               Rediger
            </Button>
         )}
         <Box boxShadow="xs" rounded={4} sx={{ p: { base: 1, md: 2 }, width: "100%" }}>
            {reportResponse.data?.content && <RichTextPreview content={reportResponse.data.content} />}
            {!reportResponse.data?.content && <Text>Det er ikke lagt til innhold enda.</Text>}
         </Box>
         <Text fontSize="sm" color="gray">
            Dato endret: {new Date(simpleReport.lastModifiedDate).toLocaleDateString()}
         </Text>
      </Box>
   );
};
