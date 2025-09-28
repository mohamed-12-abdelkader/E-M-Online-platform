import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Badge,
  VStack,
  HStack,
  Progress,
  Divider,
  Select,
  Collapse,
  Button,
  Spinner,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaEye,
  FaCheckCircle,
  FaGraduationCap,
  FaChartBar,
  FaTimesCircle,
  FaBookOpen,
  FaFileAlt,
  FaUser,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);

// مكون فرعي لعرض قسم المحاضرات
const LectureSection = ({ watchedCount, totalLectures, notWatchedLectures, accentColor, failColor }) => {
  const [showDetails, setShowDetails] = useState(false);
  const completionPercentage = (watchedCount / totalLectures) * 100;

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Icon as={FaBookOpen} color={accentColor} />
          <Text fontWeight="bold" fontSize="sm">المحاضرات</Text>
        </HStack>
        <Button size="xs" variant="ghost" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "إخفاء" : "إظهار"} التفاصيل
        </Button>
      </HStack>
      <Progress value={completionPercentage} size="sm" colorScheme="blue" mb={2} />
      <HStack spacing={3}>
        <Tooltip label={`${watchedCount} من ${totalLectures} محاضرة مشاهدة`}>
          <Badge colorScheme="green">
            <FaCheckCircle style={{ marginLeft: 4 }} /> مشاهدة: {watchedCount}
          </Badge>
        </Tooltip>
        <Tooltip label={`${notWatchedLectures.length} محاضرة غير مشاهدة`}>
          <Badge colorScheme="red">
            <FaTimesCircle style={{ marginLeft: 4 }} /> غير مشاهدة: {notWatchedLectures.length}
          </Badge>
        </Tooltip>
      </HStack>
      <Collapse in={showDetails} animateOpacity>
        {notWatchedLectures.length > 0 && (
          <Box mt={2}>
            <Text color={failColor} fontSize="xs" fontWeight="bold">
              المحاضرات غير المشاهدة:
            </Text>
            <HStack spacing={2} flexWrap="wrap" mt={1}>
              {notWatchedLectures.map((lecId) => (
                <Badge key={lecId} colorScheme="red" fontSize="xs">
                  <FaBookOpen style={{ marginLeft: 2 }} /> محاضرة {lecId}
                </Badge>
              ))}
            </HStack>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

// مكون فرعي لعرض قسم الامتحانات
const ExamSection = ({ examsSolved, examsNotSolved, title, icon, successColor, failColor }) => {
  const [showDetails, setShowDetails] = useState(false);
  const totalExams = examsSolved.length + examsNotSolved.length;
  const completionPercentage = totalExams > 0 ? (examsSolved.length / totalExams) * 100 : 0;

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Icon as={icon} color={successColor} />
          <Text fontWeight="bold" fontSize="sm">{title}</Text>
        </HStack>
        <Button size="xs" variant="ghost" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "إخفاء" : "إظهار"} التفاصيل
        </Button>
      </HStack>
      <Progress value={completionPercentage} size="sm" colorScheme="green" mb={2} />
      <HStack spacing={3}>
        <Tooltip label={`${examsSolved.length} امتحانات محلولة`}>
          <Badge colorScheme="green">
            <FaCheckCircle style={{ marginLeft: 4 }} /> محلولة: {examsSolved.length}
          </Badge>
        </Tooltip>
        <Tooltip label={`${examsNotSolved.length} امتحانات غير محلولة`}>
          <Badge colorScheme="red">
            <FaTimesCircle style={{ marginLeft: 4 }} /> غير محلولة: {examsNotSolved.length}
          </Badge>
        </Tooltip>
      </HStack>
      <Collapse in={showDetails} animateOpacity>
        {examsNotSolved.length > 0 && (
          <Box mt={2}>
            <Text color={failColor} fontSize="xs" fontWeight="bold">
              {title} غير محلولة:
            </Text>
            <VStack align="start" spacing={1} mt={1}>
              {examsNotSolved.map((ex) => (
                <Badge key={ex.exam_id} colorScheme="red" fontSize="xs">
                  <FaFileAlt style={{ marginLeft: 2 }} /> {ex.title || `امتحان ${ex.exam_id}`}
                </Badge>
              ))}
            </VStack>
          </Box>
        )}
        {examsSolved.length > 0 && (
          <Box mt={2}>
            <Text color={successColor} fontSize="xs" fontWeight="bold">
              {title} محلولة:
            </Text>
            <VStack align="start" spacing={1} mt={1}>
              {examsSolved.map((ex) => (
                <Badge key={ex.exam_id} colorScheme="green" fontSize="xs">
                  <FaFileAlt style={{ marginLeft: 2 }} /> امتحان {ex.exam_id}{" "}
                  {ex.total_grade ? `(درجة: ${ex.total_grade})` : ""}
                </Badge>
              ))}
            </VStack>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

const CourseStatisticsPage = () => {
  const { id } = useParams();
  
  // State management
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState(null);

  // الألوان المتكيفة
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const successColor = useColorModeValue("green.500", "green.300");
  const failColor = useColorModeValue("red.400", "red.300");

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/course/${id}/students-progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressData(response.data);
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError(err.response?.data?.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch lectures data
  const fetchLectures = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`api/course/${id}/lectures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLectures(response.data.lectures || []);
    } catch (err) {
      console.error("Error fetching lectures:", err);
    }
  }, [id]);

  // Fetch exams data
  const fetchExams = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`api/course/${id}/course-exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(response.data.exams || []);
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProgress();
      fetchLectures();
      fetchExams();
    }
  }, [id, fetchProgress, fetchLectures, fetchExams]);

  // تصفية الطلاب
  const filteredStudents = progressData?.students_details
    ?.filter((student) => {
      if (filter === "completed") return student.watched_count === progressData.total_lectures;
      if (filter === "incomplete") return student.watched_count < progressData.total_lectures;
      return true;
    })
    ?.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // مكون بطاقة الإحصائيات العامة
  const StatCard = ({ title, value, icon, color }) => (
    <MotionBox
      variants={itemVariants}
      p={3}
      bg={cardBg}
      borderRadius="md"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      textAlign="center"
      height="full"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Icon as={icon} w={6} h={6} color={color} mb={1} />
      <Text fontSize="sm" fontWeight="semibold" color={subTextColor}>
        {title}
      </Text>
      <Heading size="md" fontWeight="bold" color={headingColor}>
        {value.toLocaleString()}
      </Heading>
    </MotionBox>
  );

  return (
    <Box minH="100vh" className="mt-[40px]" bg={bgColor} py={{ base: 4, md: 8 }} dir="rtl">
      {/* Header Section */}
      <Flex
        as="header"
        align="center"
        justify="center"
        bg={useColorModeValue("blue.600", "gray.800")}
        color="white"
        py={{ base: 4, md: 6 }}
        mb={{ base: 4, md: 8 }}
        boxShadow="md"
        textAlign="center"
        px={{ base: 2, md: 4 }}
      >
        <VStack spacing={{ base: 1, md: 2 }}>
          <Icon as={FaChartBar} w={{ base: 8, md: 10 }} h={{ base: 8, md: 10 }} />
          <Heading as="h1" size={{ base: "md", md: "lg" }} fontWeight="bold">
            إحصائيات تقدم الطلاب
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }}>نظرة تفصيلية على تقدم الطلاب في الكورس</Text>
        </VStack>
      </Flex>

      <Container maxW="6xl" px={{ base: 2, sm: 4, md: 6 }}>
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="blue.500" />
            <Text mr={4}>جاري تحميل البيانات...</Text>
          </Flex>
        ) : error ? (
          <Box py={20} textAlign="center">
            <Text color="red.500">{error}</Text>
          </Box>
        ) : progressData ? (
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            {/* إحصائيات عامة */}
            <Box
              bg={cardBg}
              p={{ base: 3, md: 5 }}
              borderRadius={{ base: 'lg', md: 'xl' }}
              boxShadow="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading size={{ base: "sm", md: "md" }} color={headingColor} mb={{ base: 3, md: 4 }}>
                <FaChartBar style={{ display: "inline", marginLeft: 8 }} /> إحصائيات عامة
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={{ base: 3, md: 3 }} gap={{ base: 2, md: 3 }}>
                <StatCard
                  title="عدد الطلاب"
                  value={progressData.course_stats?.total_students}
                  icon={FaUsers}
                  color={accentColor}
                />
                <StatCard
                  title="عدد المحاضرات"
                  value={progressData.course_stats?.total_lectures}
                  icon={FaBookOpen}
                  color="purple.500"
                />
                <StatCard
                  title="عدد الفيديوهات"
                  value={progressData.course_stats?.total_videos}
                  icon={FaEye}
                  color="teal.500"
                />
                <StatCard
                  title="امتحانات المحاضرة"
                  value={progressData.course_stats?.total_lecture_exams}
                  icon={FaFileAlt}
                  color="orange.500"
                />
                <StatCard
                  title="امتحانات الكورس"
                  value={progressData.course_stats?.total_course_exams}
                  icon={FaGraduationCap}
                  color="green.500"
                />
              </SimpleGrid>
              <Text color={successColor} fontWeight="bold" mt={4}>
                <FaCheckCircle style={{ marginLeft: 4 }} /> عدد الطلاب الذين أكملوا الكورس:{" "}
                {progressData.completed_students}
              </Text>
            </Box>

            {/* فلترة وبحث */}
            <VStack spacing={{ base: 2, md: 4 }} align="stretch">
              <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                <Select
                  w={{ base: '100%', sm: '200px' }}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  bg={cardBg}
                  borderColor={borderColor}
                  size={{ base: 'sm', md: 'md' }}
                >
                  <option value="all">الكل</option>
                  <option value="completed">مكتمل</option>
                  <option value="incomplete">غير مكتمل</option>
                </Select>
                <Input
                  placeholder="ابحث باسم الطالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={cardBg}
                  borderColor={borderColor}
                  size={{ base: 'sm', md: 'md' }}
                  flex="1"
                  minW={{ base: '100%', sm: '200px' }}
                />
              </HStack>
            </VStack>

            {/* قائمة الطلاب */}
            {filteredStudents.length === 0 ? (
              <Box py={{ base: 10, md: 20 }} textAlign="center">
                <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>لا يوجد طلاب مطابقين.</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 4 }} gap={{ base: 3, md: 4 }}>
                {filteredStudents.map((student) => (
                  <MotionBox
                    key={student.id}
                    variants={itemVariants}
                    bg={cardBg}
                    p={{ base: 3, md: 4 }}
                    borderRadius={{ base: 'lg', md: 'xl' }}
                    boxShadow="md"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                      <HStack justify="space-between" flexWrap="wrap" gap={2}>
                        <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap">
                          <Icon as={FaUser} color={accentColor} />
                          <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }} color={headingColor}>
                            {student.name}
                          </Text>
                          <Badge colorScheme="blue" fontSize={{ base: 'xs', md: 'sm' }}>ID: {student.id}</Badge>
                        </HStack>
                        <Button
                          size={{ base: 'xs', md: 'sm' }}
                          variant="ghost"
                          onClick={() =>
                            setExpandedStudent(expandedStudent === student.id ? null : student.id)
                          }
                          fontSize={{ base: 'xs', md: 'sm' }}
                        >
                          {expandedStudent === student.id ? "إخفاء" : "إظهار"} التفاصيل
                        </Button>
                      </HStack>
                    <Collapse in={expandedStudent === student.id} animateOpacity>
                      <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                        {/* قسم المحاضرات */}
                        <LectureSection
                          watchedCount={student.watched_count}
                          totalLectures={progressData.total_lectures}
                          notWatchedLectures={student.not_watched_lectures}
                          accentColor={accentColor}
                          failColor={failColor}
                        />
                        <Divider />
                        {/* قسم امتحانات المحاضرة */}
                        <ExamSection
                          examsSolved={student.lecture_exams_solved}
                          examsNotSolved={student.lecture_exams_not_solved}
                          title="امتحانات المحاضرة"
                          icon={FaFileAlt}
                          successColor={successColor}
                          failColor={failColor}
                        />
                        <Divider />
                        {/* قسم امتحانات الكورس */}
                        <ExamSection
                          examsSolved={student.course_exams_solved}
                          examsNotSolved={student.course_exams_not_solved}
                          title="امتحانات الكورس"
                          icon={FaGraduationCap}
                          successColor={successColor}
                          failColor={failColor}
                        />
                      </VStack>
                    </Collapse>
                  </VStack>
                </MotionBox>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        ) : null}
      </Container>
    </Box>
  );
};

export default CourseStatisticsPage;