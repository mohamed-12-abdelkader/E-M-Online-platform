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
  Badge,
  Avatar,
  Button,
  useColorModeValue,
  Divider,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  IconButton,
  Collapse,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Container,
  Flex,
  Icon,
} from "@chakra-ui/react";
import {
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdExpandMore,
  MdExpandLess,
  MdTrendingUp,
  MdTrendingDown,
  MdAssessment,
  MdPlayCircle,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import { FaCheckCircle, FaTimesCircle, FaBookOpen, FaGraduationCap, FaChartLine, FaUserGraduate } from "react-icons/fa";
import { FiArrowLeft, FiBook, FiBarChart2, FiAward, FiClock } from "react-icons/fi";
import baseUrl from "../../api/baseUrl";
import { useParams, useNavigate } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";

const StudentReport = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const toast = useToast();
  const [userData, isAdmin, isTeacher] = UserType();

  // Color values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  const greenGradient = "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
  const blueGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  const orangeGradient = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
  const purpleGradient = "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";

  useEffect(() => {
    if (isTeacher && studentId) {
      fetchReport();
    }
  }, [isTeacher, studentId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(
        `/api/course/teacher/students/${studentId}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReport(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "حدث خطأ في تحميل التقرير";
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

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير متوفر";
    return new Date(dateString).toLocaleString("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={bgGradient} pt="100px" pb={12}>
        <Container maxW="7xl">
          <Center minH="70vh">
            <VStack spacing={6}>
              <Spinner
                size="xl"
                thickness="4px"
                speed="0.65s"
                color="white"
                emptyColor="whiteAlpha.300"
              />
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  جاري تحميل التقرير...
                </Text>
                <Text fontSize="sm" color="whiteAlpha.800">
                  يرجى الانتظار قليلاً
                </Text>
              </VStack>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Box minH="100vh" bg={bgGradient} pt="100px" pb={12}>
        <Container maxW="7xl">
          <Center minH="70vh">
            <Card bg="white" borderRadius="2xl" boxShadow="2xl" p={8}>
              <VStack spacing={6}>
                <Text fontSize="xl" color="red.500" fontWeight="bold">
                  {error || "لا يمكن تحميل التقرير"}
                </Text>
                <HStack spacing={4}>
                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={fetchReport}
                    borderRadius="xl"
                  >
                    إعادة المحاولة
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/teacher-students")}
                    borderRadius="xl"
                  >
                    العودة للقائمة
                  </Button>
                </HStack>
              </VStack>
            </Card>
          </Center>
        </Container>
      </Box>
    );
  }

  const { student, courses, overallStatistics } = report;

  return (
    <Box minH="100vh" bg={bgGradient} pt="100px" pb={12}>
      <Container maxW="7xl" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          {/* Back Button */}
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            variant="ghost"
            colorScheme="purple"
            color="white"
            size={{ base: "sm", md: "md" }}
            onClick={() => navigate("/teacher-students")}
            _hover={{ bg: "whiteAlpha.200" }}
            alignSelf="flex-start"
          >
            العودة لقائمة الطلاب
          </Button>

          {/* Student Hero Card */}
          <Card
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            overflow="hidden"
            border="none"
          >
            <Box
              bgGradient={primaryGradient}
              p={{ base: 6, md: 8 }}
              color="white"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-50%"
                right="-10%"
                w="300px"
                h="300px"
                bg="whiteAlpha.100"
                borderRadius="full"
                filter="blur(60px)"
              />
              <Box
                position="absolute"
                bottom="-50%"
                left="-10%"
                w="300px"
                h="300px"
                bg="whiteAlpha.100"
                borderRadius="full"
                filter="blur(60px)"
              />
              <HStack spacing={6} position="relative" zIndex={1} flexWrap="wrap">
                <Avatar
                  size={{ base: "xl", md: "2xl" }}
                  name={student.name}
                  bg="whiteAlpha.200"
                  color="white"
                  border="4px solid"
                  borderColor="whiteAlpha.300"
                  boxShadow="xl"
                />
                <VStack align="flex-start" spacing={3} flex={1} minW={0}>
                  <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white">
                    {student.name}
                  </Heading>
                  <HStack spacing={4} flexWrap="wrap">
                    {student.email && (
                      <HStack
                        spacing={2}
                        bg="whiteAlpha.200"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        backdropFilter="blur(10px)"
                      >
                        <MdEmail size={20} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="white">
                          {student.email}
                        </Text>
                      </HStack>
                    )}
                    {student.phone && (
                      <HStack
                        spacing={2}
                        bg="whiteAlpha.200"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        backdropFilter="blur(10px)"
                      >
                        <MdPhone size={20} />
                        <Text fontSize={{ base: "sm", md: "md" }} color="white">
                          {student.phone}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          </Card>

          {/* Overall Statistics */}
          <Card bg="white" borderRadius="2xl" boxShadow="xl" border="none">
            <CardBody p={{ base: 4, md: 6 }}>
              <HStack spacing={3} mb={6}>
                <Box
                  bgGradient={primaryGradient}
                  p={3}
                  borderRadius="xl"
                  color="white"
                >
                  <FaChartLine size={24} />
                </Box>
                <Heading size={{ base: "md", md: "lg" }} color={textColor} fontWeight="bold">
                  الإحصائيات العامة
                </Heading>
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                <Card
                  bgGradient={blueGradient}
                  borderRadius="xl"
                  boxShadow="lg"
                  color="white"
                  p={4}
                >
                  <Stat>
                    <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                      إجمالي الكورسات
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">
                      {overallStatistics.totalCourses}
                    </StatNumber>
                    <StatHelpText color="whiteAlpha.800" fontSize="xs">
                      كورس مسجل
                    </StatHelpText>
                  </Stat>
                </Card>

                <Card
                  bgGradient={greenGradient}
                  borderRadius="xl"
                  boxShadow="lg"
                  color="white"
                  p={4}
                >
                  <Stat>
                    <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                      المحاضرات المشاهدة
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">
                      {overallStatistics.watchedLectures} / {overallStatistics.totalLectures}
                    </StatNumber>
                    <StatHelpText color="whiteAlpha.800" fontSize="xs">
                      <StatArrow type="increase" />
                      {overallStatistics.totalLectures > 0
                        ? Math.round(
                            (overallStatistics.watchedLectures / overallStatistics.totalLectures) * 100
                          )
                        : 0}
                      %
                    </StatHelpText>
                  </Stat>
                </Card>

                <Card
                  bgGradient={purpleGradient}
                  borderRadius="xl"
                  boxShadow="lg"
                  color="white"
                  p={4}
                >
                  <Stat>
                    <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                      الامتحانات المسلمة
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">
                      {overallStatistics.submittedExams} / {overallStatistics.totalExams}
                    </StatNumber>
                    <StatHelpText color="whiteAlpha.800" fontSize="xs">
                      امتحان
                    </StatHelpText>
                  </Stat>
                </Card>

                <Card
                  bgGradient={
                    overallStatistics.overallAverageGrade >= 50
                      ? greenGradient
                      : orangeGradient
                  }
                  borderRadius="xl"
                  boxShadow="lg"
                  color="white"
                  p={4}
                >
                  <Stat>
                    <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                      المتوسط العام
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">
                      {overallStatistics.overallAverageGrade?.toFixed(1) || 0}%
                    </StatNumber>
                    <StatHelpText color="whiteAlpha.800" fontSize="xs">
                      <StatArrow
                        type={overallStatistics.overallAverageGrade >= 50 ? "increase" : "decrease"}
                      />
                      {overallStatistics.overallAverageGrade >= 50 ? "ناجح" : "راسب"}
                    </StatHelpText>
                  </Stat>
                </Card>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Courses Tabs */}
          <Card bg="white" borderRadius="2xl" boxShadow="xl" border="none" overflow="hidden">
            <Tabs variant="enclosed" colorScheme="purple">
              <Box
                bgGradient={primaryGradient}
                px={6}
                py={4}
                borderTopRadius="2xl"
              >
                <TabList borderBottom="none" flexWrap="wrap">
                  {courses.map((course) => (
                    <Tab
                      key={course.courseId}
                      fontWeight="bold"
                      color="white"
                      _selected={{
                        color: "purple.600",
                        bg: "white",
                        borderRadius: "xl",
                      }}
                      _hover={{
                        color: "whiteAlpha.800",
                      }}
                      borderRadius="xl"
                      mb={2}
                      mr={2}
                    >
                      {course.courseTitle}
                    </Tab>
                  ))}
                </TabList>
              </Box>

              <TabPanels>
                {courses.map((course) => (
                  <TabPanel key={course.courseId} px={{ base: 4, md: 6 }} py={6}>
                    <VStack spacing={6} align="stretch">
                      {/* Course Statistics */}
                      <Card
                        bgGradient={blueGradient}
                        borderRadius="xl"
                        boxShadow="lg"
                        color="white"
                        overflow="hidden"
                      >
                        <CardBody p={6}>
                          <HStack spacing={3} mb={6}>
                            <Box
                              bg="whiteAlpha.200"
                              p={3}
                              borderRadius="xl"
                              backdropFilter="blur(10px)"
                            >
                              <FiBarChart2 size={24} />
                            </Box>
                            <Heading size="md" color="white" fontWeight="bold">
                              إحصائيات الكورس
                            </Heading>
                          </HStack>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <Box
                              bg="whiteAlpha.200"
                              p={4}
                              borderRadius="xl"
                              backdropFilter="blur(10px)"
                            >
                              <Text fontSize="xs" color="whiteAlpha.900" mb={1} fontWeight="medium">
                                المحاضرات المشاهدة
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold" color="white">
                                {course.statistics.watchedLecturesCount}
                              </Text>
                              <Text fontSize="xs" color="whiteAlpha.800">
                                من {course.statistics.totalLectures}
                              </Text>
                            </Box>
                            <Box
                              bg="whiteAlpha.200"
                              p={4}
                              borderRadius="xl"
                              backdropFilter="blur(10px)"
                            >
                              <Text fontSize="xs" color="whiteAlpha.900" mb={1} fontWeight="medium">
                                الامتحانات المسلمة
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold" color="white">
                                {course.statistics.submittedExams}
                              </Text>
                              <Text fontSize="xs" color="whiteAlpha.800">
                                من {course.statistics.totalExams}
                              </Text>
                            </Box>
                            <Box
                              bg="whiteAlpha.200"
                              p={4}
                              borderRadius="xl"
                              backdropFilter="blur(10px)"
                            >
                              <Text fontSize="xs" color="whiteAlpha.900" mb={1} fontWeight="medium">
                                المتوسط
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold" color="white">
                                {course.statistics.averageGrade?.toFixed(1) || 0}%
                              </Text>
                            </Box>
                            <Box
                              bg="whiteAlpha.200"
                              p={4}
                              borderRadius="xl"
                              backdropFilter="blur(10px)"
                            >
                              <Text fontSize="xs" color="whiteAlpha.900" mb={1} fontWeight="medium">
                                إجمالي الدرجات
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold" color="white">
                                {course.statistics.totalObtainedGrade} / {course.statistics.totalMaxGrade}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Lectures Progress */}
                      <Card bg="white" borderRadius="xl" boxShadow="md" border="none">
                        <CardBody p={6}>
                          <HStack justify="space-between" mb={6} flexWrap="wrap">
                            <HStack spacing={3}>
                              <Box
                                bgGradient={greenGradient}
                                p={3}
                                borderRadius="xl"
                                color="white"
                              >
                                <FaBookOpen size={20} />
                              </Box>
                              <Heading size="md" color={textColor} fontWeight="bold">
                                تقدم المحاضرات
                              </Heading>
                            </HStack>
                            <Badge
                              bgGradient={greenGradient}
                              color="white"
                              fontSize="md"
                              px={4}
                              py={2}
                              borderRadius="full"
                              boxShadow="sm"
                            >
                              {course.statistics.watchedLecturesCount} / {course.statistics.totalLectures}
                            </Badge>
                          </HStack>
                          <Progress
                            value={
                              course.statistics.totalLectures > 0
                                ? (course.statistics.watchedLecturesCount /
                                    course.statistics.totalLectures) *
                                  100
                                : 0
                            }
                            colorScheme="green"
                            size="lg"
                            borderRadius="full"
                            mb={6}
                            bg={useColorModeValue("gray.100", "gray.700")}
                          />
                          <TableContainer>
                            <Table variant="simple" size="md">
                              <Thead>
                                <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                                  <Th color={textColor} fontWeight="bold">المحاضرة</Th>
                                  <Th color={textColor} fontWeight="bold">الحالة</Th>
                                  <Th color={textColor} fontWeight="bold">تاريخ المشاهدة</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {course.allLectures.map((lecture) => (
                                  <Tr
                                    key={lecture.lectureId}
                                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                                    transition="all 0.2s"
                                  >
                                    <Td fontWeight="medium" color={textColor}>
                                      {lecture.lectureTitle}
                                    </Td>
                                    <Td>
                                      {lecture.isWatched ? (
                                        <Badge
                                          bgGradient={greenGradient}
                                          color="white"
                                          px={3}
                                          py={1}
                                          borderRadius="full"
                                          boxShadow="sm"
                                        >
                                          <HStack spacing={2}>
                                            <FaCheckCircle size={14} />
                                            <Text>مشاهدة</Text>
                                          </HStack>
                                        </Badge>
                                      ) : (
                                        <Badge
                                          colorScheme="gray"
                                          px={3}
                                          py={1}
                                          borderRadius="full"
                                        >
                                          <HStack spacing={2}>
                                            <FaTimesCircle size={14} />
                                            <Text>غير مشاهدة</Text>
                                          </HStack>
                                        </Badge>
                                      )}
                                    </Td>
                                    <Td color={subTextColor} fontSize="sm">
                                      {formatDate(lecture.viewedAt)}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </CardBody>
                      </Card>

                      {/* Lecture Exams */}
                      <Card bg="white" borderRadius="xl" boxShadow="md" border="none">
                        <CardBody p={6}>
                          <HStack spacing={3} mb={6}>
                            <Box
                              bgGradient={purpleGradient}
                              p={3}
                              borderRadius="xl"
                              color="white"
                            >
                              <MdAssessment size={20} />
                            </Box>
                            <Heading size="md" color={textColor} fontWeight="bold">
                              امتحانات المحاضرات
                            </Heading>
                          </HStack>
                          {course.lectureExams.length === 0 ? (
                            <Center py={12}>
                              <VStack spacing={4}>
                                <Box
                                  bgGradient={primaryGradient}
                                  p={6}
                                  borderRadius="full"
                                  boxShadow="lg"
                                >
                                  <MdAssessment size={32} color="white" />
                                </Box>
                                <Text color={subTextColor} fontSize="md" fontWeight="medium">
                                  لا توجد امتحانات محاضرات
                                </Text>
                              </VStack>
                            </Center>
                          ) : (
                            <VStack spacing={4} align="stretch">
                              {course.lectureExams.map((exam) => (
                                <Card
                                  key={exam.examId}
                                  bg={
                                    exam.passed
                                      ? useColorModeValue("green.50", "green.900")
                                      : exam.hasSubmitted
                                      ? useColorModeValue("red.50", "red.900")
                                      : useColorModeValue("gray.50", "gray.700")
                                  }
                                  borderRadius="xl"
                                  boxShadow="sm"
                                  border="2px solid"
                                  borderColor={
                                    exam.passed
                                      ? "green.200"
                                      : exam.hasSubmitted
                                      ? "red.200"
                                      : borderColor
                                  }
                                  _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "md",
                                  }}
                                  transition="all 0.2s"
                                >
                                  <CardBody p={5}>
                                    <HStack justify="space-between" mb={3} flexWrap="wrap">
                                      <VStack align="flex-start" spacing={2} flex={1} minW={0}>
                                        <Heading size="sm" color={textColor} fontWeight="bold">
                                          {exam.examTitle}
                                        </Heading>
                                        <Text fontSize="sm" color={subTextColor}>
                                          {exam.lectureTitle}
                                        </Text>
                                      </VStack>
                                      {exam.hasSubmitted ? (
                                        <Badge
                                          bgGradient={
                                            exam.passed ? greenGradient : orangeGradient
                                          }
                                          color="white"
                                          fontSize="md"
                                          px={4}
                                          py={2}
                                          borderRadius="full"
                                          boxShadow="sm"
                                        >
                                          {exam.passed ? "ناجح" : "راسب"}
                                        </Badge>
                                      ) : (
                                        <Badge
                                          colorScheme="gray"
                                          fontSize="md"
                                          px={4}
                                          py={2}
                                          borderRadius="full"
                                        >
                                          لم يسلم
                                        </Badge>
                                      )}
                                    </HStack>
                                    {exam.hasSubmitted && (
                                      <HStack spacing={4} mt={3} flexWrap="wrap">
                                        <HStack
                                          spacing={2}
                                          bg="white"
                                          px={3}
                                          py={2}
                                          borderRadius="lg"
                                          boxShadow="sm"
                                        >
                                          <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                            الدرجة:
                                          </Text>
                                          <Text fontSize="sm" color={subTextColor}>
                                            {exam.obtainedGrade} / {exam.totalGrade}
                                          </Text>
                                        </HStack>
                                        <HStack
                                          spacing={2}
                                          bg="white"
                                          px={3}
                                          py={2}
                                          borderRadius="lg"
                                          boxShadow="sm"
                                        >
                                          <Icon as={FiClock} color={subTextColor} />
                                          <Text fontSize="sm" color={subTextColor}>
                                            {formatDate(exam.submittedAt)}
                                          </Text>
                                        </HStack>
                                      </HStack>
                                    )}
                                  </CardBody>
                                </Card>
                              ))}
                            </VStack>
                          )}
                        </CardBody>
                      </Card>

                      {/* Course Exams */}
                      <Card bg="white" borderRadius="xl" boxShadow="md" border="none">
                        <CardBody p={6}>
                          <HStack spacing={3} mb={6}>
                            <Box
                              bgGradient={orangeGradient}
                              p={3}
                              borderRadius="xl"
                              color="white"
                            >
                              <FaGraduationCap size={20} />
                            </Box>
                            <Heading size="md" color={textColor} fontWeight="bold">
                              امتحانات الكورس
                            </Heading>
                          </HStack>
                          {course.courseExams.length === 0 ? (
                            <Center py={12}>
                              <VStack spacing={4}>
                                <Box
                                  bgGradient={primaryGradient}
                                  p={6}
                                  borderRadius="full"
                                  boxShadow="lg"
                                >
                                  <FaGraduationCap size={32} color="white" />
                                </Box>
                                <Text color={subTextColor} fontSize="md" fontWeight="medium">
                                  لا توجد امتحانات كورس
                                </Text>
                              </VStack>
                            </Center>
                          ) : (
                            <VStack spacing={4} align="stretch">
                              {course.courseExams.map((exam) => (
                                <Card
                                  key={exam.examId}
                                  bg={useColorModeValue("blue.50", "blue.900")}
                                  borderRadius="xl"
                                  boxShadow="sm"
                                  border="2px solid"
                                  borderColor="blue.200"
                                  _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "md",
                                  }}
                                  transition="all 0.2s"
                                >
                                  <CardBody p={5}>
                                    <HStack justify="space-between" mb={3} flexWrap="wrap">
                                      <VStack align="flex-start" spacing={2} flex={1} minW={0}>
                                        <Heading size="sm" color={textColor} fontWeight="bold">
                                          {exam.examTitle}
                                        </Heading>
                                        <HStack spacing={4} fontSize="sm" color={subTextColor} flexWrap="wrap">
                                          <HStack spacing={1}>
                                            <FiBook size={14} />
                                            <Text>{exam.questionsCount} سؤال</Text>
                                          </HStack>
                                          <HStack spacing={1}>
                                            <FiClock size={14} />
                                            <Text>{exam.durationMinutes} دقيقة</Text>
                                          </HStack>
                                          <HStack spacing={1}>
                                            <FiAward size={14} />
                                            <Text>{exam.attemptsCount} محاولة</Text>
                                          </HStack>
                                        </HStack>
                                      </VStack>
                                      <IconButton
                                        icon={
                                          expandedCourses[exam.examId] ? (
                                            <MdExpandLess />
                                          ) : (
                                            <MdExpandMore />
                                          )
                                        }
                                        onClick={() => toggleCourse(exam.examId)}
                                        aria-label="عرض التفاصيل"
                                        variant="ghost"
                                        colorScheme="blue"
                                        size="md"
                                        borderRadius="full"
                                      />
                                    </HStack>
                                    {exam.lastAttempt && (
                                      <HStack
                                        spacing={4}
                                        mt={3}
                                        flexWrap="wrap"
                                        bg="white"
                                        p={3}
                                        borderRadius="lg"
                                        boxShadow="sm"
                                      >
                                        <HStack spacing={2}>
                                          <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                            آخر محاولة:
                                          </Text>
                                          <Text fontSize="sm" color={subTextColor}>
                                            {exam.lastAttempt.obtainedGrade} / {exam.lastAttempt.totalGrade}
                                          </Text>
                                        </HStack>
                                        <HStack spacing={2}>
                                          <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                            الحالة:
                                          </Text>
                                          <Badge
                                            bgGradient={
                                              exam.lastAttempt.status === "submitted"
                                                ? greenGradient
                                                : orangeGradient
                                            }
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                          >
                                            {exam.lastAttempt.status === "submitted" ? "مسلم" : "قيد التنفيذ"}
                                          </Badge>
                                        </HStack>
                                      </HStack>
                                    )}
                                    <Collapse in={expandedCourses[exam.examId]} animateOpacity>
                                      <Box
                                        mt={4}
                                        pt={4}
                                        borderTopWidth="2px"
                                        borderColor={borderColor}
                                      >
                                        <HStack spacing={2} mb={4}>
                                          <Icon as={FiBarChart2} color={textColor} />
                                          <Text fontWeight="bold" color={textColor} fontSize="md">
                                            جميع المحاولات ({exam.allAttempts.length})
                                          </Text>
                                        </HStack>
                                        <TableContainer>
                                          <Table variant="simple" size="md">
                                            <Thead>
                                              <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                                                <Th color={textColor} fontWeight="bold">رقم المحاولة</Th>
                                                <Th color={textColor} fontWeight="bold">الدرجة</Th>
                                                <Th color={textColor} fontWeight="bold">الحالة</Th>
                                                <Th color={textColor} fontWeight="bold">تاريخ البدء</Th>
                                                <Th color={textColor} fontWeight="bold">تاريخ التسليم</Th>
                                              </Tr>
                                            </Thead>
                                            <Tbody>
                                              {exam.allAttempts.map((attempt) => (
                                                <Tr
                                                  key={attempt.attemptNumber}
                                                  _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                                                  transition="all 0.2s"
                                                >
                                                  <Td fontWeight="bold" color={textColor}>
                                                    #{attempt.attemptNumber}
                                                  </Td>
                                                  <Td color={textColor}>
                                                    {attempt.obtainedGrade} / {attempt.totalGrade}
                                                  </Td>
                                                  <Td>
                                                    <Badge
                                                      bgGradient={
                                                        attempt.status === "submitted"
                                                          ? greenGradient
                                                          : orangeGradient
                                                      }
                                                      color="white"
                                                      px={3}
                                                      py={1}
                                                      borderRadius="full"
                                                    >
                                                      {attempt.status === "submitted" ? "مسلم" : "قيد التنفيذ"}
                                                    </Badge>
                                                  </Td>
                                                  <Td color={subTextColor} fontSize="sm">
                                                    {formatDate(attempt.startedAt)}
                                                  </Td>
                                                  <Td color={subTextColor} fontSize="sm">
                                                    {formatDate(attempt.submittedAt)}
                                                  </Td>
                                                </Tr>
                                              ))}
                                            </Tbody>
                                          </Table>
                                        </TableContainer>
                                      </Box>
                                    </Collapse>
                                  </CardBody>
                                </Card>
                              ))}
                            </VStack>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default StudentReport;
