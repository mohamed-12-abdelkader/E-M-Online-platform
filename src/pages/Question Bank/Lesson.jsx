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
  FaTimes,
  FaSearchPlus,
  FaLightbulb,
  FaExclamationCircle
} from "react-icons/fa";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);

// دالة لضغط الصور قبل الرفع لتجنب خطأ 413 (Payload Too Large)
const compressImage = (file, maxWidth = 1024, quality = 0.7) => {
  return new Promise((resolve) => {
    if (!file.type.match(/image.*/)) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // تصغير الأبعاد إذا كانت كبيرة جداً
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // في حال فشل الضغط نرجع الملف الأصلي
              return;
            }
            const newFile = new window.File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // المستخدم مدرس أو أدمن؟
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setIsTeacher(user?.role === "teacher");
      setIsAdmin(user?.role === "admin");
    } catch {}
  }, []);

  // وضع التحديد (لإضافة أسئلة للامتحان) — مثل التطبيق
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  // تكبير الصورة
  const [zoomImageUri, setZoomImageUri] = useState(null);
  // عرض نتيجة الإضافة للامتحان
  const { isOpen: isAddSuccessOpen, onOpen: onAddSuccessOpen, onClose: onAddSuccessClose } = useDisclosure();
  const [addSuccessMessage, setAddSuccessMessage] = useState("");
  // إجابات مختارة (عرض تدريبي - يظهر صحيح/خطأ)
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Data states
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [comprehensiveExams, setComprehensiveExams] = useState([]);
  const [passagesList, setPassagesList] = useState([]); // [{ passage: {...}, questions: [...] }]
  const [passagesLoading, setPassagesLoading] = useState(false);
  const [passagesError, setPassagesError] = useState(null);

  // Selection states
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedPassageIds, setSelectedPassageIds] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examModalTab, setExamModalTab] = useState("lecture"); // "lecture" | "comprehensive"
  const [examModalMode, setExamModalMode] = useState("questions"); // "questions" | "passages"

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
  const optionWrongBg = useColorModeValue("red.50", "red.900");
  const optionLetterBgNeutral = useColorModeValue("gray.200", "gray.600");
  const explanationBg = useColorModeValue("blue.50", "blue.900");

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

  // جلب امتحانات المحاضرة
  const fetchLectureExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("/api/exams/teacher/lecture-exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.exams) setExams(response.data.exams);
      else setExams([]);
    } catch (err) {
      console.error("Error fetching lecture exams:", err);
      setExams([]);
      toast({ title: "خطأ", description: "فشل تحميل امتحانات المحاضرة", status: "error", isClosable: true });
    }
  };

  // جلب الامتحانات الشاملة (كورس)
  const fetchComprehensiveExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("/api/exams/teacher", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.exams) setComprehensiveExams(response.data.exams);
      else setComprehensiveExams([]);
    } catch (err) {
      console.error("Error fetching comprehensive exams:", err);
      setComprehensiveExams([]);
      toast({ title: "خطأ", description: "فشل تحميل الامتحانات الشاملة", status: "error", isClosable: true });
    }
  };

  const fetchExams = async () => {
    setExamLoading(true);
    await Promise.all([fetchLectureExams(), fetchComprehensiveExams()]);
    setExamLoading(false);
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

  // إضافة الأسئلة من بنك الأسئلة إلى الامتحان
  // امتحان محاضرة: POST /api/exams/:examId/questions/from-bank → يُنشئ نسخة داخل الامتحان، الاستجابة تحتوي examQuestionIds
  // امتحان كورس: نفس الـ endpoint (تمييز تلقائي) أو POST /api/exams/course-level/:examId/questions/from-bank
  const handleAddQuestionsToExam = async () => {
    if (!selectedExamId) {
      toast({ title: "تنبيه", description: "الرجاء اختيار امتحان", status: "warning" });
      return;
    }
    if (!selectedQuestions.length) {
      toast({ title: "تنبيه", description: "الرجاء اختيار أسئلة من البنك", status: "warning" });
      return;
    }

    try {
      setAddToExamLoading(true);
      const token = localStorage.getItem("token");

      const body = examModalTab === "comprehensive"
        ? { questionIds: selectedQuestions, type: "course-exam" }
        : { questionIds: selectedQuestions };

      const response = await baseUrl.post(
        `/api/exams/${selectedExamId}/questions/from-bank`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
      const count = data?.count ?? selectedQuestions.length;
      const message = data?.message || `تم إضافة ${count} سؤال للامتحان بنجاح`;

      setAddSuccessMessage(message);
      onExamClose();
      setSelectedQuestions([]);
      setSelectedExamId("");
      setIsSelectionMode(false);
      onAddSuccessOpen();
    } catch (err) {
      console.error("Error adding questions to exam:", err);
      const msg = err.response?.data?.message || "حدث خطأ أثناء إضافة الأسئلة للامتحان";
      toast({ title: "خطأ", description: msg, status: "error", isClosable: true });
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

  // تبديل وضع التحديد (مثل التطبيق)
  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedQuestions([]);
  };

  // اختيار إجابة للعرض التدريبي (يظهر صحيح/خطأ)
  const handleSelectAnswer = (questionId, optionIndex) => {
    if (isSelectionMode) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // ألوان ونصوص الحالة والصعوبة (مطابقة للتطبيق)
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "green.500";
      case "rejected": return "red.500";
      case "pending": return "orange.500";
      default: return "gray.500";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "approved": return "موافق عليه";
      case "rejected": return "مرفوض";
      case "pending": return "قيد المراجعة";
      default: return status || "—";
    }
  };
  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy": return "green.500";
      case "hard": return "red.500";
      default: return "blue.500";
    }
  };
  const getDifficultyText = (level) => {
    switch (level) {
      case "easy": return "سهل";
      case "hard": return "صعب";
      default: return "متوسط";
    }
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
    if (examModalMode === "questions" && selectedQuestions.length === 0) {
      toast({ title: "تنبيه", description: "اختر أسئلة أولاً", status: "info" });
      return;
    }
    if (examModalMode === "passages" && selectedPassageIds.length === 0) {
      toast({ title: "تنبيه", description: "اختر قطعاً أولاً", status: "info" });
      return;
    }
    setSelectedExamId("");
    setExamModalTab("lecture");
    fetchExams();
    onExamOpen();
  };

  const handleOpenPassagesToExamModal = () => {
    if (selectedPassageIds.length === 0) {
      toast({ title: "تنبيه", description: "اختر قطعاً من تبويب أسئلة القطع", status: "info" });
      return;
    }
    setExamModalMode("passages");
    setSelectedExamId("");
    setExamModalTab("lecture");
    fetchExams();
    onExamOpen();
  };

  const handleAddPassagesToExam = async () => {
    if (!selectedExamId) {
      toast({ title: "تنبيه", description: "الرجاء اختيار امتحان", status: "warning" });
      return;
    }
    try {
      setAddToExamLoading(true);
      const token = localStorage.getItem("token");
      let lastMessage = "تم إضافة القطع للامتحان بنجاح";
      for (const passageId of selectedPassageIds) {
        const res = await baseUrl.post(
          `/api/exams/${selectedExamId}/questions/from-bank/passage`,
          { passageId: Number(passageId) },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        if (res.data?.message) lastMessage = res.data.message;
      }
      toast({ title: "نجح", description: lastMessage, status: "success", isClosable: true });
      onExamClose();
      setSelectedPassageIds([]);
      setExamModalMode("questions");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "فشل في إضافة القطع للامتحان";
      toast({ title: "خطأ", description: msg, status: "error", isClosable: true });
    } finally {
      setAddToExamLoading(false);
    }
  };

  const handleTogglePassageId = (passageId) => {
    setSelectedPassageIds((prev) =>
      prev.includes(passageId) ? prev.filter((id) => id !== passageId) : [...prev, passageId]
    );
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

  if (loading && questions.length === 0) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("#E3F2FD", "gray.900")} pt="80px" position="relative" overflow="hidden">
        <Box position="absolute" top="-100px" right="-100px" w="300px" h="300px" borderRadius="full" bg="blue.400" opacity={0.1} />
        <Box position="absolute" bottom="-80px" left="-80px" w="250px" h="250px" borderRadius="full" bg="purple.400" opacity={0.1} />
        <Box position="relative" zIndex={1} p={12} bg={cardBg} borderRadius="3xl" boxShadow="xl" borderWidth="1px" borderColor={cardBorder} maxW="400px" textAlign="center">
          <Box w="120px" h="120px" mx="auto" mb={6} borderRadius="full" bgGradient="linear(to-b, blue.200, blue.50)" display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaDatabase} color="blue.500" boxSize={16} />
          </Box>
          <Text color={textPrimary} fontWeight="700" fontSize="xl" fontFamily={fontCairo} mb={2}>جاري التحميل...</Text>
          <Text color={textSecondary} fontFamily={fontCairo} mb={6}>جاري تحميل أسئلة الدرس</Text>
          <Spinner size="lg" color="blue.500" thickness="3px" />
        </Box>
      </Flex>
    );
  }

  if (error && questions.length === 0) {
    return (
      <Flex minH="100vh" direction="column" bg={useColorModeValue("#E3F2FD", "gray.900")} pt="80px">
        <Flex px={4} py={3} borderBottomWidth="1px" borderColor={cardBorder} bg={cardBg} align="center">
          <Button as={Link} to="/teacher/subjects" variant="ghost" size="sm" leftIcon={<Icon as={FaArrowRight} />} fontFamily={fontCairo}>رجوع</Button>
        </Flex>
        <Flex flex={1} align="center" justify="center" p={8}>
          <VStack spacing={5} maxW="md" textAlign="center">
            <Box w="20" h="20" borderRadius="full" bg="red.100" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FaExclamationCircle} color="red.500" boxSize={10} />
            </Box>
            <Text color={textPrimary} fontWeight="700" fontFamily={fontCairo}>{error}</Text>
            <Button colorScheme="blue" onClick={() => fetchQuestionsData()} fontFamily={fontCairo} fontWeight="bold">إعادة المحاولة</Button>
          </VStack>
        </Flex>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue("#E3F2FD", "gray.900")} pt="80px" pb={24} position="relative">
      <Box position="absolute" top="-50px" right="-50px" w="200px" h="200px" borderRadius="full" bg="blue.400" opacity={0.08} />
      <Box position="absolute" bottom="-30px" left="-30px" w="150px" h="150px" borderRadius="full" bg="purple.400" opacity={0.08} />
      <ScrollToTop />
      <Container maxW="1280px" position="relative" zIndex={1}>

        {/* Header — مطابق للتطبيق: شريط علوي مع رجوع وأزرار */}
        <Flex
          direction="row"
          align="center"
          justify="space-between"
          py={3}
          px={{ base: 4, md: 6 }}
          mb={4}
          bg={cardBg}
          borderBottomWidth="1.5px"
          borderColor={cardBorder}
          borderRadius="0 0 2xl 2xl"
          fontFamily={fontCairo}
        >
          <Button as={Link} to="/teacher/subjects" variant="ghost" size="sm" leftIcon={<Icon as={FaArrowRight} />} fontFamily={fontCairo} color={textPrimary}>
            رجوع
          </Button>
          <HStack spacing={2} flexWrap="wrap" justify="center">
            {isAdmin && (
              <>
                <Button size="sm" leftIcon={<Icon as={FaPlus} />} colorScheme="blue" variant="outline" onClick={onOpen} fontFamily={fontCairo}>
                  إضافة أسئلة
                </Button>
                <Button size="sm" leftIcon={<Icon as={FaImage} />} colorScheme="orange" variant="outline" onClick={() => { setQuestionType("image"); onOpen(); }} fontFamily={fontCairo}>
                  سؤال صورة
                </Button>
              </>
            )}
            {(isAdmin || isTeacher) && questions.length > 0 && (
              <Button
                size="sm"
                leftIcon={<Icon as={isSelectionMode ? FaTimes : FaClipboardList} />}
                colorScheme={isSelectionMode ? "gray" : "blue"}
                variant={isSelectionMode ? "solid" : "outline"}
                onClick={toggleSelectionMode}
                fontFamily={fontCairo}
              >
                {isSelectionMode ? "إلغاء التحديد" : "تحديد الأسئلة"}
              </Button>
            )}
            {isTeacher && !isAdmin && (
              <Button size="sm" leftIcon={<Icon as={FaPlus} />} colorScheme="blue" onClick={onOpen} fontFamily={fontCairo} fontWeight="bold">أسئلة جديدة</Button>
            )}
          </HStack>
        </Flex>

        {/* Tabs: الأسئلة العادية | أسئلة القطع */}
        <Tabs variant="soft-rounded" colorScheme="blue" mb={6}>
          <TabList bg={cardBg} p={1} borderRadius="xl" borderWidth="1px" borderColor={cardBorder} boxShadow={cardShadow} fontFamily={fontCairo}>
            <Tab fontWeight="600">الأسئلة العادية</Tab>
            <Tab fontWeight="600">أسئلة القطع</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={{ base: 0, md: 0 }} pt={4}>
              {/* Questions — موبايل: 95% عرض + في المنتصف | ديسكتوب: شبكة */}
              {questions.length > 0 ? (
                <Box
                  w={{ base: "95%", md: "100%" }}
                  maxW={{ base: "95%", md: "none" }}
                  mx="auto"
                  px={{ base: 0, md: 0 }}
                >
                  <Text color={textSecondary} fontSize="sm" fontFamily={fontCairo} mb={4} textAlign={{ base: "center", md: "left" }}>
                    عرض {questions.length} سؤال
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 6 }} justifyContent="center">
                    <AnimatePresence>
                      {questions.map((question, index) => (
                        <MotionBox
                          key={question.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                          position="relative"
                          w="100%"
                        >
                          <Card
                            bg={isSelectionMode && selectedQuestions.includes(question.id) ? selectedCardBg : cardBg}
                            borderRadius="2xl"
                            overflow="hidden"
                            boxShadow={isSelectionMode && selectedQuestions.includes(question.id) ? "lg" : "0 4px 24px rgba(0,0,0,0.06)"}
                            borderWidth={isSelectionMode && selectedQuestions.includes(question.id) ? 2 : 1}
                            borderColor={isSelectionMode && selectedQuestions.includes(question.id) ? "blue.400" : cardBorder}
                            _hover={{ boxShadow: cardShadowHover }}
                            transition="all 0.25s ease"
                            h="100%"
                            display="flex"
                            flexDirection="column"
                            cursor={isSelectionMode ? "pointer" : "default"}
                            onClick={() => isSelectionMode && handleToggleSelectId(question.id)}
                            position="relative"
                            p={{ base: 4, md: 5 }}
                          >
                            {isSelectionMode && (
                              <Box position="absolute" top={3} right={3} zIndex={2} w="26px" h="26px" borderRadius="lg" borderWidth="2px" borderColor={selectedQuestions.includes(question.id) ? "blue.500" : "gray.400"} bg={selectedQuestions.includes(question.id) ? "blue.500" : "transparent"} display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                                {selectedQuestions.includes(question.id) && <Icon as={FaCheck} color="white" boxSize={3.5} />}
                              </Box>
                            )}

                            {/* رأس السؤال — رقم + شارات + أزرار */}
                            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3} mb={4} pb={4} borderBottomWidth="1px" borderColor={borderColor}>
                              <HStack spacing={3} flex={1} minW={0}>
                                <Flex w="12" h="12" borderRadius="2xl" bgGradient="linear(135deg, blue.400, blue.600)" color="white" align="center" justify="center" fontWeight="bold" fontSize="xl" fontFamily={fontCairo} flexShrink={0} boxShadow="md">
                                  {index + 1}
                                </Flex>
                                <VStack align="flex-start" spacing={1}>
                                  <HStack spacing={2} flexWrap="wrap">
                                    {question.status && (
                                      <Badge colorScheme={question.status === "approved" ? "green" : question.status === "rejected" ? "red" : "orange"} variant="subtle" borderRadius="full" fontSize="xs" fontFamily={fontCairo} px={2}>
                                        {getStatusText(question.status)}
                                      </Badge>
                                    )}
                                    <Badge colorScheme={question.difficulty_level === "easy" ? "green" : question.difficulty_level === "hard" ? "red" : "blue"} variant="subtle" borderRadius="full" fontSize="xs" fontFamily={fontCairo} px={2}>
                                      {getDifficultyText(question.difficulty_level)}
                                    </Badge>
                                    <HStack spacing={1} bg="yellow.50" _dark={{ bg: "yellow.900" }} color="yellow.700" px={2} py={0.5} borderRadius="full">
                                      <Text fontSize="xs" fontWeight="700" fontFamily={fontCairo}>{Number(question.points) || 1} نقطة</Text>
                                    </HStack>
                                  </HStack>
                                </VStack>
                              </HStack>
                              {(isAdmin || isTeacher) && (
                                <HStack spacing={0} onClick={(e) => e.stopPropagation()}>
                                  <Tooltip label="تعديل" hasArrow><IconButton icon={<FaEdit />} size="sm" variant="ghost" colorScheme="blue" borderRadius="lg" onClick={(e) => { e.stopPropagation(); setEditingQuestion(question); const opts = question.options ? question.options.map(o => typeof o === "string" ? o : (o.text_content || o.image_url)) : []; setEditFormData({ text: question.question_text || question.text || "", options: opts.length === 4 ? opts : ["", "", "", ""] }); onEditOpen(); }} /></Tooltip>
                                  <Tooltip label="صورة" hasArrow><IconButton icon={<FaImage />} size="sm" variant="ghost" colorScheme="purple" borderRadius="lg" onClick={(e) => { e.stopPropagation(); setCurrentQuestion(question); setImagePreview(question.media?.media_url || question.image); onImageOpen(); }} /></Tooltip>
                                  <Tooltip label="حذف" hasArrow><IconButton icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red" borderRadius="lg" onClick={(e) => { e.stopPropagation(); setDeletingQuestion(question); onDeleteOpen(); }} /></Tooltip>
                                </HStack>
                              )}
                            </Flex>

                            {/* محتوى السؤال */}
                            <Box flex={1} onClick={(e) => e.stopPropagation()}>
                              {question.status === "rejected" && question.rejection_reason && (
                                <Alert status="error" borderRadius="xl" mb={4}>
                                  <AlertIcon />
                                  <Box>
                                    <AlertTitle fontSize="sm">سبب الرفض:</AlertTitle>
                                    <Text fontSize="sm" mt={1}>{question.rejection_reason}</Text>
                                  </Box>
                                </Alert>
                              )}

                              {question.media?.media_url && (
                                <Box mb={4} borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderColor} cursor="pointer" onClick={(e) => { e.stopPropagation(); setZoomImageUri(question.media.media_url); }} position="relative" _hover={{ opacity: 0.95 }}>
                                  <Image src={question.media.media_url} w="100%" maxH={{ base: 220, md: 260 }} objectFit="contain" alt="Question" />
                                  <HStack position="absolute" bottom={2} left={2} bg="blackAlpha.700" color="white" px={3} py={1.5} borderRadius="lg" fontSize="xs" fontFamily={fontCairo} spacing={2}>
                                    <Icon as={FaSearchPlus} />
                                    <Text>تكبير</Text>
                                  </HStack>
                                </Box>
                              )}

                              <Text fontSize={{ base: "lg", md: "md" }} fontWeight="700" color={textPrimary} mb={4} lineHeight="1.8" fontFamily={fontCairo}>
                                {question.question_text || question.text}
                              </Text>

                              <Box>
                                {(isAdmin || isTeacher) && (
                                  <Text fontSize="xs" color={textSecondary} mb={3} fontFamily={fontCairo}>اضغط على الخيار لتعيينه إجابةً صحيحة</Text>
                                )}
                                <VStack align="stretch" spacing={3}>
                                  {question.options && question.options.map((opt, i) => {
                                    const isCorrect = question.correct_answer_index === i;
                                    const content = typeof opt === "string" ? opt : (opt.text_content || opt.image_url);
                                    const isImg = typeof opt !== "string" && opt.option_type === "image";
                                    const isUpdating = correctAnswerUpdatingId === question.id;
                                    const canSelect = (isAdmin || isTeacher) && !isCorrect && !isUpdating;
                                    const selectedAnswer = selectedAnswers[question.id];
                                    const isSelected = selectedAnswer === i;
                                    const showCorrect = isCorrect;
                                    const showWrong = isSelected && !isCorrect;
                                    let optBg = optionBg;
                                    let optBorder = "transparent";
                                    let optBorderW = 1;
                                    if (showCorrect) { optBg = optionCorrectBg; optBorder = optionCorrectBorder; optBorderW = 2; }
                                    if (showWrong) { optBg = optionWrongBg; optBorder = "red.400"; optBorderW = 2; }
                                    if (isSelected && !showCorrect && !showWrong) { optBg = optionHoverBg; optBorder = "blue.400"; optBorderW = 2; }
                                    return (
                                      <Tooltip key={i} label={canSelect ? "تحديد كإجابة صحيحة" : (isCorrect ? "الإجابة الصحيحة" : "")} hasArrow>
                                        <HStack
                                          p={{ base: 4, md: 3 }}
                                          bg={optBg}
                                          borderRadius="xl"
                                          borderWidth={optBorderW}
                                          borderColor={optBorder}
                                          justify="space-between"
                                          cursor={canSelect ? "pointer" : (isSelectionMode ? "default" : "pointer")}
                                          _hover={canSelect ? { bg: optionHoverBg, borderColor: "blue.200" } : {}}
                                          transition="all 0.2s"
                                          minH={{ base: "52px", md: "auto" }}
                                          onClick={() => {
                                            if (isSelectionMode) return;
                                            if (canSelect) handleUpdateCorrectAnswer(question.id, i);
                                            else handleSelectAnswer(question.id, i);
                                          }}
                                        >
                                          <HStack spacing={3} minW={0} flex={1}>
                                            <Flex w="9" h="9" flexShrink={0} borderRadius="full" bg={showCorrect ? "green.500" : showWrong ? "red.500" : optionLetterBgNeutral} color="white" fontSize="sm" fontWeight="bold" align="center" justify="center" fontFamily={fontCairo}>
                                              {String.fromCharCode(65 + i)}
                                            </Flex>
                                            {isImg ? (
                                              <Image src={content} maxH="40px" borderRadius="md" />
                                            ) : (
                                              <Text fontSize={{ base: "sm", md: "sm" }} color={showCorrect ? optionCorrectText : textPrimary} noOfLines={3} fontFamily={fontCairo} lineHeight="1.6">{content}</Text>
                                            )}
                                          </HStack>
                                          {showCorrect && !isUpdating && <Icon as={FaCheck} color="green.500" boxSize={5} flexShrink={0} />}
                                          {showWrong && <Icon as={FaTimes} color="red.500" boxSize={5} flexShrink={0} />}
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

                              {question.explanation && (
                                <Box mt={5} p={4} borderRadius="xl" borderWidth="1.5px" borderColor="blue.200" bg={explanationBg}>
                                  <HStack spacing={2} mb={2}>
                                    <Icon as={FaLightbulb} color="blue.500" boxSize={5} />
                                    <Text fontWeight="700" color="blue.600" fontSize="sm" fontFamily={fontCairo}>التوضيح</Text>
                                  </HStack>
                                  <Text fontSize="sm" color={textPrimary} lineHeight="1.8" fontFamily={fontCairo}>{question.explanation}</Text>
                                </Box>
                              )}
                            </Box>
                          </Card>
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </SimpleGrid>
                </Box>
              ) : (
                <Flex direction="column" align="center" justify="center" minH="420px" bg={cardBg} borderRadius="2xl" borderWidth="2px" borderStyle="dashed" borderColor={cardBorder} textAlign="center" p={10} boxShadow={cardShadow}>
                  <Box w="20" h="20" borderRadius="full" bgGradient="linear(to-b, blue.200, blue.50)" display="flex" alignItems="center" justifyContent="center" mb={5}>
                    <Icon as={FaDatabase} boxSize={10} color="blue.500" />
                  </Box>
                  <Heading size="md" color={textPrimary} mb={2} fontFamily={fontCairo}>لا توجد أسئلة</Heading>
                  <Text color={textSecondary} mb={6} fontFamily={fontCairo}>لم يتم إضافة أي أسئلة لهذا الدرس بعد</Text>
                  {(isAdmin || isTeacher) && (
                    <Button colorScheme="blue" onClick={onOpen} leftIcon={<Icon as={FaPlus} />} fontFamily={fontCairo} fontWeight="bold" size="lg">
                      إضافة سؤال جديد
                    </Button>
                  )}
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
                  {isTeacher && passagesList.length > 0 && (
                    <Flex justify="flex-end" w="full">
                      <Button
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<Icon as={FaClipboardList} />}
                        onClick={handleOpenPassagesToExamModal}
                        isDisabled={selectedPassageIds.length === 0}
                        fontFamily={fontCairo}
                      >
                        إضافة القطع المحددة للامتحان ({selectedPassageIds.length})
                      </Button>
                    </Flex>
                  )}
                  {passagesList.map((item, pIdx) => {
                    const passage = item.passage || {};
                    const qList = item.questions || [];
                    const passageId = passage.id;
                    const isPassageSelected = passageId != null && selectedPassageIds.includes(passageId);
                    return (
                      <Card
                        key={passage.id || pIdx}
                        bg={isPassageSelected ? selectedCardBg : cardBg}
                        borderRadius="2xl"
                        overflow="hidden"
                        boxShadow={cardShadow}
                        borderWidth="2px"
                        borderColor={isPassageSelected ? "blue.400" : cardBorder}
                        fontFamily={fontCairo}
                        cursor={isTeacher ? "pointer" : "default"}
                        onClick={() => isTeacher && passageId != null && handleTogglePassageId(passageId)}
                        _hover={isTeacher ? { boxShadow: cardShadowHover } : undefined}
                      >
                        <CardHeader bg={optionBg} borderBottomWidth="1px" borderColor={borderColor} py={4}>
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <HStack spacing={3}>
                              {isTeacher && passageId != null && (
                                <Checkbox
                                  isChecked={isPassageSelected}
                                  onChange={() => handleTogglePassageId(passageId)}
                                  onClick={(e) => e.stopPropagation()}
                                  size="md"
                                  colorScheme="blue"
                                />
                              )}
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

      {/* FAB — إضافة للامتحان (مثل التطبيق) */}
      {isSelectionMode && selectedQuestions.length > 0 && (
        <Box position="fixed" bottom={6} left={{ base: 4, md: 20 }} right={{ base: 4, md: 20 }} zIndex={100} maxW="400px" mx="auto">
          <Button
            w="full"
            size="lg"
            colorScheme="blue"
            leftIcon={<Icon as={FaClipboardList} />}
            fontFamily={fontCairo}
            fontWeight="bold"
            borderRadius="2xl"
            boxShadow="lg"
            _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            onClick={() => { setExamModalMode("questions"); fetchExams(); onExamOpen(); }}
          >
            إضافة {selectedQuestions.length} سؤال للامتحان
          </Button>
        </Box>
      )}

      {/* --- ADD TO EXAM MODAL (مدرس) — امتحان محاضرة | امتحان شامل، أسئلة أو قطع --- */}
      {isTeacher && (
        <Modal isOpen={isExamOpen} onClose={() => { onExamClose(); setExamModalMode("questions"); }} size="lg" isCentered>
          <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
          <ModalContent borderRadius="2xl" boxShadow={headerShadow} borderWidth="1px" borderColor={cardBorder}>
            <ModalHeader bg="blue.500" color="white" borderRadius="2xl 2xl 0 0" py={5} fontFamily={fontCairo}>
              <HStack spacing={3}>
                <Box p={2} bg="whiteAlpha.200" borderRadius="xl"><Icon as={FaClipboardList} boxSize={5} /></Box>
                <Text fontWeight="bold" fontSize="xl">
                  {examModalMode === "passages" ? "إضافة القطع للامتحان" : "إضافة الأسئلة للامتحان"}
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
            <ModalBody py={4}>
              <Tabs index={examModalTab === "lecture" ? 0 : 1} onChange={(i) => setExamModalTab(i === 0 ? "lecture" : "comprehensive")} variant="soft-rounded" colorScheme="blue" mb={4}>
                <TabList bg="gray.100" p={1} borderRadius="xl">
                  <Tab fontSize="sm" fontWeight="600">امتحان محاضرة</Tab>
                  {examModalMode !== "passages" && <Tab fontSize="sm" fontWeight="600">امتحان شامل</Tab>}
                </TabList>
              </Tabs>
              {examLoading ? (
                <Flex justify="center" p={8}><Spinner color="blue.500" /></Flex>
              ) : examModalTab === "lecture" ? (
                exams.length === 0 ? (
                  <Text textAlign="center" color="gray.500" py={8}>لا توجد امتحانات محاضرة متاحة.</Text>
                ) : (
                  <RadioGroup value={selectedExamId} onChange={setSelectedExamId}>
                    <VStack align="stretch" spacing={3} maxH="360px" overflowY="auto" pr={1}>
                      {exams.map((exam) => (
                        <Box
                          key={exam.id}
                          p={4}
                          bg={selectedExamId === String(exam.id) ? "blue.50" : "gray.50"}
                          borderRadius="xl"
                          borderWidth="2px"
                          borderColor={selectedExamId === String(exam.id) ? "blue.500" : "transparent"}
                          cursor="pointer"
                          onClick={() => setSelectedExamId(String(exam.id))}
                          _hover={{ bg: "blue.50" }}
                        >
                          <Radio value={String(exam.id)} mb={2}>
                            <Text fontWeight="bold" fontSize="md">{exam.title}</Text>
                          </Radio>
                          <HStack fontSize="sm" color="gray.500" spacing={4} pl={6}>
                            {exam.courseTitle && <Text>{exam.courseTitle}</Text>}
                            {exam.lectureTitle && (<><Text>•</Text><Text>{exam.lectureTitle}</Text></>)}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </RadioGroup>
                )
              ) : (
                comprehensiveExams.length === 0 ? (
                  <Text textAlign="center" color="gray.500" py={8}>لا توجد امتحانات شاملة متاحة.</Text>
                ) : (
                  <RadioGroup value={selectedExamId} onChange={setSelectedExamId}>
                    <VStack align="stretch" spacing={3} maxH="360px" overflowY="auto" pr={1}>
                      {comprehensiveExams.map((exam) => (
                        <Box
                          key={exam.id}
                          p={4}
                          bg={selectedExamId === String(exam.id) ? "blue.50" : "gray.50"}
                          borderRadius="xl"
                          borderWidth="2px"
                          borderColor={selectedExamId === String(exam.id) ? "blue.500" : "transparent"}
                          cursor="pointer"
                          onClick={() => setSelectedExamId(String(exam.id))}
                          _hover={{ bg: "blue.50" }}
                        >
                          <Radio value={String(exam.id)} mb={2}>
                            <Text fontWeight="bold" fontSize="md">{exam.title}</Text>
                          </Radio>
                          <HStack fontSize="sm" color="gray.500" spacing={4} pl={6}>
                            <Text>{exam.course_title || exam.courseTitle || ""}</Text>
                            {exam.duration_minutes != null && <Text>• {exam.duration_minutes} د</Text>}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </RadioGroup>
                )
              )}
            </ModalBody>
            <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
              <Button variant="ghost" mr={3} onClick={() => { onExamClose(); setExamModalMode("questions"); }} fontFamily={fontCairo}>إلغاء</Button>
              {examModalMode === "passages" ? (
                <Button colorScheme="blue" onClick={handleAddPassagesToExam} isLoading={addToExamLoading} isDisabled={!selectedExamId} fontFamily={fontCairo} fontWeight="bold">
                  إضافة {selectedPassageIds.length} قطعة
                </Button>
              ) : (
                <Button colorScheme="blue" onClick={handleAddQuestionsToExam} isLoading={addToExamLoading} isDisabled={!selectedExamId} fontFamily={fontCairo} fontWeight="bold">
                  إضافة {selectedQuestions.length} سؤال
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

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
            <Tabs variant="soft-rounded" colorScheme="blue" index={questionType === "text" ? 0 : questionType === "image" ? 1 : questionType === "passage" ? 2 : 3} onChange={(idx) => setQuestionType(idx === 0 ? "text" : idx === 1 ? "image" : idx === 2 ? "passage" : "imageOnlyBulk")}>
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
                          onChange={async (e) => {
                            try {
                              const inputTarget = e.target;
                              let files = Array.from(inputTarget.files || []);

                              // المتصفحات ومرافق النظام لا تحفظ الترتيب الفعلي لـ "نقرات الماوس" عند اختيار الملفات
                              // لذلك أفضل طريقة لضمان الترتيب الصحيح (مثلاً: صورة 1، صورة 2 ... صورة 10)
                              // هو إعادة ترتيبهم حسب الأسماء بشكل رقمي وأبجدي.
                              files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

                              const limited = files.slice(0, 20);

                              setImageOnlyBulkLoading(true); // نظهر التحميل أثناء معالجة الصور

                              // ضغط الصور لحل مشكلة 413 Payload Too Large
                              const compressedFiles = await Promise.all(
                                limited.map(file => compressImage(file, 1024, 0.7))
                              );

                              imageOnlyBulkPreviewUrlsRef.current.forEach(URL.revokeObjectURL);
                              const urls = compressedFiles.map((f) => URL.createObjectURL(f));
                              imageOnlyBulkPreviewUrlsRef.current = urls;
                              setImageOnlyBulkPreviewUrls(urls);
                              setImageOnlyBulkFiles(compressedFiles);
                              setImageOnlyBulkResult(null);

                              inputTarget.value = "";
                            } catch (error) {
                              console.error("Error processing images:", error);
                            } finally {
                              setImageOnlyBulkLoading(false);
                            }
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
                        <FormLabel fontFamily={fontCairo} fontSize="sm" mb={3}>معاينة الصور — يمكنك مراجعة الصور وترتيبها قبل الرفع</FormLabel>
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                          {imageOnlyBulkFiles.map((file, index) => (
                            <Box key={index} position="relative" borderRadius="xl" overflow="hidden" borderWidth="2px" borderColor={borderColor} bg={bulkPreviewBg} boxShadow="sm" transition="all 0.2s" _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}>
                              <Badge position="absolute" top={2} right={2} colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="lg" zIndex={2} boxShadow="sm">سؤال {index + 1}</Badge>
                              <IconButton
                                aria-label="إلغاء الصورة"
                                icon={<Icon as={FaTimes} />}
                                size="sm"
                                colorScheme="red"
                                position="absolute"
                                top={2}
                                left={2}
                                borderRadius="full"
                                onClick={() => removeBulkImageAtIndex(index)}
                                zIndex={2}
                                boxShadow="sm"
                              />
                              <Box position="relative" h="180px" w="full" bg="white">
                                <Image src={imageOnlyBulkPreviewUrls[index]} alt={file.name} objectFit="contain" w="full" h="full" p={2} />
                              </Box>
                              <Box p={2} bg={useColorModeValue("gray.50", "whiteAlpha.100")} borderTopWidth="1px" borderColor={borderColor}>
                                <Text fontSize="xs" noOfLines={1} fontFamily={fontCairo} color={textSecondary} textAlign="center" fontWeight="500">{file.name}</Text>
                              </Box>
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

      {/* 5. Image Zoom Modal — مطابق للتطبيق */}
      <Modal isOpen={!!zoomImageUri} onClose={() => setZoomImageUri(null)} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent" boxShadow="none" maxW="100vw">
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center" minH="100vh">
            <IconButton aria-label="إغلاق" icon={<FaTimes />} position="fixed" top={4} right={4} zIndex={10} colorScheme="blackAlpha" color="white" size="lg" onClick={() => setZoomImageUri(null)} />
            {zoomImageUri && <Image src={zoomImageUri} maxW="100%" maxH="90vh" objectFit="contain" alt="تكبير" onClick={() => setZoomImageUri(null)} cursor="pointer" />}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 6. Add to Exam Success Modal — مطابق للتطبيق */}
      <Modal isOpen={isAddSuccessOpen} onClose={() => { onAddSuccessClose(); setAddSuccessMessage(""); }} size="sm" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="3xl" overflow="hidden" borderWidth="2px" borderColor="blue.200" boxShadow="xl">
          <ModalBody py={8} textAlign="center">
            <Box w="20" h="20" mx="auto" mb={5} borderRadius="full" bgGradient="linear(to-r, blue.500, blue.400)" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FaCheck} color="white" boxSize={12} />
            </Box>
            <Heading size="md" fontFamily={fontCairo} mb={2} color={textPrimary}>تمت الإضافة بنجاح</Heading>
            <Text color={textSecondary} fontFamily={fontCairo} mb={6}>{addSuccessMessage}</Text>
            <Button colorScheme="blue" size="lg" w="full" fontFamily={fontCairo} fontWeight="bold" onClick={() => { onAddSuccessClose(); setAddSuccessMessage(""); }}>
              حسناً
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Lesson;
