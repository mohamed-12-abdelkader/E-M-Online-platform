import {
  Button,
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";

const LectureDialog = ({
  isOpen,
  onClose,
  cancelRef,
  selectedLecture,
  onDelete,
  deleteLoading,
}) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
  >
    <AlertDialogOverlay>
      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          حذف الكورس
        </AlertDialogHeader>
        <div className="p-3">
          {selectedLecture ? (
            <h1 className="font-bold">
              هل تريد حذف {selectedLecture.description}
            </h1>
          ) : (
            <p>Selected lecture is null</p>
          )}
        </div>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} className="mx-2">
            إلغاء
          </Button>
          <Button colorScheme="red" ml={3} className="mx-2" onClick={onDelete}>
            {deleteLoading ? <Spinner /> : "نعم حذف"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default LectureDialog;
