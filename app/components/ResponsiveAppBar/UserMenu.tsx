import { Form, Link } from "@remix-run/react";
import type { Auth0Profile } from "remix-auth-auth0";

import type { User } from "~/.server/db/user";
import { useDialog } from "~/utils/dialogUtils";

import { Button } from "../ui/button";
import { Dialog, DialogFooter, DialogHeading } from "../ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage, FormProvider } from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type UserMenuProps = {
   roleText: string;
   isAuthenticated: boolean;
   user: Auth0Profile | undefined;
   loggedInUser: User | undefined;
};

export const UserMenu = ({ roleText, user, isAuthenticated, loggedInUser }: UserMenuProps) => {
   const editProfileDialog = useDialog({ defaultOpen: false });
   const photo = user && user.photos && user.photos[0] ? user.photos[0].value : "";
   return (
      <>
         {isAuthenticated && (
            <>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button aria-label="Åpne meny" size="icon">
                        <img alt="" src={photo} className="rounded-full w-[35px]" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     {loggedInUser ? (
                        <DropdownMenuItem onClick={editProfileDialog.open}>Rediger profil</DropdownMenuItem>
                     ) : null}
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
         {loggedInUser ? (
            <Dialog ref={editProfileDialog.dialogRef}>
               <DialogHeading>Rediger profil</DialogHeading>
               <FormProvider>
                  <FormItem name="name">
                     <FormLabel>Navn</FormLabel>
                     <FormControl
                        render={(props) => <Input {...props} defaultValue={loggedInUser.name} autoComplete="off" />}
                     />
                     <FormMessage />
                  </FormItem>
                  <FormItem name="picture">
                     <FormLabel>Bilde</FormLabel>
                     <FormControl
                        render={(props) => (
                           <Input {...props} className="w-fit" type="file" name="image" accept="image/*" />
                        )}
                     />
                     <FormMessage />
                  </FormItem>
                  <FormItem name="emailSubscription" className="border p-2 flex justify-between items-center rounded">
                     <div>
                        <FormLabel>E-post</FormLabel>
                        <FormDescription>
                           Få tilsendt e-post hvis en bruker velger å publisere en nyhet eller nytt dokument
                        </FormDescription>
                     </div>
                     <FormControl render={(props) => <Switch {...props} />} />
                  </FormItem>
                  <FormItem name="pushSubscription" className="border p-2 flex justify-between items-center rounded">
                     <div>
                        <FormLabel>Push notifikasjoner</FormLabel>
                        <FormDescription>
                           Få tilsendt push notifikasjoner på enheten ved feks. endringer i et arrangement du deltar på
                        </FormDescription>
                     </div>
                     <FormControl render={(props) => <Switch {...props} />} />
                  </FormItem>
               </FormProvider>

               <DialogFooter>
                  <Button type="submit" name="intent" value="updateProfile">
                     Lagre
                  </Button>
                  <Button type="button" variant="ghost" onClick={editProfileDialog.close}>
                     Avbryt
                  </Button>
               </DialogFooter>
            </Dialog>
         ) : null}
      </>
   );
};
