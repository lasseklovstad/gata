import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { Select } from "chakra-react-select";
import { Save } from "lucide-react";
import { useState } from "react";

import { getResponsibilities } from "~/api/responsibility.api";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormProvider } from "~/components/ui/form";
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

type IOption = { value: string; label: string };

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export default function AddResponsibilityUserDialog() {
   const { responsibilities } = useLoaderData<typeof loader>();
   const { dialogRef } = useDialog({ defaultOpen: true });
   const [selectedResp, setSelectedResp] = useState<IOption | null>();
   const [selectedYear, setSelectedYear] = useState<IOption | null>();
   const fetcher = useFetcher();

   const responsibilityOptions = responsibilities.map((res) => {
      return { label: res.name, value: res.id };
   });

   return (
      <Dialog ref={dialogRef}>
         <FormProvider>
            <fetcher.Form method="post" action="..">
               <DialogHeading>Legg til ansvarspost</DialogHeading>
               <FormItem name="responsibilityId">
                  <FormLabel>Velg ansvarspost</FormLabel>
                  <FormControl
                     render={(props) => (
                        <Select<IOption, false, never>
                           {...props}
                           variant="filled"
                           placeholder="Velg ansvarspost"
                           onChange={(ev) => setSelectedResp(ev)}
                           value={selectedResp}
                           options={responsibilityOptions}
                        />
                     )}
                  />
               </FormItem>
               <FormItem name="year">
                  <FormLabel>Velg år</FormLabel>
                  <FormControl
                     render={(props) => (
                        <Select<{ value: string; label: string }, false, never>
                           {...props}
                           placeholder="Velg år"
                           onChange={(ev) => setSelectedYear(ev)}
                           value={selectedYear}
                           options={years.map((res) => {
                              return { label: res.toString(), value: res.toString() };
                           })}
                        />
                     )}
                  />
               </FormItem>
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
         </FormProvider>
      </Dialog>
   );
}
