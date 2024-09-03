import { Link } from "@remix-run/react";

import type { ExternalUser } from "db/schema";
import type { User } from "~/.server/db/user";

import { SideBar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { isAdmin, isMember } from "../../utils/roleUtils";
import { Button } from "../ui/button";

type ResponsiveAppBarProps = {
   auth0User: ExternalUser | null;
   loggedInUser: User | undefined;
   pwaPublicKey: string;
};

export const ResponsiveAppBar = ({ auth0User, loggedInUser, pwaPublicKey }: ResponsiveAppBarProps) => {
   const isUserMember = isMember(loggedInUser);
   const isUserAdmin = isAdmin(loggedInUser);

   const filteredPages = [
      { name: "Hjem", url: "/home" },
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
               <Link to="/home" className="mr-2 hidden md:block">
                  <span className="sr-only">Gå hjem</span>
                  <img src="/logo192.png" alt="Hesten blå" className="h-[48px]" />
               </Link>

               <div className="flex grow md:hidden">
                  <SideBar items={filteredPages} />
               </div>
               <Link to="/home" className="grow md:hidden">
                  <span className="sr-only">Gå hjem</span>
                  <img src="/logo192.png" className="h-[40px]" alt="Hesten blå" />
               </Link>

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

               <UserMenu
                  roleText={getRole()}
                  isAuthenticated={!!auth0User}
                  loggedInUser={loggedInUser}
                  pwaPublicKey={pwaPublicKey}
               />
            </div>
         </div>
      </header>
   );
};
