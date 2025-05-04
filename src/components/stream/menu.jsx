import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Box,
  Text,
  Button,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import UpdateStreamModal from "./updateModel";

export default function StreamMenu({
  stream,
  onStreamUpdated,
  onStreamDeleted,
}) {
  const {
    isOpen: isUpdateOpen,
    onOpen: openUpdate,
    onClose: closeUpdate,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await baseUrl.delete(`/api/meet/${stream.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success("تم حذف البث");
      onStreamDeleted?.(stream.id);
      closeDelete();
    } catch (error) {
      toast.error("فشل في حذف البث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position="absolute" top="8px" left="8px" zIndex={1}>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FiMoreVertical />}
          variant="ghost"
          size="sm"
          aria-label="خيارات البث"
        />
        <MenuList>
          <MenuItem onClick={openUpdate}>تعديل البث</MenuItem>
          <MenuItem onClick={openDelete} color="red.500">
            حذف البث
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Update Modal */}
      <UpdateStreamModal
        isOpen={isUpdateOpen}
        onClose={closeUpdate}
        stream={stream}
        onSuccess={onStreamUpdated}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد الحذف</ModalHeader>
          <ModalCloseButton position="absolute" top={2} left={2} right="auto" />
          <ModalBody>
            <Text>
              هل أنت متأكد أنك تريد حذف البث بعنوان{" "}
              <strong>{stream.title}</strong>؟
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              ml={3}
              onClick={closeDelete}
              isDisabled={loading}
            >
              إلغاء
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isDisabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "حذف"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
