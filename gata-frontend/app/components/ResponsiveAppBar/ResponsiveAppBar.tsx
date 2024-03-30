import { Link } from "@remix-run/react";
import type { Auth0Profile } from "remix-auth-auth0";

import { Menu } from "lucide-react";
import type { IGataUser } from "../../types/GataUser.type";
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
import { UserMenu } from "./UserMenu";

type ResponsiveAppBarProps = {
   loggedInUser: IGataUser | undefined;
   isAuthenticated: boolean;
   user: Auth0Profile | undefined;
};

export const ResponsiveAppBar = ({ loggedInUser, user, isAuthenticated }: ResponsiveAppBarProps) => {
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
                                    <a href={page.url} target="_blank">
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
                           <Button asChild>
                              <a href={page.url} target="_blank">
                                 {page.name}
                              </a>
                           </Button>
                        );
                     }
                     return (
                        <Button asChild>
                           <Link to={page.url}>{page.name}</Link>
                        </Button>
                     );
                  })}
               </div>

               <UserMenu roleText={getRole()} user={user} isAuthenticated={isAuthenticated} />
            </div>
         </div>
      </header>
   );
};
