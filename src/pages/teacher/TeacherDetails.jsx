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
  Button,
  useToast,
  VStack,
  HStack,
  Container,
  Card,
  SimpleGrid,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { FaFileVideo, FaSearch } from "react-icons/fa";
import baseUrl from "../../api/baseUrl";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import TeacherInfo from "../../components/teacher/TeacherInfo";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input as ChakraInput } from "@chakra-ui/react";

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
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const sectionBg = useColorModeValue("white", "gray.800");
  const sectionBorder = useColorModeValue("gray.200", "gray.700");
  const modalBg = useColorModeValue("white", "gray.800");
  const modalBorder = useColorModeValue("gray.200", "gray.700");
  const cardHoverShadow = useColorModeValue("0 16px 40px rgba(66, 153, 225, 0.15)", "0 16px 40px rgba(0,0,0,0.35)");

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
      <Box minH="100vh" bg={bgColor} dir="rtl" className="mb-[100px]">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} pt={6} pb={4}>
          <Box borderRadius="2xl" overflow="hidden" bg={cardBg} borderWidth="1px" borderColor={cardBorder}>
            <Box h="4" bgGradient="linear(to-r, blue.400, blue.500)" />
            <Flex p={8} gap={8} direction={{ base: "column", lg: "row" }} align="center">
              <VStack flex={1} align={{ base: "center", lg: "flex-start" }} spacing={4}>
                <Box h="10" w="64" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="lg" />
                <Box h="10" w="40" bg="orange.200" _dark={{ bg: "orange.800" }} borderRadius="xl" />
                <Box h="20" w="full" maxW="400px" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="md" />
              </VStack>
              <Box w={{ base: "200px", md: "280px" }} h={{ base: "200px", md: "280px" }} borderRadius="full" bg="gray.200" _dark={{ bg: "gray.600" }} />
            </Flex>
          </Box>
        </Container>
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
          <Box
            p={5}
            borderRadius="2xl"
            bg={sectionBg}
            borderWidth="1px"
            borderColor={sectionBorder}
            mb={6}
          >
            <Flex align="center" gap={3} mb={4}>
              <Box w="12" h="12" borderRadius="xl" bg="blue.200" _dark={{ bg: "blue.700" }} />
              <Box h="6" w="48" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="md" />
            </Flex>
            <Box h="12" w="full" maxW="400px" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="xl" />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3].map((i) => (
              <Card key={i} bg={cardBg} borderRadius="2xl" overflow="hidden" borderWidth="1px" borderColor={cardBorder}>
                <Box h="200px" bg="gray.200" _dark={{ bg: "gray.600" }} />
                <Box p={5}>
                  <Box h="5" w="80%" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="md" mb={2} />
                  <Box h="4" w="60%" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="md" mb={4} />
                  <Box h="10" w="full" bg="gray.200" _dark={{ bg: "gray.600" }} borderRadius="xl" />
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
        <ScrollToTop />
      </Box>
    );
  }

  if (error || !data || !data.teacher) {
    return (
      <Box minH="60vh" bg={bgColor} dir="rtl" display="flex" alignItems="center" justifyContent="center" p={6}>
        <Box maxW="md" w="full" p={8} borderRadius="2xl" bg={cardBg} borderWidth="1px" borderColor={cardBorder} boxShadow="lg" textAlign="center">
          <Icon as={MdCancelPresentation} boxSize="16" color="red.500" mx="auto" mb={4} />
          <Text fontSize="xl" fontWeight="bold" color={headingColor}>
            {error || "هذا المحاضر غير موجود على الموقع"}
          </Text>
        </Box>
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
    <Box minH="100vh" bg={bgColor} dir="rtl" className="mb-[100px]" style={{ fontFamily: "'Changa', sans-serif" }}>
      <TeacherInfo teacher={teacher} number={courses.length} />

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={8}>
        {/* قسم الكورسات — هيدر موحّد مع البراند */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap={4}
          mb={6}
          p={5}
          borderRadius="2xl"
          bg={sectionBg}
          borderWidth="1px"
          borderColor={sectionBorder}
          boxShadow="sm"
        >
          <HStack spacing={4} flexWrap="wrap">
            <Flex w="12" h="12" borderRadius="xl" bg="blue.500" color="white" align="center" justify="center" boxShadow="md">
              <Icon as={FaFileVideo} boxSize={6} />
            </Flex>
            <VStack align="flex-start" spacing={0}>
              <Heading size="md" color={headingColor} fontWeight="bold">
                كل الكورسات المتاحة
              </Heading>
              <Text fontSize="sm" color={subtextColor}>
                {filteredCourses?.length ?? 0} كورس
              </Text>
            </VStack>
          </HStack>
          <InputGroup maxW="320px" size="md">
            <InputLeftElement pointerEvents="none" height="100%">
              <Icon as={FaSearch} color="gray.400" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="ابحث في الكورسات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="xl"
              pl={10}
              bg={cardBg}
              borderColor={cardBorder}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
            />
          </InputGroup>
        </Flex>

        {filteredCourses && filteredCourses.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                bg={cardBg}
                borderRadius="2xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={cardBorder}
                boxShadow="md"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: cardHoverShadow,
                  borderColor: "blue.400",
                }}
              >
                <Box position="relative" h="200px" overflow="hidden">
                  <Image
                    src={course.avatar || "https://via.placeholder.com/400x200/3182CE/ffffff?text=كورس"}
                    alt={course.title}
                    w="full"
                    h="full"
                    objectFit="cover"
                    transition="transform 0.3s"
                    _hover={{ transform: "scale(1.05)" }}
                  />
                  <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.700, transparent)" />
                  <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {common_grades?.[0]?.name || "مرحلة دراسية"}
                  </Badge>
                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    bg={course.is_enrolled ? "green.500" : "orange.500"}
                    color="white"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {course.is_enrolled ? "مشترك" : "غير مشترك"}
                  </Badge>
                </Box>

                <VStack p={5} align="stretch" spacing={3}>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor} noOfLines={2} textAlign="right">
                    {course.title}
                  </Text>
                  {course.description && (
                    <Text fontSize="sm" color={subtextColor} noOfLines={3} textAlign="right" lineHeight="tall">
                      {course.description}
                    </Text>
                  )}
                  <Flex justify="space-between" align="center" w="full" pt={1}>
                    <HStack spacing={2}>
                      <Icon as={FaFileVideo} color="blue.500" boxSize={4} />
                      <Text fontSize="xs" color={subtextColor}>كورس أونلاين</Text>
                    </HStack>
                    <Text fontSize="lg" color="orange.500" fontWeight="bold">
                      {course.price} ج.م
                    </Text>
                  </Flex>
                </VStack>

                <Box p={5} pt={0}>
                  {course.is_enrolled ? (
                    <Link to={`/CourseDetailsPage/${course.id}`} style={{ display: "block" }}>
                      <Button
                        w="full"
                        bg="blue.500"
                        color="white"
                        borderRadius="xl"
                        fontWeight="bold"
                        h="48px"
                        _hover={{ bg: "blue.400", transform: "translateY(-2px)", boxShadow: "md" }}
                        transition="all 0.2s"
                      >
                        دخول الكورس
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      w="full"
                      bg="orange.500"
                      color="white"
                      borderRadius="xl"
                      fontWeight="bold"
                      h="48px"
                      onClick={() => setActivateModal({ isOpen: true, courseId: course.id })}
                      _hover={{ bg: "orange.400", transform: "translateY(-2px)", boxShadow: "md" }}
                      transition="all 0.2s"
                    >
                      تفعيل الكورس
                    </Button>
                  )}
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box
            p={10}
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={cardBorder}
            textAlign="center"
          >
            <Icon as={MdCancelPresentation} boxSize="12" color="red.500" mb={4} />
            <Text fontSize="lg" fontWeight="medium" color={textColor}>
              لا يوجد كورسات الآن، سوف يتم إضافتها في أقرب وقت ممكن
            </Text>
          </Box>
        )}
      </Container>

      <Modal isOpen={activateModal.isOpen} onClose={() => setActivateModal({ isOpen: false, courseId: null })} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
        <ModalContent borderRadius="2xl" bg={modalBg} borderWidth="1px" borderColor={modalBorder}>
          <ModalHeader bg="blue.500" color="white" borderTopRadius="2xl">تفعيل الكورس</ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <Text mb={4} color={headingColor}>أدخل كود التفعيل الذي حصلت عليه من المدرس:</Text>
            <ChakraInput
              placeholder="كود التفعيل"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              size="lg"
              borderRadius="xl"
              borderColor={cardBorder}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.3)" }}
            />
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={modalBorder}>
            <Button variant="outline" onClick={() => setActivateModal({ isOpen: false, courseId: null })} mr={3}>إلغاء</Button>
            <Button bg="orange.500" color="white" _hover={{ bg: "orange.400" }} onClick={handleActivateCourse} isLoading={activateLoading} disabled={!activationCode} borderRadius="xl">
              تأكيد التفعيل
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ScrollToTop />
    </Box>
  );
};

export default TeacherDetails;