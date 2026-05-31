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
  Select,
  Switch,
  Alert,
  AlertIcon,
  Spinner,
  Image,
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
  FaUpload,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const newDraftId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyDraftQuestion = () => ({
  id: newDraftId(),
  question_text: "",
  question_type: "choice",
  choices: ["", ""],
  answer: "",
  correctAnswerIndex: null,
  answerInferred: false,
  image_url: null,
  imageDescription: "",
  questionImages: [],
  passage_id: null,
});

const resolveOcrAnswer = (q) => {
  const options = Array.isArray(q.options) ? q.options : [];
  if (q.correct_answer_index != null && options[q.correct_answer_index]) {
    return options[q.correct_answer_index].text ?? "";
  }
  if (q.correct_answer != null && q.correct_answer !== "") {
    const label = String(q.correct_answer).trim();
    const byLabel = options.find(
      (o) => String(o.label ?? "").trim() === label
    );
    if (byLabel?.text) return byLabel.text;
    const byText = options.find((o) => String(o.text ?? "").trim() === label);
    if (byText?.text) return byText.text;
  }
  return "";
};

const mapOcrQuestionToDraft = (q) => {
  const choices = (q.options || [])
    .map((o) => (o.text ?? "").trim())
    .filter(Boolean);
  const hasChoices = choices.length >= 2;
  const questionImages = Array.isArray(q.question_images)
    ? q.question_images.filter((image) => image?.image_url)
    : [];
  const questionImage = questionImages[0] || null;
  return {
    id: newDraftId(),
    question_text: (q.question_text ?? "").trim(),
    passage_id: q.passage_id ?? null,
    question_type: hasChoices ? "choice" : "text",
    choices: hasChoices ? choices : [],
    answer: hasChoices ? resolveOcrAnswer(q) : "",
    correctAnswerIndex: Number.isInteger(q.correct_answer_index)
      ? q.correct_answer_index
      : null,
    answerInferred: !!q.correct_answer_inferred,
    image_url: questionImage?.image_url ?? null,
    imageDescription: questionImage?.short_description ?? "",
    questionImages,
  };
};

const mapOcrPassageToDraft = (passage) => ({
  id: newDraftId(),
  passage_id: passage.passage_id,
  title: passage.title ?? "",
  content: passage.content ?? "",
});

const getDraftCorrectAnswerIndex = (draft) => {
  const choices = draft.choices.map((c) => c.trim()).filter(Boolean);
  if (
    Number.isInteger(draft.correctAnswerIndex) &&
    draft.correctAnswerIndex >= 0 &&
    draft.correctAnswerIndex < choices.length
  ) {
    return draft.correctAnswerIndex;
  }
  if (draft.answer?.trim()) {
    const idx = choices.indexOf(draft.answer.trim());
    return idx >= 0 ? idx : null;
  }
  return null;
};

const draftToTeacherQuestionPayload = (draft) => {
  const choices = draft.choices.map((c) => c.trim()).filter(Boolean);
  const correctAnswerIndex = getDraftCorrectAnswerIndex(draft);
  const payload = {
    question_text: draft.question_text.trim(),
    question_type: choices.length > 0 ? "choice" : "text",
    choices,
    correct_answer_index: correctAnswerIndex,
    answer:
      correctAnswerIndex != null && choices[correctAnswerIndex]
        ? choices[correctAnswerIndex]
        : undefined,
    image_url: draft.image_url || undefined,
    explanation: draft.explanation || undefined,
    difficulty_level: "medium",
    points: 1,
  };
  return payload;
};

const getTeacherQuestionImageUrl = (question) =>
  question.media?.media_url ||
  question.media_url ||
  question.image_url ||
  question.image ||
  null;

const normalizeTeacherQuestion = (question, passage = null) => {
  const rawOptions = Array.isArray(question.choices)
    ? question.choices
    : Array.isArray(question.options)
      ? question.options
      : [];
  const choices = rawOptions
    .map((option) =>
      typeof option === "string"
        ? option
        : option?.text_content || option?.text || option?.image_url || ""
    )
    .filter(Boolean);
  const answerIndexFromText =
    question.answer && choices.includes(question.answer)
      ? choices.indexOf(question.answer)
      : null;
  const correctAnswerIndex = Number.isInteger(question.correct_answer_index)
    ? question.correct_answer_index
    : answerIndexFromText;

  return {
    ...question,
    passage,
    question_type: question.question_type || (choices.length > 0 ? "choice" : "text"),
    choices,
    answer:
      correctAnswerIndex != null && choices[correctAnswerIndex]
        ? choices[correctAnswerIndex]
        : "",
    correct_answer_index: correctAnswerIndex,
    image_url: getTeacherQuestionImageUrl(question),
  };
};

const validateTeacherDraftQuestion = (draft, index) => {
  const n = index + 1;
  if (!draft.question_text?.trim()) {
    return `السؤال ${n}: نص السؤال مطلوب`;
  }
  const choices = draft.choices.map((c) => c.trim()).filter(Boolean);
  if (choices.length === 1) {
    return `السؤال ${n}: يجب وجود خيارين على الأقل أو ترك السؤال بدون اختيارات`;
  }
  const correctAnswerIndex = getDraftCorrectAnswerIndex(draft);
  if (
    correctAnswerIndex != null &&
    (correctAnswerIndex < 0 || correctAnswerIndex >= choices.length)
  ) {
    return `السؤال ${n}: رقم الإجابة الصحيحة غير صحيح`;
  }
  return null;
};

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
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [draftPassages, setDraftPassages] = useState([]);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [inferCorrectAnswer, setInferCorrectAnswer] = useState(false);
  const [ocrNotes, setOcrNotes] = useState("");
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
  const ocrUploadBg = useColorModeValue("purple.50", "gray.700");
  const passageInfoBg = useColorModeValue("blue.50", "gray.700");

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

  // Fetch teacher private-library questions and passages for a specific part.
  const fetchQuestions = async (
    partId = selectedSection?.id
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!partId) {
        setQuestions([]);
        return;
      }

      const questionsResponse = await baseUrl.get(`/api/teacher/questions/questions/${partId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const standaloneRaw =
        questionsResponse.data?.questions ||
        questionsResponse.data?.data?.questions ||
        questionsResponse.data?.data ||
        [];
      const responsePassages =
        questionsResponse.data?.passages ||
        questionsResponse.data?.data?.passages ||
        [];
      const passagesById = (Array.isArray(responsePassages) ? responsePassages : [])
        .reduce((map, passage) => {
          if (passage?.id != null) {
            map[String(passage.id)] = passage;
          }
          return map;
        }, {});
      const normalizedQuestions = (Array.isArray(standaloneRaw) ? standaloneRaw : [])
        .map((question) =>
          normalizeTeacherQuestion(
            question,
            question.passage_id != null
              ? passagesById[String(question.passage_id)] || null
              : null
          )
        );

      setQuestions(normalizedQuestions);
    } catch (error) {
      toast({
        title: "خطأ",
        description:
          error.message ||
          error.response?.data?.message ||
          "فشل في جلب الأسئلة",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Set correct answer for a question (with optimistic UI)
  const setCorrectAnswer = async (question, answer) => {
    const answerIndex = question.choices.findIndex((choice) => choice === answer);
    if (answerIndex < 0) return;
    const previousAnswer = question.answer;
    // Save previous answer to revert if needed
    setPrevAnswers((prev) => ({ ...prev, [question.id]: previousAnswer }));
    setPendingAnswerId(question.id);
    // Update UI immediately
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === question.id
          ? { ...q, answer, correct_answer_index: answerIndex }
          : q
      )
    );
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(`/api/teacher/questions/question/${question.id}`, {
        question_text: question.question_text,
        question_type: question.choices?.length ? "choice" : "text",
        choices: question.choices || [],
        answer,
        correct_answer_index: answerIndex,
        passage_id: question.passage_id || question.passage?.id || null,
        image_url: question.image_url || undefined,
        explanation: question.explanation || undefined,
        difficulty_level: question.difficulty_level || "medium",
        points: question.points || 1,
      }, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تم التحديث", description: "تم تعيين الإجابة الصحيحة", status: "success", duration: 2000, isClosable: true });
    } catch (error) {
      // Revert UI
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === question.id
            ? {
                ...q,
                answer: previousAnswer,
                correct_answer_index: question.correct_answer_index,
              }
            : q
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
    setQuestionChoices(question.choices || []);
    setQuestionAnswer(
      question.correct_answer_index == null
        ? ""
        : String(question.correct_answer_index)
    );
    onEditQuestionOpen();
  };

  // Update question
  const updateQuestion = async () => {
    setIsEditingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      const choices = questionChoices
        .map((choice) => choice.trim())
        .filter(Boolean);
      const correctAnswerIndex =
        questionAnswer === "" ? null : Number(questionAnswer);
      await baseUrl.put(`/api/teacher/questions/question/${questionEdit.id}`, {
        question_text: questionText,
        question_type: choices.length > 0 ? "choice" : "text",
        choices,
        answer:
          correctAnswerIndex != null && choices[correctAnswerIndex]
            ? choices[correctAnswerIndex]
            : undefined,
        correct_answer_index: correctAnswerIndex,
        passage_id: questionEdit.passage_id || questionEdit.passage?.id || null,
        image_url: questionEdit.image_url || undefined,
        explanation: questionEdit.explanation || undefined,
        difficulty_level: questionEdit.difficulty_level || "medium",
        points: questionEdit.points || 1,
      }, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast({ title: "تم التحديث", description: "تم تعديل السؤال بنجاح", status: "success", duration: 2000, isClosable: true });
      onEditQuestionClose();
      fetchQuestions();
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
      fetchQuestions();
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

  const openBulkModal = () => {
    setDraftPassages([]);
    setDraftQuestions([]);
    setOcrNotes("");
    setInferCorrectAnswer(false);
    setIsBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setDraftPassages([]);
    setDraftQuestions([]);
    setOcrNotes("");
    setInferCorrectAnswer(false);
  };

  const updateDraftPassage = (passageId, patch) => {
    setDraftPassages((prev) =>
      prev.map((passage) =>
        passage.passage_id === passageId ? { ...passage, ...patch } : passage
      )
    );
  };

  const updateDraftQuestion = (id, patch) => {
    setDraftQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  };

  const removeDraftQuestion = (id) => {
    setDraftQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addManualDraftQuestion = () => {
    setDraftQuestions((prev) => [...prev, emptyDraftQuestion()]);
  };

  const saveTeacherLibraryDrafts = async (token) => {
    if (!selectedSection?.id) {
      toast({
        title: "خطأ",
        description: "يجب اختيار جزء قبل حفظ الأسئلة",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return false;
    }

    const passageIds = new Set(draftPassages.map((p) => p.passage_id));
    const passageGroups = draftPassages
      .map((passage) => ({
        passage,
        questions: draftQuestions.filter(
          (q) => q.passage_id === passage.passage_id
        ),
      }))
      .filter((group) => group.questions.length > 0);
    const standaloneQuestions = draftQuestions.filter(
      (q) => !q.passage_id || !passageIds.has(q.passage_id)
    );

    if (passageGroups.length === 0 && standaloneQuestions.length === 0) {
      toast({
        title: "خطأ",
        description: "لا توجد أسئلة صالحة للحفظ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    for (const group of passageGroups) {
      if (!group.passage.content?.trim()) {
        toast({
          title: "خطأ في التحقق",
          description: "نص القطعة مطلوب قبل الحفظ",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
      for (let i = 0; i < group.questions.length; i++) {
        const err = validateTeacherDraftQuestion(group.questions[i], i);
        if (err) {
          toast({ title: "خطأ في التحقق", description: err, status: "error", duration: 5000, isClosable: true });
          return false;
        }
      }
    }

    for (let i = 0; i < standaloneQuestions.length; i++) {
      const err = validateTeacherDraftQuestion(standaloneQuestions[i], i);
      if (err) {
        toast({ title: "خطأ في التحقق", description: err, status: "error", duration: 5000, isClosable: true });
        return false;
      }
    }

    for (const group of passageGroups) {
      await baseUrl.post(
        "/api/teacher/questions/passage",
        {
          part_id: selectedSection.id,
          title: group.passage.title?.trim() || undefined,
          content: group.passage.content.trim(),
          questions: group.questions.map(draftToTeacherQuestionPayload),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    if (standaloneQuestions.length > 0) {
      await baseUrl.post(
        "/api/teacher/questions/bulk/json",
        {
          part_id: selectedSection.id,
          questions: standaloneQuestions.map(draftToTeacherQuestionPayload),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    toast({
      title: "تم الحفظ",
      description: `تم حفظ ${passageGroups.length} قطعة و${standaloneQuestions.length} سؤال مستقل`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    closeBulkModal();
    fetchQuestions(selectedSection.id);
    return true;
  };

  const handleOcrFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
    ];
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
    if (!isPdf && !isImage && !allowed.includes(file.type)) {
      toast({
        title: "خطأ",
        description: "يرجى رفع ملف PDF أو صورة (PNG, JPG, …)",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsExtractingOcr(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      if (inferCorrectAnswer) {
        formData.append("infer_correct_answer", "true");
      }
      formData.append("include_question_images", "true");

      const response = await baseUrl.post(
        "/api/ocr/extract-questions",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data?.data;
      const extracted = data?.questions;
      if (!response.data?.success || !Array.isArray(extracted) || extracted.length === 0) {
        toast({
          title: "تنبيه",
          description: "لم يتم استخراج أسئلة من الملف",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const mappedPassages = Array.isArray(data?.passages)
        ? data.passages.map(mapOcrPassageToDraft)
        : [];
      const mapped = extracted.map(mapOcrQuestionToDraft);
      setDraftPassages((prev) => [...prev, ...mappedPassages]);
      setDraftQuestions((prev) => [...prev, ...mapped]);
      setOcrNotes(data.notes || "");
      toast({
        title: "تم الاستخراج",
        description: `تم استخراج ${mapped.length} سؤال${
          mappedPassages.length ? ` و${mappedPassages.length} قطعة` : ""
        } — راجعها ثم احفظ`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "فشل في استخراج الأسئلة من الملف";
      toast({ title: "خطأ", description: msg, status: "error", duration: 4000, isClosable: true });
    } finally {
      setIsExtractingOcr(false);
    }
  };

  const submitBulkJsonQuestions = async () => {
    if (!selectedSection?.id) return;
    if (draftQuestions.length === 0) {
      toast({
        title: "خطأ",
        description: "أضف سؤالاً واحداً على الأقل",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAddingBulk(true);
    try {
      const token = localStorage.getItem("token");
      await saveTeacherLibraryDrafts(token);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "فشل في حفظ الأسئلة";
      toast({ title: "خطأ", description: msg, status: "error", duration: 4000, isClosable: true });
    } finally {
      setIsAddingBulk(false);
    }
  };

  const draftQuestionsByPassage = draftQuestions.reduce((map, question) => {
    const key = question.passage_id ?? "__standalone__";
    map[key] ??= [];
    map[key].push(question);
    return map;
  }, {});
  const standaloneDraftQuestions = draftQuestionsByPassage.__standalone__ || [];

  const libraryQuestionsByPassage = questions.reduce((map, question) => {
    const key = question.passage_id || question.passage?.id || "__standalone__";
    map[key] ??= [];
    map[key].push(question);
    return map;
  }, {});
  const standaloneLibraryQuestions = libraryQuestionsByPassage.__standalone__ || [];
  const libraryPassages = Object.entries(libraryQuestionsByPassage)
    .filter(([passageId]) => passageId !== "__standalone__")
    .map(([passageId, passageQuestions]) => {
      const firstQuestion = passageQuestions[0] || {};
      const passage = firstQuestion.passage || {
        id: passageId,
        title: firstQuestion.passage_title,
        content: firstQuestion.passage_content,
        order_index: firstQuestion.passage_order_index,
        created_at: firstQuestion.passage_created_at,
        updated_at: firstQuestion.passage_updated_at,
      };

      return {
        id: passage.id || passageId,
        passage,
        questions: passageQuestions,
      };
    });

  const renderLibraryQuestionCard = (question, index) => (
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
        {(question.image_url || question.image) && (
          <Box width="full" pl={8}>
            <Image
              src={question.image_url || question.image}
              alt={`صورة السؤال ${index + 1}`}
              maxH="220px"
              w="full"
              objectFit="contain"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              bg="white"
              loading="lazy"
            />
          </Box>
        )}
        {Array.isArray(question.choices) && question.choices.length > 0 && (
          <HStack flexWrap="wrap" gap={2} pl={8} width="full">
            {question.choices.map((option, optIndex) => {
              const isSelected = question.correct_answer_index === optIndex;
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
  );

  const renderDraftQuestionCard = (draft, index) => (
    <Box
      key={draft.id}
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={cardBg}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <HStack>
          <Badge colorScheme="purple">سؤال {index + 1}</Badge>
          {draft.passage_id && (
            <Badge colorScheme="blue" variant="subtle">
              سؤال قطعة
            </Badge>
          )}
        </HStack>
        <HStack>
          {draft.answerInferred && (
            <Badge colorScheme="orange" fontSize="xs">
              إجابة مُستنتجة
            </Badge>
          )}
          <IconButton
            icon={<FaTrash />}
            aria-label="حذف"
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={() => removeDraftQuestion(draft.id)}
          />
        </HStack>
      </Flex>

      <FormControl mb={3}>
        <FormLabel fontSize="sm">نوع السؤال</FormLabel>
        <Select
          value={draft.question_type}
          onChange={(e) => {
            const type = e.target.value;
            updateDraftQuestion(draft.id, {
              question_type: type,
              choices: type === "choice" && draft.choices.length < 2
                ? ["", ""]
                : type === "text" ? [] : draft.choices,
              answer: type === "text" ? "" : draft.answer,
              correctAnswerIndex: type === "text" ? null : draft.correctAnswerIndex,
            });
          }}
          dir="rtl"
        >
          <option value="choice">اختيار من متعدد</option>
          <option value="text">سؤال نصي (بدون اختيارات)</option>
        </Select>
      </FormControl>

      <FormControl mb={3}>
        <FormLabel fontSize="sm">نص السؤال</FormLabel>
        <Textarea
          value={draft.question_text}
          onChange={(e) =>
            updateDraftQuestion(draft.id, { question_text: e.target.value })
          }
          rows={2}
          dir="rtl"
          placeholder="نص السؤال"
        />
      </FormControl>

      <FormControl mb={3}>
        <FormLabel fontSize="sm">صور السؤال المستخرجة (اختياري)</FormLabel>
        {draft.questionImages?.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {draft.questionImages.map((image, imageIndex) => (
              <Box key={image.image_id || image.image_url || imageIndex}>
                <Image
                  src={image.image_url}
                  alt={image.short_description || `صورة السؤال ${index + 1}`}
                  maxH="160px"
                  objectFit="contain"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg="gray.50"
                />
                {image.short_description && (
                  <Text fontSize="sm" color={subTextColor} mt={1}>
                    {image.short_description}
                  </Text>
                )}
              </Box>
            ))}
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              alignSelf="flex-start"
              onClick={() =>
                updateDraftQuestion(draft.id, {
                  image_url: null,
                  imageDescription: "",
                  questionImages: [],
                })
              }
            >
              إزالة الصور
            </Button>
          </VStack>
        ) : draft.image_url ? (
          <VStack align="stretch" spacing={2}>
            <Image
              src={draft.image_url}
              alt={`صورة السؤال ${index + 1}`}
              maxH="140px"
              objectFit="contain"
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              bg="gray.50"
            />
            {draft.imageDescription && (
              <Text fontSize="sm" color={subTextColor}>
                {draft.imageDescription}
              </Text>
            )}
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              alignSelf="flex-start"
              onClick={() =>
                updateDraftQuestion(draft.id, {
                  image_url: null,
                  imageDescription: "",
                })
              }
            >
              إزالة
            </Button>
          </VStack>
        ) : (
          <Text fontSize="sm" color={subTextColor}>
            لا توجد صورة مستخرجة لهذا السؤال
          </Text>
        )}
      </FormControl>

      {draft.question_type === "choice" && (
        <>
          <FormControl mb={3}>
            <FormLabel fontSize="sm">الاختيارات</FormLabel>
            <VStack align="stretch" spacing={2}>
              {draft.choices.map((choice, cIdx) => (
                <HStack key={cIdx}>
                  <Badge minW="28px" textAlign="center">
                    {String.fromCharCode(65 + cIdx)}
                  </Badge>
                  <Input
                    value={choice}
                    onChange={(e) => {
                      const next = [...draft.choices];
                      const oldVal = next[cIdx];
                      next[cIdx] = e.target.value;
                      const patch = { choices: next };
                      if (draft.answer === oldVal) {
                        patch.answer = e.target.value;
                      }
                      updateDraftQuestion(draft.id, patch);
                    }}
                    dir="rtl"
                    placeholder={`اختيار ${cIdx + 1}`}
                  />
                  <IconButton
                    icon={<FaTrash />}
                    aria-label="حذف اختيار"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    isDisabled={draft.choices.length <= 2}
                    onClick={() => {
                      const removed = draft.choices[cIdx];
                      const next = draft.choices.filter((_, i) => i !== cIdx);
                      updateDraftQuestion(draft.id, {
                        choices: next.length >= 2 ? next : ["", ""],
                        answer: draft.answer === removed ? "" : draft.answer,
                        correctAnswerIndex:
                          draft.correctAnswerIndex === cIdx
                            ? null
                            : draft.correctAnswerIndex > cIdx
                              ? draft.correctAnswerIndex - 1
                              : draft.correctAnswerIndex,
                      });
                    }}
                  />
                </HStack>
              ))}
            </VStack>
            <Button
              size="sm"
              mt={2}
              leftIcon={<FaPlus />}
              onClick={() =>
                updateDraftQuestion(draft.id, {
                  choices: [...draft.choices, ""],
                })
              }
            >
              إضافة اختيار
            </Button>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">الإجابة الصحيحة</FormLabel>
            <Select
              placeholder="لا توجد إجابة محددة"
              value={
                Number.isInteger(draft.correctAnswerIndex)
                  ? String(draft.correctAnswerIndex)
                  : ""
              }
              onChange={(e) => {
                const nextIndex = e.target.value === "" ? null : Number(e.target.value);
                updateDraftQuestion(draft.id, {
                  correctAnswerIndex: nextIndex,
                  answer: nextIndex == null ? "" : draft.choices[nextIndex] || "",
                  answerInferred: false,
                });
              }}
              dir="rtl"
            >
              {draft.choices
                .map((c) => c.trim())
                .map((c, cIdx) => (
                  <option key={`${cIdx}-${c}`} value={cIdx} disabled={!c}>
                    {c || `اختيار ${cIdx + 1}`}
                  </option>
                ))}
            </Select>
          </FormControl>
        </>
      )}
    </Box>
  );

  return (
    <Box minH="100vh" className="mt-[50px]"  py={10} dir="rtl" fontFamily="'Changa', sans-serif">
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
                onClick={openBulkModal}
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
              <VStack align="stretch" spacing={8}>
                {libraryPassages.map((item, passageIndex) => (
                  <MotionBox
                    key={item.id}
                    variants={itemVariants}
                    p={6}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={5}>
                      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
                        <VStack align="flex-start" spacing={2}>
                          <HStack wrap="wrap">
                          <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                            قطعة {passageIndex + 1}
                          </Badge>
                            {item.passage?.id && (
                              <Badge colorScheme="gray" variant="subtle">
                                ID: {item.passage.id}
                              </Badge>
                            )}
                            {item.passage?.order_index != null && (
                              <Badge colorScheme="purple" variant="subtle">
                                الترتيب: {item.passage.order_index}
                              </Badge>
                            )}
                            {item.passage?.created_at && (
                              <Badge colorScheme="orange" variant="subtle">
                                {new Date(item.passage.created_at).toLocaleDateString("ar-SA")}
                              </Badge>
                            )}
                          </HStack>
                          <Text fontWeight="bold" color={headingColor} fontSize="lg">
                            {item.passage?.title || "قطعة بدون عنوان"}
                          </Text>
                        </VStack>
                        <Badge colorScheme="teal" variant="subtle" fontSize="sm">
                          {item.questions.length} سؤال
                        </Badge>
                      </Flex>

                      <Box
                        p={4}
                        bg={passageInfoBg}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        {item.passage?.content ? (
                          <Text whiteSpace="pre-wrap" lineHeight="1.8" color={textColor}>
                            {item.passage.content}
                          </Text>
                        ) : (
                          <Text color={subTextColor}>
                            لا يوجد نص محفوظ لهذه القطعة
                          </Text>
                          )}
                      </Box>

                      <SimpleGrid columns={lessonCols} spacing={5}>
                        {item.questions.map((question, index) =>
                          renderLibraryQuestionCard(question, index)
                        )}
                      </SimpleGrid>
                    </VStack>
                  </MotionBox>
                ))}

                {standaloneLibraryQuestions.length > 0 && (
                  <Box>
                    {libraryPassages.length > 0 && (
                      <Heading size="md" color={headingColor} mb={4}>
                        أسئلة مستقلة
                      </Heading>
                    )}
                    <SimpleGrid columns={lessonCols} spacing={8}>
                      {standaloneLibraryQuestions.map((question, index) =>
                        renderLibraryQuestionCard(question, index)
                      )}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
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
              <Select
                placeholder="لا توجد إجابة محددة"
                value={questionAnswer}
                onChange={e => setQuestionAnswer(e.target.value)}
                dir="rtl"
              >
                {questionChoices
                  .map((choice) => choice.trim())
                  .map((choice, idx) => (
                    <option key={`${idx}-${choice}`} value={idx} disabled={!choice}>
                      {choice || `اختيار ${idx + 1}`}
                    </option>
                  ))}
              </Select>
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

      {/* Bulk Add Questions Modal — OCR + JSON review */}
      <Modal isOpen={isBulkModalOpen} onClose={closeBulkModal} size="4xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" boxShadow="2xl" maxH="90vh">
          <ModalHeader fontWeight="bold" fontSize="xl" color="purple.700" textAlign="center">
            إضافة أسئلة — {selectedSection?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={5}>
              <Box
                p={5}
                borderRadius="xl"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="purple.200"
                bg={ocrUploadBg}
              >
                <Text fontWeight="bold" mb={3}>
                  استخراج من PDF أو صورة (ذكاء اصطناعي)
                </Text>
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel htmlFor="infer-answer" mb={0} flex="1">
                    تخمين الإجابة الصحيحة إن لم تكن مذكورة في الملف
                  </FormLabel>
                  <Switch
                    id="infer-answer"
                    colorScheme="purple"
                    isChecked={inferCorrectAnswer}
                    onChange={(e) => setInferCorrectAnswer(e.target.checked)}
                    isDisabled={isExtractingOcr || isAddingBulk}
                  />
                </FormControl>
                <Input
                  type="file"
                  accept="application/pdf,image/*,.pdf"
                  display="none"
                  id="ocr-question-file"
                  onChange={handleOcrFileUpload}
                  isDisabled={isExtractingOcr || isAddingBulk}
                />
                <Button
                  as="label"
                  htmlFor="ocr-question-file"
                  leftIcon={isExtractingOcr ? <Spinner size="sm" /> : <FaUpload />}
                  colorScheme="purple"
                  variant="outline"
                  w="full"
                  cursor={isExtractingOcr || isAddingBulk ? "not-allowed" : "pointer"}
                  isDisabled={isExtractingOcr || isAddingBulk}
                  borderRadius="xl"
                  py={6}
                >
                  {isExtractingOcr ? "جاري الاستخراج…" : "رفع PDF أو صورة"}
                </Button>
                <HStack mt={2} spacing={4} justify="center" color={subTextColor} fontSize="sm">
                  <HStack><Icon as={FaFilePdf} /><Text>PDF</Text></HStack>
                  <HStack><Icon as={FaImage} /><Text>PNG, JPG, …</Text></HStack>
                </HStack>
              </Box>

              <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                <Text fontWeight="bold" color={headingColor}>
                  مراجعة الأسئلة ({draftQuestions.length})
                </Text>
                <Button
                  size="sm"
                  leftIcon={<FaPlus />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={addManualDraftQuestion}
                  isDisabled={isExtractingOcr || isAddingBulk}
                  borderRadius="full"
                >
                  إضافة سؤال يدوياً
                </Button>
              </Flex>

              {ocrNotes && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Text fontSize="sm">{ocrNotes}</Text>
                </Alert>
              )}

              {draftQuestions.length === 0 ? (
                <Text textAlign="center" color={subTextColor} py={6}>
                  ارفع ملفاً لاستخراج الأسئلة، أو أضف سؤالاً يدوياً
                </Text>
              ) : (
                <VStack align="stretch" spacing={5} maxH="50vh" overflowY="auto" pr={1}>
                  {draftPassages.map((passage, passageIndex) => {
                    const passageQuestions =
                      draftQuestionsByPassage[passage.passage_id] || [];
                    return (
                      <Box
                        key={passage.id}
                        p={4}
                        borderRadius="2xl"
                        borderWidth="2px"
                        borderColor="blue.200"
                        bg={cardBg}
                        boxShadow="md"
                      >
                        <HStack justify="space-between" mb={4}>
                          <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                            قطعة {passageIndex + 1}
                          </Badge>
                          <Badge colorScheme="teal" variant="subtle">
                            {passageQuestions.length} سؤال
                          </Badge>
                        </HStack>

                        <FormControl mb={3}>
                          <FormLabel fontSize="sm">عنوان القطعة (اختياري)</FormLabel>
                          <Input
                            value={passage.title}
                            onChange={(e) =>
                              updateDraftPassage(passage.passage_id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="عنوان القطعة"
                            dir="rtl"
                          />
                        </FormControl>

                        <FormControl mb={4}>
                          <FormLabel fontSize="sm">نص القطعة</FormLabel>
                          <Textarea
                            value={passage.content}
                            onChange={(e) =>
                              updateDraftPassage(passage.passage_id, {
                                content: e.target.value,
                              })
                            }
                            rows={5}
                            dir="rtl"
                            placeholder="نص القطعة"
                          />
                        </FormControl>

                        <VStack align="stretch" spacing={4}>
                          {passageQuestions.map((draft, qIndex) =>
                            renderDraftQuestionCard(draft, qIndex)
                          )}
                        </VStack>
                      </Box>
                    );
                  })}

                  {standaloneDraftQuestions.length > 0 && (
                    <Box>
                      {draftPassages.length > 0 && (
                        <Heading size="sm" color={headingColor} mb={3}>
                          أسئلة مستقلة
                        </Heading>
                      )}
                      <VStack align="stretch" spacing={4}>
                        {standaloneDraftQuestions.map((draft, index) =>
                          renderDraftQuestionCard(draft, index)
                        )}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px">
            <Button
              colorScheme="purple"
              px={8}
              fontWeight="bold"
              borderRadius="full"
              onClick={submitBulkJsonQuestions}
              isLoading={isAddingBulk}
              isDisabled={
                draftQuestions.length === 0 || isExtractingOcr || isAddingBulk
              }
            >
              حفظ {draftQuestions.length > 0 ? `(${draftQuestions.length})` : ""}
            </Button>
            <Button variant="ghost" ml={3} onClick={closeBulkModal} isDisabled={isAddingBulk}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default QuestionLibraryPage;
