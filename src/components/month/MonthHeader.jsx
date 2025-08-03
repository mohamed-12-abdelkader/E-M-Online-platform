import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  ModalHeader,
  ModalFooter,
  Image, // Import Image component
} from "@chakra-ui/react";
import { FaPlayCircle, FaBookOpen, FaSearch, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const MonthHeader = React.memo(({ image, description, noflecture, users, isTeacher, id, refresh }) => {
  const token = localStorage.getItem("token");
  const textColor = "white"; // Changed to white as per design
  const accentColor = useColorModeValue("purple.300", "purple.200"); // Still using purple for modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleteUserLoading(true);

    try {
      const response = await baseUrl.delete(`api/month/student`, {
        headers: {
          token: token,
        },
        data: {
          user_id: selectedUser.user_id,
          month_id: id,
        },
      });

      if (response.status === 200) {
        toast.success("تم حذف الطالب بنجاح!");
        onConfirmClose();
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 200);
      } else {
        // Handle unexpected status codes if needed
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف الطالب!");
      console.error("خطأ في الحذف:", error.response?.data || error.message);
    } finally {
      setDeleteUserLoading(false);
      setSelectedUser(null);
    }
  };

  const usersTable = useMemo(() => (
    filteredUsers.length > 0 ? (
      <Table variant="simple" colorScheme="purple" sx={{ boxShadow: "lg" }}>
        <Thead>
          <Tr>
            <Th color="white">الرقم التعريفي</Th>
            <Th color="white">اسم المستخدم</Th>
            <Th color="white">البريد الإلكتروني</Th>
            <Th color="white">إجراءات</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredUsers.map((user) => (
            <Tr key={user.user_id} _hover={{ bg: "purple.900" }}>
              <Td color="white">{user.user_id}</Td>
              <Td color="white">{user.user_name}</Td>
              <Td color="white">{user.user_email}</Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => {
                    setSelectedUser(user);
                    onConfirmOpen();
                  }}
                >
                  <Icon as={FaTrash} />
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    ) : (
      <Text color="gray.300" textAlign="center" mt={4}>
        لا يوجد طلبة مطابقين
      </Text>
    )
  ), [filteredUsers, onConfirmOpen]);

  return (
    <div
    >

   <div
  className="bg-blue-500 px-5" // هذا الـ div الخارجي قد لا يكون ضرورياً إذا كانت الـ section تغطي المساحة
>
  <section
    dir="rtl"
    className="relative flex flex-col md:flex-row items-center justify-between md: py-16 md:py-24 bg-gradient-to-br from-white via-blue-50 to-blue-400 "
    style={{
      fontFamily: "'Cairo', sans-serif",
  
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundAttachment: "fixed", // لجعل النمط يظهر ثابتًا
      backgroundRepeat: "repeat",
      backgroundSize: "auto", // أو يمكنك استخدام 'cover' حسب تأثير الـ SVG
    }}
  >
    {/* Contained content to keep things aligned */}
    <div
      className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10"
      style={{ minHeight: "inherit" }}
    >
      {/* Course Info (Right Side in RTL) */}
      <div className="flex-1 text-center md:text-right mb-10 md:mb-0 md:ml-12 p-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
          {description || "كورس اللغة العربية : من الصفر إلى الاحتراف"}
        </h1>
        <p className="text-lg md:text-xl text-white mb-6 max-w-lg md:max-w-none mx-auto">
       
        </p>
   
        <div className="flex justify-center md:justify-start space-x-4 space-x-reverse">
             <MotionButton
                variants={childVariants}
                leftIcon={<Icon as={FaPlayCircle} />}
                colorScheme="blue"
                size="lg"
                borderRadius="full"
                bg="blue.600"
                _hover={{
                  bg: "blue.700",
                  transform: "scale(1.05)",
                  shadow: "xl",
                }}
                onClick={isTeacher ? onOpen : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isTeacher ? "عرض المشتركين" : "ابدأ التعلم"}
              </MotionButton>
          <button className="bg-white text-blue-600 border border-blue-600 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
            تصفح المحتوى
          </button>
        </div>
      </div>

      {/* Image Container (Left Side in RTL) */}
      
    </div>
    <div className=" flex-1 px-3 flex justify-center md:justify-start mt-10 md:mt-0 p-4">
        {/* الصورة الأساسية */}
       <img
  src={image || "/lE7lWBexvOTPM2MPEKyTRRBo1TQtNGMoL1pxWCxD.jpg"}
  alt="Course Instructor"
  className="rounded-3xl shadow-2x  w-[350px] max-h-[300px] md:left-0 max-w-[400px] max-h-[400px]"
  style={{
    position: "absolute",
    border: "6px solid white",
    outline: "6px solid #60A5FA",
   

    objectFit: "scale-down", // يعرض الصورة بحجمها الطبيعي بدون قص
    objectPosition: "center", // لتوسيط الصورة داخل الإطار
  }}
/>

        {/* عنصر زخرفي إضافي خلف الصورة لإضافة عمق */}
     
      </div>
  </section>

    </div>

<div className="h-[500px] px-8">
   <img
           src={image || "/lE7lWBexvOTPM2MPEKyTRRBo1TQtNGMoL1pxWCxD.jpg"} // استخدم مسار صورتك هنا "4edb8c38-39e2-40ff-9449-52246cf2a029.jpg"
          alt="Course Instructor"
          className="rounded-3xl shadow-2xl object-cover w-[750px]  h-[430px] mt-[50px] "
          style={{
           objectFit: "scale-down",
            border: "6px solid white", // حدود بيضاء حول الصورة
            outline: "6px solid #60A5FA", // حدود زرقاء خارجية
            
          }}
          
        />
</div>

      

      {/* The original large image in a separate div, if still needed for some reason */}
      {/* If this is meant to be the main image in the header, integrate it into the main section.
          If it's a separate element below the header, then this is fine.
          Given the request, the image should be *within* the header section.
          I'm commenting this out as the image is now integrated above.
      */}
      {/*
      <Box h="500px" px={8}>
        <Image
          src={image || "/lE7lWBexvOTPM2MPEKyTRRBo1TQtNGMoL1pxWCxD.jpg"}
          alt="Course Instructor"
          borderRadius="3xl"
          shadow="2xl"
          objectFit="cover"
          w="750px"
          h="500px"
          mt="50px"
          sx={{
            border: "6px solid white",
            outline: "6px solid #60A5FA",
          }}
        />
      </Box>
      */}

      {/* Modals remain unchanged */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "5xl" }} motionPreset="scale">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent borderRadius="2xl" p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.800", "gray.900")}>
          <Flex justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }} color="white">
                قائمة المشتركين
              </Text>
              <Text fontWeight="bold" fontSize="lg" color={accentColor}>
                عدد المشتركين: {filteredUsers.length} طالب
              </Text>
            </VStack>
            <ModalCloseButton
              size="lg"
              colorScheme="purple"
              bg="purple.500"
              color="white"
              borderRadius="full"
              _hover={{ bg: "purple.600", transform: "scale(1.1)" }}
            />
          </Flex>

          <InputGroup mb={6}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="ابحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="full"
              bg={useColorModeValue("gray.700", "gray.800")}
              color="white"
            />
          </InputGroup>

          <ModalBody maxH="60vh" overflowY="auto" px={{ base: 2, md: 6 }}>
            {usersTable}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p={4}>
          <ModalHeader fontSize="lg" fontWeight="bold">تأكيد الحذف</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              هل أنت متأكد من حذف الطالب <strong>{selectedUser?.user_name}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onConfirmClose} borderRadius="full">
              إلغاء
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteUser}
              borderRadius="full"
              isLoading={deleteUserLoading}
            >
              حذف
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default MonthHeader;