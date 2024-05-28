import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { useDialog } from "~/utils/dialogUtils";

import { Button } from "../ui/button";
import { Dialog, DialogFooter, DialogHeading } from "../ui/dialog";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage, FormProvider } from "../ui/form";
import { Textarea } from "../ui/textarea";

type AddImageProps = {
   onAddImage: (url: string) => void;
};

export const AddImage = ({ onAddImage }: AddImageProps) => {
   const { dialogRef } = useDialog({ defaultOpen: false });
   const [url, setUrl] = useState("");
   const [error, setError] = useState("");

   const reset = () => {
      setUrl("");
      dialogRef.current?.close();
      setError("");
   };

   return (
      <>
         <Button variant="outline" onClick={() => dialogRef.current?.showModal()}>
            <ImageIcon className="mr-2" />
            Bilde
         </Button>
         <Dialog ref={dialogRef}>
            <DialogHeading>Legg til bilde</DialogHeading>
            <FormProvider errors={{ url: [error] }}>
               <FormItem name="url">
                  <FormLabel>Bilde url</FormLabel>
                  <FormControl
                     render={(props) => (
                        <Textarea
                           {...props}
                           placeholder="https://am3pap006files.storage.live.com/y4m9oBPr...."
                           value={url}
                           onChange={(e) => setUrl(e.target.value)}
                        />
                     )}
                  />
                  <FormMessage />
                  <FormDescription>Tips: Last opp filer på One Drive og del bilde med å lage en link</FormDescription>
               </FormItem>
            </FormProvider>
            <DialogFooter>
               <Button
                  onClick={() => {
                     if (url.startsWith("https")) {
                        reset();
                        onAddImage(url);
                     } else {
                        setError("Url'en må starte med https");
                     }
                  }}
               >
                  Lagre
               </Button>
               <Button onClick={() => reset()} variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </Dialog>
      </>
   );
};
