import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { SaveIcon } from "lucide-react";

import { getResponsibility, insertResponsibility, updateResponsibility } from "~/.server/db/responsibility";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";
import { responsibilitySchema } from "~/utils/formSchema";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
   await createAuthenticator(context).getRequiredUser(request);
   if (!params.responsibilityId) throw new Error("ResponsibilityId is required in url!");
   return {
      responsibility:
         params.responsibilityId !== "new" ? await getResponsibility(context, params.responsibilityId) : undefined,
   };
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);
   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }
   const responsibility = responsibilitySchema.safeParse(await request.formData());
   if (responsibility.error) {
      return json({ ...responsibility.error.formErrors }, { status: 400 });
   }

   if (request.method === "POST") {
      await insertResponsibility(context, responsibility.data);
      return redirect("/responsibility");
   }
   if (request.method === "PUT" && params.responsibilityId) {
      await updateResponsibility(context, params.responsibilityId, responsibility.data);
      return redirect("/responsibility");
   }
};

export default function EditResponsibility() {
   const navigate = useNavigate();
   const { dialogRef } = useDialog({ defaultOpen: true });
   const { responsibility } = useLoaderData<typeof loader>();
   const method = responsibility ? "put" : "post";
   const fetcher = useFetcher<typeof action>();
   const error = fetcher.data?.fieldErrors;
   console.log(error);
   const onClose = () => navigate("..");

   return (
      <Dialog ref={dialogRef} onClose={onClose}>
         <fetcher.Form method={method} preventScrollReset>
            <DialogHeading>{method === "put" ? "Rediger Ansvarspost" : "Ny Ansvarspost"}</DialogHeading>
            <FormProvider errors={error}>
               <FormItem name="name">
                  <FormLabel>Navn</FormLabel>
                  <FormControl
                     render={(props) => <Input autoComplete="off" defaultValue={responsibility?.name} {...props} />}
                  />
                  <FormMessage />
               </FormItem>

               <FormItem name="description">
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl render={(props) => <Textarea defaultValue={responsibility?.description} {...props} />} />
               </FormItem>
            </FormProvider>
            <DialogFooter>
               <Button type="submit" isLoading={fetcher.state !== "idle"}>
                  <SaveIcon className="mr-1" />
                  Lagre
               </Button>
               <Button type="button" onClick={onClose} variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
}
