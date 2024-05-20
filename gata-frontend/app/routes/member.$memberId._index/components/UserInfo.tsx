import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import { SelectPrimaryEmail } from "./SelectPrimaryEmail";
import type { IContingentInfo } from "../../../types/ContingentInfo.type";
import type { IGataUser } from "../../../types/GataUser.type";
import { isAdmin, isMember } from "../../../utils/roleUtils";
import { memberIntent } from "../intent";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { FormControl, FormItem, FormLabel } from "~/components/ui/form";
import { Select } from "~/components/ui/select";

type UserInfoProps = {
   user: IGataUser;
   loggedInUser: IGataUser;
   contingentInfo: IContingentInfo;
};

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export const UserInfo = ({ user, contingentInfo, loggedInUser }: UserInfoProps) => {
   const [selectedYear, setSelectedYear] = useState(todaysYear.toString());
   const fetcher = useFetcher();

   const notPaidYears = years
      .filter((y) => y <= todaysYear)
      .filter((y) => !user.contingents.find((c) => c.year === y)?.isPaid);

   const getContingent = () => {
      const hasPaid = !!user.contingents.find((c) => c.year.toString(10) === selectedYear)?.isPaid;
      return (
         <Alert variant={hasPaid ? "success" : "warning"} className="my-2">
            <AlertTitle>Status: {hasPaid ? "Betalt" : "Ikke betalt"}</AlertTitle>
            {!hasPaid && (
               <AlertDescription>
                  {contingentInfo.size}kr til {contingentInfo.bank}
               </AlertDescription>
            )}
            <AlertAction>
               <input readOnly hidden value={hasPaid ? "true" : "false"} name="hasPaid" />
               {isAdmin(loggedInUser) && (
                  <Button
                     isLoading={fetcher.state !== "idle"}
                     variant="outline"
                     type="submit"
                     name="intent"
                     value={memberIntent.updateContingent}
                  >
                     {hasPaid ? "Marker som ikke betalt" : "Marker som betalt"}
                  </Button>
               )}
            </AlertAction>
         </Alert>
      );
   };
   return (
      <>
         <div className="my-4">
            <Typography>
               <strong>Navn:</strong> {user.primaryUser.name}
            </Typography>
            {isAdmin(loggedInUser) ? (
               <SelectPrimaryEmail user={user} />
            ) : (
               <Typography>
                  <strong>Email:</strong> {user.primaryUser.email}
               </Typography>
            )}
         </div>
         {isMember(user) ? (
            <>
               <Typography variant="h2" className="mb-2">
                  Kontingent
               </Typography>
               <fetcher.Form method="POST">
                  <div className="shadow bg-background rounded p-2 mb-4">
                     <FormItem name="year">
                        <FormLabel>Velg år</FormLabel>
                        <FormControl
                           render={(props) => (
                              <Select
                                 {...props}
                                 onChange={(ev) => setSelectedYear(ev.target.value.toString())}
                                 value={selectedYear}
                              >
                                 <option disabled selected value="">
                                    Velg år
                                 </option>
                                 {years.map((year) => {
                                    return (
                                       <option value={year} key={year}>
                                          {year}
                                       </option>
                                    );
                                 })}
                              </Select>
                           )}
                        />
                     </FormItem>
                     {getContingent()}
                     {notPaidYears.length > 0 ? (
                        <Alert variant="destructive">
                           <AlertTitle>
                              Du har gjenstående betalinger for følgende år: {notPaidYears.sort().join(", ")}
                           </AlertTitle>
                        </Alert>
                     ) : (
                        <Alert variant="success">
                           <AlertTitle>Du har ingen gjenstående betalinger</AlertTitle>
                        </Alert>
                     )}
                  </div>
               </fetcher.Form>
            </>
         ) : (
            <Alert className="my-4">
               <AlertTitle>Kontingent</AlertTitle>
               <AlertDescription>Bruker må vær medlem for å registrere kontingent</AlertDescription>
            </Alert>
         )}
      </>
   );
};
