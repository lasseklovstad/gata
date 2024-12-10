import { Save } from "lucide-react";
import { useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";

import { useDialog } from "~/utils/dialogUtils";

import type { gataReportFormDialogLoader, gataReportFormDialogAction } from "./gataReportFormDialog.server";
import { Button } from "./ui/button";
import { Dialog, DialogFooter, DialogHeading } from "./ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type GataReportFormDialogProps = {
   type?: "DOCUMENT" | "NEWS";
};

export const GataReportFormDialog = ({ type }: GataReportFormDialogProps) => {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const { report } = useLoaderData<typeof gataReportFormDialogLoader>();
   const fetcher = useFetcher<typeof gataReportFormDialogAction>();
   const navigate = useNavigate();
   const method = report ? "PUT" : "POST";
   const [title, setTitle] = useState(report?.title || "");
   const [description, setDescription] = useState(report?.description || "");

   const onClose = () => void navigate("..");

   return (
      <Dialog ref={dialogRef}>
         <fetcher.Form method={method}>
            <DialogHeading>{method === "PUT" ? "Rediger informasjon" : "Nytt dokument"}</DialogHeading>
            <FormProvider errors={fetcher.data && "errors" in fetcher.data ? fetcher.data.errors : undefined}>
               <FormItem name="title">
                  <FormLabel>Tittel</FormLabel>
                  <FormControl
                     render={(props) => <Input {...props} value={title} onChange={(ev) => setTitle(ev.target.value)} />}
                  />
                  <FormMessage />
               </FormItem>
               <FormItem name="description">
                  <FormLabel>Beskrivelse (Valgfri)</FormLabel>
                  <FormControl
                     render={(props) => (
                        <Textarea {...props} value={description} onChange={(ev) => setDescription(ev.target.value)} />
                     )}
                  />
               </FormItem>
               <input hidden value={report?.type || type} readOnly name="type" />
            </FormProvider>
            <DialogFooter>
               <Button type="submit" isLoading={fetcher.state !== "idle"}>
                  <Save className="mr-2" />
                  Lagre
               </Button>
               <Button type="button" onClick={onClose} variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
};
