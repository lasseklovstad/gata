import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Save } from "lucide-react";

import { getResponsibilities } from "~/api/responsibility.api";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormProvider } from "~/components/ui/form";
import { NativeSelect } from "~/components/ui/native-select";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const signal = request.signal;
   const responsibilities = await getResponsibilities({
      token,
      signal,
      baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
   });
   return json({ responsibilities });
};

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export default function AddResponsibilityUserDialog() {
   const { responsibilities } = useLoaderData<typeof loader>();
   const { dialogRef } = useDialog({ defaultOpen: true });
   const fetcher = useFetcher();

   const responsibilityOptions = responsibilities.map((res) => {
      return { label: res.name, value: res.id };
   });

   return (
      <Dialog ref={dialogRef}>
         <fetcher.Form method="post" action="..">
            <DialogHeading>Legg til ansvarspost</DialogHeading>
            <FormProvider>
               <FormItem name="responsibilityId">
                  <FormLabel>Velg ansvarspost</FormLabel>
                  <FormControl
                     render={(props) => (
                        <NativeSelect {...props} className="w-[180px]" required>
                           <option value="" disabled selected>
                              Velg ansvarspost
                           </option>
                           {responsibilityOptions.map(({ label, value }) => (
                              <option key={value} value={value}>
                                 {label}
                              </option>
                           ))}
                        </NativeSelect>
                     )}
                  />
               </FormItem>
               <FormItem name="year">
                  <FormLabel>Velg år</FormLabel>
                  <FormControl
                     render={(props) => (
                        <NativeSelect {...props} className="w-[180px]" required>
                           <option value="" disabled selected>
                              Velg år
                           </option>
                           {years
                              .map((res) => {
                                 return { label: res.toString(), value: res.toString() };
                              })
                              .map(({ label, value }) => (
                                 <option key={value} value={value}>
                                    {label}
                                 </option>
                              ))}
                        </NativeSelect>
                     )}
                  />
               </FormItem>
            </FormProvider>
            <DialogFooter>
               <Button type="submit" isLoading={fetcher.state !== "idle"}>
                  <Save className="mr-2" />
                  Lagre
               </Button>
               <Button as={Link} to=".." variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
}
