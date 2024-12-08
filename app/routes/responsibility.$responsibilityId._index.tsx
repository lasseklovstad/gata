import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
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
import { transformErrorResponse } from "~/utils/validateUtils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   await createAuthenticator().getRequiredUser(request);
   if (!params.responsibilityId) throw new Error("ResponsibilityId is required in url!");
   return {
      responsibility: params.responsibilityId !== "new" ? await getResponsibility(params.responsibilityId) : undefined,
   };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }
   const responsibility = responsibilitySchema.safeParse(await request.formData());
   if (responsibility.error) {
      return transformErrorResponse(responsibility.error);
   }

   if (request.method === "POST") {
      await insertResponsibility(responsibility.data);
      return redirect("/responsibility");
   }
   if (request.method === "PUT" && params.responsibilityId) {
      await updateResponsibility(params.responsibilityId, responsibility.data);
      return redirect("/responsibility");
   }
};

export default function EditResponsibility() {
   const navigate = useNavigate();
   const { dialogRef } = useDialog({ defaultOpen: true });
   const { responsibility } = useLoaderData<typeof loader>();
   const method = responsibility ? "put" : "post";
   const fetcher = useFetcher<typeof action>();
   const onClose = () => navigate("..");

   return (
      <Dialog ref={dialogRef} onClose={onClose}>
         <fetcher.Form method={method} preventScrollReset>
            <DialogHeading>{method === "put" ? "Rediger Ansvarspost" : "Ny Ansvarspost"}</DialogHeading>
            <FormProvider errors={fetcher.data && "errors" in fetcher.data ? fetcher.data.errors : undefined}>
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
