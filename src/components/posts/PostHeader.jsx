import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Textarea,
  Input,
} from "@chakra-ui/react";
import logo from "../../img/new-logo.png";
import { MdMoreHoriz } from "react-icons/md";
import { useState } from "react";
import useDeletePost from "../../Hooks/posts/useDeletePost";
import useEditePost from "../../Hooks/posts/useEditePost"; // Import useEditePost
import useSponser from "../../Hooks/posts/useSponser";

const PostHeader = ({ name, cover, admi_id, id, content, post }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const initial = name.charAt(0).toUpperCase();
  const [deleteLoading, deletePost] = useDeletePost();
  const [editeLoading, editePost] = useEditePost(); // Use editePost and editeLoading
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false); // New state for funding modal
  const [newName, setNewName] = useState(content);

  const {
    handleAddsponser,
    handlestart_dateChange,
    handleend_dateChange,
    handlepriorityChange,
    commentLoading,
    start_date,
    priority,
    end_date,
  } = useSponser({ postId: post.id });
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  const color = colors[initial.charCodeAt(0) % colors.length];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);
  const openFundingModal = () => setIsFundingModalOpen(true); // Function to open funding modal
  const closeFundingModal = () => setIsFundingModalOpen(false); // Function to close funding modal

  const handleDelete = async () => {
    await deletePost(id);
    closeModal();
  };

  const handleEdit = async () => {
    await editePost(id, newName); // Call editePost with post id and new content
    closeEditModal();
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        {admi_id ? (
          <div className='flex items-center'>
            <img
              src={logo}
              className='h-[70px] w-[70px]'
              style={{ borderRadius: "50%" }}
            />
            <h1 className='text-xl font-bold mx-2'>E-M Online</h1>
          </div>
        ) : (
          <div className='flex items-center'>
            {cover ? (
              <img
                src={cover}
                className='h-[40px] w-[40px]'
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${color} mr-2`}
              >
                {initial}
              </div>
            )}
            <h1 className='text-xl font-bold mx-2'>{name}</h1>
          </div>
        )}
        {(user.role == null && user.id == post.user_id) ||
        (user.role == "teacher" && user.id == post.teacher_id) ||
        user.role == "admin" ? (
          <div>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<MdMoreHoriz />}
                variant='ghost'
                aria-label='Options'
              />
              <MenuList>
                <MenuItem onClick={openEditModal}>تعديل</MenuItem>
                <MenuItem onClick={openModal}>حذف</MenuItem>
                {user.role == "admin" ? (
                  <MenuItem onClick={openFundingModal}>تمويل</MenuItem>
                ) : null}
              </MenuList>
            </Menu>
          </div>
        ) : null}
      </div>

      {/* Modal for deleting post */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !deleteLoading && closeModal()}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>هل أنت متأكد من حذف هذا المنشور؟</ModalHeader>
          <ModalBody>
            <p>لن تتمكن من استعادة المنشور بعد الحذف.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='ghost'
              onClick={() => !deleteLoading && closeModal()}
            >
              إلغاء
            </Button>
            <Button
              colorScheme='red'
              onClick={handleDelete}
              isLoading={deleteLoading}
              loadingText='جاري الحذف...'
            >
              {deleteLoading ? <Spinner size='sm' /> : "تأكيد الحذف"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for editing post */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل المنشور</ModalHeader>
          <ModalBody>
            <Textarea
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='أدخل الاسم الجديد'
              resize='vertical'
              minHeight='100px'
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={closeEditModal}>
              إلغاء
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleEdit}
              isLoading={editeLoading}
            >
              تأكيد التعديل
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for funding */}
      <Modal isOpen={isFundingModalOpen} onClose={closeFundingModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تمويل المنشور</ModalHeader>
          <ModalBody>
            <h1 className='font-bold my-1'> تاريخ البدء</h1>
            <Input
              placeholder='تاريخ البدء'
              value={start_date}
              onChange={handlestart_dateChange}
              mb={3}
            />
            <h1 className='font-bold my-1'> تاريخ الانتهاء</h1>
            <Input
              placeholder='تاريخ الانتهاء'
              value={end_date}
              onChange={handleend_dateChange}
              mb={3}
            />
            <Input
              placeholder='الأولوية'
              value={priority}
              onChange={handlepriorityChange}
              mb={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={closeFundingModal}>
              إلغاء
            </Button>
            <Button colorScheme='green' onClick={handleAddsponser}>
              تمويل
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PostHeader;
