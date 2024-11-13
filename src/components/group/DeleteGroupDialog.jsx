import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Spinner,
} from "@chakra-ui/react";

const DeleteGroupDialog = ({
  isOpen,
  onClose,
  cancelRef,
  onDelete,
  deleteLoading,
}) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
  >
    <AlertDialogOverlay>
      <AlertDialogContent className="p-3">
        <h1 className="font-bold">- حذف المجموعة</h1>
        <AlertDialogBody>
          هل أنت متأكد من أنك تريد حذف المجموعة؟
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} className="m-2">
            إلغاء
          </Button>
          <Button colorScheme="red" onClick={onDelete} ml={3} className="m-2">
            {deleteLoading ? <Spinner /> : "نعم، حذف"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default DeleteGroupDialog;
