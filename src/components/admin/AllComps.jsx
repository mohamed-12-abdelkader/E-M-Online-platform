import React, { useState, useRef } from "react";
import useGitCompByAdmin from "../../Hooks/comp/useGitCompByAdmin";
import {
  Card,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import useActivComp from "../../Hooks/comp/useActivComp";
// Assuming you have a hook for deleting comps
import { CoursesCard } from "../../ui/card/CoursesCard";
import useDeleateComp from "../../Hooks/comp/useDeleateComp";

const classes = [
  { id: "1", name: "الأول الثانوي" },
  { id: "2", name: "الثاني الثانوي" },
  { id: "3", name: "الثالث الثانوي" },
];

const AllComps = () => {
  const [compsLoading, comps, refetchComps] = useGitCompByAdmin();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedComp, setSelectedComp] = useState(null);
  const [activComp, activComploading] = useActivComp();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [deleteLoading, deleteComp] = useDeleateComp(); // Hook for deleting comps

  const handleClassClick = (classId) => {
    setSelectedClassId(classId);
  };

  const handleActionClick = (comp) => {
    setSelectedComp(comp);
    onOpen();
  };

  const handleDeleteClick = (comp) => {
    setSelectedComp(comp);
    onDeleteOpen();
  };

  const confirmAction = () => {
    const newStatus = !selectedComp.is_ready;
    activComp(selectedComp.id, newStatus);
    onClose();
  };

  const handleDelete = async () => {
    await deleteComp(selectedComp.id); // Delete the selected competition
    refetchComps(); // Refetch the competitions after deletion
    onDeleteClose();
  };

  const filteredComps =
    selectedClassId && comps?.data
      ? comps.data.filter((comp) => comp.grad_id === parseInt(selectedClassId))
      : comps?.data;

  return (
    <div className='w-[85%] m-auto mt-[50px] my-[100px]'>
      <div className='flex justify-center flex-wrap my-5'>
        {classes.map((classe) => {
          const isSelected = selectedClassId === classe.id;
          return (
            <div key={classe.id} onClick={() => handleClassClick(classe.id)}>
              <Box
                cursor='pointer'
                borderWidth='1px'
                borderRadius='md'
                boxShadow='md'
                px={5}
                py={3}
                className='m-2'
                bg={isSelected ? "#3b82f6" : "white"}
                color={isSelected ? "white" : "black"}
                borderColor={isSelected ? "#3b82f6" : "gray.300"}
              >
                مسابقات الصف {classe.name}
              </Box>
            </div>
          );
        })}
      </div>

      <div className='flex flex-wrap justify-start'>
        {compsLoading ? (
          <p>Loading...</p>
        ) : filteredComps && filteredComps.length > 0 ? (
          filteredComps.map((comp) => (
            <CoursesCard
              type='comp'
              key={comp.id}
              lectre={comp}
              handleactive={handleActionClick}
              handleDeleate={() => handleDeleteClick(comp)} // Pass delete function
            />
          ))
        ) : (
          <p>لا توجد بيانات لعرضها.</p>
        )}
      </div>

      {/* Activation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد العملية</ModalHeader>
          <ModalBody>
            هل أنت متأكد من {selectedComp?.is_ready ? "تعطيل" : "تفعيل"}{" "}
            المسابقة "{selectedComp?.name}"؟
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button colorScheme='blue' onClick={confirmAction}>
              {activComploading ? <Spinner /> : "تأكيد"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              تأكيد الحذف
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد أنك تريد حذف المسابقة؟ هذه العملية لا يمكن التراجع
              عنها.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                إلغاء
              </Button>
              <Button
                colorScheme='red'
                onClick={handleDelete}
                ml={3}
                isLoading={deleteLoading}
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default AllComps;
