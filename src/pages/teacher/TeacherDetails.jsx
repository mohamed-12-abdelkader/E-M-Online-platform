import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Flex,
  Image,
  Badge,
  Spinner,
  Stack,
  Button,
  useToast,
  VStack,
  HStack,
  Container,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { FaFileVideo, FaSearch, FaEnvelope } from "react-icons/fa";
import baseUrl from "../../api/baseUrl";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import TeacherInfo from "../../components/teacher/TeacherInfo";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Input as ChakraInput } from "@chakra-ui/react";

const TeacherDetails = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activateModal, setActivateModal] = useState({ isOpen: false, courseId: null });
  const [activationCode, setActivationCode] = useState("");
  const [activateLoading, setActivateLoading] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("blue.700", "blue.200");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await baseUrl.get(`/api/student/teacher/${id}/details`, {
          headers: { Authorization: `bearer ${token} ` },
        });
        setData(res.data);
      } catch (err) {
        setError("حدث خطأ في تحميل بيانات المحاضر");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  if (loading) {
    return (
      <Box minH="100vh" className="mb-[100px]">
        {/* Loading Hero Section */}
        <Box
          bg="blue.500"
          py={8}
          px={4}
        >
          <Container dir="rtl" maxW="container.xl">
            <Flex
              direction={{ base: "column", lg: "row" }}
              align="center"
              justify="space-between"
              gap={6}
            >
              {/* Loading Content */}
              <Box flex={1} w="100%">
                <VStack align={{ base: "center", lg: "flex-start" }} spacing={6}>
                  {/* Loading Name */}
                  <Box textAlign={{ base: "center", lg: "right" }} w="full">
                    <Box
                      h={{ base: "40px", sm: "50px", md: "60px" }}
                      w={{ base: "200px", sm: "300px", md: "400px" }}
                      bg="whiteAlpha.300"
                      borderRadius="lg"
                      mb={4}
                      mx={{ base: "auto", lg: "0" }}
                    />
                    <Box
                      h="40px"
                      w="180px"
                      bg="orange.400"
                      borderRadius="xl"
                      mx={{ base: "auto", lg: "0" }}
                    />
                  </Box>

                  {/* Loading Description */}
                  <Box 
                    w="full" 
                    maxW="600px"
                    p={4}
                    bg="whiteAlpha.200"
                    borderRadius="xl"
                  >
                    <VStack spacing={2} align="stretch">
                      <Box h="20px" w="100%" bg="whiteAlpha.300" borderRadius="md" />
                      <Box h="20px" w="80%" bg="whiteAlpha.300" borderRadius="md" />
                      <Box h="20px" w="60%" bg="whiteAlpha.300" borderRadius="md" />
                    </VStack>
                  </Box>

                  {/* Loading Stats */}
                  <div className="flex">
                    <Box w="full" maxW="500px">
                      <Flex 
                        direction={{ base: "column", sm: "row" }} 
                        gap={4} 
                        w="full" 
                        justify={{ base: "center", lg: "flex-start" }}
                      >
                        <Box
                          px={5}
                          py={3}
                          bg="orange.400"
                          borderRadius="xl"
                          display="flex"
                          alignItems="center"
                          gap={3}
                        >
                          <Box w="20px" h="20px" bg="whiteAlpha.300" borderRadius="md" />
                          <VStack align="flex-start" spacing={0}>
                            <Box h="16px" w="60px" bg="whiteAlpha.300" borderRadius="sm" />
                            <Box h="24px" w="40px" bg="whiteAlpha.300" borderRadius="sm" />
                          </VStack>
                        </Box>
                      </Flex>
                    </Box>

                    {/* Loading WhatsApp */}
                    <Box className="w-[130px] mx-3">
                      <Box
                        p={4}
                        bg="#128C7E"
                        borderRadius="xl"
                      >
                        <HStack spacing={3}>
                          <Box
                            p={2}
                            bg="whiteAlpha.200"
                            borderRadius="lg"
                          >
                            <Box w="20px" h="20px" bg="whiteAlpha.300" borderRadius="md" />
                          </Box>
                          <VStack align="flex-start" spacing={0} flex={1}>
                            <Box h="20px" w="60px" bg="whiteAlpha.300" borderRadius="sm" />
                          </VStack>
                        </HStack>
                      </Box>
                    </Box>
                  </div>

                  {/* Loading Social Media */}
                  <Box w="full" maxW="600px">
                    <VStack className="flex" spacing={4} align="stretch">
                      <Box>
                        <Box h="20px" w="100px" bg="whiteAlpha.300" borderRadius="md" mb={3} />
                        <HStack spacing={3}>
                          <Box w="40px" h="40px" bg="whiteAlpha.300" borderRadius="lg" />
                          <Box w="40px" h="40px" bg="whiteAlpha.300" borderRadius="lg" />
                          <Box w="40px" h="40px" bg="whiteAlpha.300" borderRadius="lg" />
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              </Box>

              {/* Loading Avatar */}
              <Box>
                <Box
                  width={{ base: "200px", md: "300px" }}
                  height={{ base: "200px", md: "300px" }}
                  bg="whiteAlpha.300"
                  borderRadius="full"
                  borderWidth="6px"
                  borderColor="white"
                  boxShadow="lg"
                />
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Loading Courses Section */}
        <Box className="border w-[90%] m-auto my-8 p-5 rounded-lg">
          <Flex align="center" gap={3} mb={4}>
            <Box w="24px" h="24px" bg="blue.300" borderRadius="md" />
            <Box h="32px" w="200px" bg="gray.200" borderRadius="md" />
          </Flex>
          
          <Box maxW="400px" mb={6}>
            <Box h="40px" w="100%" bg="gray.200" borderRadius="md" />
          </Box>

          <div className='w-full m-auto flex justify-center md:justify-start flex-wrap gap-6'>
            {[...Array(3)].map((_, index) => (
              <Box
                key={index}
                className="w-[320px]"
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  background: "#fff",
                  overflow: "hidden",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Box h="200px" bg="gray.200" />
                <Box p={6}>
                  <VStack align="flex-start" spacing={4}>
                    <Box w="full">
                      <Box h="24px" w="80%" bg="gray.200" borderRadius="md" mb={2} />
                      <Box h="20px" w="60%" bg="gray.200" borderRadius="md" />
                    </Box>
                    <Box w="full">
                      <Box h="16px" w="100%" bg="gray.200" borderRadius="md" mb={1} />
                      <Box h="16px" w="90%" bg="gray.200" borderRadius="md" mb={1} />
                      <Box h="16px" w="70%" bg="gray.200" borderRadius="md" />
                    </Box>
                    <Flex justify="space-between" align="center" w="full" pt={2}>
                      <HStack spacing={2}>
                        <Box w="16px" h="16px" bg="gray.200" borderRadius="md" />
                        <Box h="16px" w="80px" bg="gray.200" borderRadius="md" />
                      </HStack>
                      <Box h="24px" w="60px" bg="gray.200" borderRadius="md" />
                    </Flex>
                  </VStack>
                </Box>
                <Box p={6} pt={0}>
                  <Box h="48px" w="full" bg="gray.200" borderRadius="xl" />
                </Box>
              </Box>
            ))}
          </div>
        </Box>
      </Box>
    );
  }

  if (error || !data || !data.teacher) {
    return (
      <Box maxW='md' w='full' p={8} borderRadius='2xl' boxShadow='xl' textAlign='center' m="auto" mt={12}>
        <Box as={MdCancelPresentation} size='64px' color='red.500' mx='auto' mb={4} />
        <Text fontSize='xl' fontWeight='bold' color={textColor}>
          {error || "هذا المحاضر غير موجود على الموقع"}
        </Text>
      </Box>
    );
  }

  const { teacher, common_grades, courses } = data;

  // فلترة الكورسات حسب البحث
  const filteredCourses = searchTerm
    ? courses?.filter((course) =>
        (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         course.title?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : courses;
console.log(teacher)

  // دالة تفعيل الكورس
  const handleActivateCourse = async () => {
    setActivateLoading(true);
    try {
      await baseUrl.post("/api/course/activate", {
        code: activationCode,
        course_id: activateModal.courseId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // تحديث حالة الكورس في البيانات المحلية
      setData(prevData => ({
        ...prevData,
        courses: prevData.courses.map(course => 
          course.id === activateModal.courseId 
            ? { ...course, is_enrolled: true }
            : course
        )
      }));
      
      toast({ title: "تم تفعيل الكورس بنجاح!", status: "success", duration: 3000, isClosable: true });
      setActivateModal({ isOpen: false, courseId: null });
      setActivationCode("");
    } catch (error) {
      toast({ title: "خطأ في تفعيل الكورس", description: error.response?.data?.message || "حدث خطأ غير متوقع", status: "error", duration: 3000, isClosable: true });
    } finally {
      setActivateLoading(false);
    }
  };

  return (
    <Box  minH='100vh' className="mb-[100px]">
      {/* Teacher Info Card */}
    <TeacherInfo teacher={teacher} number={courses.length}/>

      {/* Courses Section */}
      <Box className="border w-[90%] m-auto my-8 p-5 rounded-lg -lg">
        {/* العنوان */}
        <Flex align="center" gap={3} mb={4}>
          <Icon as={FaFileVideo} w={6} h={6} color="blue.500" />
          <Heading size="lg" color={headingColor}>
            كل الكورسات المتاحة
          </Heading>
        </Flex>
        {/* مربع البحث */}
        <InputGroup maxW="400px" mb={6}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
     
        </InputGroup>
        {/* عرض الكورسات أو رسالة لا يوجد */}
        {filteredCourses && filteredCourses.length > 0 ? (
          <div className='w-full m-auto flex justify-center md:justify-start flex-wrap gap-6'>
            {filteredCourses.map((course) => (
              <Box
                key={course.id}
                className="w-[320px]"
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  background: "#fff",
                  overflow: "hidden",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15)"
                }}
              >
                {/* صورة الكورس */}
                <Box position="relative" h="200px" overflow="hidden">
                  <Image
                    src={course.avatar || "https://via.placeholder.com/320x200/4fd1c5/ffffff?text=صورة+الكورس"}
                    alt={course.title}
                    w="full"
                    h="full"
                    objectFit="cover"
                    transition="transform 0.3s ease"
                    _hover={{ transform: "scale(1.05)" }}
                  />
                  {/* Badge للمرحلة الدراسية */}
                  <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    colorScheme="blue"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {common_grades && common_grades.length > 0 ? common_grades[0].name : "مرحلة دراسية"}
                  </Badge>
                  {/* Badge للحالة */}
                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    colorScheme={course.is_enrolled ? "green" : "orange"}
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {course.is_enrolled ? "مشترك" : "غير مشترك"}
                  </Badge>
                </Box>

                {/* معلومات الكورس */}
                <Box p={6}>
                  <VStack align="flex-start" spacing={4}>
                    {/* عنوان الكورس */}
                    <Box w="full">
                      <Text 
                        fontWeight="bold" 
                        fontSize="lg" 
                        color="#2d3748" 
                        mb={2} 
                        textAlign="right"
                        noOfLines={2}
                        lineHeight="1.4"
                      >
                        {course.title}
                      </Text>
                    </Box>

                    {/* وصف الكورس */}
                    {course.description && (
                      <Text 
                        fontSize="sm" 
                        color="#718096" 
                        textAlign="right"
                        noOfLines={3}
                        lineHeight="1.5"
                      >
                        {course.description}
                      </Text>
                    )}

                    {/* معلومات إضافية */}
                    <Flex justify="space-between" align="center" w="full" pt={2}>
                      <HStack spacing={2}>
                        <Icon as={FaFileVideo} color="blue.500" boxSize={4} />
                        <Text fontSize="xs" color="#718096">
                          كورس أونلاين
                        </Text>
                      </HStack>
                      <Text fontSize="lg" color="red.500" fontWeight="bold">
                        {course.price} جنيه
                      </Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* زر الشراء أو الدخول */}
                <Box p={6} pt={0}>
                  {course.is_enrolled ? (
                    <Link to={`/CourseDetailsPage/${course.id}`}>
                      <Button 
                        colorScheme="green" 
                        w="full" 
                        borderRadius="xl" 
                        fontWeight="bold" 
                        fontSize="md"
                        h="48px"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
                        }}
                        transition="all 0.2s ease"
                      >
                        دخول الكورس
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      colorScheme="blue" 
                      w="full" 
                      borderRadius="xl" 
                      fontWeight="bold" 
                      fontSize="md"
                      h="48px"
                      onClick={() => setActivateModal({ isOpen: true, courseId: course.id })}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
                      }}
                      transition="all 0.2s ease"
                    >
                      شراء الكورس
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </div>
        ) : (
          <Box
            p={10}
            bg={cardBg}
            borderRadius="2xl"
            textAlign="center"
            boxShadow="md"
          >
            <Icon as={MdCancelPresentation} w={12} h={12} color="red.500" mb={4} />
            <Text fontSize="lg" fontWeight="medium" color={textColor}>
              لا يوجد كورسات الآن، سوف يتم إضافتها في أقرب وقت ممكن
            </Text>
          </Box>
        )}
      </Box>
      {/* مودال تفعيل الكورس */}
      <Modal isOpen={activateModal.isOpen} onClose={() => setActivateModal({ isOpen: false, courseId: null })} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تفعيل الكورس</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>أدخل كود التفعيل الذي حصلت عليه من المدرس:</Text>
            <ChakraInput
              placeholder="كود التفعيل"
              value={activationCode}
              onChange={e => setActivationCode(e.target.value)}
              size="lg"
              borderRadius="xl"
              mb={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setActivateModal({ isOpen: false, courseId: null })} mr={3}>إلغاء</Button>
            <Button colorScheme="blue" onClick={handleActivateCourse} isLoading={activateLoading} disabled={!activationCode}>تأكيد الشراء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ScrollToTop />
    </Box>
  );
};

export default TeacherDetails;