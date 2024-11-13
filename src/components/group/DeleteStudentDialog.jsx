import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Spinner,
} from "@chakra-ui/react";

const DeleteStudentDialog = ({
  isOpen,
  onClose,
  cancelRef,
  onDelete,
  deleteLoading,
  selectedStudent,
}) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
  >
    <AlertDialogOverlay>
      <AlertDialogContent className="p-3">
        <h1 className="font-bold">- حذف طالب من المجموعة</h1>
        {selectedStudent && (
          <>
            <AlertDialogBody>
              هل بالفعل تريد حذف {selectedStudent.fname} {selectedStudent.lname}
              ؟
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={onDelete} ml={3}>
                {deleteLoading ? <Spinner /> : "نعم، حذف"}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default DeleteStudentDialog;
