import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import React, { useState } from "react";
import useEditeCommint from "../../Hooks/posts/useEditeCommint";

const EditeModale = ({ isEditOpen, onEditClose, postId, fetchData }) => {
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editeCommintLoading, editeCommint] = useEditeCommint({
    postId: postId,
  });
  const handleSaveEdit = async () => {
    if (editCommentId && editCommentContent) {
      await editeCommint(editCommentId, editCommentContent); // استخدم معرف التعليق والمحتوى المعدل
      fetchData(); // حدّث التعليقات بعد التعديل
    }
    onEditClose(); // أغلق النافذة بعد التعديل
    console.log(editCommentId);
  };
  const handleEditCommentChange = (e) => {
    setEditCommentContent(e.target.value);
  };
  return (
    <div>
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل التعليق</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="عدل تعليقك هنا..."
              value={editCommentContent}
              onChange={handleEditCommentChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveEdit}>
              {editeCommintLoading ? <Spinner /> : " حفظ التعديلات"}
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EditeModale;
