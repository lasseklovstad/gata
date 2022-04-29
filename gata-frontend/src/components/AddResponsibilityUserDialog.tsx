import { Save } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem } from "@mui/material";
import { useState } from "react";
import { useGetResponisibilies } from "../api/responsibility.api";
import { useSaveResponsibilityForUser } from "../api/user.api";
import { IResponsibilityYear } from "../types/ResponsibilityYear.type";
import { ErrorAlert } from "./ErrorAlert";
import { LoadingButton } from "./Loading";

type AddResponsibilityUserDialogProps = {
   onClose: () => void;
   onSuccess: (responsibility: IResponsibilityYear[]) => void;
   userId: string;
};

const numberOfYears = 10;
const todaysYear = new Date().getFullYear();
const years = Array.from({ length: numberOfYears }, (v, i) => todaysYear - numberOfYears + 2 + i).reverse();

export const AddResponsibilityUserDialog = ({ onClose, onSuccess, userId }: AddResponsibilityUserDialogProps) => {
   const { responsibilitiesResponse } = useGetResponisibilies();
   const [selectedResp, setSelectedResp] = useState("");
   const [selectedYear, setSelectedYear] = useState(todaysYear);
   const { response, postResponsibility } = useSaveResponsibilityForUser(userId);

   const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
      ev.preventDefault();
      if (!selectedResp) {
         return;
      }
      const { status, data } = await postResponsibility(selectedResp, selectedYear);
      if (status === "success" && data) {
         onSuccess(data);
      }
   };

   return (
      <Dialog open maxWidth="xs" fullWidth>
         <form onSubmit={handleSubmit}>
            <DialogTitle>Legg til ansvarspost</DialogTitle>
            <DialogContent>
               <TextField
                  variant="filled"
                  label="Velg ansvarspost"
                  placeholder="Velg ansvarspost"
                  select
                  onChange={(ev) => setSelectedResp(ev.target.value)}
                  value={selectedResp}
                  sx={{ width: "200px", mr: 1 }}
               >
                  <MenuItem value="">Ikke valgt</MenuItem>
                  {responsibilitiesResponse.data?.map((res) => {
                     return (
                        <MenuItem value={res.id} key={res.id}>
                           {res.name}
                        </MenuItem>
                     );
                  })}
               </TextField>
               <TextField
                  variant="filled"
                  label="Velg år"
                  placeholder="Velg år"
                  select
                  onChange={(ev) => setSelectedYear(parseInt(ev.target.value))}
                  value={selectedYear}
                  sx={{ width: "200px", mt: 1 }}
               >
                  {years.map((year) => {
                     return (
                        <MenuItem value={year} key={year}>
                           {year}
                        </MenuItem>
                     );
                  })}
               </TextField>
            </DialogContent>
            <DialogActions>
               <Button onClick={onClose}>Avbryt</Button>
               <LoadingButton type="submit" response={response} variant="contained" startIcon={<Save />}>
                  Lagre
               </LoadingButton>
            </DialogActions>
            <ErrorAlert response={response} />
         </form>
      </Dialog>
   );
};
