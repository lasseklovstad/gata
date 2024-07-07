import { Form, Link, useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";

import type { User } from "~/.server/db/user";
import type { action } from "~/root";
import { useDialog } from "~/utils/dialogUtils";

import { UserForm } from "./UserForm";
import { AvatarUser } from "../AvatarUser";
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
   const [picture, setPicture] = useState<string>();
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [area, setArea] = useState<Area>();

   const closeEditDialog = editProfileDialog.close;
   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         closeEditDialog();
         formRef.current?.reset();
      }
   }, [closeEditDialog, fetcher.data, fetcher.state]);

   const handleReset = () => {
      editProfileDialog.close();
      setPicture(undefined);
      setArea(undefined);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
   };

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
               <fetcher.Form ref={formRef} encType="multipart/form-data" method="PUT" onReset={handleReset}>
                  <DialogHeading>Rediger profil</DialogHeading>
                  <FormProvider>
                     <UserForm
                        user={loggedInUser}
                        pwaPublicKey={pwaPublicKey}
                        area={area}
                        crop={crop}
                        picture={picture}
                        setCrop={setCrop}
                        setPicture={setPicture}
                        setZoom={setZoom}
                        zoom={zoom}
                        setArea={setArea}
                     />
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
