import { Alert, AlertTitle, Box, MenuItem, Paper, TextField, Typography } from "@mui/material";
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
};
const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();
export const UserInfo = ({ user }: UserInfoProps) => {
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

   const getContingent = () => {
      const hasPaid = contingents.find((c) => c.year === selectedYear)?.isPaid;
      return (
         <Alert
            severity={hasPaid ? "success" : "warning"}
            action={
               isAdmin && (
                  <LoadingButton onClick={markAsPost(!hasPaid)} response={postResponse}>
                     {hasPaid ? "Marker som ikke betalt" : "Marker som betalt"}
                  </LoadingButton>
               )
            }
         >
            <AlertTitle>Status: {hasPaid ? "Betalt" : "Ikke betalt"}</AlertTitle>
            {contingentInfoResponse.data && !hasPaid && (
               <Typography gutterBottom variant="body2">
                  {contingentInfoResponse.data.size}kr til {contingentInfoResponse.data.bank}
               </Typography>
            )}
         </Alert>
      );
   };
   return (
      <>
         <Box m={1}>
            <Typography variant="body1">
               <strong>Navn:</strong> {user.primaryUser.name}
            </Typography>
            {isAdmin ? (
               <SelectPrimaryEmail user={user} />
            ) : (
               <Typography variant="body1">
                  <strong>Email:</strong> {user.primaryUser.email}
               </Typography>
            )}
         </Box>
         <Typography variant="h2" gutterBottom>
            Kontingent
         </Typography>

         <Paper sx={{ p: 2, mb: 1 }}>
            <TextField
               variant="standard"
               label="Velg år"
               placeholder="Velg år"
               select
               onChange={(ev) => setSelectedYear(ev.target.value.toString())}
               value={selectedYear}
               sx={{ width: "200px", mb: 1 }}
            >
               {years.map((year) => {
                  return (
                     <MenuItem value={year} key={year}>
                        {year}
                     </MenuItem>
                  );
               })}
            </TextField>
            {getContingent()}
            <ErrorAlert response={postResponse} />
         </Paper>
      </>
   );
};
