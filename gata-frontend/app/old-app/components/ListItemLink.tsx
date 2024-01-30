import { ListItem } from "@chakra-ui/react";
import { Link, LinkProps } from "@remix-run/react";

type ListItemLinkProps = Pick<LinkProps, "to" | "children">;

export const ListItemLink = ({ to, children }: ListItemLinkProps) => {
   return (
      <ListItem sx={{ "& :hover": { bg: "gray.100" } }}>
         <Link to={to}>{children}</Link>
      </ListItem>
   );
};
