import { Image } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, TextField } from "@mui/material";
import { useState } from "react";

type AddImageProps = {
   onAddImage: (url: string) => void;
};

export const AddImage = ({ onAddImage }: AddImageProps) => {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [url, setUrl] = useState("");
   const [error, setError] = useState("");

   const reset = () => {
      setUrl("");
      setDialogOpen(false);
      setError("");
   };

   return (
      <>
         <Button startIcon={<Image />} onClick={() => setDialogOpen(true)}>
            Bilde
         </Button>
         <Dialog open={dialogOpen} maxWidth="md" fullWidth>
            <DialogTitle>Legg til bilde</DialogTitle>
            <DialogContent>
               <TextField
                  fullWidth
                  variant="filled"
                  multiline
                  rows={5}
                  label="Bilde url"
                  placeholder={"https://am3pap006files.storage.live.com/y4m9oBPr...."}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  error={!!error}
                  helperText={error}
               />
               <FormHelperText>Tips: Last opp filer på One Drive og del bilde med å lage en link</FormHelperText>
            </DialogContent>
            <DialogActions>
               <Button
                  onClick={() => {
                     if (url.startsWith("https")) {
                        reset();
                        onAddImage(url);
                     } else {
                        setError("Url'en må starte med https");
                     }
                  }}
                  variant="contained"
               >
                  Lagre
               </Button>
               <Button onClick={() => reset()}>Avbryt</Button>
            </DialogActions>
         </Dialog>
      </>
   );
};
