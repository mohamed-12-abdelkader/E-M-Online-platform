import React, { useState, useEffect } from 'react';
import baseUrl from '../../api/baseUrl';
import { FaSearch, FaPhone, FaUser, FaGraduationCap, FaArrowLeft, FaArrowRight, FaCalendar, FaKey, FaEdit } from 'react-icons/fa';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Card,
  CardBody,
  Avatar,
  Divider,
  SimpleGrid,
  Center,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  useToast
} from '@chakra-ui/react';

const AllStudents = () => {
  const [allStudents, setAllStudents] = useState([]); // جميع الطلاب
  const [filteredStudents, setFilteredStudents] = useState([]); // الطلاب المفلترة
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    skip: 0,
    hasMore: false
  });
  
  // حالات نافذة تعديل كلمة المرور
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryColor = useColorModeValue("blue.600", "blue.300");
  const primaryHoverColor = useColorModeValue("blue.700", "blue.400");
  const secondaryColor = useColorModeValue("gray.500", "gray.400");
  const secondaryHoverColor = useColorModeValue("gray.600", "gray.300");
  const avatarBg = useColorModeValue("blue.500", "blue.400");
  const phoneIconColor = useColorModeValue("blue.500", "blue.300");
  const userIconColor = useColorModeValue("green.500", "green.300");
  const gradeIconColor = useColorModeValue("purple.500", "purple.300");
  const loadingBg = useColorModeValue("white", "gray.800");
  const loadingTextColor = useColorModeValue("gray.700", "gray.200");

  // Fetch all students data
  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // جلب جميع الطلاب من API الجديد
      const response = await baseUrl.get(`/api/student/students-data`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.success) {
        const students = response.data.data.students || [];
        setAllStudents(students);
        setFilteredStudents(students);
        setPagination({
          total: response.data.data.total || students.length,
          limit: 10,
          skip: 0,
          hasMore: students.length > 10
        });
        setError(null);
      } else {
        throw new Error('فشل في جلب بيانات الطلاب');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل بيانات الطلاب');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(allStudents);
    } else {
      const filtered = allStudents.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        const name = (student.name || '').toLowerCase();
        const phone = (student.phone || '').toLowerCase();
        const parentPhone = (student.parent_phone || '').toLowerCase();
        
        // البحث في الصفوف الدراسية (grades array)
        const grades = student.grades || [];
        const gradeNames = grades.map(grade => grade.name || '').join(' ').toLowerCase();
        
        return name.includes(searchLower) || 
               phone.includes(searchLower) || 
               parentPhone.includes(searchLower) ||
               gradeNames.includes(searchLower);
      });
      setFilteredStudents(filtered);
    }
    setCurrentPage(1); // إعادة تعيين الصفحة عند البحث
  }, [searchTerm, allStudents]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // البحث يتم تلقائياً عبر useEffect
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // فتح نافذة تعديل كلمة المرور
  const openPasswordModal = (student) => {
    setSelectedStudent(student);
    setNewPassword('');
    setShowPassword(false);
    onOpen();
  };

  // تعديل كلمة مرور الطالب
  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال كلمة مرور جديدة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await baseUrl.patch(`/api/users/students/${selectedStudent.id}/password`, {
        new_password: newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        toast({
          title: 'تم التحديث',
          description: 'تم تغيير كلمة مرور الطالب بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setNewPassword('');
        setSelectedStudent(null);
      } else {
        throw new Error('فشل في تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تغيير كلمة المرور',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Calculate pagination for filtered students
  const totalPages = Math.ceil(filteredStudents.length / pagination.limit);
  const startIndex = (currentPage - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  if (loading && allStudents.length === 0) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={primaryColor} />
          <Text fontSize="lg" color={subTextColor}>جاري تحميل بيانات الطلاب...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} pt="80px" pb={8} px={4}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={4} mb={8} textAlign="center">
          <Heading size="2xl" color={textColor}>جميع الطلاب</Heading>
          <Text fontSize="lg" color={subTextColor}>إدارة وعرض بيانات الطلاب المسجلين</Text>
        </VStack>

        {/* Search Section */}
        <Card bg={cardBg} shadow="lg" mb={8}>
          <CardBody>
            <form onSubmit={handleSearch}>
              <Flex direction={{ base: "column", md: "row" }} gap={4}>
                <InputGroup
                 flex={1}>
                  <InputLeftElement>
                    <Icon as={FaSearch} color={subTextColor} />
                  </InputLeftElement>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="البحث بالاسم أو رقم الهاتف أو رقم ولي الأمر..."
                    borderColor={borderColor}
                    _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  />
                </InputGroup>
                <Button
                  type="submit"
                  bg={primaryColor}
                  _hover={{ bg: primaryHoverColor }}
                  color="white"
                  px={6}
                  py={3}
                >
                  بحث
                </Button>
                {searchTerm && (
                  <Button
                    type="button"
                    onClick={clearSearch}
                    bg={secondaryColor}
                    _hover={{ bg: secondaryHoverColor }}
                    color="white"
                    px={6}
                    py={3}
                  >
                    مسح البحث
                  </Button>
                )}
              </Flex>
            </form>
          </CardBody>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert status="error" mb={6} borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Students Grid */}
        {currentStudents.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6} mb={8}>
            {currentStudents.map((student) => (
              <Card
                key={student.id}
                bg={cardBg}
                shadow="lg"
                _hover={{ shadow: "xl" }}
                transition="all 0.3s"
                overflow="hidden"
              >
                <CardBody>
                  {/* Student Avatar */}
                  <Flex alignItems="center" mb={4}>
                    <Avatar
                      size="md"
                      bg={avatarBg}
                      name={student.name || '?'}
                      mr={3}
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" color={textColor} fontSize="lg" noOfLines={1}>
                        {student.name || 'غير محدد'}
                      </Text>
                      <Text color={subTextColor} fontSize="sm">ID: {student.id}</Text>
                    </VStack>
                  </Flex>

                  <Divider mb={4} borderColor={borderColor} />

                  {/* Student Details */}
                  <VStack spacing={3} align="start">
                    {/* Phone */}
                    <HStack spacing={2} justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Icon as={FaPhone} color={phoneIconColor} />
                        <Text color={subTextColor} fontSize="sm">رقم الهاتف:</Text>
                      </HStack>
                      <Text color={textColor} fontSize="sm" fontWeight="medium">
                        {student.phone || 'غير محدد'}
                      </Text>
                    </HStack>

                    {/* Parent Phone */}
                    <HStack spacing={2} justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Icon as={FaUser} color={userIconColor} />
                        <Text color={subTextColor} fontSize="sm">رقم ولي الأمر:</Text>
                      </HStack>
                      <Text color={textColor} fontSize="sm" fontWeight="medium">
                        {student.parent_phone || 'غير محدد'}
                      </Text>
                    </HStack>

                    {/* Grade */}
                    <HStack spacing={2} justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Icon as={FaGraduationCap} color={gradeIconColor} />
                        <Text color={subTextColor} fontSize="sm">الصف الدراسي:</Text>
                      </HStack>
                      <Text color={textColor} fontSize="sm" fontWeight="medium" textAlign="left">
                        {student.grades && student.grades.length > 0 
                          ? student.grades.map(grade => grade.name).join(', ')
                          : 'غير محدد'
                        }
                      </Text>
                    </HStack>

                    {/* Created Date */}
                    <HStack spacing={2} justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Icon as={FaCalendar} color="orange.500" />
                        <Text color={subTextColor} fontSize="sm">تاريخ التسجيل:</Text>
                      </HStack>
                      <Text color={textColor} fontSize="sm" fontWeight="medium">
                        {student.created_at 
                          ? new Date(student.created_at).toLocaleDateString('ar-EG')
                          : 'غير محدد'
                        }
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Action Buttons */}
                  <Divider my={4} borderColor={borderColor} />
                  <HStack spacing={2} justify="center">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<Icon as={FaKey} />}
                      onClick={() => openPasswordModal(student)}
                      _hover={{ bg: "blue.50" }}
                    >
                      تعديل كلمة المرور
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="6xl">👥</Text>
              <Heading size="lg" color={textColor}>
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب'}
              </Heading>
              <Text color={subTextColor}>
                {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'لم يتم العثور على أي طلاب مسجلين'}
              </Text>
            </VStack>
          </Center>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card bg={cardBg} shadow="lg">
            <CardBody>
              <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
                                 <Text color={subTextColor}>
                   عرض {startIndex + 1} إلى {Math.min(endIndex, filteredStudents.length)} من أصل {filteredStudents.length} طالب
                 </Text>
                
                <HStack spacing={2}>
                  {/* Previous Page */}
                  <IconButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    icon={<Icon as={FaArrowRight} />}
                    bg={currentPage === 1 ? "gray.100" : primaryColor}
                    color={currentPage === 1 ? "gray.400" : "white"}
                    _hover={{ bg: currentPage === 1 ? "gray.100" : primaryHoverColor }}
                    _disabled={{ bg: "gray.100", color: "gray.400", cursor: "not-allowed" }}
                    size="md"
                  />

                  {/* Page Numbers */}
                  <HStack spacing={1}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          bg={currentPage === pageNum ? primaryColor : "gray.100"}
                          color={currentPage === pageNum ? "white" : subTextColor}
                          _hover={{ 
                            bg: currentPage === pageNum ? primaryHoverColor : "gray.200" 
                          }}
                          size="md"
                          px={3}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </HStack>

                  {/* Next Page */}
                  <IconButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    icon={<Icon as={FaArrowLeft} />}
                    bg={currentPage === totalPages ? "gray.100" : primaryColor}
                    color={currentPage === totalPages ? "gray.400" : "white"}
                    _hover={{ bg: currentPage === totalPages ? "gray.100" : primaryHoverColor }}
                    _disabled={{ bg: "gray.100", color: "gray.400", cursor: "not-allowed" }}
                    size="md"
                  />
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Loading Overlay */}
        {loading && allStudents.length > 0 && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
          >
            <Card bg={loadingBg} p={6}>
              <HStack spacing={3}>
                <Spinner size="sm" color={primaryColor} />
                <Text color={loadingTextColor}>جاري التحميل...</Text>
              </HStack>
            </Card>
          </Box>
        )}
      </Container>

      {/* Modal تعديل كلمة المرور */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FaKey} color="blue.500" />
              <Text>تعديل كلمة مرور الطالب</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedStudent && (
              <VStack spacing={6} align="stretch">
                {/* معلومات الطالب */}
                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                  <VStack spacing={2} align="start">
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        bg={avatarBg}
                        name={selectedStudent.name || '?'}
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="blue.800">
                          {selectedStudent.name || 'غير محدد'}
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          ID: {selectedStudent.id}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>

                {/* نموذج كلمة المرور الجديدة */}
                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor}>
                    كلمة المرور الجديدة
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      borderColor={borderColor}
                      _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        color={subTextColor}
                      >
                        {showPassword ? "إخفاء" : "إظهار"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* تحذير */}
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold">
                      تنبيه مهم
                    </Text>
                    <Text fontSize="xs">
                      سيتم تغيير كلمة مرور الطالب فوراً. تأكد من إبلاغ الطالب بكلمة المرور الجديدة.
                    </Text>
                  </VStack>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button onClick={onClose} variant="outline">
                إلغاء
              </Button>
              <Button
                colorScheme="blue"
                onClick={handlePasswordChange}
                isLoading={passwordLoading}
                loadingText="جاري التحديث..."
                leftIcon={<Icon as={FaKey} />}
              >
                تغيير كلمة المرور
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AllStudents;
