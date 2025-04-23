import React, { useState } from 'react';
import {
  Table, Thead, Tbody, Tr, Th, Td,
  Input, Button, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, useDisclosure,
  Box, Text, InputGroup, InputLeftElement,
  VStack, Heading, useToast, FormControl,
  FormLabel, FormErrorMessage, Card, CardBody,
  Flex, HStack, useColorMode, IconButton,
} from '@chakra-ui/react';
import { FaEdit, FaSearch, FaSave, FaArrowRight, FaArrowLeft, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import useGitUser from '../../Hooks/admin/useGitUsers';
import Loading from '../../components/loading/Loading';
import baseUrl from '../../api/baseUrl';
import { toast } from 'react-toastify';

const AllUsers = () => {
    const token = localStorage.getItem("token");
  const { colorMode } = useColorMode();
  const [users, usersLoading] = useGitUser();
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();


  // Pagination settings
  const usersPerPage = 100;
  const totalUsers = Array.isArray(users) ? users.filter((user) => user.mail.toLowerCase().includes(searchEmail.toLowerCase())).length : 0;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const pageRange = 2; // Show current page ± 2

  // Handle loading state
  if (usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Loading />
      </Box>
    );
  }

  // Handle edit button click
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordError('');
    onOpen();
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
  
    try {
      const response = await baseUrl.post(
        `api/user/admin-reset-password`,
        { phone:selectedUser.phone, newPassword },
        {
          headers: {
            token: token,
          },
        }
      );
  
      toast.success("تم تغيير كلمة السر بنجاح");
    } catch (error) {
      toast.error("فشل تغيير كلمة السر");
    } finally {
      setNewPassword('');
      onClose();
    }
  };
  

  // Filter users based on email
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => user.mail.toLowerCase().includes(searchEmail.toLowerCase()))
    : [];

  // Get users for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const startPage = Math.max(1, currentPage - pageRange);
    const endPage = Math.min(totalPages, currentPage + pageRange);

    // First page
    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          size="sm"
          variant={currentPage === 1 ? 'solid' : 'outline'}
          colorScheme="teal"
          onClick={() => handlePageChange(1)}
          borderRadius="full"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(<Text key="start-ellipsis" mx={2}>...</Text>);
      }
    }

    // Pages in range
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          size="sm"
          variant={currentPage === page ? 'solid' : 'outline '}
          colorScheme="teal"
          onClick={() => handlePageChange(page)}
          borderRadius="full"
          _hover={{ bg: colorMode === 'dark' ? 'teal.600' : 'teal.100' }}
        >
          {page}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<Text key="end-ellipsis" mx={2}>...</Text>);
      }
      buttons.push(
        <Button
          key={totalPages}
          size="sm"
          variant={currentPage === totalPages ? 'solid' : 'outline'}
          colorScheme="teal"
          onClick={() => handlePageChange(totalPages)}
          borderRadius="full"
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Box p={{ base: 4, md: 8 }} className='mt-[80px]' mx="auto" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Heading size="lg" textAlign="center" color={colorMode === 'dark' ? 'whiteAlpha.900' : 'teal.600'}>
          إدارة المستخدمين
        </Heading>

        {/* Search Input */}
        <InputGroup maxW="500px" mx="auto">
          <InputLeftElement pointerEvents="none">
            <FaSearch color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} />
          </InputLeftElement>
          <Input
            placeholder="ابحث بالإيميل..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            bg={colorMode === 'dark' ? 'gray.700' : 'white'}
            color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'}
            borderRadius="md"
            boxShadow="sm"
            _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
          />
        </InputGroup>

        {/* Total Users Count */}
        <Text textAlign="center" color={colorMode === 'dark' ? 'whiteAlpha.800' : 'gray.600'}>
          إجمالي المستخدمين: <strong>{totalUsers}</strong>
        </Text>

        {/* Users Table */}
        <Card boxShadow="lg" borderRadius="md" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
          <CardBody>
            {currentUsers.length === 0 ? (
              <Text textAlign="center" color={colorMode === 'dark' ? 'whiteAlpha.700' : 'gray.500'} py={4}>
                لا يوجد مستخدمين مطابقين للبحث
              </Text>
            ) : (
              <Table variant="simple" size={{ base: 'sm', md: 'md' }} colorScheme={colorMode === 'dark' ? 'whiteAlpha' : 'gray'}>
                <Thead>
                  <Tr>
                    <Th color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.700'}>الاسم</Th>
                    <Th color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.700'}>الإيميل</Th>
                    <Th color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.700'}>تعديل الباسورد</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentUsers.map((user) => (
                    <Tr key={user.id}>
                      <Td color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'}>{user.fname}</Td>
                      <Td color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'}>{user.mail}</Td>
                      <Td>
                        <Button
                          colorScheme="teal"
                          leftIcon={<FaEdit />}
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          تعديل
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Flex justify="center" mt={4}>
            <HStack spacing={2}>
              {/* First Page */}
              <IconButton
                icon={<FaAngleDoubleRight />}
                size="sm"
                colorScheme="teal"
                variant="outline"
                isDisabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                borderRadius="full"
                aria-label="الصفحة الأولى"
                _hover={{ bg: colorMode === 'dark' ? 'teal.600' : 'teal.100' }}
              />

              {/* Previous Page */}
              <IconButton
                icon={<FaArrowRight />}
                size="sm"
                colorScheme="teal"
                variant="outline"
                isDisabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                borderRadius="full"
                aria-label="الصفحة السابقة"
                _hover={{ bg: colorMode === 'dark' ? 'teal.600' : 'teal.100' }}
              />

              {/* Page Numbers */}
              {getPaginationButtons()}

              {/* Next Page */}
              <IconButton
                icon={<FaArrowLeft />}
                size="sm"
                colorScheme="teal"
                variant="outline"
                isDisabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                borderRadius="full"
                aria-label="الصفحة التالية"
                _hover={{ bg: colorMode === 'dark' ? 'teal.600' : 'teal.100' }}
              />

              {/* Last Page */}
              <IconButton
                icon={<FaAngleDoubleLeft />}
                size="sm"
                colorScheme="teal"
                variant="outline"
                isDisabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                borderRadius="full"
                aria-label="الصفحة الأخيرة"
                _hover={{ bg: colorMode === 'dark' ? 'teal.600' : 'teal.100' }}
              />
            </HStack>
          </Flex>
        )}
      </VStack>

      {/* Edit Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="md" mx={{ base: 4, md: 0 }} bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
          <ModalHeader bg={colorMode === 'dark' ? 'teal.900' : 'teal.50'} borderTopRadius="md" color={colorMode === 'dark' ? 'whiteAlpha.900' : 'teal.800'}>
            تعديل كلمة المرور
          </ModalHeader>
          <ModalCloseButton color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.600'} />
          <ModalBody>
            <VStack spacing={4}>
              <Text color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'}>
                تعديل كلمة المرور للطالب: <strong>{selectedUser?.fname}</strong>
              </Text>
              <FormControl isInvalid={!!passwordError}>
                <FormLabel color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.700'}>كلمة المرور الجديدة</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="أدخل كلمة المرور الجديدة"
                  bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                  color={colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800'}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                />
                <FormErrorMessage>{passwordError}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              leftIcon={<FaSave />}
              mr={3}
              onClick={handlePasswordUpdate}
            >
              حفظ
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              colorScheme={colorMode === 'dark' ? 'whiteAlpha' : 'gray'}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AllUsers;