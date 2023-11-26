import { ListItem } from "@chakra-ui/react";
import { Link, LinkProps } from "react-router-dom";

type ListItemLinkProps = Pick<LinkProps, "to" | "children">;

export const ListItemLink = ({ to, children }: ListItemLinkProps) => {
   return (
      <ListItem sx={{ "& :hover": { bg: "gray.100" } }}>
         <Link to={to}>{children}</Link>
      </ListItem>
   );
};
