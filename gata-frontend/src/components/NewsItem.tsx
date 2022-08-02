import { IGataReport } from "../types/GataReport.type";
import { useGetGataReport } from "../api/report.api";
import { RichTextPreview } from "./RichTextEditor/RichTextPreview";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";

type NewsItemProps = {
   simpleReport: IGataReport;
};

export const NewsItem = ({ simpleReport }: NewsItemProps) => {
   const { reportResponse, canEdit } = useGetGataReport(simpleReport.id);
   return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-end" }}>
         {canEdit && (
            <Button component={Link} to={`report/${simpleReport.id}`}>
               Rediger
            </Button>
         )}
         <Paper variant="outlined" sx={{ p: { xs: 1, md: 2 }, width: "100%" }}>
            {reportResponse.data?.content && <RichTextPreview content={reportResponse.data.content} />}
            {!reportResponse.data?.content && <Typography gutterBottom>Det er ikke lagt til innhold enda.</Typography>}
         </Paper>
         <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Dato endret: {new Date(simpleReport.lastModifiedDate).toLocaleDateString()}
         </Typography>
      </Box>
   );
};
