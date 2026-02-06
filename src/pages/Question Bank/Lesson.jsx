import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  useColorModeValue,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Image,
  IconButton,
  Spinner,
  HStack,
  VStack,
  useToast,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  Tooltip,
  Container,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  Divider
} from "@chakra-ui/react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaArrowRight,
  FaCheck,
  FaUpload,
  FaDatabase,
  FaClipboardList,
  FaFileAlt,
  FaTimes
} from "react-icons/fa";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [passagesList, setPassagesList] = useState([]); // [{ passage: {...}, questions: [...] }]
  const [passagesLoading, setPassagesLoading] = useState(false);
  const [passagesError, setPassagesError] = useState(null);

  // Selection states
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");

  // Form states
  const [bulkQuestions, setBulkQuestions] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    text: '',
    options: ['', '', '', '']
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  // New states for image questions
  const [questionType, setQuestionType] = useState("text"); // "text" | "image" | "passage"
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageQuestionText, setImageQuestionText] = useState("");
  const [imageCorrectAnswerIndex, setImageCorrectAnswerIndex] = useState(0);

  // Passage (قطعة) state
  const [passageTitle, setPassageTitle] = useState("");
  const [passageContent, setPassageContent] = useState("");
  const [passageQuestions, setPassageQuestions] = useState([
    { question_text: "", options: ["", "", "", ""], correct_answer_index: 0, explanation: "", difficulty_level: "medium", points: 1 }
  ]);
  const [passageLoading, setPassageLoading] = useState(false);

  // أسئلة صورة فقط (Bulk) — حتى 20 صورة
  const [imageOnlyBulkFiles, setImageOnlyBulkFiles] = useState([]);
  const [imageOnlyBulkPreviewUrls, setImageOnlyBulkPreviewUrls] = useState([]);
  const imageOnlyBulkPreviewUrlsRef = useRef([]);
  const [imageOnlyBulkLoading, setImageOnlyBulkLoading] = useState(false);
  const [imageOnlyBulkResult, setImageOnlyBulkResult] = useState(null);
  const [imageOnlyBulkMetaDefault, setImageOnlyBulkMetaDefault] = useState({ correct_answer_index: 0, difficulty_level: "medium", points: 1 });

  // تحديث الإجابة الصحيحة لسؤال (PATCH correct-answer)
  const [correctAnswerUpdatingId, setCorrectAnswerUpdatingId] = useState(null);


  // Loading states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [addToExamLoading, setAddToExamLoading] = useState(false);

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
  const { isOpen: isExamOpen, onOpen: onExamOpen, onClose: onExamClose } = useDisclosure();

  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Theme Colors
  const mainBg = useColorModeValue("gray.50", "gray.900");
  const pageBg = useColorModeValue("blue.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blue.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bulkPreviewBg = useColorModeValue("gray.50", "gray.800");
  const textPrimary = useColorModeValue("gray.800", "whiteAlpha.900");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const optionBg = useColorModeValue("gray.50", "gray.700");
  const optionCorrectBg = useColorModeValue("green.50", "green.900");
  const optionCorrectBorder = useColorModeValue("green.200", "green.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(66, 153, 225, 0.08)", "0 4px 20px rgba(0,0,0,0.2)");
  const cardShadowHover = useColorModeValue("0 12px 40px rgba(66, 153, 225, 0.15)", "0 12px 40px rgba(0,0,0,0.3)");
  const headerShadow = useColorModeValue("0 4px 20px rgba(66, 153, 225, 0.2)", "0 4px 20px rgba(0,0,0,0.3)");
  const fontCairo = "'Cairo', 'Tajawal', sans-serif";
  const loadingGradient = useColorModeValue("linear(to-b, blue.50 0%, white 50%)", "linear(to-b, gray.900 0%, gray.800 50%)");
  const patternOpacity = useColorModeValue(0.03, 0.05);
  const errorBorderColor = useColorModeValue("red.200", "red.900");
  const errorIconBg = useColorModeValue("red.50", "red.900");
  const selectedCardBg = useColorModeValue("blue.50", "gray.700");
  const optionLetterBg = useColorModeValue("gray.300", "gray.600");
  const optionCorrectText = useColorModeValue("green.800", "green.200");
  const optionHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const emptyIconBg = useColorModeValue("blue.50", "blue.900");

  // Fetch questions data
  const fetchQuestionsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return;
      }

      const response = await baseUrl.get(`/api/question-bank-v2/lesson/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data.success) {
        setQuestions(response.data.data?.questions || response.data.data || []);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب الأسئلة";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch passages (أسئلة القطع) — GET /api/question-bank-v2/lesson/:lessonId/passages
  const fetchPassages = async () => {
    try {
      setPassagesLoading(true);
      setPassagesError(null);
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await baseUrl.get(`/api/question-bank-v2/lesson/${id}/passages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setPassagesList(response.data.data);
      } else {
        setPassagesList([]);
      }
    } catch (err) {
      setPassagesError(err.response?.data?.message || "فشل تحميل أسئلة القطع");
      setPassagesList([]);
    } finally {
      setPassagesLoading(false);
    }
  };

  // Fetch exams data
  const fetchExams = async () => {
    try {
      setExamLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/exams/teacher/lecture-exams`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data && response.data.exams) {
        setExams(response.data.exams);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      toast({ title: "خطأ", description: "فشل تحميل قائمة الامتحانات", status: "error", duration: 3000, isClosable: true });
    } finally {
      setExamLoading(false);
    }
  };

  // Parse bulk text questions
  const parseBulkQuestions = (text) => {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    let currentQuestion = null;
    let currentOptions = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.match(/^[A-D]\)/)) {
        if (currentQuestion && currentOptions.length === 4) {
          questions.push({
            question_text: currentQuestion,
            options: currentOptions.map((opt, idx) => ({ option_index: idx, option_type: "text", text_content: opt })),
            correct_answer_index: 0,
            difficulty_level: "medium",
            points: 1
          });
        }
        currentQuestion = line;
        currentOptions = [];
      } else {
        const optionText = line.replace(/^[A-D]\)\s*/, '');
        if (optionText) currentOptions.push(optionText);
      }
    }

    if (currentQuestion && currentOptions.length === 4) {
      questions.push({
        question_text: currentQuestion,
        options: currentOptions.map((opt, idx) => ({ option_index: idx, option_type: "text", text_content: opt })),
        correct_answer_index: 0,
        difficulty_level: "medium",
        points: 1
      });
    }
    return questions;
  };

  // Create bulk questions (اختيار من متعدد دفعة واحدة - مع الإجابة الصحيحة)
  // API: POST /api/lesson-questions/lessons/:lessonId/questions/bulk
  const createBulkQuestions = async () => {
    const trimmed = (bulkQuestions || "").trim();
    if (!trimmed) {
      toast({ title: "خطأ", description: "اكتب نص الأسئلة أولاً.", status: "error", duration: 3000, isClosable: true });
      return { success: false };
    }
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }

      const response = await baseUrl.post(
        `/api/lesson-questions/lessons/${id}/questions/bulk`,
        { bulk_text: trimmed },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.data?.success && response.data?.data?.questions) {
        const raw = response.data.data.questions;
        const letterToIndex = (letter) => {
          const L = (letter || "").toString().trim().toUpperCase();
          if (L === "A" || L === "أ") return 0;
          if (L === "B" || L === "ب") return 1;
          if (L === "C" || L === "ج") return 2;
          if (L === "D" || L === "د") return 3;
          return 0;
        };
        const newQuestions = raw.map((q) => ({
          id: q.id,
          question_text: q.text ?? q.question_text,
          text: q.text ?? q.question_text,
          options: Array.isArray(q.options) ? q.options.map((o) => (typeof o === "string" ? o : (o?.text_content ?? o))) : [],
          correct_answer_index: typeof q.correct_answer !== "undefined" ? letterToIndex(q.correct_answer) : (q.correct_answer_index ?? 0)
        }));
        setQuestions((prev) => [...prev, ...newQuestions]);
        const msg = response.data.message || `تمت إضافة ${response.data.data.inserted ?? newQuestions.length} سؤال/أسئلة`;
        toast({ title: "نجح", description: msg, status: "success", duration: 3000, isClosable: true });
        return { success: true };
      }
      toast({ title: "نجح", description: response.data?.message || "تمت إضافة الأسئلة", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء الأسئلة";
      toast({ title: "خطأ", description: errorMessage, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setSubmitLoading(false);
    }
  };

  // Create image question
  const createImageChoicesQuestion = async (questionText, correctAnswerIndex) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append('question_text', questionText || 'اختر الإجابة الصحيحة');
      formData.append('lesson_id', id);
      formData.append('correct_answer_index', correctAnswerIndex || 0);
      formData.append('difficulty_level', 'medium');
      formData.append('points', '2');

      selectedImages.forEach((image, index) => {
        formData.append(`option_${index}`, image);
      });

      const response = await baseUrl.post(`/api/question-bank-v2/image-choices`, formData, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      if (response.data.success && response.data.data) {
        setQuestions(prev => [...prev, response.data.data]);
      }

      toast({ title: "نجح", description: "تم إنشاء السؤال الصوري بنجاح", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "حدث خطأ";
      toast({ title: "خطأ", description: errorMessage, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setSubmitLoading(false);
    }
  };

  // Create passage (إضافة قطعة) — POST /api/question-bank-v2/passages
  const createPassage = async () => {
    const contentTrimmed = (passageContent || "").trim();
    if (!contentTrimmed) {
      toast({ title: "خطأ", description: "أدخل نص القطعة أولاً.", status: "error", duration: 3000, isClosable: true });
      return { success: false };
    }
    const validQuestions = passageQuestions.filter(
      (q) => (q.question_text || "").trim() && q.options.every((o) => (o || "").trim())
    );
    if (validQuestions.length === 0) {
      toast({ title: "خطأ", description: "أضف سؤالاً واحداً على الأقل مع نص السؤال والأربعة خيارات.", status: "error", duration: 3000, isClosable: true });
      return { success: false };
    }
    try {
      setPassageLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      const body = {
        lesson_id: Number(id),
        title: (passageTitle || "").trim() || undefined,
        content: contentTrimmed,
        questions: validQuestions.map((q) => ({
          question_text: (q.question_text || "").trim(),
          options: (q.options || ["", "", "", ""]).map((text, idx) => ({
            option_index: idx,
            option_type: "text",
            text_content: (text || "").trim()
          })),
          correct_answer_index: Number(q.correct_answer_index) || 0,
          explanation: (q.explanation || "").trim() || undefined,
          difficulty_level: q.difficulty_level || "medium",
          points: Number(q.points) || 1
        }))
      };
      const response = await baseUrl.post("/api/question-bank-v2/passages", body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        const newQuestions = Array.isArray(data.questions) ? data.questions : (data.passage?.questions || []);
        const normalized = newQuestions.map((q) => ({
          id: q.id,
          question_text: q.question_text ?? q.text,
          text: q.question_text ?? q.text,
          options: Array.isArray(q.options)
            ? q.options.map((o) => (typeof o === "string" ? o : (o?.text_content ?? o)))
            : [],
          correct_answer_index: q.correct_answer_index ?? 0
        }));
        setQuestions((prev) => [...prev, ...normalized]);
        fetchPassages();
        toast({ title: "نجح", description: `تمت إضافة القطعة و${normalized.length} سؤال.`, status: "success", duration: 3000, isClosable: true });
        return { success: true };
      }
      fetchPassages();
      toast({ title: "نجح", description: response.data?.message || "تمت إضافة القطعة", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "حدث خطأ في إضافة القطعة";
      toast({ title: "خطأ", description: errorMessage, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setPassageLoading(false);
    }
  };

  // Update question
  const updateQuestion = async (formData) => {
    try {
      setEditLoading(true);
      const token = localStorage.getItem("token");

      const requestData = {
        question_text: formData.text,
        options: formData.options.map((opt, idx) => ({
          option_index: idx,
          option_type: "text",
          text_content: opt
        })).filter(opt => opt.text_content.trim() !== '')
      };

      let response;
      try {
        response = await baseUrl.put(`/api/question-bank-v2/${editingQuestion.id}`, requestData, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        throw err;
      }

      if (response.data.success) {
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...q, question_text: formData.text, options: formData.options } : q));
      }

      toast({ title: "نجح", description: "تم تحديث السؤال بنجاح", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      toast({ title: "خطأ", description: "فشل التحديث", status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setEditLoading(false);
    }
  };

  const deleteQuestion = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/question-bank-v2/${deletingQuestion.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setQuestions(prev => prev.filter(q => q.id !== deletingQuestion.id));
      setSelectedQuestions(prev => prev.filter(id => id !== deletingQuestion.id));
      toast({ title: "نجح", description: "تم الحذف", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الحذف", status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setDeleteLoading(false);
    }
  };

  const uploadImage = async () => {
    try {
      setImageLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("media", selectedImage);
      formData.append("media_type", "image");

      const response = await baseUrl.post(`/api/question-bank-v2/${currentQuestion.id}/media`, formData, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setQuestions(prev => prev.map(q => q.id === currentQuestion.id ? { ...q, media: response.data.data } : q));
      }
      toast({ title: "نجح", description: "تم رفع الصورة", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      setImageLoading(false);
    }
  };

  // Add selected questions to exam
  const handleAddQuestionsToExam = async () => {
    if (!selectedExamId) {
      toast({ title: "تنبيه", description: "الرجاء اختيار امتحان", status: "warning" });
      return;
    }

    try {
      setAddToExamLoading(true);
      const token = localStorage.getItem("token");

      const response = await baseUrl.post(`/api/exams/${selectedExamId}/questions/from-bank`, {
        questionIds: selectedQuestions
      }, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data) {
        toast({
          title: "نجح",
          description: `تم إضافة ${selectedQuestions.length} سؤال للامتحان بنجاح`,
          status: "success",
          duration: 3000
        });
        onExamClose();
        setSelectedQuestions([]);
        setSelectedExamId("");
      }
    } catch (err) {
      console.error("Error adding questions to exam:", err);
      const msg = err.response?.data?.message || "حدث خطأ أثناء إضافة الأسئلة للامتحان";
      toast({ title: "خطأ", description: msg, status: "error" });
    } finally {
      setAddToExamLoading(false);
    }
  };

  const handleToggleSelectId = (id) => {
    setSelectedQuestions(prev => {
      if (prev.includes(id)) return prev.filter(qId => qId !== id);
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  useEffect(() => {
    fetchQuestionsData();
    fetchPassages();
  }, [id]);

  // Handlers
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (questionType === "text") {
      if (!bulkQuestions.trim()) return;
      const result = await createBulkQuestions();
      if (result.success) { onClose(); resetBulkForm(); }
      return;
    }
    if (questionType === "image") {
      if (selectedImages.length !== 4) return;
      const result = await createImageChoicesQuestion(imageQuestionText, imageCorrectAnswerIndex);
      if (result.success) { onClose(); resetBulkForm(); }
      return;
    }
    if (questionType === "passage") {
      const result = await createPassage();
      if (result.success) { onClose(); resetBulkForm(); }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const result = await updateQuestion(editFormData);
    if (result.success) { onEditClose(); resetEditForm(); }
  };

  const handleImageSubmit = async () => {
    const result = await uploadImage();
    if (result.success) { onImageClose(); removeImage(); setCurrentQuestion(null); }
  };

  const handleOpenExamModal = () => {
    if (selectedQuestions.length === 0) {
      toast({ title: "تنبيه", description: "اختر أسئلة أولاً", status: "info" });
      return;
    }
    fetchExams();
    onExamOpen();
  };

  const resetBulkForm = () => {
    setBulkQuestions("");
    setQuestionType("text");
    setSelectedImages([]);
    setImagePreviews([]);
    setImageQuestionText("");
    setImageCorrectAnswerIndex(0);
    setPassageTitle("");
    setPassageContent("");
    setPassageQuestions([{ question_text: "", options: ["", "", "", ""], correct_answer_index: 0, explanation: "", difficulty_level: "medium", points: 1 }]);
    imageOnlyBulkPreviewUrlsRef.current.forEach(URL.revokeObjectURL);
    imageOnlyBulkPreviewUrlsRef.current = [];
    setImageOnlyBulkPreviewUrls([]);
    setImageOnlyBulkFiles([]);
    setImageOnlyBulkResult(null);
    setImageOnlyBulkMetaDefault({ correct_answer_index: 0, difficulty_level: "medium", points: 1 });
  };

  const removeBulkImageAtIndex = (index) => {
    URL.revokeObjectURL(imageOnlyBulkPreviewUrls[index]);
    imageOnlyBulkPreviewUrlsRef.current = imageOnlyBulkPreviewUrlsRef.current.filter((_, i) => i !== index);
    setImageOnlyBulkPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImageOnlyBulkFiles((prev) => prev.filter((_, i) => i !== index));
    setImageOnlyBulkResult(null);
  };

  const handleUpdateCorrectAnswer = async (questionId, correct_answer_index) => {
    if (correct_answer_index < 0 || correct_answer_index > 3) return;
    setCorrectAnswerUpdatingId(questionId);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.patch(
        `api/question-bank-v2/${questionId}/correct-answer`,
        { correct_answer_index: Number(correct_answer_index) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, correct_answer_index: Number(correct_answer_index) } : q)));
        toast({ title: res.data?.message || "تم تحديث الإجابة الصحيحة بنجاح", status: "success", duration: 3000, isClosable: true });
      } else {
        toast({ title: res.data?.message || "فشل التحديث", status: "error", duration: 3000, isClosable: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "حدث خطأ أثناء تحديث الإجابة الصحيحة";
      toast({ title: "خطأ", description: msg, status: "error", duration: 4000, isClosable: true });
    } finally {
      setCorrectAnswerUpdatingId(null);
    }
  };

  // إضافة أسئلة صورة فقط (Bulk) — POST image-only-bulk
  const handleImageOnlyBulkSubmit = async () => {
    if (!imageOnlyBulkFiles.length || !id) {
      toast({ title: "اختر صوراً أولاً (حتى 20)", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (imageOnlyBulkFiles.length > 20) {
      toast({ title: "الحد الأقصى 20 صورة", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setImageOnlyBulkLoading(true);
    setImageOnlyBulkResult(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      imageOnlyBulkFiles.forEach((file) => formData.append("images", file));
      const meta = imageOnlyBulkFiles.map(() => ({
        correct_answer_index: imageOnlyBulkMetaDefault.correct_answer_index,
        difficulty_level: imageOnlyBulkMetaDefault.difficulty_level,
        points: Number(imageOnlyBulkMetaDefault.points) || 1,
      }));
      formData.append("meta", JSON.stringify(meta));
      const res = await baseUrl.post(
        `api/question-bank-v2/lesson/${id}/questions/image-only-bulk`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;
      if (data?.success && data?.data) {
        const { added = 0, failed = 0, questions = [], errors = [] } = data.data;
        setImageOnlyBulkResult({ added, failed, questions, errors });
        if (failed === 0) {
          toast({ title: data?.message || `تمت إضافة ${added} سؤال بنجاح`, status: "success", duration: 5000, isClosable: true });
          fetchQuestionsData();
          setImageOnlyBulkFiles([]);
        } else {
          toast({ title: data?.message || `تمت إضافة ${added}، وفشل ${failed}`, status: "warning", duration: 5000, isClosable: true });
          fetchQuestionsData();
        }
      } else {
        toast({ title: data?.message || "فشل الرفع", status: "error", duration: 3000, isClosable: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "حدث خطأ أثناء رفع الصور";
      toast({ title: "خطأ في الرفع", description: msg, status: "error", duration: 4000, isClosable: true });
    } finally {
      setImageOnlyBulkLoading(false);
    }
  };

  const addPassageQuestion = () => {
    setPassageQuestions((prev) => [...prev, { question_text: "", options: ["", "", "", ""], correct_answer_index: 0, explanation: "", difficulty_level: "medium", points: 1 }]);
  };

  const updatePassageQuestion = (index, field, value) => {
    setPassageQuestions((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      if (field === "options") next[index] = { ...next[index], options: value };
      else next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePassageQuestion = (index) => {
    setPassageQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const resetEditForm = () => { setEditFormData({ text: '', options: ['', '', '', ''] }); };
  const removeImage = () => { setSelectedImage(null); setImagePreview(null); };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={pageBg} pt="80px" position="relative">
        <Box position="absolute" inset={0} bgGradient={loadingGradient} opacity={0.9} />
        <VStack spacing={5} position="relative" zIndex={1} p={8} bg={cardBg} borderRadius="2xl" boxShadow={cardShadow} borderWidth="1px" borderColor={cardBorder}>
          <Spinner size="xl" color="blue.500" thickness="3px" />
          <Text color={textPrimary} fontWeight="600" fontFamily={fontCairo}>جاري تحميل الأسئلة...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={pageBg} pt="80px" p={4}>
        <VStack spacing={5} bg={cardBg} p={8} borderRadius="2xl" boxShadow={cardShadow} borderWidth="2px" borderColor={errorBorderColor} maxW="md" textAlign="center">
          <Box w="14" h="14" borderRadius="full" bg={errorIconBg} display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaTrash} color="red.500" boxSize={6} />
          </Box>
          <Heading size="md" color={textPrimary} fontFamily={fontCairo}>فشل تحميل الأسئلة</Heading>
          <Text color={textSecondary} fontSize="sm">{error}</Text>
          <Button colorScheme="blue" onClick={fetchQuestionsData} leftIcon={<Icon as={FaPlus} />} fontFamily={fontCairo}>إعادة المحاولة</Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} pt="100px" pb={10} px={{ base: 4, md: 6, lg: 8 }} position="relative">
      <Box position="absolute" inset={0} opacity={patternOpacity} backgroundImage={useColorModeValue("radial-gradient(circle at 25px 25px, blue.400 1.5px, transparent 0)", "radial-gradient(circle at 25px 25px, blue.500 1.5px, transparent 0)")} backgroundSize="60px 60px" pointerEvents="none" />
      <ScrollToTop />
      <Container maxW="1280px" position="relative" zIndex={1}>

        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          mb={8}
          bgGradient="linear(to-r, blue.600, blue.500)"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          color="white"
          boxShadow={headerShadow}
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top={0} left={0} w="full" h="full" bgImage="radial-gradient(circle at 10% 20%, rgba(255,255,255,0.12) 2px, transparent 0)" bgSize="36px 36px" opacity={1} />
          <VStack align={{ base: "center", md: "flex-start" }} spacing={1} zIndex={1}>
            <HStack spacing={2} opacity={0.9} fontSize="sm" fontFamily={fontCairo}>
              <Link to="/teacher/subjects"><Text _hover={{ textDecor: "underline" }}>المواد</Text></Link>
              <Icon as={FaArrowRight} size="xs" />
              <Text>بنك الأسئلة</Text>
            </HStack>
            <Heading size="xl" fontFamily={fontCairo} fontWeight="800" letterSpacing="-0.02em">إدارة أسئلة الدرس</Heading>
            <Text fontSize="md" opacity={0.9} fontFamily={fontCairo}>{questions.length} سؤال</Text>
          </VStack>

          <HStack spacing={3} mt={{ base: 4, md: 0 }} zIndex={1} flexWrap="wrap" justify="center">
            {questions.length > 0 && (
              <Button
                variant="outline"
                colorScheme="whiteAlpha"
                color="white"
                borderWidth="2px"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={handleSelectAll}
                size="sm"
                fontFamily={fontCairo}
              >
                {selectedQuestions.length === questions.length ? "إلغاء الكل" : "تحديد الكل"}
              </Button>
            )}
            {selectedQuestions.length > 0 && (
              <Button
                leftIcon={<Icon as={FaClipboardList} />}
                bg="orange.400"
                _hover={{ bg: "orange.500" }}
                color="white"
                onClick={handleOpenExamModal}
                size="sm"
                fontFamily={fontCairo}
              >
                للامتحان ({selectedQuestions.length})
              </Button>
            )}
            <Button
              leftIcon={<Icon as={FaPlus} />}
              bg="white"
              color="blue.600"
              _hover={{ bg: "blue.50", transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
              onClick={onOpen}
              size="md"
              fontFamily={fontCairo}
              fontWeight="bold"
            >
              أسئلة جديدة
            </Button>
          </HStack>
        </Flex>

        {/* Tabs: الأسئلة العادية | أسئلة القطع */}
        <Tabs variant="soft-rounded" colorScheme="blue" mb={6}>
          <TabList bg={cardBg} p={1} borderRadius="xl" borderWidth="1px" borderColor={cardBorder} boxShadow={cardShadow} fontFamily={fontCairo}>
            <Tab fontWeight="600">الأسئلة العادية</Tab>
            <Tab fontWeight="600">أسئلة القطع</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0} pt={4}>
        {/* Questions Grid */}
        {questions.length > 0 ? (
          <Box>
            <HStack mb={6} justify="space-between" align="center">
              <Text color={textSecondary} fontSize="sm" fontFamily={fontCairo}>عرض {questions.length} سؤال</Text>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <AnimatePresence>
                {questions.map((question, index) => (
                  <MotionBox
                    key={question.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                    position="relative"
                  >
                    <Card
                      bg={selectedQuestions.includes(question.id) ? selectedCardBg : cardBg}
                      borderRadius="2xl"
                      overflow="hidden"
                      boxShadow={selectedQuestions.includes(question.id) ? "md" : cardShadow}
                      borderWidth="2px"
                      borderColor={selectedQuestions.includes(question.id) ? "blue.400" : cardBorder}
                      _hover={{ boxShadow: cardShadowHover, transform: "translateY(-4px)" }}
                      transition="all 0.25s ease"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                      cursor="pointer"
                      onClick={() => handleToggleSelectId(question.id)}
                    >
                      <CardHeader pb={2} pt={5} px={5}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                          <HStack spacing={3}>
                            <Checkbox
                              isChecked={selectedQuestions.includes(question.id)}
                              onChange={() => handleToggleSelectId(question.id)}
                              size="md"
                              colorScheme="blue"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Badge bg="blue.500" color="white" borderRadius="lg" px={3} py={1} fontSize="sm" fontFamily={fontCairo} fontWeight="bold">
                              {index + 1}
                            </Badge>
                            <Badge colorScheme={question.difficulty_level === "hard" ? "red" : "green"} variant="subtle" borderRadius="full" fontSize="xs" fontFamily={fontCairo}>
                              {question.difficulty_level || "متوسط"}
                            </Badge>
                          </HStack>
                          <HStack spacing={1} onClick={(e) => e.stopPropagation()}>
                            <Tooltip label="تعديل" hasArrow>
                              <IconButton icon={<FaEdit />} size="sm" variant="ghost" colorScheme="blue" borderRadius="lg" onClick={(e) => { e.stopPropagation(); setEditingQuestion(question); const opts = question.options ? question.options.map(o => typeof o === "string" ? o : (o.text_content || o.image_url)) : []; setEditFormData({ text: question.question_text || question.text || "", options: opts.length === 4 ? opts : ["", "", "", ""] }); onEditOpen(); }} />
                            </Tooltip>
                            <Tooltip label="صورة" hasArrow>
                              <IconButton icon={<FaImage />} size="sm" variant="ghost" colorScheme="purple" borderRadius="lg" onClick={(e) => { e.stopPropagation(); setCurrentQuestion(question); setImagePreview(question.media?.media_url || question.image); onImageOpen(); }} />
                            </Tooltip>
                            <Tooltip label="حذف" hasArrow>
                              <IconButton icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red" borderRadius="lg" onClick={(e) => { e.stopPropagation(); setDeletingQuestion(question); onDeleteOpen(); }} />
                            </Tooltip>
                          </HStack>
                        </Flex>
                      </CardHeader>

                      <CardBody flex={1} pt={0} px={5} pb={5}>
                        <Text fontSize="md" fontWeight="600" color={textPrimary} mb={4} lineHeight="1.7" fontFamily={fontCairo}>
                          {question.question_text || question.text}
                        </Text>

                        {question.media?.media_url && (
                          <Box mb={4} borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                            <Image src={question.media.media_url} w="100%" maxH="180px" objectFit="cover" alt="Question" />
                          </Box>
                        )}

                        <Box onClick={(e) => e.stopPropagation()}>
                          <Text fontSize="xs" color={textSecondary} mb={2} fontFamily={fontCairo}>اضغط على الخيار لتعيينه إجابةً صحيحة</Text>
                          <VStack align="stretch" spacing={2}>
                            {question.options && question.options.map((opt, i) => {
                              const isCorrect = question.correct_answer_index === i;
                              const content = typeof opt === "string" ? opt : (opt.text_content || opt.image_url);
                              const isImg = typeof opt !== "string" && opt.option_type === "image";
                              const isUpdating = correctAnswerUpdatingId === question.id;
                              const canSelect = !isCorrect && !isUpdating;
                              return (
                                <Tooltip key={i} label={canSelect ? "تحديد كإجابة صحيحة" : (isCorrect ? "الإجابة الصحيحة الحالية" : "")} hasArrow>
                                  <HStack
                                    p={3}
                                    bg={isCorrect ? optionCorrectBg : optionBg}
                                    borderRadius="xl"
                                    borderWidth="1px"
                                    borderColor={isCorrect ? optionCorrectBorder : "transparent"}
                                    justify="space-between"
                                    cursor={canSelect ? "pointer" : "default"}
                                    _hover={canSelect ? { bg: optionHoverBg, borderColor: "blue.200" } : { opacity: 0.95 }}
                                    transition="all 0.2s"
                                    onClick={() => canSelect && handleUpdateCorrectAnswer(question.id, i)}
                                  >
                                    <HStack spacing={3} minW={0} flex={1}>
                                      <Box w="28px" h="28px" flexShrink={0} borderRadius="full" bg={isCorrect ? "green.500" : optionLetterBg} color="white" fontSize="xs" fontWeight="bold" display="flex" alignItems="center" justifyContent="center" fontFamily={fontCairo}>
                                        {String.fromCharCode(65 + i)}
                                      </Box>
                                      {isImg ? (
                                        <Image src={content} maxH="36px" borderRadius="md" />
                                      ) : (
                                        <Text fontSize="sm" color={isCorrect ? optionCorrectText : textSecondary} noOfLines={2} fontFamily={fontCairo}>{content}</Text>
                                      )}
                                    </HStack>
                                    {isCorrect && !isUpdating && <Icon as={FaCheck} color="green.500" boxSize={4} flexShrink={0} />}
                                    {isCorrect && isUpdating && <Spinner size="sm" flexShrink={0} />}
                                  </HStack>
                                </Tooltip>
                              );
                            })}
                          </VStack>
                          {correctAnswerUpdatingId === question.id && (
                            <HStack mt={2} spacing={2} fontSize="xs" color={textSecondary} fontFamily={fontCairo}>
                              <Spinner size="xs" />
                              <Text>جاري تحديث الإجابة الصحيحة...</Text>
                            </HStack>
                          )}
                        </Box>
                      </CardBody>
                    </Card>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </SimpleGrid>
          </Box>
        ) : (
          <Flex direction="column" align="center" justify="center" minH="420px" bg={cardBg} borderRadius="2xl" borderWidth="2px" borderStyle="dashed" borderColor={cardBorder} textAlign="center" p={10} boxShadow={cardShadow}>
            <Box w="20" h="20" borderRadius="full" bg={emptyIconBg} display="flex" alignItems="center" justifyContent="center" mb={5}>
              <Icon as={FaDatabase} boxSize={10} color="blue.500" />
            </Box>
            <Heading size="md" color={textPrimary} mb={2} fontFamily={fontCairo}>لا توجد أسئلة بعد</Heading>
            <Text color={textSecondary} mb={6} fontFamily={fontCairo}>ابدأ بإضافة أسئلة لهذا الدرس</Text>
            <Button colorScheme="blue" onClick={onOpen} leftIcon={<Icon as={FaPlus} />} fontFamily={fontCairo} fontWeight="bold" size="lg">
              إضافة أول سؤال
            </Button>
          </Flex>
        )}
            </TabPanel>
            <TabPanel px={0} pt={4}>
              {passagesLoading ? (
                <Flex justify="center" align="center" minH="320px" bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={cardBorder} p={8}>
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="3px" />
                    <Text color={textSecondary} fontFamily={fontCairo}>جاري تحميل أسئلة القطع...</Text>
                  </VStack>
                </Flex>
              ) : passagesError ? (
                <Flex direction="column" align="center" justify="center" minH="320px" bg={cardBg} borderRadius="2xl" borderWidth="2px" borderColor={errorBorderColor} p={8} textAlign="center">
                  <Box w="14" h="14" borderRadius="full" bg={errorIconBg} display="flex" alignItems="center" justifyContent="center" mb={4}>
                    <Icon as={FaFileAlt} color="red.500" boxSize={6} />
                  </Box>
                  <Text color={textPrimary} fontWeight="600" fontFamily={fontCairo} mb={2}>فشل تحميل أسئلة القطع</Text>
                  <Text color={textSecondary} fontSize="sm" fontFamily={fontCairo} mb={4}>{passagesError}</Text>
                  <Button colorScheme="blue" size="sm" onClick={fetchPassages} fontFamily={fontCairo}>إعادة المحاولة</Button>
                </Flex>
              ) : passagesList.length === 0 ? (
                <Flex direction="column" align="center" justify="center" minH="320px" bg={cardBg} borderRadius="2xl" borderWidth="2px" borderStyle="dashed" borderColor={cardBorder} p={10} textAlign="center">
                  <Box w="20" h="20" borderRadius="full" bg={emptyIconBg} display="flex" alignItems="center" justifyContent="center" mb={5}>
                    <Icon as={FaFileAlt} boxSize={10} color="blue.500" />
                  </Box>
                  <Heading size="md" color={textPrimary} mb={2} fontFamily={fontCairo}>لا توجد قطع بعد</Heading>
                  <Text color={textSecondary} mb={6} fontFamily={fontCairo}>استخدم «إضافة أسئلة جديدة» ثم تبويب «إضافة قطعة» لإضافة قطعة وأسئلتها</Text>
                  <Button colorScheme="blue" onClick={onOpen} leftIcon={<Icon as={FaPlus} />} fontFamily={fontCairo} fontWeight="bold" size="lg">إضافة قطعة</Button>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={6}>
                  {passagesList.map((item, pIdx) => {
                    const passage = item.passage || {};
                    const qList = item.questions || [];
                    return (
                      <Card key={passage.id || pIdx} bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow={cardShadow} borderWidth="1px" borderColor={cardBorder} fontFamily={fontCairo}>
                        <CardHeader bg={optionBg} borderBottomWidth="1px" borderColor={borderColor} py={4}>
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <HStack spacing={3}>
                              <Badge colorScheme="blue" borderRadius="lg" px={3} py={1} fontSize="sm" fontWeight="bold">قطعة {pIdx + 1}</Badge>
                              {passage.title && (
                                <Text fontWeight="700" color={textPrimary} fontSize="lg">{passage.title}</Text>
                              )}
                            </HStack>
                            <Badge colorScheme="teal" variant="subtle" fontSize="xs">{qList.length} سؤال</Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody py={4}>
                          {passage.content && (
                            <Box mb={5} p={4} bg={mainBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                              <Text fontSize="sm" color={textSecondary} whiteSpace="pre-wrap" lineHeight="1.8">{passage.content}</Text>
                            </Box>
                          )}
                          <VStack align="stretch" spacing={4}>
                            {qList.map((q, qIdx) => {
                              const opts = q.options || [];
                              const optContent = (o) => (typeof o === "string" ? o : (o?.text_content ?? o));
                              return (
                                <Box key={q.id || qIdx} p={4} bg={optionBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                                  <HStack spacing={2} mb={3}>
                                    <Badge colorScheme="blue" fontSize="xs">{qIdx + 1}</Badge>
                                    <Text fontWeight="600" color={textPrimary} fontSize="md">{q.question_text || q.text}</Text>
                                  </HStack>
                                  <VStack align="stretch" spacing={2}>
                                    {opts.map((opt, oIdx) => {
                                      const isCorrect = q.correct_answer_index === oIdx;
                                      const content = optContent(opt);
                                      return (
                                        <HStack
                                          key={oIdx}
                                          p={2}
                                          pl={3}
                                          bg={isCorrect ? optionCorrectBg : "transparent"}
                                          borderRadius="lg"
                                          borderWidth="1px"
                                          borderColor={isCorrect ? optionCorrectBorder : "transparent"}
                                        >
                                          <Text fontSize="xs" fontWeight="bold" color={optionLetterBg} w="20px">{String.fromCharCode(65 + oIdx)})</Text>
                                          <Text fontSize="sm" color={isCorrect ? optionCorrectText : textSecondary}>{content}</Text>
                                          {isCorrect && <Icon as={FaCheck} color="green.500" boxSize={4} />}
                                        </HStack>
                                      );
                                    })}
                                  </VStack>
                                </Box>
                              );
                            })}
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>


      {/* --- ADD TO EXAM MODAL --- */}
      <Modal isOpen={isExamOpen} onClose={onExamClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" boxShadow={headerShadow} borderWidth="1px" borderColor={cardBorder}>
          <ModalHeader bg="blue.500" color="white" borderRadius="2xl 2xl 0 0" py={5} fontFamily={fontCairo}>
            <HStack spacing={3}>
              <Box p={2} bg="whiteAlpha.200" borderRadius="xl"><Icon as={FaClipboardList} boxSize={5} /></Box>
              <Text fontWeight="bold" fontSize="xl">إضافة الأسئلة للامتحان</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            {examLoading ? (
              <Flex justify="center" p={8}><Spinner color="blue.500" /></Flex>
            ) : exams.length === 0 ? (
              <Text textAlign="center" color="gray.500" py={8}>لا توجد امتحانات متاحة حالياً.</Text>
            ) : (
              <RadioGroup value={selectedExamId} onChange={setSelectedExamId}>
                <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" pr={1}>
                  {exams.map((exam) => (
                    <Box
                      key={exam.id}
                      p={4}
                      bg={selectedExamId === String(exam.id) ? "blue.50" : "gray.50"}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={selectedExamId === String(exam.id) ? "blue.500" : "transparent"}
                      cursor="pointer"
                      onClick={() => setSelectedExamId(String(exam.id))}
                      _hover={{ bg: "blue.50" }}
                    >
                      <Radio value={String(exam.id)} mb={2}>
                        <Text fontWeight="bold" fontSize="md">{exam.title}</Text>
                      </Radio>
                      <HStack fontSize="sm" color="gray.500" spacing={4} pl={6}>
                        <Text>{exam.courseTitle}</Text>
                        <Text>•</Text>
                        <Text>{exam.lectureTitle}</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </RadioGroup>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            <Button variant="ghost" mr={3} onClick={onExamClose} fontFamily={fontCairo}>إلغاء</Button>
            <Button colorScheme="blue" onClick={handleAddQuestionsToExam} isLoading={addToExamLoading} isDisabled={!selectedExamId} fontFamily={fontCairo} fontWeight="bold">
              إضافة ({selectedQuestions.length})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- OTHER MODALS --- */}

      {/* 1. Add Bulk Question Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" boxShadow={headerShadow} borderWidth="1px" borderColor={cardBorder}>
          <ModalHeader bg="blue.500" color="white" borderRadius="2xl 2xl 0 0" py={5} fontFamily={fontCairo}>
            <HStack spacing={3}>
              <Box p={2} bg="whiteAlpha.200" borderRadius="xl"><Icon as={FaPlus} boxSize={5} /></Box>
              <Text fontWeight="bold" fontSize="xl">إضافة أسئلة جديدة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <Tabs variant="soft-rounded" colorScheme="blue" onChange={(idx) => setQuestionType(idx === 0 ? "text" : idx === 1 ? "image" : idx === 2 ? "passage" : "imageOnlyBulk")}>
              <TabList mb={4} bg="gray.50" p={1} borderRadius="xl" flexWrap="wrap">
                <Tab flex="1" minW="100px">أسئلة نصية (Bulk)</Tab>
                <Tab flex="1" minW="100px">سؤال بالصور</Tab>
                <Tab flex="1" minW="100px">إضافة قطعة</Tab>
                <Tab flex="1" minW="100px">أسئلة صورة فقط (Bulk)</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <Alert status="info" borderRadius="xl" mb={4}>
                    <AlertIcon />
                    <Box fontSize="sm">
                      <AlertTitle>تنسيق إضافة أسئلة اختيار من متعدد دفعة واحدة:</AlertTitle>
                      <Text mt={1}>• سطر السؤال (يمكن أن يبدأ برقم أو إيموجي مثل 2️⃣ أو ٣.)</Text>
                      <Text>• أربعة أسطر للاختيارات: أ) ... ب) ... ج) ... د) ... (أو بالإنجليزية A) B) C) D))</Text>
                      <Text>• سطر اختياري: ✅ الإجابة الصحيحة: ب (أو أ / ج / د أو A / B / C / D)</Text>
                    </Box>
                  </Alert>
                  <Textarea
                    value={bulkQuestions}
                    onChange={(e) => setBulkQuestions(e.target.value)}
                    placeholder={`2️⃣ متى وقعت معركة حطين؟\nأ) 1099م\nب) 1187م\nج) 1250م\nد) 1260م\n✅ الإجابة الصحيحة: ب\n\n3️⃣ من هو قائد المسلمين في معركة عين جالوت؟\nأ) الظاهر بيبرس\nب) قطز\nج) صلاح الدين\nد) قلاوون\n✅ الإجابة الصحيحة: ب`}
                    rows={12}
                    borderRadius="xl"
                    bg="gray.50"
                    border="none"
                    _focus={{ bg: "white", boxShadow: "outline" }}
                    fontFamily="inherit"
                  />
                </TabPanel>
                <TabPanel px={0}>
                  {/* Image Question Form UI */}
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>نص السؤال</FormLabel>
                      <Input value={imageQuestionText} onChange={(e) => setImageQuestionText(e.target.value)} placeholder="مثال: اختر الصورة الصحيحة..." />
                    </FormControl>
                    <FormControl>
                      <FormLabel>الخيارات (اختر 4 صور)</FormLabel>
                      <SimpleGrid columns={4} spacing={2}>
                        {[0, 1, 2, 3].map(i => (
                          <Box key={i} h="100px" bg="gray.100" borderRadius="xl" position="relative" overflow="hidden" border="2px dashed" borderColor="gray.300">
                            {imagePreviews[i] ? (
                              <Image src={imagePreviews[i]} w="100%" h="100%" objectFit="cover" />
                            ) : (
                              <Flex h="100%" align="center" justify="center" color="gray.400" direction="column">
                                <Icon as={FaUpload} />
                                <Text fontSize="xs">{String.fromCharCode(65 + i)}</Text>
                              </Flex>
                            )}
                            <Input
                              type="file"
                              position="absolute"
                              top={0} left={0} w="100%" h="100%"
                              opacity={0}
                              cursor="pointer"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const newImgs = [...selectedImages]; newImgs[i] = file; setSelectedImages(newImgs);
                                  const reader = new FileReader(); reader.onload = () => { const newPrevs = [...imagePreviews]; newPrevs[i] = reader.result; setImagePreviews(newPrevs); }; reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {/* Radio for Correct Answer */}
                            <Box position="absolute" bottom={1} right={1} onClick={(e) => { e.stopPropagation(); setImageCorrectAnswerIndex(i); }}>
                              <Box w="20px" h="20px" borderRadius="full" border="2px solid white" bg={imageCorrectAnswerIndex === i ? "green.500" : "gray.300"} />
                            </Box>
                          </Box>
                        ))}
                      </SimpleGrid>
                      <Text fontSize="xs" color="gray.500" mt={1}>* انقر على الدائرة الصغيرة لتحديد الإجابة الصحيحة.</Text>
                    </FormControl>
                  </VStack>
                </TabPanel>
                <TabPanel px={0} maxH="60vh" overflowY="auto">
                  <Alert status="info" borderRadius="xl" mb={4}>
                    <AlertIcon />
                    <Box fontSize="sm">
                      <AlertTitle>إضافة قطعة مع أسئلة</AlertTitle>
                      <Text mt={1}>أدخل نص القطعة ثم أضف أسئلة اختيار من متعدد مرتبطة بها.</Text>
                    </Box>
                  </Alert>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel fontFamily={fontCairo}>عنوان القطعة (اختياري)</FormLabel>
                      <Input value={passageTitle} onChange={(e) => setPassageTitle(e.target.value)} placeholder="عنوان القطعة" borderRadius="xl" borderColor={borderColor} fontFamily={fontCairo} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontFamily={fontCairo}>نص القطعة</FormLabel>
                      <Textarea value={passageContent} onChange={(e) => setPassageContent(e.target.value)} placeholder="نص القطعة الكامل..." rows={6} borderRadius="xl" borderColor={borderColor} fontFamily={fontCairo} />
                    </FormControl>
                    <Divider />
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="600" fontFamily={fontCairo}>أسئلة القطعة</Text>
                      <Button size="sm" leftIcon={<Icon as={FaPlus} />} colorScheme="blue" variant="outline" onClick={addPassageQuestion} fontFamily={fontCairo}>إضافة سؤال</Button>
                    </Flex>
                    {passageQuestions.map((q, qIdx) => (
                      <Box key={qIdx} p={4} bg={optionBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                        <Flex justify="space-between" align="center" mb={3}>
                          <Badge colorScheme="blue" fontFamily={fontCairo}>سؤال {qIdx + 1}</Badge>
                          {passageQuestions.length > 1 && (
                            <IconButton aria-label="حذف السؤال" icon={<FaTrash />} size="xs" colorScheme="red" variant="ghost" onClick={() => removePassageQuestion(qIdx)} />
                          )}
                        </Flex>
                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" fontFamily={fontCairo}>نص السؤال</FormLabel>
                          <Input value={q.question_text} onChange={(e) => updatePassageQuestion(qIdx, "question_text", e.target.value)} placeholder="السؤال؟" borderRadius="lg" fontFamily={fontCairo} />
                        </FormControl>
                        <FormControl mb={3}>
                          <FormLabel fontSize="sm" fontFamily={fontCairo}>الخيارات (أ، ب، ج، د)</FormLabel>
                          <VStack spacing={2}>
                            {(q.options || ["", "", "", ""]).map((opt, oIdx) => (
                              <HStack key={oIdx} w="full">
                                <Text w="24px" fontSize="sm" fontWeight="bold" fontFamily={fontCairo}>{String.fromCharCode(65 + oIdx)})</Text>
                                <Input value={opt} onChange={(e) => { const opts = [...(q.options || ["", "", "", ""])]; opts[oIdx] = e.target.value; updatePassageQuestion(qIdx, "options", opts); }} placeholder={`الخيار ${String.fromCharCode(65 + oIdx)}`} size="sm" borderRadius="lg" fontFamily={fontCairo} />
                                <Radio isChecked={q.correct_answer_index === oIdx} onChange={() => updatePassageQuestion(qIdx, "correct_answer_index", oIdx)} />
                              </HStack>
                            ))}
                          </VStack>
                        </FormControl>
                        <HStack spacing={4} flexWrap="wrap">
                          <FormControl flex="1" minW="120px">
                            <FormLabel fontSize="xs" fontFamily={fontCairo}>الصعوبة</FormLabel>
                            <Select size="sm" value={q.difficulty_level} onChange={(e) => updatePassageQuestion(qIdx, "difficulty_level", e.target.value)} borderRadius="lg" fontFamily={fontCairo}>
                              <option value="easy">سهل</option>
                              <option value="medium">متوسط</option>
                              <option value="hard">صعب</option>
                            </Select>
                          </FormControl>
                          <FormControl w="80px">
                            <FormLabel fontSize="xs" fontFamily={fontCairo}>النقاط</FormLabel>
                            <Input type="number" min={1} value={q.points} onChange={(e) => updatePassageQuestion(qIdx, "points", e.target.value)} size="sm" borderRadius="lg" fontFamily={fontCairo} />
                          </FormControl>
                        </HStack>
                        <FormControl mt={2}>
                          <FormLabel fontSize="xs" fontFamily={fontCairo}>شرح (اختياري)</FormLabel>
                          <Input value={q.explanation} onChange={(e) => updatePassageQuestion(qIdx, "explanation", e.target.value)} placeholder="شرح الإجابة" size="sm" borderRadius="lg" fontFamily={fontCairo} />
                        </FormControl>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                <TabPanel px={0}>
                  <Alert status="info" borderRadius="xl" mb={4} fontFamily={fontCairo}>
                    <AlertIcon />
                    <Box fontSize="sm">
                      <AlertTitle>إضافة أسئلة صورة فقط (Bulk)</AlertTitle>
                      <Text mt={1}>ارفع حتى 20 صورة؛ كل صورة = سؤال مستقل مع أربعة اختيارات ثابتة (أ، ب، ج، د). يمكنك تحديد الإجابة الصحيحة الافتراضية ومستوى الصعوبة والنقاط أدناه (تُطبَّق على كل الصور).</Text>
                    </Box>
                  </Alert>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel fontFamily={fontCairo}>الصور (حتى 20)</FormLabel>
                      <Flex align="center" gap={3} flexWrap="wrap">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const limited = files.slice(0, 20);
                            imageOnlyBulkPreviewUrlsRef.current.forEach(URL.revokeObjectURL);
                            const urls = limited.map((f) => URL.createObjectURL(f));
                            imageOnlyBulkPreviewUrlsRef.current = urls;
                            setImageOnlyBulkPreviewUrls(urls);
                            setImageOnlyBulkFiles(limited);
                            setImageOnlyBulkResult(null);
                            e.target.value = "";
                          }}
                          border="none"
                          p={0}
                          fontFamily={fontCairo}
                          sx={{ "&::file-selector-button": { padding: 2, mr: 2, borderRadius: "md", border: "1px solid", borderColor: "gray.300", bg: "gray.50", cursor: "pointer" } }}
                        />
                        {imageOnlyBulkFiles.length > 0 && (
                          <HStack fontSize="sm" color={textSecondary}>
                            <Icon as={FaImage} boxSize={4} color="blue.500" />
                            <Text>{imageOnlyBulkFiles.length} صورة محددة</Text>
                          </HStack>
                        )}
                      </Flex>
                    </FormControl>
                    {imageOnlyBulkFiles.length > 0 && (
                      <Box>
                        <FormLabel fontFamily={fontCairo} fontSize="sm" mb={2}>معاينة الصور — يمكنك إلغاء أي صورة</FormLabel>
                        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                          {imageOnlyBulkFiles.map((file, index) => (
                            <Box key={index} position="relative" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor={borderColor} bg={bulkPreviewBg}>
                              <Image src={imageOnlyBulkPreviewUrls[index]} alt={file.name} objectFit="cover" h="24" w="full" />
                              <IconButton
                                aria-label="إلغاء الصورة"
                                icon={<Icon as={FaTimes} />}
                                size="xs"
                                colorScheme="red"
                                position="absolute"
                                top={1}
                                right={1}
                                borderRadius="full"
                                onClick={() => removeBulkImageAtIndex(index)}
                              />
                              <Text fontSize="xs" noOfLines={1} px={2} py={1} fontFamily={fontCairo}>{file.name}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontFamily={fontCairo} fontSize="sm">الإجابة الصحيحة الافتراضية</FormLabel>
                        <Select
                          value={imageOnlyBulkMetaDefault.correct_answer_index}
                          onChange={(e) => setImageOnlyBulkMetaDefault((prev) => ({ ...prev, correct_answer_index: Number(e.target.value) }))}
                          size="sm"
                          borderRadius="lg"
                          fontFamily={fontCairo}
                        >
                          <option value={0}>أ</option>
                          <option value={1}>ب</option>
                          <option value={2}>ج</option>
                          <option value={3}>د</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontFamily={fontCairo} fontSize="sm">مستوى الصعوبة</FormLabel>
                        <Select
                          value={imageOnlyBulkMetaDefault.difficulty_level}
                          onChange={(e) => setImageOnlyBulkMetaDefault((prev) => ({ ...prev, difficulty_level: e.target.value }))}
                          size="sm"
                          borderRadius="lg"
                          fontFamily={fontCairo}
                        >
                          <option value="easy">سهل</option>
                          <option value="medium">متوسط</option>
                          <option value="hard">صعب</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontFamily={fontCairo} fontSize="sm">النقاط</FormLabel>
                        <Input
                          type="number"
                          min={1}
                          value={imageOnlyBulkMetaDefault.points}
                          onChange={(e) => setImageOnlyBulkMetaDefault((prev) => ({ ...prev, points: Number(e.target.value) || 1 }))}
                          size="sm"
                          borderRadius="lg"
                          fontFamily={fontCairo}
                        />
                      </FormControl>
                    </SimpleGrid>
                    <Button
                      leftIcon={<Icon as={FaUpload} />}
                      colorScheme="blue"
                      onClick={handleImageOnlyBulkSubmit}
                      isLoading={imageOnlyBulkLoading}
                      isDisabled={!imageOnlyBulkFiles.length}
                      fontFamily={fontCairo}
                      fontWeight="bold"
                      borderRadius="xl"
                      w="full"
                      size="lg"
                    >
                      {imageOnlyBulkLoading ? "جاري الرفع..." : "رفع الصور (إضافة أسئلة)"}
                    </Button>
                    {imageOnlyBulkResult && (
                      <Alert status={imageOnlyBulkResult.failed > 0 ? "warning" : "success"} borderRadius="xl" fontFamily={fontCairo}>
                        <AlertIcon />
                        <Box>
                          <AlertTitle>{imageOnlyBulkResult.failed > 0 ? "تم جزئياً" : "تمت الإضافة"}</AlertTitle>
                          <Text fontSize="sm" mt={1}>
                            تمت إضافة {imageOnlyBulkResult.added} سؤال.
                            {imageOnlyBulkResult.failed > 0 && ` فشل ${imageOnlyBulkResult.failed}. ${imageOnlyBulkResult.errors?.length ? imageOnlyBulkResult.errors.map((e) => `(صورة ${(e.index ?? 0) + 1}: ${e.message})`).join(" ") : ""}`}
                          </Text>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={5} bg={useColorModeValue("gray.50", "gray.800")} borderRadius="0 0 2xl 2xl">
            <Button variant="ghost" onClick={onClose} mr={3} fontFamily={fontCairo}>إلغاء</Button>
            {questionType !== "imageOnlyBulk" && (
              <Button colorScheme="blue" onClick={handleBulkSubmit} isLoading={submitLoading || passageLoading} fontFamily={fontCairo} fontWeight="bold">حفظ الأسئلة</Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2. Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" boxShadow={headerShadow} borderWidth="1px" borderColor={cardBorder}>
          <ModalHeader bg="blue.500" color="white" borderRadius="2xl 2xl 0 0" py={5} fontFamily={fontCairo}>
            <HStack spacing={3}>
              <Box p={2} bg="whiteAlpha.200" borderRadius="xl"><Icon as={FaEdit} boxSize={5} /></Box>
              <Text fontWeight="bold" fontSize="xl">تعديل السؤال</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <VStack spacing={5}>
              <FormControl>
                <FormLabel color={textPrimary} fontFamily={fontCairo} fontWeight="600">نص السؤال</FormLabel>
                <Textarea value={editFormData.text} onChange={(e) => setEditFormData({ ...editFormData, text: e.target.value })} borderRadius="xl" borderColor={borderColor} _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.2)" }} fontFamily={fontCairo} />
              </FormControl>
              <FormControl>
                <FormLabel color={textPrimary} fontFamily={fontCairo} fontWeight="600">الخيارات</FormLabel>
                <VStack spacing={3}>
                  {editFormData.options.map((opt, i) => (
                    <Input key={i} value={opt} onChange={(e) => { const newOpts = [...editFormData.options]; newOpts[i] = e.target.value; setEditFormData({ ...editFormData, options: newOpts }); }} placeholder={`الخيار ${String.fromCharCode(65 + i)}`} borderRadius="lg" borderColor={borderColor} fontFamily={fontCairo} />
                  ))}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            <Button variant="ghost" onClick={onEditClose} fontFamily={fontCairo}>إلغاء</Button>
            <Button colorScheme="blue" onClick={handleEditSubmit} isLoading={editLoading} fontFamily={fontCairo} fontWeight="bold">حفظ التعديلات</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 3. Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" boxShadow={headerShadow} borderWidth="1px" borderColor={cardBorder}>
          <ModalBody py={8} textAlign="center">
            <Box w="16" h="16" mx="auto" mb={4} borderRadius="full" bg={useColorModeValue("red.50", "red.900")} display="flex" alignItems="center" justifyContent="center">
              <Icon as={FaTrash} boxSize={8} color="red.500" />
            </Box>
            <Heading size="md" mb={2} color={textPrimary} fontFamily={fontCairo}>حذف السؤال؟</Heading>
            <Text color={textSecondary} mb={6} fontSize="sm" fontFamily={fontCairo}>هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.</Text>
            <HStack justify="center" spacing={4}>
              <Button variant="ghost" onClick={onDeleteClose} fontFamily={fontCairo}>إلغاء</Button>
              <Button colorScheme="red" onClick={deleteQuestion} isLoading={deleteLoading} fontFamily={fontCairo} fontWeight="bold">نعم، حذف</Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 4. Image Upload Modal */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl" boxShadow={headerShadow} borderWidth="1px" borderColor={cardBorder}>
          <ModalHeader bg="blue.500" color="white" borderRadius="2xl 2xl 0 0" py={5} fontFamily={fontCairo}>
            <HStack spacing={3}>
              <Box p={2} bg="whiteAlpha.200" borderRadius="xl"><Icon as={FaImage} boxSize={5} /></Box>
              <Text fontWeight="bold" fontSize="xl">صورة السؤال</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <Box borderWidth="2px" borderStyle="dashed" borderColor="blue.300" bg={emptyIconBg} borderRadius="xl" h="220px" display="flex" alignItems="center" justifyContent="center" cursor="pointer" position="relative" overflow="hidden">
              {imagePreview ? (
                <Image src={imagePreview} w="full" h="full" objectFit="contain" />
              ) : (
                <VStack color="blue.500" fontFamily={fontCairo}>
                  <Icon as={FaUpload} w={10} h={10} />
                  <Text fontWeight="600">اضغط لرفع صورة</Text>
                </VStack>
              )}
              <Input type="file" position="absolute" top={0} left={0} w="full" h="full" opacity={0} accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setSelectedImage(file); const r = new FileReader(); r.onload = () => setImagePreview(r.result); r.readAsDataURL(file); } }} />
            </Box>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            {imagePreview && <Button colorScheme="red" variant="ghost" mr="auto" fontFamily={fontCairo} onClick={removeImage}>مسح</Button>}
            <Button colorScheme="blue" onClick={handleImageSubmit} isLoading={imageLoading} fontFamily={fontCairo} fontWeight="bold">حفظ الصورة</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Lesson;
