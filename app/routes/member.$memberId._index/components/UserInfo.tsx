import { useState } from "react";
import { useFetcher } from "react-router";

import type { User } from "~/.server/db/user";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { NativeSelect } from "~/components/ui/native-select";
import { Typography } from "~/components/ui/typography";

import { SelectPrimaryEmail } from "./SelectPrimaryEmail";
import type { IContingentInfo } from "../../../types/ContingentInfo.type";
import { isAdmin, isMember } from "../../../utils/roleUtils";
import { memberIntent } from "../intent";
import type { action } from "../route";

type UserInfoProps = {
   user: User;
   loggedInUser: User;
   contingentInfo: IContingentInfo;
};

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export const UserInfo = ({ user, contingentInfo, loggedInUser }: UserInfoProps) => {
   const [selectedYear, setSelectedYear] = useState(todaysYear.toString());
   const fetcher = useFetcher<typeof action>();

   const notPaidYears = years
      .filter((y) => y <= todaysYear)
      .filter((y) => !user.contingents.find((c) => c.year === y)?.isPaid);

   const currentContingent = user.contingents.find((c) => c.year.toString(10) === selectedYear);
   const hasPaid = !!currentContingent?.isPaid;
   const amount = currentContingent?.amount ?? contingentInfo.size;

   return (
      <>
         <div className="my-4">
            <Typography>
               <strong>Navn:</strong> {user.name}
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
               <fetcher.Form method="POST" key={selectedYear}>
                  <div className="shadow bg-background rounded p-2 mb-4">
                     <div className="flex gap-4 items-end flex-wrap">
                        <FormItem name="year">
                           <FormLabel>Velg år</FormLabel>
                           <FormControl
                              render={(props) => (
                                 <NativeSelect
                                    {...props}
                                    onChange={(ev) => setSelectedYear(ev.target.value.toString())}
                                    value={selectedYear}
                                    className="w-[90px]"
                                 >
                                    {years.map((year) => {
                                       return (
                                          <option value={year} key={year}>
                                             {year}
                                          </option>
                                       );
                                    })}
                                 </NativeSelect>
                              )}
                           />
                        </FormItem>
                        {isAdmin(loggedInUser) && (
                           <>
                              <FormItem name="amount">
                                 <FormLabel>Beløp</FormLabel>
                                 <FormControl
                                    render={(props) => (
                                       <Input
                                          {...props}
                                          className="w-[90px]"
                                          autoComplete="off"
                                          type="number"
                                          pattern="\d+"
                                          defaultValue={amount}
                                       />
                                    )}
                                 />
                              </FormItem>
                              <FormItem name="hasPaid">
                                 <div className="flex gap-2 py-3 cursor-pointer">
                                    <FormControl
                                       render={(props) => (
                                          <input
                                             {...props}
                                             className="cursor-pointer"
                                             type="checkbox"
                                             defaultChecked={hasPaid}
                                          />
                                       )}
                                    />
                                    <FormLabel className="cursor-pointer">Betalt</FormLabel>
                                 </div>
                              </FormItem>
                              <Button
                                 isLoading={fetcher.state !== "idle"}
                                 variant="outline"
                                 type="submit"
                                 name="intent"
                                 value={memberIntent.updateContingent}
                              >
                                 Lagre
                              </Button>
                           </>
                        )}
                     </div>
                     <Alert variant={hasPaid ? "success" : "warning"} className="my-2">
                        <AlertTitle>Status: {hasPaid ? "Betalt" : "Ikke betalt"}</AlertTitle>
                        {!hasPaid && (
                           <AlertDescription>
                              {amount}kr til {contingentInfo.bank}
                           </AlertDescription>
                        )}
                     </Alert>
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
