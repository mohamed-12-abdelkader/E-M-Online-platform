import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Spinner,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Badge,
  useToast,
  Container,
  Image,
  SimpleGrid,
  Grid,
  GridItem,
  IconButton
} from "@chakra-ui/react";
import {
  FaSearch,
  FaBook,
  FaLayerGroup,
  FaFileAlt,
  FaChalkboardTeacher,
  FaChevronDown,
  FaGraduationCap,
  FaDatabase,
  FaFolderOpen
} from "react-icons/fa";
import { FiArrowRight, FiFileText, FiFolder } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import baseUrl from "../../api/baseUrl";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

const MotionBox = motion(Box);

const TeacherSubject = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Theme Colors
  const mainBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.05)", "dark-lg");

  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);

  const fetchTeacherSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return;
      }

      const response = await baseUrl.get(`/api/teacher/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب المواد المتاحة";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherSubjects();
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject?.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalLessons = subjects.reduce((acc, sub) =>
    acc + (sub.chapters?.reduce((cAcc, chap) => cAcc + (chap.lessons?.length || 0), 0) || 0), 0
    , 0);

  useEffect(() => {
    if (filteredSubjects.length > 0 && !activeSubjectId) {
      const firstSubject = filteredSubjects[0];
      setActiveSubjectId(firstSubject.id);
      if (firstSubject.chapters?.length > 0) {
        setActiveChapterId(firstSubject.chapters[0].id);
      }
    }
  }, [filteredSubjects, activeSubjectId]);

  const activeSubject = filteredSubjects.find(s => s.id === activeSubjectId) || filteredSubjects[0];
  const activeChapter = activeSubject?.chapters?.find(c => c.id === activeChapterId) || activeSubject?.chapters?.[0];

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={mainBg} className="mt-[80px]">
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={mainBg} className="mt-[80px]">
        <VStack spacing={6} bg={cardBg} p={10} borderRadius="2xl" shadow="lg" border="1px dashed" borderColor="red.200">
          <Icon as={FaChalkboardTeacher} boxSize={12} color="red.400" />
          <VStack spacing={2}>
            <Text color="red.500" fontSize="xl" fontWeight="bold">عذراً، حدث خطأ</Text>
            <Text color="gray.500">{error}</Text>
          </VStack>
          <Button colorScheme="red" variant="solid" onClick={fetchTeacherSubjects} leftIcon={<Icon as={FaSearch} />} borderRadius="full" px={8}>
            إعادة المحاولة
          </Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={mainBg} pt={{ base: "100px", md: "100px" }} pb="20px" px={{ base: 3, md: 8 }} w="full" overflowX="hidden">
      <Box maxW="1600px" mx="auto">

        {/* Header Section */}
        <Box
          mb={8}
          p={{ base: 5, md: 8 }}
          bgGradient="linear(to-r, blue.600, blue.400)"
          borderRadius="3xl"
          boxShadow="2xl"
          color="white"
          position="relative"
          overflow="hidden"
        >
          {/* Background Pattern */}
          <Box position="absolute" top={0} right={0} left={0} bottom={0} opacity={0.1}
            bgImage="radial-gradient(circle at 20% 20%, white 2px, transparent 0)"
            bgSize="30px 30px"
          />

          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={6} position="relative" zIndex={1}>
            <HStack spacing={4} align="top" w={{ base: "full", md: "auto" }}>
              <Box p={3} bg="whiteAlpha.200" borderRadius="2xl" backdropFilter="blur(10px)">
                <Icon as={FaBook} boxSize={{ base: 6, md: 8 }} color="white" />
              </Box>
              <VStack align="flex-start" spacing={1} flex={1}>
                <Heading size={{ base: "md", md: "lg" }}>المواد الدراسية</Heading>
                <Text opacity={0.9} fontSize={{ base: "sm", md: "md" }}>إدارة المحتوى التعليمي، الفصول، والدروس</Text>
              </VStack>
            </HStack>

            <HStack spacing={{ base: 3, md: 10 }} divider={<Box w="1px" h="40px" bg="whiteAlpha.300" />} pt={{ base: 2, md: 0 }}>
              <VStack spacing={0}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">{subjects.length}</Text>
                <Text fontSize="sm" opacity={0.8}>مواد</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">{totalLessons}</Text>
                <Text fontSize="sm" opacity={0.8}>درس</Text>
              </VStack>
            </HStack>
          </Flex>

          <Box mt={8}>
            <InputGroup size="lg" bg="white" borderRadius="full" boxShadow="lg">
              <InputLeftElement pointerEvents="none" h="full" pl={4}>
                <Icon as={FaSearch} color="blue.500" />
              </InputLeftElement>
              <Input
                placeholder="ابحث عن مادة، فصل، أو درس..."
                _placeholder={{ color: "gray.400" }}
                border="none"
                focusBorderColor="transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                h="60px"
                fontSize="md"
                color="gray.800"
              />
            </InputGroup>
          </Box>
        </Box>

        {/* Content Section */}
        {filteredSubjects.length > 0 ? (
          <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={{ base: 5, lg: 8 }} alignItems="start">
            {/* القائمة الجانبية للمواد */}
            <Box bg={cardBg} p={{ base: 4, lg: 4 }} borderRadius="2xl" shadow={cardShadow} borderWidth="1px" borderColor={borderColor} h={{ base: "auto", lg: "calc(100vh - 250px)" }} maxH={{ base: "400px", lg: "none" }} display="flex" flexDir="column" overflow="hidden" maxW="full">
              <Flex justify="space-between" align="center" px={2} mb={4} flexShrink={0}>
                <Text fontWeight="800" color={useColorModeValue("gray.800", "white")} fontSize="lg" fontFamily="'Cairo', 'Tajawal', sans-serif">
                  المواد الدراسية
                </Text>
                <Badge bg={useColorModeValue("orange.50", "orange.900")} color="orange.500" px={3} py={1} borderRadius="full" fontWeight="bold">
                  {filteredSubjects.length}
                </Badge>
              </Flex>
              <VStack align="stretch" spacing={3} flex={1} overflowY="auto" pr={{ lg: 2 }} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: 'full' } }}>
                {filteredSubjects.map(subject => {
                  const isActive = activeSubject?.id === subject.id;
                  return (
                    <Box
                      key={subject.id}
                      p={4}
                      bg={isActive ? useColorModeValue("blue.50", "blue.900/30") : "transparent"}
                      borderWidth="1px"
                      borderColor={isActive ? useColorModeValue("blue.200", "blue.700") : "transparent"}
                      borderRadius="xl"
                      cursor="pointer"
                      position="relative"
                      onClick={() => { setActiveSubjectId(subject.id); setActiveChapterId(subject.chapters?.[0]?.id || null); }}
                      transition="all 0.2s"
                      _hover={{
                        bg: isActive ? useColorModeValue("blue.50", "blue.900/30") : useColorModeValue("gray.50", "gray.700/50"),
                        transform: isActive ? "none" : "translateX(-4px)"
                      }}
                    >
                      {isActive && (
                        <Box position="absolute" right="-1px" top="20%" bottom="20%" width="4px" bg="blue.500" borderRadius="full" />
                      )}
                      <Flex gap={4} align="center">
                        <Avatar src={subject.image_url || undefined} name={subject.name} size="md" bg="blue.500" color="white" shadow="sm" />
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="md" color={isActive ? "blue.600" : useColorModeValue("gray.800", "white")} noOfLines={1} mb={0.5} fontFamily="'Cairo', 'Tajawal', sans-serif">
                            {subject.name}
                          </Text>
                          <Flex wrap="wrap" gap={2} fontSize="xs" color="gray.500" mt={1}>
                            <Flex align="center" gap={1}><Icon as={FiFolder} /> <Text>{subject.chapters?.length || 0}</Text></Flex>
                            <Text display={{ base: "none", sm: "block" }}>•</Text>
                            <Flex align="center" gap={1}><Icon as={FiFileText} /> <Text>{(subject.chapters || []).reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)}</Text></Flex>
                            <Text display={{ base: "none", sm: "block" }}>•</Text>
                            <Flex align="center" gap={1}><Icon as={FaGraduationCap} /> <Text noOfLines={1} maxW="150px">{subject.grade_name}</Text></Flex>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            {/* منطقة محتوى المادة (الفصول والدروس) */}
            {activeSubject && (
              <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm" h={{ base: "auto", lg: "calc(100vh - 250px)" }} minH={{ base: "500px", lg: "auto" }} display="flex" flexDir="column" maxW="full" overflow="hidden">
                {/* Header: Subject Details */}
                <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={8} pb={6} borderBottomWidth="1px" borderColor={borderColor} gap={4} flexShrink={0} maxW="full">
                  <Flex gap={4} align="center" w="full">
                    <Avatar src={activeSubject.image_url || undefined} name={activeSubject.name} size={{ base: "md", md: "xl" }} bg="blue.500" shadow="md" />
                    <VStack align="start" spacing={1} flex={1}>
                      <Heading size={{ base: "md", md: "lg" }} color={useColorModeValue("gray.800", "white")} fontFamily="'Cairo', 'Tajawal', sans-serif">{activeSubject.name}</Heading>
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" maxW="2xl" lineHeight="1.6" noOfLines={{ base: 2, md: 3 }}>{activeSubject.description || "لا يوجد وصف."}</Text>
                    </VStack>
                  </Flex>
                  <Link to={`/subject/${activeSubject.id}`} style={{ width: "100%" }}>
                    <Button w={{ base: "100%", sm: "auto" }} colorScheme="blue" variant="solid" rightIcon={<FiArrowRight />} size="md" borderRadius="xl" shadow="sm">
                      عرض المادة
                    </Button>
                  </Link>
                </Flex>

                <Heading size="md" color={useColorModeValue("gray.800", "white")} fontFamily="'Cairo', 'Tajawal', sans-serif" mb={6} flexShrink={0}>محتوى المادة الدراسي</Heading>

                {activeSubject.chapters && activeSubject.chapters.length > 0 ? (
                  <Box flex={1} display="flex" flexDir="column" overflow="hidden" maxW="full">
                    {/* Wrapper for Chapters */}
                    <Box mb={6} position="relative" flexShrink={0} maxW="full">
                      <Flex gap={3} wrap="wrap" pb={2}>
                        {activeSubject.chapters.map(chapter => {
                          const isChActive = activeChapter?.id === chapter.id;
                          return (
                            <Button
                              key={chapter.id}
                              variant={isChActive ? "solid" : "ghost"}
                              colorScheme={isChActive ? "blue" : "gray"}
                              bg={isChActive ? "blue.500" : useColorModeValue("gray.50", "gray.700")}
                              color={isChActive ? "white" : "gray.500"}
                              onClick={() => setActiveChapterId(chapter.id)}
                              flexShrink={0}
                              borderRadius="xl"
                              px={{ base: 4, md: 6 }}
                              py={{ base: 4, md: 5 }}
                              size={{ base: "sm", md: "md" }}
                              fontWeight="bold"
                              fontFamily="'Cairo', 'Tajawal', sans-serif"
                              shadow={isChActive ? "md" : "none"}
                              _hover={{
                                bg: isChActive ? "blue.600" : useColorModeValue("gray.200", "gray.600"),
                                transform: "translateY(-2px)"
                              }}
                              transition="all 0.2s"
                            >
                              {chapter.name}
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>

                    {/* Active Chapter Details & Lessons */}
                    {activeChapter && (
                      <Box p={{ base: 5, md: 7 }} bg={useColorModeValue("gray.50", "gray.800/50")} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} flex={1} overflowY="auto" overflowX="hidden" sx={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: 'full' } }}>
                        <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={6} gap={4}>
                          <Box>
                            <Text fontWeight="800" color={useColorModeValue("gray.800", "white")} fontSize="xl" fontFamily="'Cairo', 'Tajawal', sans-serif" mb={1}>{activeChapter.name}</Text>
                            <Text fontSize="sm" color="gray.500">{activeChapter.lessons?.length || 0} درس</Text>
                          </Box>
                        </Flex>

                        {/* Lessons Grid */}
                        {activeChapter.lessons && activeChapter.lessons.length > 0 ? (
                          <Grid templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }} gap={5}>
                            {activeChapter.lessons.map(lesson => (
                              <GridItem key={lesson.id}>
                                <Flex
                                  as={Link}
                                  to={`/lesson/${lesson.id}`}
                                  p={5}
                                  bg={cardBg}
                                  borderRadius="xl"
                                  borderWidth="1px"
                                  borderColor={borderColor}
                                  align="center"
                                  gap={4}
                                  shadow="sm"
                                  position="relative"
                                  _hover={{ shadow: "md", borderColor: "blue.400", transform: "translateY(-3px)", textDecoration: "none" }}
                                  transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                                >
                                  <Box p={3} bg={useColorModeValue("orange.50", "orange.900/30")} color="orange.500" borderRadius="xl" borderWidth="1px" borderColor={useColorModeValue("orange.100", "orange.800")}>
                                    <Icon as={FiFileText} boxSize={5} />
                                  </Box>
                                  <Box flex={1} overflow="hidden">
                                    <Text fontWeight="bold" fontSize="md" color={useColorModeValue("gray.800", "white")} noOfLines={1} mb={0.5} fontFamily="'Cairo', 'Tajawal', sans-serif">{lesson.name}</Text>
                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>اضغط لعرض تفاصيل الدرس</Text>
                                  </Box>
                                  <IconButton aria-label="تفاصيل" icon={<FiArrowRight />} size="sm" variant="ghost" bg={useColorModeValue("blue.50", "blue.900/30")} color="blue.500" _hover={{ bg: "blue.500", color: "white" }} />
                                </Flex>
                              </GridItem>
                            ))}
                          </Grid>
                        ) : (
                          <Flex direction="column" align="center" justify="center" p={10} bg={cardBg} borderRadius="xl" borderStyle="dashed" borderWidth="2px" borderColor={borderColor}>
                            <Box p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="full" mb={4}>
                              <Icon as={FiFileText} boxSize={8} color="gray.400" />
                            </Box>
                            <Text color="gray.500" fontSize="md" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">لا توجد دروس في هذا الفصل</Text>
                          </Flex>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Flex direction="column" align="center" justify="center" py={16} bg={useColorModeValue("gray.50", "gray.700/30")} borderRadius="xl" borderStyle="dashed" borderWidth="2px" borderColor={borderColor}>
                    <Box p={4} bg={useColorModeValue("gray.100", "gray.700")} borderRadius="full" mb={4}>
                      <Icon as={FiFolder} boxSize={10} color="gray.400" />
                    </Box>
                    <Text color="gray.500" fontWeight="bold" fontSize="lg" fontFamily="'Cairo', 'Tajawal', sans-serif">لا توجد فصول</Text>
                  </Flex>
                )}
              </Box>
            )}
          </Grid>
        ) : (
          <Flex direction="column" align="center" justify="center" minH="400px" bg={cardBg} borderRadius="3xl" border="1px dashed" borderColor="gray.300" textAlign="center" p={8}>
            <Image
              src="https://illustrations.popsy.co/gray/question-mark.svg"
              h="200px"
              mb={6}
              opacity={0.5}
              filter="grayscale(100%)"
            />
            <Heading size="md" color="gray.600" mb={2}>لا توجد مواد متاحة</Heading>
            <Text color="gray.400" maxW="md">
              {searchTerm ? `لم نعثر على نتائج مطابقة لـ "${searchTerm}"` : "لم يتم إسناد أي مواد إليك حتى الآن. يرجى التواصل مع الإدارة."}
            </Text>
            {searchTerm && (
              <Button mt={6} colorScheme="blue" variant="outline" onClick={() => setSearchTerm("")}>
                مسح البحث والعودة
              </Button>
            )}
          </Flex>
        )}

      </Box>
      <ScrollToTop />
    </Box>
  );
};

export default TeacherSubject;