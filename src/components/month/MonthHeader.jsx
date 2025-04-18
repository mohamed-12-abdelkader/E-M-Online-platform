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
} from "@chakra-ui/react";
import { FaPlayCircle, FaBookOpen, FaSearch, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const MonthHeader = React.memo(({ image, description, noflecture, users, isTeacher }) => {
  const textColor = useColorModeValue("white", "white");
  const accentColor = useColorModeValue("purple.300", "purple.200");
  const statBg = useColorModeValue("purple.500", "purple.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  // Animation variants
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

  console.log(users)
  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Handle user deletion
  const handleDeleteUser = () => {
    setUsers(users.filter((user) => user.user_id !== selectedUser?.user_id));
    onConfirmClose();
  };

  // Memoize users table
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
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      borderRadius="3xl"
      overflow="hidden"
      shadow="2xl"
      bgImage={`url(${image})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
      p={{ base: 4, md: 8 }}
     className="h-[250px] md:h-[500px] mt-[30px] md:mt-0"
      sx={{
        transition: "all 0.3s",
        _hover: { shadow: "dark-lg", transform: "translateY(-5px)" },
      }}
    >
      {/* Overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-t, blackAlpha.700, blackAlpha.400)"
        zIndex="1"
      />

      {/* Content */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        position="relative"
        zIndex="2"
        p={{ base: 6, md: 10 }}
        h="100%"
      >
        <MotionBox variants={childVariants}>
          <Badge
            colorScheme="purple"
            alignSelf="center"
            mb={6}
            fontSize="lg"
            px={6}
            py={2}
            borderRadius="full"
            sx={{ boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)" }}
          >
            كورس تعليمي
          </Badge>
        </MotionBox>

        <MotionText
          variants={childVariants}
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight="extrabold"
          color={textColor}
          mb={4}
          textAlign="center"
          lineHeight="1.2"
          textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
        >
          {description}
        </MotionText>

       

        <HStack spacing={6} mb={8}>
          <MotionButton
            variants={childVariants}
            leftIcon={<Icon as={FaPlayCircle} />}
            colorScheme="purple"
            size="lg"
            borderRadius="full"
            bgGradient="linear(to-r, purple.400, purple.600)"
            _hover={{
              bgGradient: "linear(to-r, purple.500, purple.700)",
              transform: "scale(1.05)",
              boxShadow: "xl",
            }}
            onClick={isTeacher ? onOpen : undefined}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isTeacher ? "عرض المشتركين" : "ابدأ التعلم"}
          </MotionButton>
        </HStack>

       
      </Flex>

      {/* Modal for Users List */}
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

      {/* Confirmation Modal for Deletion */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p={4}>
          <ModalHeader fontSize="lg" fontWeight="bold">
            تأكيد الحذف
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              هل أنت متأكد من حذف الطالب <strong>{selectedUser?.user_name}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={onConfirmClose}
              borderRadius="full"
            >
              إلغاء
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteUser}
              borderRadius="full"
            >
              حذف
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
});

export default MonthHeader;