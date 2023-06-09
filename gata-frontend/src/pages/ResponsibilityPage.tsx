import { Add, Delete, Edit } from "@mui/icons-material";
import { Button, IconButton, List, ListItem, Text, Heading, Divider, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useDeleteResponsibility, useGetResponisibilies } from "../api/responsibility.api";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { Loading } from "../components/Loading";
import { ResponsibilityDialog } from "../components/ResponsibilityDialog";
import { useRoles } from "../components/useRoles";
import { IResponsibility } from "../types/Responsibility.type";
import { PageLayout } from "../components/PageLayout";

export const ResponsibilityPage = () => {
   const { isAdmin } = useRoles();
   const { responsibilitiesResponse } = useGetResponisibilies();
   const [responsibilities, setResponsibilities] = useState<IResponsibility[]>([]);
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedResp, setSelectedResp] = useState<IResponsibility>();
   const { deleteResponse, deleteResponsibility } = useDeleteResponsibility();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister du ansvarsposten",
      response: deleteResponse,
      onConfirm: async () => {
         if (selectedResp) {
            const { status } = await deleteResponsibility(selectedResp);
            if (status === "success") {
               setResponsibilities(responsibilities.filter((resp) => resp.id !== selectedResp.id));
            }
         } else {
            throw new Error("This should not happen");
         }
      },
      onClose: () => {
         setSelectedResp(undefined);
      },
   });

   const handleDelete = (resp: IResponsibility) => {
      setSelectedResp(resp);
      openConfirmDialog();
   };

   const closeModal = () => {
      setSelectedResp(undefined);
      setModalOpen(false);
   };

   const openModal = (resp?: IResponsibility) => {
      setSelectedResp(resp);
      setModalOpen(true);
   };

   const handleSuccess = (responsibility: IResponsibility, type: "update" | "create") => {
      setModalOpen(false);
      if (type === "update") {
         setResponsibilities(responsibilities.map((res) => (res.id === responsibility.id ? responsibility : res)));
      }
      if (type === "create") {
         setResponsibilities([...responsibilities, responsibility]);
      }
   };

   useEffect(() => {
      responsibilitiesResponse.data && setResponsibilities(responsibilitiesResponse.data);
   }, [responsibilitiesResponse.data]);

   return (
      <PageLayout>
         {ConfirmDialogComponent}
         <Box display="flex" justifyContent="space-between" flexWrap="wrap" alignItems="center">
            <Heading as="h1">Ansvarsposter</Heading>
            {isAdmin && (
               <Button leftIcon={<Add />} onClick={() => openModal()}>
                  Legg til
               </Button>
            )}
         </Box>
         <Loading response={responsibilitiesResponse} />
         {responsibilitiesResponse.status === "success" && (
            <List my={4}>
               {responsibilities.map((resp) => {
                  const { name, id, description } = resp;
                  return (
                     <ListItem key={id}>
                        <Box display="flex" py={2}>
                           <Box flex={1}>
                              <Text>{name}</Text>
                              <Text color="gray" fontSize="sm">
                                 {description}
                              </Text>
                           </Box>
                           <IconButton
                              variant="ghost"
                              onClick={() => openModal(resp)}
                              icon={<Edit />}
                              aria-label="Rediger"
                           />
                           <IconButton
                              variant="ghost"
                              onClick={() => handleDelete(resp)}
                              icon={<Delete />}
                              aria-label="Slett"
                           />
                        </Box>
                        <Divider />
                     </ListItem>
                  );
               })}
               {responsibilities.length === 0 && <ListItem>Ingen ansvarsposter, trykk legg til for å lage ny</ListItem>}
            </List>
         )}
         {modalOpen && (
            <ResponsibilityDialog
               onClose={() => closeModal()}
               onSuccess={handleSuccess}
               responsibility={selectedResp}
            />
         )}
      </PageLayout>
   );
};
