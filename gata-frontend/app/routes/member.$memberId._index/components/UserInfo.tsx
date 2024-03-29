import {
   Alert,
   AlertDescription,
   AlertIcon,
   AlertTitle,
   Box,
   Button,
   Flex,
   FormControl,
   FormLabel,
   Heading,
   Select,
   Text,
} from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import { SelectPrimaryEmail } from "./SelectPrimaryEmail";
import type { IContingentInfo } from "../../../types/ContingentInfo.type";
import type { IGataUser } from "../../../types/GataUser.type";
import { isAdmin, isMember } from "../../../utils/roleUtils";
import { memberIntent } from "../intent";

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
         <Alert status={hasPaid ? "success" : "warning"} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <Flex>
               <AlertIcon />
               <Box>
                  <AlertTitle>Status: {hasPaid ? "Betalt" : "Ikke betalt"}</AlertTitle>
                  {!hasPaid && (
                     <AlertDescription>
                        {contingentInfo.size}kr til {contingentInfo.bank}
                     </AlertDescription>
                  )}
               </Box>
            </Flex>
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
         </Alert>
      );
   };
   return (
      <>
         <Box my={4}>
            <Text variant="body1">
               <strong>Navn:</strong> {user.primaryUser.name}
            </Text>
            {isAdmin(loggedInUser) ? (
               <SelectPrimaryEmail user={user} />
            ) : (
               <Text variant="body1">
                  <strong>Email:</strong> {user.primaryUser.email}
               </Text>
            )}
         </Box>
         {isMember(user) ? (
            <>
               <Heading as="h2" size="lg" mb={2}>
                  Kontingent
               </Heading>
               <fetcher.Form method="POST">
                  <Box boxShadow="md" bg="white" rounded={4} sx={{ p: 2, mb: 4 }}>
                     <FormControl mb={1}>
                        <FormLabel>Velg år</FormLabel>
                        <Select
                           name="year"
                           width={100}
                           placeholder="Velg år"
                           onChange={(ev) => setSelectedYear(ev.target.value.toString())}
                           value={selectedYear}
                        >
                           {years.map((year) => {
                              return (
                                 <option value={year} key={year}>
                                    {year}
                                 </option>
                              );
                           })}
                        </Select>
                     </FormControl>
                     {getContingent()}
                     {notPaidYears.length > 0 ? (
                        <Alert status="error">
                           Du har gjenstående betalinger for følgende år: {notPaidYears.sort().join(", ")}
                        </Alert>
                     ) : (
                        <Alert status="success">Du har ingen gjenstående betalinger</Alert>
                     )}
                  </Box>
               </fetcher.Form>
            </>
         ) : (
            <Alert status="info" my={4}>
               <AlertTitle>Kontingent</AlertTitle>
               <AlertDescription>Bruker må vær medlem for å registrere kontingent</AlertDescription>
            </Alert>
         )}
      </>
   );
};
