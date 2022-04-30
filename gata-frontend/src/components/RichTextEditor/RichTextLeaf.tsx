import { Typography } from "@mui/material";
import { RenderLeafProps } from "slate-react";

export const RichTextLeaf = ({ leaf, attributes, children }: Partial<RenderLeafProps>) => {
   return (
      <Typography
         {...attributes}
         component="span"
         variant="inherit"
         fontWeight={({ typography: { fontWeightBold, fontWeightRegular } }) =>
            leaf?.bold ? fontWeightBold : fontWeightRegular
         }
         sx={{ textDecoration: leaf?.underline ? "underline" : "none", fontStyle: leaf?.italic ? "italic" : "none" }}
      >
         {children}
      </Typography>
   );
};
