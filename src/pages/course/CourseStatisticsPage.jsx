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
  Card,
  CardBody,
  Avatar,
  Center,
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
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);

const CourseStatisticsPage = () => {
  const { id } = useParams();

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("alphabetical"); // New state for sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState(null);

  const bgColor = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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

  useEffect(() => {
    if (id) {
      fetchProgress();
    }
  }, [id, fetchProgress]);

  // Enhanced Filtering and Sorting Logic
  const filteredStudents = React.useMemo(() => {
    let result = progressData?.students_details || [];

    // 1. Filter by Status
    if (filter !== "all") {
      result = result.filter((student) => {
        const watchedCount = student.watched_lectures_count || 0;
        const totalLectures = student.total_lectures || progressData.course_stats?.total_lectures || 0;
        if (filter === "completed") return watchedCount >= totalLectures && totalLectures > 0;
        if (filter === "incomplete") return watchedCount < totalLectures;
        return true;
      });
    }

    // 2. Filter by Search (Improved accuracy)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((student) =>
        student.name?.toLowerCase().includes(query)
      );
    }

    // 3. Sorting
    // Create a new array to avoid mutating the original
    result = [...result].sort((a, b) => {
      if (sortBy === "alphabetical") {
        return (a.name || "").localeCompare(b.name || "", "ar");
      } else if (sortBy === "newest") {
        // Fallback to ID if no date available, assuming higher ID is newer
        return (b.id || 0) - (a.id || 0);
      } else if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      }
      return 0;
    });

    return result;
  }, [progressData, filter, searchQuery, sortBy]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={subTextColor}>جاري تحميل البيانات...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Icon as={FaTimesCircle} boxSize={12} color="red.500" />
          <Text color="red.500" fontSize="lg">{error}</Text>
          <Button onClick={fetchProgress} colorScheme="blue">إعادة المحاولة</Button>
        </VStack>
      </Flex>
    );
  }

  if (!progressData) return null;

  return (
    <Box minH="100vh" bg={bgColor} py={8} dir="rtl">
      <Container maxW="7xl">
        {/* Radical Header */}
        <Box
          position="relative"
          overflow="hidden"
          bgGradient="linear(to-r, blue.700, orange.600)"
          borderRadius="3xl"
          p={{ base: 6, md: 10 }}
          mb={8}
          boxShadow="2xl"
        >
          {/* Decor */}
          <Box position="absolute" top="-50%" left="-10%" w="300px" h="300px" bg="whiteAlpha.100" borderRadius="full" filter="blur(60px)" />
          <Box position="absolute" bottom="-20%" right="-5%" w="200px" h="200px" bg="blackAlpha.200" borderRadius="full" filter="blur(40px)" />
          <Box position="absolute" inset="0" bgImage="radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)" bgSize="20px 20px" opacity="0.1" />

          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={6} position="relative" zIndex={1}>
            <HStack spacing={5}>
              <Center w="80px" h="80px" bg="whiteAlpha.200" backdropFilter="blur(10px)" borderRadius="2xl" border="1px solid whiteAlpha.300" shadow="lg">
                <Icon as={FaChartBar} boxSize="40px" color="white" />
              </Center>
              <VStack align="start" spacing={1}>
                <Heading size="xl" color="white" fontWeight="900" letterSpacing="tight">إحصائيات الكورس</Heading>
                <Text color="blue.100" fontSize="lg" fontWeight="medium">تابع تقدم الطلاب وأدائهم بدقة</Text>
              </VStack>
            </HStack>

            <Button
              bg="white"
              color="blue.600"
              size="lg"
              h="14"
              px={8}
              fontSize="lg"
              leftIcon={<Icon as={FaBookOpen} />}
              onClick={() => window.history.back()}
              shadow="xl"
              borderRadius="2xl"
              _hover={{
                bg: "gray.50",
                transform: "translateY(-2px)",
                shadow: "2xl"
              }}
              transition="all 0.2s"
            >
              العودة للكورس
            </Button>
          </Flex>
        </Box>

        {/* Radical Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={5} mb={10}>
          {[
            { label: "الطلاب", value: progressData.course_stats?.total_students || 0, icon: FaUsers, color: "blue" },
            { label: "المحاضرات", value: progressData.course_stats?.total_lectures || 0, icon: FaBookOpen, color: "orange" },
            { label: "الفيديوهات", value: progressData.course_stats?.total_videos || 0, icon: FaEye, color: "purple" },
            { label: "مكتملين", value: progressData.completed_students || 0, icon: FaCheckCircle, color: "green" },
            { label: "الامتحانات", value: (progressData.course_stats?.total_lecture_exams || 0) + (progressData.course_stats?.total_course_exams || 0), icon: FaFileAlt, color: "red" },
          ].map((stat, idx) => (
            <MotionBox
              key={idx}
              bg="white"
              borderRadius="2xl"
              p={5}
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.100"
              position="relative"
              overflow="hidden"
              whileHover={{ y: -8, boxShadow: "xl" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Box
                position="absolute"
                top="-15px"
                left="-15px"
                w="80px"
                h="80px"
                bg={`${stat.color}.50`}
                borderRadius="full"
                opacity={0.5}
              />

              <Flex justify="space-between" align="start" mb={4} position="relative">
                <Center w="12" h="12" bgGradient={`linear(to-br, ${stat.color}.400, ${stat.color}.600)`} borderRadius="xl" shadow="md" color="white">
                  <Icon as={stat.icon} boxSize={6} />
                </Center>
              </Flex>

              <VStack align="start" spacing={0} position="relative">
                <Text fontSize="3xl" fontWeight="900" color="gray.800">
                  {stat.value}
                </Text>
                <Text color="gray.500" fontWeight="medium">
                  {stat.label}
                </Text>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>


        {/* Filters */}
        <HStack spacing={4} mb={6} flexWrap="wrap">
          <Input
            placeholder="ابحث باسم الطالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={cardBg}
            borderColor={borderColor}
            borderRadius="lg"
            flex="1"
            minW={{ base: '100%', sm: '250px' }}
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
          />
          <Select
            w={{ base: '100%', sm: '180px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            bg={cardBg}
            borderColor={borderColor}
            borderRadius="lg"
          >
            <option value="all">كل الحالات</option>
            <option value="completed">مكتمل</option>
            <option value="incomplete">غير مكتمل</option>
          </Select>
          <Select
            w={{ base: '100%', sm: '180px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            bg={cardBg}
            borderColor={borderColor}
            borderRadius="lg"
          >
            <option value="alphabetical">أبجدي (أ-ي)</option>
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
          </Select>
        </HStack>

        {/* Students List */}
        {
          filteredStudents.length === 0 ? (
            <Card bg={cardBg} borderRadius="xl" boxShadow="md">
              <CardBody py={12}>
                <VStack spacing={4}>
                  <Icon as={FaUsers} boxSize={16} color="gray.400" />
                  <Text color={subTextColor} fontSize="lg">لا يوجد طلاب مطابقين</Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {filteredStudents.map((student) => {
                const watchedCount = student.watched_lectures_count || 0;
                const totalLectures = student.total_lectures || progressData.course_stats?.total_lectures || 0;
                const completionPercentage = student.lectures_completion_percentage || 0;
                const solvedExams = (student.solved_lecture_exams || []).length + (student.solved_course_exams || []).length;
                const pendingExams = (student.not_solved_lecture_exams || []).length + (student.not_solved_course_exams || []).length;

                return (
                  <Card
                    key={student.id}
                    bg={cardBg}
                    className="modern-card"
                    overflow="hidden"
                    _hover={{ transform: "translateY(-5px)" }} // increased slightly
                    transition="all 0.3s"
                  >
                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        {/* Student Header */}
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Avatar
                              name={student.name}
                              bg="blue.500"
                              color="white"
                              size="md"
                              fontWeight="bold"
                            />
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg" color={textColor}>
                                {student.name}
                              </Text>
                              {student.email && (
                                <Text fontSize="sm" color={subTextColor}>{student.email}</Text>
                              )}
                            </VStack>
                          </HStack>
                          <Badge
                            colorScheme={completionPercentage === 100 ? "green" : completionPercentage >= 50 ? "blue" : "orange"}
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {completionPercentage.toFixed(0)}%
                          </Badge>
                        </HStack>

                        <Divider />

                        {/* Quick Stats */}
                        <SimpleGrid columns={2} spacing={3}>
                          <Box p={3} bg="blue.50" borderRadius="lg">
                            <Text fontSize="xs" color="blue.600" mb={1}>المحاضرات</Text>
                            <Text fontSize="xl" fontWeight="bold" color="blue.700">
                              {watchedCount}/{totalLectures}
                            </Text>
                          </Box>
                          <Box p={3} bg="purple.50" borderRadius="lg">
                            <Text fontSize="xs" color="purple.600" mb={1}>الامتحانات</Text>
                            <Text fontSize="xl" fontWeight="bold" color="purple.700">
                              {solvedExams}/{solvedExams + pendingExams}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        {/* Progress Bar */}
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>تقدم المحاضرات</Text>
                            <Text fontSize="sm" color={subTextColor}>{completionPercentage.toFixed(0)}%</Text>
                          </HStack>
                          <Progress
                            value={completionPercentage}
                            size="lg"
                            colorScheme={completionPercentage === 100 ? "green" : "blue"}
                            borderRadius="full"
                          />
                        </Box>

                        {/* Expand Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                          rightIcon={expandedStudent === student.id ? <FaChevronUp /> : <FaChevronDown />}
                          w="full"
                        >
                          {expandedStudent === student.id ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                        </Button>

                        {/* Details */}
                        <Collapse in={expandedStudent === student.id} animateOpacity>
                          <VStack align="stretch" spacing={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
                            {/* Watched Lectures */}
                            {(student.watched_lectures || []).length > 0 && (
                              <Box>
                                <HStack spacing={2} mb={3}>
                                  <Icon as={FaCheckCircle} color="green.500" />
                                  <Text fontWeight="bold" fontSize="sm" color="green.700">
                                    المحاضرات المشاهدة ({(student.watched_lectures || []).length})
                                  </Text>
                                </HStack>
                                <VStack align="stretch" spacing={2}>
                                  {(student.watched_lectures || []).slice(0, 3).map((lecture) => (
                                    <Box
                                      key={lecture.id}
                                      p={2}
                                      bg="green.50"
                                      borderRadius="md"
                                      borderLeft="3px solid"
                                      borderLeftColor="green.500"
                                    >
                                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                        #{lecture.position} - {lecture.title}
                                      </Text>
                                      <HStack spacing={2} mt={1} fontSize="xs" color="gray.600">
                                        <Text>فيديوهات: {lecture.watched_videos || 0}/{lecture.total_videos || 0}</Text>
                                        {lecture.is_watched && (
                                          <Badge colorScheme="green" fontSize="2xs">مكتملة</Badge>
                                        )}
                                      </HStack>
                                    </Box>
                                  ))}
                                  {(student.watched_lectures || []).length > 3 && (
                                    <Text fontSize="xs" color={subTextColor} textAlign="center">
                                      + {(student.watched_lectures || []).length - 3} محاضرة أخرى
                                    </Text>
                                  )}
                                </VStack>
                              </Box>
                            )}

                            {/* Not Watched Lectures */}
                            {(student.not_watched_lectures || []).length > 0 && (
                              <Box>
                                <HStack spacing={2} mb={3}>
                                  <Icon as={FaTimesCircle} color="red.500" />
                                  <Text fontWeight="bold" fontSize="sm" color="red.700">
                                    المحاضرات المتراكمة ({(student.not_watched_lectures || []).length})
                                  </Text>
                                </HStack>
                                <VStack align="stretch" spacing={2}>
                                  {(student.not_watched_lectures || []).slice(0, 3).map((lecture) => (
                                    <Box
                                      key={lecture.id}
                                      p={2}
                                      bg="red.50"
                                      borderRadius="md"
                                      borderLeft="3px solid"
                                      borderLeftColor="red.500"
                                    >
                                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                        #{lecture.position} - {lecture.title}
                                      </Text>
                                      <Text fontSize="xs" color="red.600" mt={1}>
                                        متبقي: {lecture.remaining_videos || 0} فيديو
                                      </Text>
                                    </Box>
                                  ))}
                                  {(student.not_watched_lectures || []).length > 3 && (
                                    <Text fontSize="xs" color={subTextColor} textAlign="center">
                                      + {(student.not_watched_lectures || []).length - 3} محاضرة أخرى
                                    </Text>
                                  )}
                                </VStack>
                              </Box>
                            )}

                            {/* Solved Exams */}
                            {solvedExams > 0 && (
                              <Box>
                                <HStack spacing={2} mb={3}>
                                  <Icon as={FaCheckCircle} color="green.500" />
                                  <Text fontWeight="bold" fontSize="sm" color="green.700">
                                    الامتحانات المحلولة ({solvedExams})
                                  </Text>
                                </HStack>
                                <VStack align="stretch" spacing={2}>
                                  {[...(student.solved_lecture_exams || []), ...(student.solved_course_exams || [])].slice(0, 3).map((exam) => (
                                    <Box
                                      key={exam.id}
                                      p={2}
                                      bg="green.50"
                                      borderRadius="md"
                                      borderLeft="3px solid"
                                      borderLeftColor="green.500"
                                    >
                                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{exam.title}</Text>
                                      <HStack spacing={2} mt={1} fontSize="xs">
                                        <Badge colorScheme={exam.passed ? "green" : "red"} fontSize="2xs">
                                          {exam.passed ? "نجح" : "رسب"}
                                        </Badge>
                                        <Text color="gray.600">
                                          {exam.grade || 0}/{exam.total_grade || 100}
                                        </Text>
                                      </HStack>
                                    </Box>
                                  ))}
                                </VStack>
                              </Box>
                            )}

                            {/* Pending Exams */}
                            {pendingExams > 0 && (
                              <Box>
                                <HStack spacing={2} mb={3}>
                                  <Icon as={FaTimesCircle} color="red.500" />
                                  <Text fontWeight="bold" fontSize="sm" color="red.700">
                                    الامتحانات المتراكمة ({pendingExams})
                                  </Text>
                                </HStack>
                                <VStack align="stretch" spacing={2}>
                                  {[...(student.not_solved_lecture_exams || []), ...(student.not_solved_course_exams || [])].slice(0, 3).map((exam) => (
                                    <Box
                                      key={exam.id}
                                      p={2}
                                      bg="red.50"
                                      borderRadius="md"
                                      borderLeft="3px solid"
                                      borderLeftColor="red.500"
                                    >
                                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{exam.title}</Text>
                                    </Box>
                                  ))}
                                </VStack>
                              </Box>
                            )}
                          </VStack>
                        </Collapse>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )
        }
      </Container >
    </Box >
  );
};

export default CourseStatisticsPage;
