import {
   Alert,
   AlertDescription,
   AlertTitle,
   Box,
   FormControl,
   FormLabel,
   Heading,
   Select,
   Text,
   AlertIcon,
   Flex,
} from "@chakra-ui/react";
import { IGataUser } from "../types/GataUser.type";
import { useState } from "react";
import { usePostContingent } from "../api/user.api";
import { LoadingButton } from "./Loading";
import { ErrorAlert } from "./ErrorAlert";
import { useRoles } from "./useRoles";
import { useGetContingentInfo } from "../api/contingent.api";
import { SelectPrimaryEmail } from "./SelectPrimaryEmail";

type UserInfoProps = {
   user: IGataUser;
   onChange: (user: IGataUser) => void;
};
const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();
export const UserInfo = ({ user, onChange }: UserInfoProps) => {
   const { isAdmin } = useRoles();
   const [selectedYear, setSelectedYear] = useState(todaysYear.toString());
   const [contingents, setContingents] = useState(user.contingents);
   const { postResponse, postContingent } = usePostContingent(user.id);
   const { contingentInfoResponse } = useGetContingentInfo();

   const markAsPost = (isPaid: boolean) => async () => {
      const { data } = await postContingent(selectedYear, isPaid);
      if (data) {
         setContingents(data);
      }
   };

   const notPaidYears = years
      .filter((y) => y <= todaysYear)
      .filter((y) => !contingents.find((c) => c.year === y)?.isPaid);

   const getContingent = () => {
      const hasPaid = contingents.find((c) => c.year.toString(10) === selectedYear)?.isPaid;
      return (
         <Alert status={hasPaid ? "success" : "warning"} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <Flex>
               <AlertIcon />
               <Box>
                  <AlertTitle>Status: {hasPaid ? "Betalt" : "Ikke betalt"}</AlertTitle>
                  {contingentInfoResponse.data && !hasPaid && (
                     <AlertDescription>
                        {contingentInfoResponse.data.size}kr til {contingentInfoResponse.data.bank}
                     </AlertDescription>
                  )}
               </Box>
            </Flex>
            {isAdmin && (
               <LoadingButton variant="outline" onClick={markAsPost(!hasPaid)} response={postResponse}>
                  {hasPaid ? "Marker som ikke betalt" : "Marker som betalt"}
               </LoadingButton>
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
            {isAdmin ? (
               <SelectPrimaryEmail user={user} onChange={onChange} />
            ) : (
               <Text variant="body1">
                  <strong>Email:</strong> {user.primaryUser.email}
               </Text>
            )}
         </Box>
         <Heading as="h2" size="lg" mb={2}>
            Kontingent
         </Heading>

         <Box boxShadow="md" bg="white" rounded={4} sx={{ p: 2, mb: 4 }}>
            <FormControl mb={1}>
               <FormLabel>Velg år</FormLabel>
               <Select
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
            <ErrorAlert response={postResponse} />
         </Box>
      </>
   );
};
