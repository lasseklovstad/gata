import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { SaveIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

import type { IResponsibility } from "~/types/Responsibility.type";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { useDialog } from "~/utils/dialogUtils";

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   if (params.responsibilityId !== "new") {
      const responsibility = await client<IResponsibility>(`responsibility/${params.responsibilityId}`, {
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return json<LoaderData>({ responsibility });
   }
   return json<LoaderData>({ responsibility: undefined });
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const body = Object.fromEntries(await request.formData());
   if (!body.name) {
      return json({ error: { name: "Navn må fylles ut" } }, { status: 400 });
   }

   if (request.method === "POST") {
      await client("responsibility", { method: "POST", body, token, baseUrl: context.cloudflare.env.BACKEND_BASE_URL });
      return redirect("/responsibility");
   }
   if (request.method === "PUT") {
      await client(`responsibility/${params.responsibilityId}`, {
         method: "PUT",
         body,
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return redirect("/responsibility");
   }
};

type LoaderData = {
   responsibility: IResponsibility | undefined;
};

export default function EditResponsibility() {
   const navigate = useNavigate();
   const { dialogRef } = useDialog({ defaultOpen: true });
   const { responsibility } = useLoaderData<typeof loader>();
   const method = responsibility ? "put" : "post";
   const fetcher = useFetcher<typeof action>();
   const error = fetcher.data?.error;
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
