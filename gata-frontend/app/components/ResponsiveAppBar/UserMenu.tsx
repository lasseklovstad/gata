import { Form, Link } from "@remix-run/react";
import type { Auth0Profile } from "remix-auth-auth0";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

type UserMenuProps = {
   roleText: string;
   isAuthenticated: boolean;
   user: Auth0Profile | undefined;
};

export const UserMenu = ({ roleText, user, isAuthenticated }: UserMenuProps) => {
   const photo = user && user.photos && user.photos[0] ? user.photos[0].value : "";
   return (
      <>
         {isAuthenticated && (
            <>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button aria-label="Åpne meny" size="icon">
                        <img src={photo} className="rounded-full w-[35px]" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem asChild>
                        <Link to="/logout">Logg ut</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link to="/privacy">Privacy</Link>
                     </DropdownMenuItem>
                     <DropdownMenuLabel>Rolle: {roleText}</DropdownMenuLabel>
                  </DropdownMenuContent>
               </DropdownMenu>
            </>
         )}
         {!isAuthenticated && (
            <Form method="POST" action="/login">
               <Button type="submit">Logg inn</Button>
            </Form>
         )}
      </>
   );
};
