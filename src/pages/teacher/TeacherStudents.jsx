import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Center,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Avatar,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  FormControl,
  FormLabel,
  IconButton,
  useDisclosure,
  Container,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { MdEmail, MdPhone, MdArrowForward, MdSchool } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import { FiCheckCircle, FiBook, FiUser } from "react-icons/fi";
import { FaUserGraduate } from "react-icons/fa";
import baseUrl from "../../api/baseUrl";
import { useNavigate } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activating, setActivating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const [userData, isAdmin, isTeacher] = UserType();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (isTeacher) {
      fetchStudents();
    }
  }, [isTeacher]);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("api/course/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الكورسات",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleOpenActivateModal = async (student) => {
    setSelectedStudent(student);
    setSelectedCourseId("");
    await fetchCourses();
    onOpen();
  };

  const handleActivateCourse = async () => {
    if (!selectedCourseId) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى اختيار كورس",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setActivating(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.post(
        "/api/course/activate-student",
        {
          student_id: selectedStudent.id,
          course_id: parseInt(selectedCourseId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "تم بنجاح",
        description: response.data?.message || "تم تفعيل الكورس للطالب بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchStudents();
      onClose();
      setSelectedStudent(null);
      setSelectedCourseId("");
    } catch (err) {
      console.error("Error activating course:", err);
      toast({
        title: "خطأ",
        description: err.response?.data?.message || "حدث خطأ في تفعيل الكورس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActivating(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("/api/course/teacher/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.students || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "حدث خطأ في تحميل قائمة الطلاب";
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.phone?.includes(term)
    );
  });

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} pt="100px" pb={12}>
        <Container maxW="7xl">
          <Center minH="70vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
              <Text fontSize="lg" color={subTextColor}>
                جاري تحميل قائمة الطلاب...
              </Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={bgColor} pt="100px" pb={12}>
        <Container maxW="7xl">
          <Center minH="70vh">
            <VStack spacing={4}>
              <Text fontSize="xl" color="red.500" fontWeight="bold">
                {error}
              </Text>
              <Button colorScheme="blue" onClick={fetchStudents}>
                إعادة المحاولة
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} pt="100px" pb={12}>
      <Container maxW="7xl" px={{ base: 4, md: 6 }}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            gap={{ base: 4, sm: 6 }}
          >
            <VStack align="flex-start" spacing={1}>
              <Heading size={{ base: "md", sm: "lg", md: "xl" }} color={textColor} fontWeight="bold">
                طلابي
              </Heading>
              <Text color={subTextColor} fontSize={{ base: "sm", md: "md" }}>
                إدارة ومتابعة طلابك
              </Text>
            </VStack>
            <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
              <Stat
                bg={cardBg}
                p={{ base: 3, md: 4 }}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
                minW={{ base: "120px", sm: "150px" }}
              >
                <StatLabel color={subTextColor} fontSize={{ base: "xs", md: "sm" }}>
                  إجمالي الطلاب
                </StatLabel>
                <StatNumber fontSize={{ base: "xl", md: "2xl" }} color={textColor}>
                  {students.length}
                </StatNumber>
              </Stat>
              {searchTerm && (
                <Stat
                  bg={cardBg}
                  p={{ base: 3, md: 4 }}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  minW={{ base: "120px", sm: "150px" }}
                >
                  <StatLabel color={subTextColor} fontSize={{ base: "xs", md: "sm" }}>
                    نتائج البحث
                  </StatLabel>
                  <StatNumber fontSize={{ base: "xl", md: "2xl" }} color="green.500">
                    {filteredStudents.length}
                  </StatNumber>
                </Stat>
              )}
            </HStack>
          </Flex>

          {/* Search Bar */}
          <Card bg={cardBg} boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={{ base: 3, md: 4 }}>
              <InputGroup size={{ base: "md", md: "lg" }}>
                <InputLeftElement pointerEvents="none" h="full" pl={{ base: 3, md: 4 }}>
                  <BiSearch color="gray.400" size={{ base: 18, md: 20 }} />
                </InputLeftElement>
                <Input
                  placeholder="ابحث عن طالب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="white"
                  borderColor={borderColor}
                  borderRadius="md"
                  pl={{ base: 10, md: 12 }}
                  fontSize={{ base: "sm", md: "md" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                />
              </InputGroup>
            </CardBody>
          </Card>

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <Card bg={cardBg} boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <CardBody p={12}>
                <Center>
                  <VStack spacing={4}>
                    <FaUserGraduate size={48} color={subTextColor} />
                    <VStack spacing={2}>
                      <Heading size="md" color={textColor}>
                        {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد طلاب مسجلين"}
                      </Heading>
                      <Text color={subTextColor} fontSize="sm">
                        {searchTerm
                          ? "حاول البحث بكلمات مختلفة"
                          : "سيظهر الطلاب هنا عند تسجيلهم"}
                      </Text>
                    </VStack>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : (
            <Card bg={cardBg} boxShadow="sm" borderWidth="1px" borderColor={borderColor} overflow="hidden">
              <TableContainer overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                    <Tr>
                      <Th
                        color={textColor}
                        fontWeight="bold"
                        py={{ base: 3, md: 4 }}
                        fontSize={{ base: "xs", md: "sm" }}
                        whiteSpace="nowrap"
                      >
                        الطالب
                      </Th>
                      <Th
                        color={textColor}
                        fontWeight="bold"
                        py={{ base: 3, md: 4 }}
                        fontSize={{ base: "xs", md: "sm" }}
                        display={{ base: "none", md: "table-cell" }}
                      >
                        البريد الإلكتروني
                      </Th>
                      <Th
                        color={textColor}
                        fontWeight="bold"
                        py={{ base: 3, md: 4 }}
                        fontSize={{ base: "xs", md: "sm" }}
                        display={{ base: "none", lg: "table-cell" }}
                      >
                        رقم الهاتف
                      </Th>
                      <Th
                        color={textColor}
                        fontWeight="bold"
                        py={{ base: 3, md: 4 }}
                        fontSize={{ base: "xs", md: "sm" }}
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        الإجراءات
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredStudents.map((student) => (
                      <Tr
                        key={student.id}
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.700"),
                        }}
                        transition="all 0.2s"
                        borderBottomWidth="1px"
                        borderBottomColor={borderColor}
                      >
                        <Td py={{ base: 3, md: 4 }}>
                          <HStack spacing={{ base: 2, md: 3 }}>
                            <Avatar
                              size={{ base: "xs", sm: "sm" }}
                              name={student.name}
                              bg="blue.500"
                              color="white"
                            />
                            <VStack align="flex-start" spacing={0} minW={0} flex={1}>
                              <Text
                                fontWeight="semibold"
                                color={textColor}
                                fontSize={{ base: "xs", md: "sm" }}
                                noOfLines={1}
                              >
                                {student.name}
                              </Text>
                              <HStack spacing={2} display={{ base: "flex", md: "none" }}>
                                {student.email && (
                                  <HStack spacing={1}>
                                    <MdEmail size={12} color={subTextColor} />
                                    <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                                      {student.email}
                                    </Text>
                                  </HStack>
                                )}
                                <Badge
                                  colorScheme="blue"
                                  borderRadius="full"
                                  px={2}
                                  py={0.5}
                                  fontSize="2xs"
                                >
                                  <HStack spacing={1} justify="center">
                                    <FiBook size={10} />
                                    <Text>{student.courses_count}</Text>
                                  </HStack>
                                </Badge>
                              </HStack>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td py={{ base: 3, md: 4 }} display={{ base: "none", md: "table-cell" }}>
                          {student.email ? (
                            <HStack spacing={2}>
                              <MdEmail size={16} color={subTextColor} />
                              <Text fontSize="sm" color={textColor} noOfLines={1} maxW="250px">
                                {student.email}
                              </Text>
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color={subTextColor} fontStyle="italic">
                              غير متوفر
                            </Text>
                          )}
                        </Td>
                        <Td py={{ base: 3, md: 4 }} display={{ base: "none", lg: "table-cell" }}>
                          {student.phone ? (
                            <HStack spacing={2}>
                              <MdPhone size={16} color={subTextColor} />
                              <Text fontSize="sm" color={textColor}>
                                {student.phone}
                              </Text>
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color={subTextColor} fontStyle="italic">
                              غير متوفر
                            </Text>
                          )}
                        </Td>
                        <Td py={{ base: 3, md: 4 }}>
                          <VStack spacing={2} align="center">
                            <Badge
                              colorScheme="blue"
                              borderRadius="full"
                              px={{ base: 2, md: 3 }}
                              py={1}
                              fontSize={{ base: "xs", md: "sm" }}
                              display={{ base: "none", md: "flex" }}
                            >
                              <HStack spacing={1} justify="center">
                                <FiBook size={12} />
                                <Text>{student.courses_count} كورس</Text>
                              </HStack>
                            </Badge>
                            <HStack
                              spacing={{ base: 1, md: 2 }}
                              justify="center"
                              flexWrap="wrap"
                              w="full"
                            >
                              <Button
                                colorScheme="green"
                                leftIcon={<FiCheckCircle />}
                                size={{ base: "xs", sm: "sm", md: "md" }}
                                onClick={() => handleOpenActivateModal(student)}
                                fontWeight="bold"
                                boxShadow="sm"
                                _hover={{
                                  boxShadow: "md",
                                  transform: "translateY(-1px)",
                                }}
                                transition="all 0.2s"
                                fontSize={{ base: "xs", md: "sm" }}
                                px={{ base: 2, md: 4 }}
                              >
                                <Text display={{ base: "none", sm: "inline" }}>تفعيل</Text>
                                <Text display={{ base: "inline", sm: "none" }}>✓</Text>
                              </Button>
                              <Button
                                colorScheme="blue"
                                rightIcon={<MdArrowForward />}
                                size={{ base: "xs", sm: "sm", md: "md" }}
                                variant="outline"
                                onClick={() => navigate(`/teacher-students/${student.id}`)}
                                fontSize={{ base: "xs", md: "sm" }}
                                px={{ base: 2, md: 4 }}
                              >
                                <Text display={{ base: "none", sm: "inline" }}>التقرير</Text>
                                <Text display={{ base: "inline", sm: "none" }}>تقرير</Text>
                              </Button>
                            </HStack>
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </VStack>

        {/* Activate Course Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size={{ base: "full", sm: "md", md: "lg" }}
          isCentered
        >
          <ModalOverlay />
          <ModalContent borderRadius={{ base: "none", sm: "xl" }} m={{ base: 0, sm: 4 }}>
            <ModalHeader
              bg="blue.500"
              color="white"
              borderRadius={{ base: "none", sm: "xl 0 0 0" }}
              py={{ base: 4, md: 6 }}
            >
              <HStack spacing={2}>
                <FiCheckCircle size={20} />
                <Text fontSize={{ base: "md", md: "lg" }}>تفعيل كورس للطالب</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" size={{ base: "md", md: "lg" }} />

            <ModalBody p={{ base: 4, md: 6 }}>
              <VStack spacing={6} align="stretch">
                {selectedStudent && (
                  <Box
                    p={{ base: 3, md: 4 }}
                    bg="blue.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="blue.200"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size={{ base: "sm", md: "md" }}
                        name={selectedStudent.name}
                        bg="blue.500"
                      />
                      <VStack align="flex-start" spacing={0} flex={1}>
                        <Text
                          fontWeight="bold"
                          color={textColor}
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {selectedStudent.name}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                          {selectedStudent.email}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color={textColor}
                    mb={2}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    اختر الكورس
                  </FormLabel>
                  {coursesLoading ? (
                    <Center py={8}>
                      <VStack spacing={2}>
                        <Spinner size="md" color="blue.500" />
                        <Text color={subTextColor} fontSize="sm">
                          جاري تحميل الكورسات...
                        </Text>
                      </VStack>
                    </Center>
                  ) : courses.length > 0 ? (
                    <Select
                      placeholder="اختر كورس من القائمة"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      size={{ base: "md", md: "lg" }}
                      borderRadius="md"
                      borderColor={borderColor}
                      fontSize={{ base: "sm", md: "md" }}
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px blue.400",
                      }}
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Box
                      p={6}
                      bg="gray.50"
                      borderRadius="lg"
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={borderColor}
                      textAlign="center"
                    >
                      <VStack spacing={2}>
                        <MdSchool size={32} color={subTextColor} />
                        <Text color={subTextColor} fontSize="sm">
                          لا توجد كورسات متاحة
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter
              borderTopWidth="1px"
              borderTopColor={borderColor}
              py={{ base: 4, md: 6 }}
            >
              <HStack spacing={3} w="full" justify="flex-end" flexWrap="wrap">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size={{ base: "sm", md: "md" }}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  إلغاء
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleActivateCourse}
                  isLoading={activating}
                  loadingText="جاري التفعيل..."
                  leftIcon={<FiCheckCircle />}
                  isDisabled={!selectedCourseId || courses.length === 0}
                  size={{ base: "sm", md: "md" }}
                  fontWeight="bold"
                  fontSize={{ base: "sm", md: "md" }}
                  px={{ base: 4, md: 6 }}
                >
                  تفعيل الكورس
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default TeacherStudents;
