import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Button,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Progress,
  Avatar,
  Stack,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputLeftElement,
  Grid,
  HStack,
  VStack,
} from "@chakra-ui/react";
import {
  FaBook,
  FaGraduationCap,
  FaQuestionCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaChartLine, // أيقونة للإحصائيات
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// بيانات افتراضية للكتب الخارجية
const subjectData = {
  id: 1,
  name: "الرياضيات",
  description: "مادة الرياضيات للصف الثالث الثانوي - المنهج الجديد",
  image: "https://img.freepik.com/free-vector/math-chalkboard_23-2148177099.jpg",
  totalQuestions: 1245,
  progress: 65,
  books: [
    {
      id: 1,
      name: "المعاصر",
      image: "https://www.droos4u.com/wp-content/uploads/2022/08/Almoasser-math.jpg",
      chapters: [
        {
          id: 1,
          title: "الفصل الأول: الجبر (المعاصر)",
          order: 1,
          lessons: [
            { id: 1, title: "المعادلات الخطية", questions: 60, duration: "1 ساعة", completed: 20 },
            { id: 2, title: "المتباينات", questions: 40, duration: "0.5 ساعة", completed: 10 },
          ],
        },
        {
          id: 2,
          title: "الفصل الثاني: الهندسة (المعاصر)",
          order: 2,
          lessons: [
            { id: 3, title: "المثلثات", questions: 30, duration: "0.5 ساعة", completed: 5 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "الشامل",
      image: "https://www.droos4u.com/wp-content/uploads/2022/08/Alshamel-math.jpg",
      chapters: [
        {
          id: 3,
          title: "الفصل الأول: الجبر (الشامل)",
          order: 1,
          lessons: [
            { id: 4, title: "الدوال", questions: 50, duration: "1 ساعة", completed: 15 },
          ],
        },
        {
          id: 4,
          title: "الفصل الثاني: الهندسة (الشامل)",
          order: 2,
          lessons: [
            { id: 5, title: "الدائرة", questions: 25, duration: "0.5 ساعة", completed: 8 },
          ],
        },
      ],
    },
  ],
  recentQuestions: [
    { id: 1, text: "ما هو حل المعادلة س + 5 = 10؟", difficulty: "سهل" },
    { id: 2, text: "أوجد مساحة المثلث الذي طول قاعدته 5 سم وارتفاعه 3 سم", difficulty: "متوسط" },
    { id: 3, text: "ما هي مشتقة الدالة ص = س²؟", difficulty: "سهل" },
  ],
};

const SubjectPage = () => {
  const { subjectId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null); // الكتاب المختار
  const { isOpen, onOpen, onClose } = useDisclosure();

  // تحديد الألوان بناءً على وضع الثيم (فاتح/داكن)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.600", "blue.300"); // لون مميز للعناوين والأزرار
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const hoverBg = useColorModeValue("blue.50", "gray.600"); // خلفية عند التحويم
  const progressColor = useColorModeValue("green.500", "green.400"); // لون شريط التقدم

  // تصفية الفصول والدروس بناءً على مصطلح البحث (حسب الكتاب المختار)
  const filteredChapters = selectedBook
    ? selectedBook.chapters
        .map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons.filter((lesson) =>
            lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((chapter) => chapter.lessons.length > 0)
    : [];

  // دالة لفتح المودال وعرض تفاصيل الدرس
  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    onOpen();
  };

  return (
    <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
      {/* رأس الصفحة - معلومات المادة */}
      <Flex
        direction={{ base: "column", md: "row" }}
        mb={10}
        p={6}
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="xl"
        align="center"
        justify="space-between"
      >
        <VStack align={{ base: "center", md: "flex-start" }} spacing={3} mb={{ base: 6, md: 0 }}>
          <HStack spacing={4} align="center">
            <Icon as={FaBook} color={accentColor} boxSize={10} />
            <Heading size={{ base: "xl", md: "2xl" }} color={headingColor}>
              {subjectData.name}
            </Heading>
            <Badge colorScheme="blue" ml={3} fontSize="lg" px={3} py={1} borderRadius="full">
              {subjectData.totalQuestions} سؤال
            </Badge>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} color={textColor} textAlign={{ base: "center", md: "right" }}>
            {subjectData.description}
          </Text>
          <Flex align="center" mt={4}>
            <Progress
              value={subjectData.progress}
              size="lg"
              width={{ base: "200px", md: "300px" }}
              mr={4}
              colorScheme="green"
              borderRadius="full"
              hasStripe
              isAnimated
            />
            <Text fontWeight="bold" color={progressColor}>{subjectData.progress}% مكتمل</Text>
          </Flex>
        </VStack>
      </Flex>

      {/* إذا لم يتم اختيار كتاب، اعرض كروت الكتب الخارجية */}
      {!selectedBook && (
        <Box mb={10}>
          <Heading size="lg" mb={6} color={headingColor} textAlign="center">اختر كتابًا خارجيًا</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
            {subjectData.books.map((book) => (
              <MotionBox
                key={book.id}
                whileHover={{ scale: 1.04, boxShadow: "lg" }}
                onClick={() => setSelectedBook(book)}
                cursor="pointer"
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
                p={6}
                textAlign="center"
                transition="all 0.2s"
              >
                <Avatar src={book.image} size="xl" mb={4} mx="auto" name={book.name} />
                <Heading size="md" color={accentColor} mb={2}>{book.name}</Heading>
                <Text color={textColor}>عدد الفصول: {book.chapters.length}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* إذا تم اختيار كتاب، اعرض الفصول والدروس */}
      {selectedBook && (
        <>
          <Button mb={6} onClick={() => setSelectedBook(null)} colorScheme="blue" variant="outline" borderRadius="full">
            رجوع إلى قائمة الكتب
          </Button>
          <Flex mb={8} direction={{ base: "column", sm: "row" }} gap={4}>
            <InputGroup flex={1} size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="ابحث عن درس أو محتوى..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={cardBg}
                borderRadius="full"
                boxShadow="sm"
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                py={6}
              />
            </InputGroup>
            <Button leftIcon={<FaFilter />} colorScheme="blue" variant="solid" size="lg" borderRadius="full">
              تصفية
            </Button>
          </Flex>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            {/* القسم الرئيسي - الفصول والدروس (Accordion) */}
            <Box>
              <Heading size="lg" mb={6} color={headingColor}>فصول الكتاب والدروس</Heading>
              {filteredChapters.length > 0 ? (
                <Accordion allowMultiple defaultIndex={[0]} width="100%">
                  {filteredChapters.map((chapter) => (
                    <MotionBox
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: chapter.order * 0.1 }}
                      mb={4}
                      bg={cardBg}
                      borderRadius="lg"
                      boxShadow="md"
                      overflow="hidden"
                    >
                      <AccordionItem border="none">
                        <AccordionButton
                          bg={accentColor}
                          color="white"
                          _hover={{ bg: useColorModeValue("blue.700", "blue.400") }}
                          p={5}
                          _expanded={{ borderBottomRadius: "0" }}
                        >
                          <Box flex="1" textAlign="right">
                            <Heading size="md">{chapter.title}</Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel p={0}>
                          {chapter.lessons.map((lesson, lessonIndex) => (
                            <MotionBox
                              key={lesson.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: lessonIndex * 0.05 }}
                              whileHover={{ x: 5, boxShadow: "sm" }}
                              bg={cardBg}
                              borderBottom="1px solid"
                              borderColor={useColorModeValue("gray.100", "gray.600")}
                              _last={{ borderBottom: "none" }}
                              cursor="pointer"
                              onClick={() => handleLessonClick(lesson)}
                              py={4}
                              px={5}
                            >
                              <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }}>
                                <VStack align="flex-start" spacing={1} mb={{ base: 2, sm: 0 }}>
                                  <HStack>
                                    <Icon as={FaGraduationCap} color={textColor} boxSize={4} />
                                    <Text fontWeight="bold" fontSize="lg" color={headingColor}>{lesson.title}</Text>
                                  </HStack>
                                  <HStack spacing={4}>
                                    <Badge colorScheme="blue" px={2} py={1} borderRadius="md" display="flex" alignItems="center">
                                      <Icon as={FaQuestionCircle} mr={1} /> {lesson.questions} أسئلة
                                    </Badge>
                                    <HStack color="gray.500" fontSize="sm">
                                      <Icon as={FaClock} />
                                      <Text>{lesson.duration}</Text>
                                    </HStack>
                                  </HStack>
                                </VStack>
                                <Box textAlign="left" minW={{ base: "full", sm: "150px" }}>
                                  <Progress
                                    value={(lesson.completed / lesson.questions) * 100}
                                    size="md"
                                    colorScheme="green"
                                    borderRadius="full"
                                    mb={1}
                                  />
                                  <Text fontSize="sm" color={textColor}>
                                    {lesson.completed}/{lesson.questions} ({Math.round((lesson.completed / lesson.questions) * 100)}%)
                                  </Text>
                                </Box>
                              </Flex>
                            </MotionBox>
                          ))}
                        </AccordionPanel>
                      </AccordionItem>
                    </MotionBox>
                  ))}
                </Accordion>
              ) : (
                <Box
                  bg={cardBg}
                  p={10}
                  borderRadius="lg"
                  textAlign="center"
                  boxShadow="md"
                >
                  <Text fontSize="xl" color={textColor} mb={4}>
                    عذرًا، لا توجد دروس مطابقة لـ "{searchTerm}" في هذا الكتاب.
                  </Text>
                  <MotionButton
                    mt={4}
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    onClick={() => setSearchTerm("")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    عرض جميع الدروس
                  </MotionButton>
                </Box>
              )}
            </Box>
            {/* الشريط الجانبي */}
            <VStack spacing={6} align="stretch">
              {/* إحصائيات سريعة */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="md" className="mt-[60px]">
                <Heading size="md" mb={5} display="flex" alignItems="center" color={headingColor}>
                  <Icon as={FaChartLine} color={accentColor} mr={2} boxSize={5} />
                  إحصائيات الكتاب
                </Heading>
                <SimpleGrid columns={2} spacing={5}>
                  <Flex direction="column" align="center" p={4} bg={useColorModeValue("blue.50", "gray.700")} borderRadius="lg">
                    <Text fontSize="3xl" fontWeight="bold" color={accentColor}>{selectedBook.chapters.length}</Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">عدد الفصول</Text>
                  </Flex>
                  <Flex direction="column" align="center" p={4} bg={useColorModeValue("green.50", "gray.700")} borderRadius="lg">
                    <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                      {selectedBook.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)}
                    </Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">عدد الدروس</Text>
                  </Flex>
                  <Flex direction="column" align="center" p={4} bg={useColorModeValue("orange.50", "gray.700")} borderRadius="lg">
                    <Text fontSize="3xl" fontWeight="bold" color={accentColor}>{selectedBook.chapters.reduce((sum, chapter) => sum + chapter.lessons.reduce((q, l) => q + l.questions, 0), 0)}</Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">إجمالي الأسئلة</Text>
                  </Flex>
                  <Flex direction="column" align="center" p={4} bg={useColorModeValue("purple.50", "gray.700")} borderRadius="lg">
                    <Text fontSize="3xl" fontWeight="bold" color={progressColor}>{Math.round((selectedBook.chapters.reduce((sum, chapter) => sum + chapter.lessons.reduce((q, l) => q + l.completed, 0), 0) / Math.max(1, selectedBook.chapters.reduce((sum, chapter) => sum + chapter.lessons.reduce((q, l) => q + l.questions, 0), 0))) * 100)}%</Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">معدل الإنجاز</Text>
                  </Flex>
                </SimpleGrid>
              </Box>
            </VStack>
          </Grid>
        </>
      )}

      {/* مودال تأكيد الدخول للدرس */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" boxShadow="2xl" p={2} bg={cardBg}>
          <ModalHeader color={headingColor} borderBottom="1px solid" borderColor={useColorModeValue("gray.100", "gray.600")} pb={3}>
            الدخول إلى درس "{selectedLesson?.title}"
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {selectedLesson && (
              <VStack spacing={4} align="flex-start">
                <Text fontSize="md" color={textColor}>
                  أنت على وشك الدخول إلى درس{" "}
                  <Text as="span" fontWeight="bold" color={accentColor}>{selectedLesson.title}</Text>{" "}
                  الذي يحتوي على:
                </Text>
                <HStack align="center">
                  <Icon as={FaQuestionCircle} color="blue.500" mr={2} boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold">{selectedLesson.questions} أسئلة</Text>
                </HStack>
                <HStack align="center">
                  <Icon as={FaClock} color="blue.500" mr={2} boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold">مدة الدراسة المقترحة: {selectedLesson.duration}</Text>
                </HStack>
                <Progress
                  value={(selectedLesson.completed / selectedLesson.questions) * 100}
                  colorScheme="green"
                  size="md"
                  w="full"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                />
                <Text fontSize="sm" color={textColor}>
                  أنجزت{" "}
                  <Text as="span" fontWeight="bold">
                    {selectedLesson.completed}
                  </Text>{" "}
                  من {selectedLesson.questions} سؤال (
                  <Text as="span" fontWeight="bold">
                    {Math.round((selectedLesson.completed / selectedLesson.questions) * 100)}%
                  </Text>
                  )
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={useColorModeValue("gray.100", "gray.600")} pt={4}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">
              إلغاء
            </Button>
            <MotionButton
              colorScheme="blue"
              as={Link}
              to={`/QuestionsPage/1`}
              onClick={onClose}
              borderRadius="lg"
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ابدأ الاختبار
            </MotionButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ScrollToTop/>
    </Box>
  );
};

export default SubjectPage;