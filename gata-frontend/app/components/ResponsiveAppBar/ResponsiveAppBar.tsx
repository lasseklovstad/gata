import { Link } from "@remix-run/react";
import { Menu } from "lucide-react";

import type { User } from "~/.server/db/user";
import type { Auth0User } from "~/types/Auth0User";

import { UserMenu } from "./UserMenu";
import { isAdmin, isMember } from "../../utils/roleUtils";
import { Button } from "../ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ResponsiveAppBarProps = {
   auth0User: Auth0User | null;
   loggedInUser: User | undefined;
};

export const ResponsiveAppBar = ({ auth0User, loggedInUser }: ResponsiveAppBarProps) => {
   const isUserMember = isMember(loggedInUser);
   const isUserAdmin = isAdmin(loggedInUser);

   const filteredPages = [
      { name: "Hjem", url: "" },
      { name: "Min side", url: `member/${loggedInUser?.id}`, isMember: true },
      { name: "Medlemmer", url: "members", isMember: true },
      { name: "Ansvarsposter", url: "responsibility", isMember: true },
      { name: "Aktuelle dokumenter", url: "report", isMember: true },
      { name: "Arkiv", url: "https://1drv.ms/f/s!Aimiul1gt9LbrA10geM-AnPDKFoY", isMember: true },
   ].filter((page) => {
      return !page.isMember || isUserMember || isUserAdmin;
   });

   const getRole = () => {
      if (isUserAdmin && isUserMember) {
         return "admin og medlem";
      } else if (isUserMember) {
         return "medlem";
      } else if (isUserAdmin) {
         return "admin";
      }
      return "ingen";
   };

   return (
      <header className="bg-primary shadow-xl">
         <div className="py-2 px-4 max-w-[1000px] w-full me-auto ms-auto">
            <div className="flex items-center">
               <img src="/logo192.png" alt="Hesten blå" className="h-[48px] mr-2 hidden md:block" />

               <div className="flex grow md:hidden">
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button aria-label="Åpne meny">
                           <Menu />
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent>
                        {filteredPages.map((page) => {
                           if (page.url.startsWith("https")) {
                              return (
                                 <DropdownMenuItem key={page.url} asChild>
                                    <a href={page.url} target="_blank" rel="noreferrer">
                                       {page.name}
                                    </a>
                                 </DropdownMenuItem>
                              );
                           }
                           return (
                              <DropdownMenuItem key={page.url} asChild>
                                 <Link to={page.url}>{page.name}</Link>
                              </DropdownMenuItem>
                           );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Rolle: {getRole()}</DropdownMenuLabel>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
               <div className="grow md:hidden">
                  <img src="/logo192.png" className="h-[40px]" alt="Hesten blå" />
               </div>

               <div className="grow flex-wrap hidden md:flex gap-1">
                  {filteredPages.map((page) => {
                     if (page.url.startsWith("https")) {
                        return (
                           <Button key={page.url} as="a" href={page.url} target="_blank">
                              {page.name}
                           </Button>
                        );
                     }
                     return (
                        <Button as={Link} to={page.url} key={page.url}>
                           {page.name}
                        </Button>
                     );
                  })}
               </div>

               <UserMenu roleText={getRole()} user={auth0User?.profile} isAuthenticated={!!auth0User} />
            </div>
         </div>
      </header>
   );
};
