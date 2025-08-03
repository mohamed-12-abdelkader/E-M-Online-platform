import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Button,
  VStack,
  HStack,
  IconButton,
  Divider,
  Badge,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Textarea,
  Checkbox,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaBook,
  FaGraduationCap,
  FaLayerGroup,
  FaQuestionCircle,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const QuestionLibraryPage = () => {
  // States for navigation
  const [currentView, setCurrentView] = useState("chapters");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  // States for API data
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [partTitle, setPartTitle] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingPart, setEditingPart] = useState(null);
  const [deletingChapter, setDeletingChapter] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [deletingPart, setDeletingPart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionEdit, setQuestionEdit] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [questionChoices, setQuestionChoices] = useState([""]);
  const [questionType, setQuestionType] = useState("choice");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [pendingAnswerId, setPendingAnswerId] = useState(null);
  const [prevAnswers, setPrevAnswers] = useState({});

  // 1. State لتحديد الأسئلة
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [isAddingToExam, setIsAddingToExam] = useState(false);

  // Modal and dialog states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isCreateLessonOpen, onOpen: onCreateLessonOpen, onClose: onCreateLessonClose } = useDisclosure();
  const { isOpen: isEditLessonOpen, onOpen: onEditLessonOpen, onClose: onEditLessonClose } = useDisclosure();
  const { isOpen: isDeleteLessonOpen, onOpen: onDeleteLessonOpen, onClose: onDeleteLessonClose } = useDisclosure();
  const { isOpen: isCreatePartOpen, onOpen: onCreatePartOpen, onClose: onCreatePartClose } = useDisclosure();
  const { isOpen: isEditPartOpen, onOpen: onEditPartOpen, onClose: onEditPartClose } = useDisclosure();
  const { isOpen: isDeletePartOpen, onOpen: onDeletePartOpen, onClose: onDeletePartClose } = useDisclosure();
  const { isOpen: isEditQuestionOpen, onOpen: onEditQuestionOpen, onClose: onEditQuestionClose } = useDisclosure();
  const { isOpen: isDeleteQuestionOpen, onOpen: onDeleteQuestionOpen, onClose: onDeleteQuestionClose } = useDisclosure();

  const toast = useToast();

  // Chakra UI color values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("blue.700", "blue.200");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const itemHoverBg = useColorModeValue("blue.50", "gray.700");

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Loading states for actions
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isEditingPart, setIsEditingPart] = useState(false);
  const [isDeletingPart, setIsDeletingPart] = useState(false);
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Fetch chapters from API
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("/api/teacher/questions/chapters", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      setChapters(response.data.chapters || []);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في جلب الفصول", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch lessons for a specific chapter
  const fetchLessons = async (chapterId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/teacher/questions/lessons/${chapterId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setLessons(response.data.lessons || []);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في جلب الدروس", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch parts for a specific lesson
  const fetchParts = async (lessonId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/teacher/questions/parts/${lessonId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setParts(response.data.parts || []);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في جلب الأجزاء", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for a specific part
  const fetchQuestions = async (partId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/teacher/questions/questions/${partId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في جلب الأسئلة", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // Set correct answer for a question (with optimistic UI)
  const setCorrectAnswer = async (question, answer) => {
    // Save previous answer to revert if needed
    setPrevAnswers((prev) => ({ ...prev, [question.id]: question.answer }));
    setPendingAnswerId(question.id);
    // Update UI immediately
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id ? { ...q, answer } : q
      )
    );
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(`/api/teacher/questions/question/${question.id}`, {
        question_text: question.question_text,
        question_type: question.question_type,
        choices: question.choices,
        answer,
      }, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تم التحديث", description: "تم تعيين الإجابة الصحيحة", status: "success", duration: 2000, isClosable: true });
    } catch (error) {
      // Revert UI
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === question.id ? { ...q, answer: prevAnswers[question.id] } : q
        )
      );
      toast({ title: "خطأ", description: "فشل في تحديث الإجابة الصحيحة", status: "error", duration: 3000, isClosable: true });
    } finally {
      setPendingAnswerId(null);
    }
  };

  // Edit question modal open
  const handleEditQuestionClick = (question) => {
    setQuestionEdit(question);
    setQuestionText(question.question_text);
    setQuestionChoices(question.choices);
    setQuestionType(question.question_type);
    setQuestionAnswer(question.answer);
    onEditQuestionOpen();
  };

  // Update question
  const updateQuestion = async () => {
    setIsEditingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(`/api/teacher/questions/question/${questionEdit.id}`, {
        question_text: questionText,
        question_type: questionType,
        choices: questionChoices,
        answer: questionAnswer,
      }, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تم التحديث", description: "تم تعديل السؤال بنجاح", status: "success", duration: 2000, isClosable: true });
      onEditQuestionClose();
      fetchQuestions(questionEdit.part_id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تعديل السؤال", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsEditingQuestion(false);
    }
  };

  // Delete question
  const handleDeleteQuestionClick = (question) => {
    setDeletingQuestion(question);
    onDeleteQuestionOpen();
  };
  const deleteQuestion = async () => {
    setIsDeletingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/teacher/questions/question/${deletingQuestion.id}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تم الحذف", description: "تم حذف السؤال بنجاح", status: "success", duration: 2000, isClosable: true });
      onDeleteQuestionClose();
      fetchQuestions(deletingQuestion.part_id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حذف السؤال", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  // Create new chapter
  const createChapter = async () => {
    setIsAddingChapter(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.post("/api/teacher/questions/chapter", { title: chapterTitle }, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم إنشاء الفصل بنجاح", status: "success", duration: 3000, isClosable: true });
      setChapterTitle("");
      onCreateClose();
      fetchChapters();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إنشاء الفصل", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAddingChapter(false);
    }
  };

  // Create new lesson
  const createLesson = async () => {
    setIsAddingLesson(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.post("/api/teacher/questions/lesson", { chapter_id: selectedChapter.id, title: lessonTitle }, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم إنشاء الدرس بنجاح", status: "success", duration: 3000, isClosable: true });
      setLessonTitle("");
      onCreateLessonClose();
      fetchLessons(selectedChapter.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إنشاء الدرس", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAddingLesson(false);
    }
  };

  // Create new part
  const createPart = async () => {
    setIsAddingPart(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.post("/api/teacher/questions/part", { lesson_id: selectedLesson.id, title: partTitle }, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم إنشاء الجزء بنجاح", status: "success", duration: 3000, isClosable: true });
      setPartTitle("");
      onCreatePartClose();
      fetchParts(selectedLesson.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إنشاء الجزء", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAddingPart(false);
    }
  };

  // Update chapter
  const updateChapter = async () => {
    setIsEditingChapter(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(`/api/teacher/questions/chapter/${editingChapter.id}`, { title: chapterTitle }, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم تحديث الفصل بنجاح", status: "success", duration: 3000, isClosable: true });
      setChapterTitle("");
      setEditingChapter(null);
      onEditClose();
      fetchChapters();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الفصل", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsEditingChapter(false);
    }
  };

  // Update lesson
  const updateLesson = async () => {
    setIsEditingLesson(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(`/api/teacher/questions/lesson/${editingLesson.id}`, { title: lessonTitle }, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم تحديث الدرس بنجاح", status: "success", duration: 3000, isClosable: true });
      setLessonTitle("");
      setEditingLesson(null);
      onEditLessonClose();
      fetchLessons(selectedChapter.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الدرس", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsEditingLesson(false);
    }
  };

  // Update part
  const updatePart = async () => {
    setIsEditingPart(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(`/api/teacher/questions/part/${editingPart.id}`, { title: partTitle }, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم تحديث الجزء بنجاح", status: "success", duration: 3000, isClosable: true });
      setPartTitle("");
      setEditingPart(null);
      onEditPartClose();
      fetchParts(selectedLesson.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الجزء", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsEditingPart(false);
    }
  };

  // Delete chapter
  const deleteChapter = async () => {
    setIsDeletingChapter(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/teacher/questions/chapter/${deletingChapter.id}`, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم حذف الفصل بنجاح", status: "success", duration: 3000, isClosable: true });
      setDeletingChapter(null);
      onDeleteClose();
      fetchChapters();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حذف الفصل", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsDeletingChapter(false);
    }
  };

  // Delete lesson
  const deleteLesson = async () => {
    setIsDeletingLesson(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/teacher/questions/lesson/${deletingLesson.id}`, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم حذف الدرس بنجاح", status: "success", duration: 3000, isClosable: true });
      setDeletingLesson(null);
      onDeleteLessonClose();
      fetchLessons(selectedChapter.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حذف الدرس", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsDeletingLesson(false);
    }
  };

  // Delete part
  const deletePart = async () => {
    setIsDeletingPart(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/teacher/questions/part/${deletingPart.id}`, { headers: { "Authorization": `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم حذف الجزء بنجاح", status: "success", duration: 3000, isClosable: true });
      setDeletingPart(null);
      onDeletePartClose();
      fetchParts(selectedLesson.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حذف الجزء", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsDeletingPart(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (chapter) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    onEditOpen();
  };
  const handleDeleteClick = (chapter) => {
    setDeletingChapter(chapter);
    onDeleteOpen();
  };
  const handleEditLessonClick = (lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    onEditLessonOpen();
  };
  const handleDeleteLessonClick = (lesson) => {
    setDeletingLesson(lesson);
    onDeleteLessonOpen();
  };
  const handleEditPartClick = (part) => {
    setEditingPart(part);
    setPartTitle(part.title);
    onEditPartOpen();
  };
  const handleDeletePartClick = (part) => {
    setDeletingPart(part);
    onDeletePartOpen();
  };

  // 2. دالة إضافة الأسئلة للامتحان الشامل
  const handleAddQuestionsToExam = async () => {
    setIsAddingToExam(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.post("/api/course/course-exam/3/add-questions", {
        question_ids: selectedQuestionIds
      }, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تمت الإضافة", description: "تمت إضافة الأسئلة للامتحان الشامل بنجاح", status: "success", duration: 3000, isClosable: true });
      setSelectedQuestionIds([]);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إضافة الأسئلة للامتحان الشامل", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAddingToExam(false);
    }
  };

  // Load chapters on component mount
  useEffect(() => { fetchChapters(); }, []);

  // Persist navigation state
  useEffect(() => {
    const navState = {
      currentView,
      selectedChapter,
      selectedLesson,
      selectedSection,
    };
    localStorage.setItem("questionNavState", JSON.stringify(navState));
  }, [currentView, selectedChapter, selectedLesson, selectedSection]);

  // Restore navigation state on mount
  useEffect(() => {
    const navState = localStorage.getItem("questionNavState");
    if (navState) {
      try {
        const parsed = JSON.parse(navState);
        if (parsed.currentView) setCurrentView(parsed.currentView);
        if (parsed.selectedChapter) setSelectedChapter(parsed.selectedChapter);
        if (parsed.selectedLesson) setSelectedLesson(parsed.selectedLesson);
        if (parsed.selectedSection) setSelectedSection(parsed.selectedSection);
        // Fetch data for restored state
        if (parsed.currentView === "lessons" && parsed.selectedChapter) fetchLessons(parsed.selectedChapter.id);
        if (parsed.currentView === "sections" && parsed.selectedLesson) fetchParts(parsed.selectedLesson.id);
        if (parsed.currentView === "questions" && parsed.selectedSection) fetchQuestions(parsed.selectedSection.id);
      } catch {}
    }
  }, []);

  // Helper functions for navigation
  const navigateToLessons = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentView("lessons");
    fetchLessons(chapter.id);
  };
  const navigateToSections = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentView("sections");
    fetchParts(lesson.id);
  };
  const navigateToQuestions = (part) => {
    setSelectedSection(part);
    setCurrentView("questions");
    fetchQuestions(part.id);
  };
  const goBack = () => {
    if (currentView === "questions") {
      setCurrentView("sections");
      setSelectedSection(null);
    } else if (currentView === "sections") {
      setCurrentView("lessons");
      setSelectedSection(null);
      setSelectedLesson(null);
      setParts([]);
    } else if (currentView === "lessons") {
      setCurrentView("chapters");
      setSelectedLesson(null);
      setSelectedChapter(null);
      setLessons([]);
    }
  };

  // Responsive columns
  const chapterCols = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const lessonCols = useBreakpointValue({ base: 1, md: 2 });
  const partCols = useBreakpointValue({ base: 1, md: 2 });

  // Add bulk questions
  const addBulkQuestions = async () => {
    setIsAddingBulk(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.post("/api/teacher/questions/bulk", {
        part_id: selectedSection.id,
        bulk_text: bulkText,
      }, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تم الإضافة", description: "تمت إضافة الأسئلة بنجاح", status: "success", duration: 2000, isClosable: true });
      setBulkText("");
      setIsBulkModalOpen(false);
      fetchQuestions(selectedSection.id);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إضافة الأسئلة", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsAddingBulk(false);
    }
  };

  return (
    <Box minH="100vh" className="mt-[50px]"  py={10} dir="rtl" fontFamily="'Cairo', sans-serif">
      {/* Header Section */}
      <Flex
        as="header"
        align="center"
        justify="center"
        bgGradient="linear(to-r, blue.600, blue.400)"
        color="white"
        py={10}
        mb={10}
        boxShadow="2xl"
        borderRadius="2xl"
        mx={4}
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" left={-10} top={-10} opacity={0.15} zIndex={0}>
          <Icon as={FaQuestionCircle} w={56} h={56} />
        </Box>
        <VStack spacing={2} zIndex={1} w="full">
          <Icon as={FaQuestionCircle} w={16} h={16} color="whiteAlpha.900" />
          <Heading as="h1" size="2xl" fontWeight="extrabold" letterSpacing="tight">
            مكتبة الأسئلة
          </Heading>
          <Text fontSize="xl" opacity={0.95} fontWeight="medium">
            استعرض الأسئلة حسب الفصول والدروس والأجزاء
          </Text>
        </VStack>
      </Flex>

      <Container maxW="6xl">
        {/* Navigation Breadcrumbs / Back Button */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          mb={8}
          p={4}
          bg={cardBg}
          borderRadius="xl"
          shadow="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack spacing={3} wrap="wrap" justifyContent="flex-start" alignItems="center">
            {currentView !== "chapters" && (
              <IconButton
                icon={<FaArrowLeft />}
                aria-label="العودة"
                onClick={goBack}
                colorScheme="purple"
                variant="ghost"
                size="md"
                borderRadius="full"
                _hover={{ bg: "purple.100" }}
              />
            )}
            {selectedChapter && (
              <>
                <Text color={subTextColor}>/</Text>
                <Button variant="link" colorScheme="blue" onClick={() => { setCurrentView("lessons"); setSelectedLesson(null); setSelectedSection(null); }} fontWeight="bold">
                  {selectedChapter.title}
                </Button>
              </>
            )}
            {selectedLesson && (
              <>
                <Text color={subTextColor}>/</Text>
                <Button variant="link" colorScheme="blue" onClick={() => { setCurrentView("sections"); setSelectedSection(null); }} fontWeight="bold">
                  {selectedLesson.title}
                </Button>
              </>
            )}
            {selectedSection && (
              <>
                <Text color={subTextColor}>/</Text>
                <Text fontWeight="bold" color={headingColor}>
                  {selectedSection.title}
                </Text>
              </>
            )}
          </HStack>
        </MotionBox>

        {/* Content Area based on currentView */}
        {currentView === "chapters" && (
          <MotionBox spacing={6} align="stretch" initial="hidden" animate="visible" variants={containerVariants}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color={headingColor} textAlign="center">
              الفصول المتاحة
            </Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                onClick={onCreateOpen}
                borderRadius="full"
                px={6}
                py={3}
                fontWeight="bold"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
                isLoading={isAddingChapter}
                isDisabled={isAddingChapter}
              >
                إنشاء فصل جديد
              </Button>
            </Flex>

            {loading ? (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>
                جاري التحميل...
              </Text>
            ) : chapters.length > 0 ? (
            <SimpleGrid columns={chapterCols} spacing={8}>
                {chapters.map((chapter) => (
                <MotionBox
                  key={chapter.id}
                  variants={itemVariants}
                  className="border "
                  p={7}
                  bgGradient="linear(to-br, white, blue.50 80%)"
                  borderRadius="2xl"
                  boxShadow="2xl"
                  borderLeft="8px solid"
                  borderLeftColor="blue.400"
                    position="relative"
                  _hover={{ transform: "scale(1.03)", boxShadow: "3xl", bg: "blue.100" }}
                  transition="all 0.3s"
                >
                  <VStack spacing={4} align="center">
                    <Icon as={FaBook} w={14} h={14} color="blue.500" />
                    <Heading size="md" color={textColor} textAlign="center">{chapter.title}</Heading>
                      <Badge colorScheme="blue" fontSize="md" px={4} py={1} borderRadius="full">
                        {new Date(chapter.created_at).toLocaleDateString('ar-SA')}
                      </Badge>
                      
                      {/* Action Buttons */}
                      <HStack spacing={2} mt={2}>
                        <IconButton
                          icon={<FaEdit />}
                          aria-label="تعديل"
                          colorScheme="yellow"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(chapter);
                          }}
                          borderRadius="full"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="حذف"
                          colorScheme="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(chapter);
                          }}
                          borderRadius="full"
                        />
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => navigateToLessons(chapter)}
                          borderRadius="full"
                        >
                          عرض الدروس
                        </Button>
                      </HStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
            ) : (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>
                لا توجد فصول متاحة. قم بإنشاء فصل جديد للبدء.
              </Text>
            )}
          </MotionBox>
        )}

        {currentView === "lessons" && selectedChapter && (
          <MotionBox spacing={6} align="stretch" initial="hidden" animate="visible" variants={containerVariants}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color={headingColor} textAlign="center">
              دروس الفصل: {selectedChapter.title}
            </Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                onClick={onCreateLessonOpen}
                borderRadius="full"
                px={6}
                py={3}
                fontWeight="bold"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
                isLoading={isAddingLesson}
                isDisabled={isAddingLesson}
              >
                إضافة درس جديد
              </Button>
            </Flex>

            {loading ? (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>
                جاري التحميل...
              </Text>
            ) : lessons.length > 0 ? (
            <SimpleGrid columns={lessonCols} spacing={8}>
                {lessons.map((lesson) => (
                <MotionBox
                  key={lesson.id}
                  variants={itemVariants}
                  p={7}
                  bgGradient="linear(to-br, white, green.50 80%)"
                  borderRadius="2xl"
                  boxShadow="2xl"
                  borderRight="8px solid"
                  borderRightColor="green.400"
                    position="relative"
                  _hover={{ transform: "scale(1.03)", boxShadow: "3xl", bg: "green.100" }}
                  transition="all 0.3s"
                >
                  <VStack spacing={4} align="center">
                    <Icon as={FaGraduationCap} w={14} h={14} color="green.500" />
                    <Heading size="md" color={textColor} textAlign="center">{lesson.title}</Heading>
                      <Badge colorScheme="green" fontSize="md" px={4} py={1} borderRadius="full">
                        {new Date(lesson.created_at).toLocaleDateString('ar-SA')}
                      </Badge>
                      
                      {/* Action Buttons */}
                      <HStack spacing={2} mt={2}>
                        <IconButton
                          icon={<FaEdit />}
                          aria-label="تعديل"
                          colorScheme="yellow"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLessonClick(lesson);
                          }}
                          borderRadius="full"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="حذف"
                          colorScheme="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLessonClick(lesson);
                          }}
                          borderRadius="full"
                        />
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => navigateToSections(lesson)}
                          borderRadius="full"
                        >
                          عرض الأجزاء
                        </Button>
                      </HStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
            ) : (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>
                لا توجد دروس متاحة. قم بإضافة درس جديد للبدء.
              </Text>
            )}
          </MotionBox>
        )}

        {currentView === "sections" && selectedLesson && (
          <MotionBox spacing={6} align="stretch" initial="hidden" animate="visible" variants={containerVariants}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color={headingColor} textAlign="center">
                أجزاء الدرس: {selectedLesson.title}
              </Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="orange"
                onClick={onCreatePartOpen}
                borderRadius="full"
                px={6}
                py={3}
                fontWeight="bold"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
                isLoading={isAddingPart}
                isDisabled={isAddingPart}
              >
                إضافة جزء جديد
              </Button>
            </Flex>
            {loading ? (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>جاري التحميل...</Text>
            ) : parts.length > 0 ? (
              <SimpleGrid columns={partCols} spacing={8}>
                {parts.map((part) => (
                  <MotionBox
                    key={part.id}
                    variants={itemVariants}
                    p={7}
                    bgGradient="linear(to-br, white, orange.50 80%)"
                    borderRadius="2xl"
                    boxShadow="2xl"
                    borderLeft="8px solid"
                    borderLeftColor="orange.400"
                    position="relative"
                    _hover={{ transform: "scale(1.03)", boxShadow: "3xl", bg: "orange.100" }}
                    transition="all 0.3s"
                  >
                    <VStack spacing={4} align="center">
                      <Icon as={FaLayerGroup} w={14} h={14} color="orange.500" />
                      <Heading size="md" color={textColor} textAlign="center">{part.title}</Heading>
                      <Badge colorScheme="orange" fontSize="md" px={4} py={1} borderRadius="full">
                        {new Date(part.created_at).toLocaleDateString('ar-SA')}
                      </Badge>
                      <HStack spacing={2} mt={2}>
                        <IconButton
                          icon={<FaEdit />}
                          aria-label="تعديل"
                          colorScheme="yellow"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleEditPartClick(part); }}
                          borderRadius="full"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="حذف"
                          colorScheme="red"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDeletePartClick(part); }}
                          borderRadius="full"
                        />
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => navigateToQuestions(part)}
                          borderRadius="full"
                        >
                          عرض الأسئلة
                        </Button>
                      </HStack>
                    </VStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            ) : (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>لا توجد أجزاء متاحة. قم بإضافة جزء جديد للبدء.</Text>
            )}
          </MotionBox>
        )}

        {currentView === "questions" && selectedSection && (
          <MotionBox spacing={6} align="stretch" initial="hidden" animate="visible" variants={containerVariants}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color={headingColor} textAlign="center">
                أسئلة الجزء: {selectedSection.title}
              </Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="purple"
                onClick={() => setIsBulkModalOpen(true)}
                borderRadius="full"
                px={6}
                py={3}
                fontWeight="bold"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
                isLoading={isAddingBulk}
                isDisabled={isAddingBulk}
              >
                إضافة أسئلة
              </Button>
            </Flex>
            {loading ? (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>جاري التحميل...</Text>
            ) : questions.length > 0 ? (
              <SimpleGrid columns={lessonCols} spacing={8}>
                {questions.map((question, index) => (
                  <MotionBox
                    key={question.id}
                    variants={itemVariants}
                    p={7}
                    bgGradient="linear(to-br, white, purple.50 80%)"
                    borderRadius="2xl"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack align="flex-start" spacing={4}>
                      <HStack alignItems="center">
                        <Checkbox
                          size="sm"
                          colorScheme="blue"
                          isChecked={selectedQuestionIds.includes(question.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedQuestionIds(ids => [...ids, question.id]);
                            } else {
                              setSelectedQuestionIds(ids => ids.filter(id => id !== question.id));
                            }
                          }}
                          mr={2}
                          title="تحديد السؤال"
                        />
                        <Badge colorScheme="purple" fontSize="lg" px={3} py={1} borderRadius="full">{index + 1}</Badge>
                        <Icon as={FaQuestionCircle} color="purple.500" w={7} h={7} />
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>{question.question_text}</Text>
                        <IconButton icon={<FaEdit />} aria-label="تعديل" colorScheme="yellow" size="sm" ml={2} onClick={() => handleEditQuestionClick(question)} />
                        <IconButton icon={<FaTrash />} aria-label="حذف" colorScheme="red" size="sm" ml={2} onClick={() => handleDeleteQuestionClick(question)} />
                      </HStack>
                      {question.question_type === "choice" && (
                        <HStack flexWrap="wrap" gap={2} pl={8} width="full">
                          {question.choices.map((option, optIndex) => {
                            const isSelected = option === question.answer;
                            const isPending = pendingAnswerId === question.id && isSelected;
                            return (
                              <Badge
                                key={optIndex}
                                colorScheme={isSelected ? (isPending ? "yellow" : "green") : "gray"}
                                fontSize="md"
                                px={4}
                                py={2}
                                borderRadius="xl"
                                fontWeight={isSelected ? "bold" : "normal"}
                                boxShadow={isSelected ? "md" : undefined}
                                cursor="pointer"
                                onClick={() => setCorrectAnswer(question, option)}
                                transition="background 0.2s"
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {isSelected && !isPending && (
                                  <Text as="span" ml={2} color="green.500" fontWeight="bold"> ✓</Text>
                                )}
                                {isPending && (
                                  <Text as="span" ml={2} color="yellow.500" fontWeight="bold"> ...</Text>
                                )}
                              </Badge>
                            );
                          })}
                        </HStack>
                      )}
                    </VStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            ) : (
              <Text textAlign="center" fontSize="lg" color={subTextColor} py={10}>لا توجد أسئلة في هذا الجزء بعد.</Text>
            )}
          </MotionBox>
        )}
        {currentView === "questions" && selectedSection && questions.length > 0 && selectedQuestionIds.length > 0 && (
          <Flex justify="center" mt={6}>
            <Button
              colorScheme="blue"
              leftIcon={<FaPlus />}
              isLoading={isAddingToExam}
              onClick={handleAddQuestionsToExam}
              borderRadius="full"
              px={8}
              fontWeight="bold"
              size="lg"
            >
              إضافة للامتحان
            </Button>
          </Flex>
        )}
      </Container>

      {/* Create Chapter Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إنشاء فصل جديد</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>عنوان الفصل</FormLabel>
              <Input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="أدخل عنوان الفصل"
                dir="rtl"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={createChapter} isDisabled={!chapterTitle.trim() || isAddingChapter}>
              إنشاء
            </Button>
            <Button variant="ghost" onClick={onCreateClose}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Lesson Modal */}
      <Modal isOpen={isCreateLessonOpen} onClose={onCreateLessonClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إضافة درس جديد</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>عنوان الدرس</FormLabel>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="أدخل عنوان الدرس"
                dir="rtl"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={createLesson} isDisabled={!lessonTitle.trim() || isAddingLesson}>
              إضافة
            </Button>
            <Button variant="ghost" onClick={onCreateLessonClose}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل الفصل</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>عنوان الفصل</FormLabel>
              <Input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="أدخل عنوان الفصل"
                dir="rtl"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={updateChapter} isDisabled={!chapterTitle.trim() || isEditingChapter}>
              تحديث
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal isOpen={isEditLessonOpen} onClose={onEditLessonClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل الدرس</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>عنوان الدرس</FormLabel>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="أدخل عنوان الدرس"
                dir="rtl"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={updateLesson} isDisabled={!lessonTitle.trim() || isEditingLesson}>
              تحديث
            </Button>
            <Button variant="ghost" onClick={onEditLessonClose}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Chapter Alert Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            حذف الفصل
          </AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من حذف الفصل "{deletingChapter?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onDeleteClose}>
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={deleteChapter} mr={3} isDisabled={isDeletingChapter}>
              حذف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Alert Dialog */}
      <AlertDialog isOpen={isDeleteLessonOpen} onClose={onDeleteLessonClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            حذف الدرس
          </AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من حذف الدرس "{deletingLesson?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onDeleteLessonClose}>
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={deleteLesson} mr={3} isDisabled={isDeletingLesson}>
              حذف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Part Modal */}
      <Modal isOpen={isCreatePartOpen} onClose={onCreatePartClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إضافة جزء جديد</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>عنوان الجزء</FormLabel>
              <Input value={partTitle} onChange={(e) => setPartTitle(e.target.value)} placeholder="أدخل عنوان الجزء" dir="rtl" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={createPart} isDisabled={!partTitle.trim() || isAddingPart}>إضافة</Button>
            <Button variant="ghost" onClick={onCreatePartClose}>إلغاء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Part Modal */}
      <Modal isOpen={isEditPartOpen} onClose={onEditPartClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل الجزء</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>عنوان الجزء</FormLabel>
              <Input value={partTitle} onChange={(e) => setPartTitle(e.target.value)} placeholder="أدخل عنوان الجزء" dir="rtl" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={updatePart} isDisabled={!partTitle.trim() || isEditingPart}>تحديث</Button>
            <Button variant="ghost" onClick={onEditPartClose}>إلغاء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Part Alert Dialog */}
      <AlertDialog isOpen={isDeletePartOpen} onClose={onDeletePartClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">حذف الجزء</AlertDialogHeader>
          <AlertDialogBody>هل أنت متأكد من حذف الجزء "{deletingPart?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.</AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onDeletePartClose}>إلغاء</Button>
            <Button colorScheme="red" onClick={deletePart} mr={3} isDisabled={isDeletingPart}>حذف</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Question Modal */}
      <Modal isOpen={isEditQuestionOpen} onClose={onEditQuestionClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>نص السؤال</FormLabel>
              <Input value={questionText} onChange={e => setQuestionText(e.target.value)} dir="rtl" />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>الاختيارات</FormLabel>
              {questionChoices.map((choice, idx) => (
                <HStack key={idx} mb={2}>
                  <Input value={choice} onChange={e => {
                    const arr = [...questionChoices];
                    arr[idx] = e.target.value;
                    setQuestionChoices(arr);
                  }} placeholder={`اختيار ${idx + 1}`} dir="rtl" />
                  <IconButton icon={<FaTrash />} aria-label="حذف اختيار" colorScheme="red" size="sm" onClick={() => {
                    setQuestionChoices(questionChoices.filter((_, i) => i !== idx));
                  }} />
                </HStack>
              ))}
              <Button mt={2} size="sm" colorScheme="blue" onClick={() => setQuestionChoices([...questionChoices, ""])}>إضافة اختيار</Button>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>الإجابة الصحيحة</FormLabel>
              <Input value={questionAnswer} onChange={e => setQuestionAnswer(e.target.value)} dir="rtl" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={updateQuestion} isDisabled={isEditingQuestion}>تحديث</Button>
            <Button variant="ghost" onClick={onEditQuestionClose}>إلغاء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete Question Alert Dialog */}
      <AlertDialog isOpen={isDeleteQuestionOpen} onClose={onDeleteQuestionClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">حذف السؤال</AlertDialogHeader>
          <AlertDialogBody>هل أنت متأكد من حذف السؤال "{deletingQuestion?.question_text}"؟ هذا الإجراء لا يمكن التراجع عنه.</AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onDeleteQuestionClose}>إلغاء</Button>
            <Button colorScheme="red" onClick={deleteQuestion} mr={3} isDisabled={isDeletingQuestion}>حذف</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Add Questions Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="bold" fontSize="2xl" color="purple.700" textAlign="center">إضافة أسئلة دفعة واحدة</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel fontWeight="bold">نص الأسئلة (كل سؤال مع اختياراته في سطر جديد)</FormLabel>
              <Textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                rows={10}
                placeholder={
                  'مثال:\nما المقصود بمبدأ "توازن القوى" في السياسة الدولية؟\nA) ...\nB) ...\nC) ...\nD) ...\n\nما الحدث الذي ترتب عليه قيام الحرب العالمية الأولى؟\nA) ...\nB) ...\nC) ...\nD) ...'
                }
                fontSize="lg"
                borderRadius="xl"
                bg="gray.50"
                dir="rtl"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" px={8} py={2} fontWeight="bold" borderRadius="full" onClick={addBulkQuestions} isDisabled={!bulkText.trim() || isAddingBulk}>
              إضافة
            </Button>
            <Button variant="ghost" ml={3} onClick={() => setIsBulkModalOpen(false)}>إلغاء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionLibraryPage;
