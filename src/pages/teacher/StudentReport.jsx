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
} from "@chakra-ui/react";
import {
  MdArrowBack,
  MdPerson,
  MdEmail,
  MdPhone,
  MdMenuBook,
  MdPlayCircle,
  MdCheckCircle,
  MdCancel,
  MdAssessment,
  MdExpandMore,
  MdExpandLess,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import { FaCheckCircle, FaTimesCircle, FaBookOpen } from "react-icons/fa";
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

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue("blue.50", "gray.700");

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
      <Center minH="70vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
          <Text fontSize="lg" color="gray.600">
            جاري تحميل التقرير...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error || !report) {
    return (
      <Center minH="70vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500" fontWeight="bold">
            {error || "لا يمكن تحميل التقرير"}
          </Text>
          <Button colorScheme="blue" onClick={fetchReport}>
            إعادة المحاولة
          </Button>
          <Button variant="ghost" onClick={() => navigate("/teacher-students")}>
            العودة للقائمة
          </Button>
        </VStack>
      </Center>
    );
  }

  const { student, courses, overallStatistics } = report;

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4} className="mt-[80px]">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Button
            leftIcon={<MdArrowBack />}
            variant="ghost"
            colorScheme="blue"
            mb={4}
            onClick={() => navigate("/teacher-students")}
          >
            العودة لقائمة الطلاب
          </Button>
          <HStack spacing={4}>
            <Avatar size="xl" name={student.name} bg="blue.500" color="white" />
            <VStack align="flex-start" spacing={2}>
              <Heading size="xl" color="blue.700">
                {student.name}
              </Heading>
              <HStack spacing={4} flexWrap="wrap">
                {student.email && (
                  <HStack spacing={2} color="gray.600">
                    <MdEmail size={18} />
                    <Text fontSize="sm">{student.email}</Text>
                  </HStack>
                )}
                {student.phone && (
                  <HStack spacing={2} color="gray.600">
                    <MdPhone size={18} />
                    <Text fontSize="sm">{student.phone}</Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Box>

        {/* Overall Statistics */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" boxShadow="lg">
          <CardBody>
            <Heading size="md" mb={6} color="blue.700">
              الإحصائيات العامة
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Stat>
                <StatLabel>إجمالي الكورسات</StatLabel>
                <StatNumber>{overallStatistics.totalCourses}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>المحاضرات المشاهدة</StatLabel>
                <StatNumber>
                  {overallStatistics.watchedLectures} / {overallStatistics.totalLectures}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {overallStatistics.totalLectures > 0
                    ? Math.round(
                        (overallStatistics.watchedLectures / overallStatistics.totalLectures) * 100
                      )
                    : 0}
                  %
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>الامتحانات المسلمة</StatLabel>
                <StatNumber>
                  {overallStatistics.submittedExams} / {overallStatistics.totalExams}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>المتوسط العام</StatLabel>
                <StatNumber>{overallStatistics.overallAverageGrade?.toFixed(1) || 0}%</StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={
                      overallStatistics.overallAverageGrade >= 50 ? "increase" : "decrease"
                    }
                  />
                  {overallStatistics.overallAverageGrade >= 50 ? "ناجح" : "راسب"}
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Courses Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            {courses.map((course, idx) => (
              <Tab key={course.courseId} fontWeight="bold">
                {course.courseTitle}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {courses.map((course) => (
              <TabPanel key={course.courseId} px={0}>
                <VStack spacing={6} align="stretch">
                  {/* Course Statistics */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="md" mb={4} color="blue.700">
                        إحصائيات الكورس
                      </Heading>
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            المحاضرات المشاهدة
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            {course.statistics.watchedLecturesCount}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            من {course.statistics.totalLectures}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            الامتحانات المسلمة
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                            {course.statistics.submittedExams}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            من {course.statistics.totalExams}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            المتوسط
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                            {course.statistics.averageGrade?.toFixed(1) || 0}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            إجمالي الدرجات
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                            {course.statistics.totalObtainedGrade} / {course.statistics.totalMaxGrade}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Lectures Progress */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="blue.700">
                          تقدم المحاضرات
                        </Heading>
                        <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full">
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
                        mb={4}
                      />
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>المحاضرة</Th>
                              <Th>الحالة</Th>
                              <Th>تاريخ المشاهدة</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {course.allLectures.map((lecture) => (
                              <Tr key={lecture.lectureId}>
                                <Td fontWeight="medium">{lecture.lectureTitle}</Td>
                                <Td>
                                  {lecture.isWatched ? (
                                    <Badge colorScheme="green">
                                      <HStack spacing={1}>
                                        <FaCheckCircle />
                                        <Text>مشاهدة</Text>
                                      </HStack>
                                    </Badge>
                                  ) : (
                                    <Badge colorScheme="gray">
                                      <HStack spacing={1}>
                                        <FaTimesCircle />
                                        <Text>غير مشاهدة</Text>
                                      </HStack>
                                    </Badge>
                                  )}
                                </Td>
                                <Td>{formatDate(lecture.viewedAt)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </CardBody>
                  </Card>

                  {/* Lecture Exams */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="md" mb={4} color="blue.700">
                        امتحانات المحاضرات
                      </Heading>
                      {course.lectureExams.length === 0 ? (
                        <Center py={8}>
                          <Text color="gray.500">لا توجد امتحانات محاضرات</Text>
                        </Center>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {course.lectureExams.map((exam) => (
                            <Box
                              key={exam.examId}
                              p={4}
                              borderRadius="lg"
                              borderWidth="1px"
                              borderColor={borderColor}
                              bg={exam.passed ? "green.50" : exam.hasSubmitted ? "red.50" : "gray.50"}
                            >
                              <HStack justify="space-between" mb={2}>
                                <VStack align="flex-start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {exam.examTitle}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {exam.lectureTitle}
                                  </Text>
                                </VStack>
                                {exam.hasSubmitted ? (
                                  <Badge
                                    colorScheme={exam.passed ? "green" : "red"}
                                    fontSize="md"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                  >
                                    {exam.passed ? "ناجح" : "راسب"}
                                  </Badge>
                                ) : (
                                  <Badge colorScheme="gray" fontSize="md" px={3} py={1} borderRadius="full">
                                    لم يسلم
                                  </Badge>
                                )}
                              </HStack>
                              {exam.hasSubmitted && (
                                <HStack spacing={4} mt={2}>
                                  <Text fontSize="sm">
                                    <strong>الدرجة:</strong> {exam.obtainedGrade} / {exam.totalGrade}
                                  </Text>
                                  <Text fontSize="sm">
                                    <strong>تاريخ التسليم:</strong> {formatDate(exam.submittedAt)}
                                  </Text>
                                </HStack>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* Course Exams */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody>
                      <Heading size="md" mb={4} color="blue.700">
                        امتحانات الكورس
                      </Heading>
                      {course.courseExams.length === 0 ? (
                        <Center py={8}>
                          <Text color="gray.500">لا توجد امتحانات كورس</Text>
                        </Center>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {course.courseExams.map((exam) => (
                            <Box
                              key={exam.examId}
                              p={4}
                              borderRadius="lg"
                              borderWidth="1px"
                              borderColor={borderColor}
                              bg={exam.hasAttempted ? "blue.50" : "gray.50"}
                            >
                              <HStack justify="space-between" mb={2}>
                                <VStack align="flex-start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {exam.examTitle}
                                  </Text>
                                  <HStack spacing={4} fontSize="sm" color="gray.600">
                                    <Text>{exam.questionsCount} سؤال</Text>
                                    <Text>{exam.durationMinutes} دقيقة</Text>
                                    <Text>{exam.attemptsCount} محاولة</Text>
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
                                />
                              </HStack>
                              {exam.lastAttempt && (
                                <HStack spacing={4} mt={2} fontSize="sm">
                                  <Text>
                                    <strong>آخر محاولة:</strong> {exam.lastAttempt.obtainedGrade} /{" "}
                                    {exam.lastAttempt.totalGrade}
                                  </Text>
                                  <Text>
                                    <strong>الحالة:</strong>{" "}
                                    <Badge
                                      colorScheme={
                                        exam.lastAttempt.status === "submitted" ? "green" : "yellow"
                                      }
                                    >
                                      {exam.lastAttempt.status === "submitted" ? "مسلم" : "قيد التنفيذ"}
                                    </Badge>
                                  </Text>
                                </HStack>
                              )}
                              <Collapse in={expandedCourses[exam.examId]} animateOpacity>
                                <Box mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
                                  <Text fontWeight="bold" mb={3}>
                                    جميع المحاولات ({exam.allAttempts.length})
                                  </Text>
                                  <TableContainer>
                                    <Table variant="simple" size="sm">
                                      <Thead>
                                        <Tr>
                                          <Th>رقم المحاولة</Th>
                                          <Th>الدرجة</Th>
                                          <Th>الحالة</Th>
                                          <Th>تاريخ البدء</Th>
                                          <Th>تاريخ التسليم</Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody>
                                        {exam.allAttempts.map((attempt) => (
                                          <Tr key={attempt.attemptNumber}>
                                            <Td fontWeight="bold">#{attempt.attemptNumber}</Td>
                                            <Td>
                                              {attempt.obtainedGrade} / {attempt.totalGrade}
                                            </Td>
                                            <Td>
                                              <Badge
                                                colorScheme={
                                                  attempt.status === "submitted" ? "green" : "yellow"
                                                }
                                              >
                                                {attempt.status === "submitted" ? "مسلم" : "قيد التنفيذ"}
                                              </Badge>
                                            </Td>
                                            <Td>{formatDate(attempt.startedAt)}</Td>
                                            <Td>{formatDate(attempt.submittedAt)}</Td>
                                          </Tr>
                                        ))}
                                      </Tbody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              </Collapse>
                            </Box>
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
      </VStack>
    </Box>
  );
};

export default StudentReport;


