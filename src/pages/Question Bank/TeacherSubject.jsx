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
    <Box minH="100vh" bg={mainBg} pt="100px" pb="20px" px={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">

        {/* Header Section */}
        <Box
          mb={8}
          p={8}
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
            <HStack spacing={4} align="top">
              <Box p={3} bg="whiteAlpha.200" borderRadius="2xl" backdropFilter="blur(10px)">
                <Icon as={FaBook} boxSize={8} color="white" />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg">المواد الدراسية</Heading>
                <Text opacity={0.9} fontSize="md">إدارة المحتوى التعليمي، الفصول، والدروس</Text>
              </VStack>
            </HStack>

            <HStack spacing={{ base: 4, md: 10 }} divider={<Box w="1px" h="40px" bg="whiteAlpha.300" />}>
              <VStack spacing={0}>
                <Text fontSize="3xl" fontWeight="bold">{subjects.length}</Text>
                <Text fontSize="sm" opacity={0.8}>مواد</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize="3xl" fontWeight="bold">{totalLessons}</Text>
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
          <VStack spacing={6} align="stretch">
            {filteredSubjects.map((subject, index) => (
              <MotionBox
                key={subject.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Accordion allowToggle allowMultiple bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} shadow="sm" overflow="hidden" defaultIndex={[]}>
                  <AccordionItem border="none">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton
                          p={6}
                          _hover={{ bg: "gray.50" }}
                          transition="all 0.2s"
                          borderLeft="4px solid"
                          borderLeftColor={isExpanded ? "blue.500" : "transparent"}
                        >
                          <Flex flex="1" align="center" gap={6} direction={{ base: "column", sm: "row" }}>
                            {/* Subject Icon/Image */}
                            <Box position="relative">
                              <Avatar
                                src={subject.image_url}
                                name={subject.name}
                                size="lg"
                                borderRadius="2xl"
                                bgGradient="linear(to-br, blue.500, cyan.400)"
                                color="white"
                                boxShadow="md"
                              />
                              {subject.is_active && (
                                <Box position="absolute" bottom={0} right={-1} w={4} h={4} bg="green.400" border="2px solid white" borderRadius="full" />
                              )}
                            </Box>

                            {/* Subject Info */}
                            <VStack align={{ base: "center", sm: "flex-start" }} spacing={1} flex={1} w="full">
                              <HStack justify="space-between" w="full">
                                <Heading size="md" color="gray.800">{subject.name}</Heading>
                                <Badge
                                  display={{ base: "flex", md: "none" }}
                                  colorScheme="blue"
                                  variant="subtle"
                                  borderRadius="full"
                                >
                                  {subject.chapters?.length || 0} فصل
                                </Badge>
                              </HStack>

                              <Text color="gray.500" fontSize="sm" noOfLines={1}>
                                {subject.description || "لا يوجد وصف لهذه المادة"}
                              </Text>

                              <HStack spacing={3} mt={1} wrap="wrap" justify={{ base: "center", sm: "flex-start" }}>
                                <Badge colorScheme="purple" variant="subtle" borderRadius="md" px={2} py={0.5}>
                                  <Icon as={FaGraduationCap} mr={1} boxSize={3} />
                                  {subject.grade_name}
                                </Badge>
                                <Badge colorScheme="orange" variant="subtle" borderRadius="md" px={2} py={0.5}>
                                  <Icon as={FaDatabase} mr={1} boxSize={3} />
                                  {subject.question_bank_name}
                                </Badge>
                              </HStack>
                            </VStack>

                            {/* Stats & Toggle */}
                            <HStack spacing={6} display={{ base: "none", md: "flex" }}>
                              <VStack spacing={0} align="center">
                                <Text fontSize="lg" fontWeight="bold" color="gray.700">{subject.chapters?.length || 0}</Text>
                                <Text fontSize="xs" color="gray.400">فصل</Text>
                              </VStack>
                              <Box w="1px" h="30px" bg="gray.200" />
                            </HStack>

                            <AccordionIcon color="gray.400" fontSize="1.5em" mr="auto" />
                          </Flex>
                        </AccordionButton>

                        <AccordionPanel pb={6} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                          {subject.chapters && subject.chapters.length > 0 ? (
                            <VStack spacing={4} align="stretch" mt={2}>
                              {subject.chapters.map((chapter) => (
                                <Accordion allowToggle key={chapter.id}>
                                  <AccordionItem border="none" bg="white" borderRadius="xl" shadow="xs">
                                    <h2>
                                      <AccordionButton py={4} borderRadius="xl" _hover={{ bg: "blue.50" }}>
                                        <HStack flex="1" spacing={4}>
                                          <Box p={2} bg="purple.50" borderRadius="lg" color="purple.500">
                                            <Icon as={FaFolderOpen} />
                                          </Box>
                                          <VStack align="flex-start" spacing={0}>
                                            <Text fontWeight="bold" fontSize="md" color="gray.700">{chapter.name}</Text>
                                            <Text fontSize="xs" color="gray.400">{chapter.lessons?.length || 0} درس</Text>
                                          </VStack>
                                        </HStack>
                                        <AccordionIcon />
                                      </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4} px={4}>
                                      {chapter.lessons && chapter.lessons.length > 0 ? (
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                          {chapter.lessons.map((lesson) => (
                                            <Link to={`/lesson/${lesson.id}`} key={lesson.id} style={{ width: '100%' }}>
                                              <HStack
                                                p={3}
                                                bg="gray.50"
                                                borderRadius="lg"
                                                cursor="pointer"
                                                border="1px solid"
                                                borderColor="transparent"
                                                _hover={{
                                                  bg: "white",
                                                  borderColor: "blue.200",
                                                  shadow: "sm",
                                                  transform: "translateX(-2px)"
                                                }}
                                                transition="all 0.2s"
                                              >
                                                <Icon as={FaFileAlt} color="blue.400" />
                                                <Text fontSize="sm" fontWeight="medium" color="gray.600">{lesson.name}</Text>
                                              </HStack>
                                            </Link>
                                          ))}
                                        </SimpleGrid>
                                      ) : (
                                        <Text fontSize="sm" color="gray.400" textAlign="center" py={2}>لا توجد دروس</Text>
                                      )}
                                    </AccordionPanel>
                                  </AccordionItem>
                                </Accordion>
                              ))}
                            </VStack>
                          ) : (
                            <Flex direction="column" align="center" justify="center" py={10} color="gray.400">
                              <Icon as={FaFolderOpen} boxSize={8} mb={2} opacity={0.3} />
                              <Text>لا توجد فصول مضافة بعد</Text>
                            </Flex>
                          )}
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              </MotionBox>
            ))}
          </VStack>
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

      </Container>
      <ScrollToTop />
    </Box>
  );
};

export default TeacherSubject;
