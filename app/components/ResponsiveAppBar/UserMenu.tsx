import { Form, Link, useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";

import type { User } from "~/.server/db/user";
import type { action } from "~/root";
import { useDialog } from "~/utils/dialogUtils";

import { UserForm } from "./UserForm";
import { Button } from "../ui/button";
import { Dialog, DialogFooter, DialogHeading } from "../ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FormProvider } from "../ui/form";
import { AvatarUser } from "../AvatarUser";

type UserMenuProps = {
   roleText: string;
   isAuthenticated: boolean;
   loggedInUser: User | undefined;
   pwaPublicKey: string;
};

export const UserMenu = ({ roleText, isAuthenticated, loggedInUser, pwaPublicKey }: UserMenuProps) => {
   const editProfileDialog = useDialog({ defaultOpen: false });
   const fetcher = useFetcher<typeof action>();
   const formRef = useRef<HTMLFormElement>(null);

   const closeEditDialog = editProfileDialog.close;
   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         closeEditDialog();
         formRef.current?.reset();
      }
   }, [closeEditDialog, fetcher.data, fetcher.state]);
   return (
      <>
         {isAuthenticated && (
            <>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button aria-label="Åpne meny" size="icon">
                        <AvatarUser className="size-10" user={loggedInUser} />
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
               <fetcher.Form ref={formRef} encType="multipart/form-data" method="PUT" onReset={editProfileDialog.close}>
                  <DialogHeading>Rediger profil</DialogHeading>
                  <FormProvider>
                     <UserForm user={loggedInUser} pwaPublicKey={pwaPublicKey} />
                  </FormProvider>

                  <DialogFooter>
                     <Button type="submit" name="intent" value="updateProfile">
                        Lagre
                     </Button>
                     <Button type="reset" variant="ghost" onClick={editProfileDialog.close}>
                        Avbryt
                     </Button>
                  </DialogFooter>
               </fetcher.Form>
            </Dialog>
         ) : null}
      </>
   );
};
