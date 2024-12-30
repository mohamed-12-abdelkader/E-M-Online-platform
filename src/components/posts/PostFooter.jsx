import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  Input,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  Modal,
  useDisclosure,
  Spinner,
  useMediaQuery,
} from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import { useState } from "react";
import useGitCommint from "../../Hooks/posts/useGitCommint";
import useAddComment from "../../Hooks/posts/useAddCommint";
import useToggleLike from "../../Hooks/posts/useToggleLike";
import ActionPost from "./ActionPost";
import Commint from "./Commint";

const PostFooter = ({ postId, post, likes, commint }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const token = localStorage.getItem("token");

  const [commints, commintsLoading, fetchData] = useGitCommint(postId);

  const { handleAddComment, handleContentChange, commentLoading, content } =
    useAddComment(postId, token, fetchData);

  const { handleToggleLike, liked, loading } = useToggleLike(
    postId,
    token,
    fetchData,
    post.liked
  );

  return (
    <div>
      <hr className='my-4' />

      <ActionPost
        onOpen={onOpen}
        loading={loading}
        liked={liked}
        handleToggleLike={handleToggleLike}
        likes={likes}
        commint={commint}
        postId={postId}
      />

      {/* Comments Drawer or Modal */}
      {isMobile ? (
        // Drawer for mobile screens
        <Drawer isOpen={isOpen} placement='bottom' onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent style={{ maxHeight: "95vh" }} className='h-[90vh]'>
            <div className='flex justify-between p-2'>
              <h1 className='font-bold text-xl'>التعليقات</h1>
              <button onClick={onClose} className='text-xl font-bold'>
                ×
              </button>
            </div>
            <DrawerBody>
              {commintsLoading ? (
                <Spinner size='xl' className='m-auto' />
              ) : (
                <Commint
                  postId={postId}
                  post={post}
                  commints={commints}
                  commintsLoading={commintsLoading}
                  fetchData={fetchData}
                />
              )}
            </DrawerBody>
            <DrawerFooter>
              <Input
                placeholder='أضف تعليقاً...'
                value={content}
                onChange={handleContentChange}
              />
              <Button
                className='mx-2'
                ml={2}
                colorScheme='blue'
                onClick={handleAddComment}
                isLoading={commentLoading}
              >
                <IoSend />
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        // Modal for larger screens
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size='xl'
          scrollBehavior='inside'
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader className='flex justify-between items-center'>
              <h1 className='font-bold text-xl'>التعليقات</h1>
              <Button variant='ghost' onClick={onClose}>
                ×
              </Button>
            </ModalHeader>
            <ModalBody>
              {commintsLoading ? (
                <Spinner size='xl' className='m-auto' />
              ) : (
                <div className='max-h-[70vh] overflow-auto'>
                  <Commint
                    postId={postId}
                    post={post}
                    commints={commints}
                    commintsLoading={commintsLoading}
                    fetchData={fetchData}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Input
                placeholder='أضف تعليقاً...'
                value={content}
                onChange={handleContentChange}
              />
              <Button
                colorScheme='blue'
                onClick={handleAddComment}
                isLoading={commentLoading}
              >
                <IoSend />
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default PostFooter;
