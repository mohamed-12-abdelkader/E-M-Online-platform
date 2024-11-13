import { IoSend } from "react-icons/io5";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  Input,
  useDisclosure,
  Spinner,
  MenuItem,
  MenuList,
  MenuButton,
  Menu,
  IconButton,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  Modal,
} from "@chakra-ui/react";
import { useState } from "react";
import useGitCommint from "../../Hooks/posts/useGitCommint";
import useAddComment from "../../Hooks/posts/useAddCommint";
import useToggleLike from "../../Hooks/posts/useToggleLike";
import useAddReply from "../../Hooks/posts/useAddReply";
import ActionPost from "./ActionPost";
import { MdMoreHoriz } from "react-icons/md";
import useDeleateCommint from "../../Hooks/posts/useDeleateCommint";
import useEditeCommint from "../../Hooks/posts/useEditeCommint";
import Commint from "./Commint";

const getFirstLetter = (name) => name.charAt(0).toUpperCase();
const getColorForLetter = (letter) => {
  const colors = [
    "#f44336",
    "#2196f3",
    "#4caf50",
    "#9c27b0",
    "#ff9800",
    "#ffeb3b",
    "#009688",
  ];
  return colors[letter.charCodeAt(0) % colors.length];
};

const PostFooter = ({ postId, post, likes, commint }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [showReplies, setShowReplies] = useState({});
  const [commints, commintsLoading, fetchData] = useGitCommint(postId);
  const [deletecommintLoading, deletecommint] = useDeleateCommint({
    postId: postId,
    fetchData,
  });

  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);

  const { handleAddComment, handleContentChange, commentLoading, content } =
    useAddComment(postId, token, fetchData);

  const {
    handleAddReply,
    handleReplyContentChange,
    setReplyingToId,
    replyContent,
    replyingToId,
    commentLoading: replyLoading,
  } = useAddReply(postId, token, fetchData);

  const { handleToggleLike, liked, loading } = useToggleLike(
    postId,
    token,
    fetchData,
    post.liked
  );

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };
  const handleReplyClick = (id) => {
    setReplyingToId(id);
  };
  const [editeCommintLoading, editeCommint] = useEditeCommint({
    postId: postId,
  });
  const openEditModal = (commint) => {
    setEditCommentId(commint.id);
    setEditCommentContent(commint.content);
    onEditOpen();
  };

  const handleEditCommentChange = (e) => {
    setEditCommentContent(e.target.value);
  };

  const handleSaveEdit = async () => {
    if (editCommentId && editCommentContent) {
      await editeCommint(editCommentId, editCommentContent); // استخدم معرف التعليق والمحتوى المعدل
      fetchData(); // حدّث التعليقات بعد التعديل
    }
    onEditClose(); // أغلق النافذة بعد التعديل
    console.log(editCommentId);
  };
  return (
    <div>
      <hr className="my-4" />

      <ActionPost
        onOpen={onOpen}
        loading={loading}
        liked={liked}
        handleToggleLike={handleToggleLike}
        likes={likes}
        commint={commint}
        postId={postId}
      />

      {/* Comments Drawer */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent style={{ maxHeight: "95vh" }} className="h-[90vh]">
          <div className="flex justify-between p-2">
            <h1 className="font-bold text-xl">التعليق على المنشور</h1>
            <button onClick={onClose} className="text-xl font-bold">
              x
            </button>
          </div>
          <DrawerBody>
            <Commint
              postId={postId}
              post={post}
              commints={commints}
              commintsLoading={commintsLoading}
              fetchData={fetchData}
              openEditModal={openEditModal}
            />
          </DrawerBody>
          <DrawerFooter>
            <Input
              placeholder="أضف تعليقاً..."
              value={content}
              onChange={handleContentChange}
            />
            <Button
              className="mx-2"
              ml={2}
              colorScheme="blue"
              onClick={handleAddComment}
              isLoading={commentLoading}
            >
              <IoSend />
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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

export default PostFooter;
