import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, VStack, Heading, Text, Spinner, Center, RadioGroup, Radio, Stack,
  Alert, AlertIcon, IconButton, HStack, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Divider, Badge, Tooltip, InputGroup, InputRightElement, Image, useColorModeValue, Flex
} from "@chakra-ui/react";
import { AiFillEdit, AiFillDelete, AiFillCheckCircle, AiOutlineCheckCircle, AiOutlineCloseCircle, AiFillStar } from "react-icons/ai";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import baseUrl from "../../api/baseUrl";
import BrandLoadingScreen from "../../components/loading/BrandLoadingScreen";
import { useParams, useNavigate } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";
import {
  FaBookOpen, FaCheckCircle, FaChevronLeft, FaChevronRight,
  FaUser, FaTimesCircle, FaPhone, FaIdBadge, FaCalendarAlt, FaImage
} from 'react-icons/fa';
import { BiSearch } from "react-icons/bi";
import { MdHelpOutline, MdZoomIn, MdArrowBack } from "react-icons/md";


const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: null });
  const [editForm, setEditForm] = useState({ text: "", choices: [] });
  const [deleteModal, setDeleteModal] = useState({ open: false, qid: null });
  const [deleting, setDeleting] = useState(false);
  const [pendingCorrect, setPendingCorrect] = useState({});
  const [studentAnswers, setStudentAnswers] = useState({}); // { [questionId]: 'A'|'B'|'C'|'D' } مثل التطبيق المرجعي
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const toast = useToast();
  // pagination state for student
  const [current, setCurrent] = useState(0);
  // State لدرجات الطلاب
  const [showGrades, setShowGrades] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesData, setGradesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // للطالب: بدء الامتحان عبر POST /api/exams/:examId/start
  const [examStarted, setExamStarted] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [examMeta, setExamMeta] = useState(null); // { examTitle, durationMinutes, questionsCount, startedAt }
  const [remainingSeconds, setRemainingSeconds] = useState(null); // عد تنازلي من duration*60 (مثل التطبيق المرجعي)
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState(null);
  const [imageUploadQuestionId, setImageUploadQuestionId] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const questionImageInputRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const timerExpiredRef = useRef(false);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    if (isTeacher || isAdmin) {
      fetchQuestions();
      return;
    }
    // طالب أو لم يُحدد النوع بعد: لا نستدعي GET أسئلة (يُرجع 403 للطالب)
    setLoading(false);
    setError(null);
    // eslint-disable-next-line
  }, [examId, isTeacher, isAdmin]);

  // للطالب: بدء الامتحان تلقائياً عند الدخول (مثل التطبيق المرجعي)
  const isStudentView = !isTeacher && !isAdmin && student;
  useEffect(() => {
    if (!isStudentView || !examId || examStarted || startLoading) return;
    handleStartExam();
    // eslint-disable-next-line
  }, [examId, isStudentView]);

  // مؤقت عد تنازلي (بالضبط كالتطبيق المرجعي): يُنقص كل ثانية، وعند الصفر تسليم تلقائي
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (remainingSeconds === null || remainingSeconds <= 0 || submitResult) {
      timerExpiredRef.current = false;
      if (remainingSeconds !== null && remainingSeconds <= 0 && !submitResult && !submitLoading) {
        timerExpiredRef.current = true;
        toast({ title: "انتهى الوقت!", description: "يتم تسليم الامتحان تلقائياً.", status: "warning" });
        handleSubmitExam(true);
      }
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 0) {
          if (prev !== null && prev <= 0 && !timerExpiredRef.current && !submitLoading && !submitResult) {
            timerExpiredRef.current = true;
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            toast({ title: "انتهى الوقت!", description: "يتم تسليم الامتحان تلقائياً.", status: "warning" });
            handleSubmitExam(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [remainingSeconds, submitResult, submitLoading]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await baseUrl.get(
        `/api/course/course-exam/${examId}/questions`,
        authHeaders
      );

      let fetchedQuestions = res.data.questions || [];

      fetchedQuestions = normalizeQuestionsFromApi(fetchedQuestions);
      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  /** تطبيع أسئلة من صيغة API بدء الامتحان: id, type, questionText, questionImage, optionA..D */
  function normalizeQuestionsFromApi(fetchedQuestions) {
    const list = Array.isArray(fetchedQuestions) ? fetchedQuestions : [];
    return list.map((q) => {
      const hasNewFormat =
        q.type != null || q.questionText != null || q.optionA != null || q.optionB != null;
      if (hasNewFormat) {
        const options = [
          [1, q.optionA],
          [2, q.optionB],
          [3, q.optionC],
          [4, q.optionD]
        ].map(([id, text]) => ({
          id,
          text: text != null && String(text).trim() !== "" ? String(text).trim() : "—",
          is_correct: false
        }));
        return {
          id: q.id,
          text: q.questionText != null ? String(q.questionText) : "",
          image: q.questionImage ?? null,
          grade: q.grade ?? 1,
          choices: options
        };
      }
      return q;
    });
  }

  // للطالب: بدء الامتحان POST /api/exams/:examId/start (كالتطبيق المرجعي: تعيين المؤقت وتهيئة الإجابات)
  const handleStartExam = async () => {
    setStartLoading(true);
    setError(null);
    try {
      const res = await baseUrl.post(
        `/api/exams/${examId}/start`,
        {},
        authHeaders
      );
      const data = res.data || {};
      setAttemptId(data.attemptId ?? null);
      setExamMeta({
        examTitle: data.examTitle ?? "",
        durationMinutes: data.durationMinutes ?? 0,
        questionsCount: data.questionsCount ?? 0,
        startedAt: data.startedAt ?? new Date().toISOString()
      });
      const rawQuestions = data.questions ?? [];
      setQuestions(normalizeQuestionsFromApi(rawQuestions));
      setExamStarted(true);
      setCurrent(0);
      setStudentAnswers({});
      // مؤقت عد تنازلي من المدة بالدقائق (مثل التطبيق المرجعي)
      if (data.durationMinutes != null && data.durationMinutes > 0) {
        setRemainingSeconds(data.durationMinutes * 60);
      } else {
        setRemainingSeconds(null);
      }
      toast({ title: "تم بدء الامتحان", status: "success" });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "حدث خطأ أثناء بدء الامتحان";
      setError(msg);
      toast({ title: msg, status: "error" });
    } finally {
      setStartLoading(false);
    }
  };

  // جلب الدرجات
  const fetchGrades = async () => {
    setGradesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(`/api/course/course-exam/${examId}/submissions`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setGradesData(res.data.submissions || []);
    } catch {
      toast({ title: "فشل جلب الدرجات", status: "error" });
    } finally {
      setGradesLoading(false);
    }
  };

  // حذف سؤال
  const handleDelete = async () => {
    if (!deleteModal.qid) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/course/course-exam/question/${deleteModal.qid}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setQuestions((prev) => prev.filter((q) => q.id !== deleteModal.qid));
      toast({ title: "تم حذف السؤال", status: "success" });
      setDeleteModal({ open: false, qid: null });
    } catch {
      toast({ title: "فشل الحذف", status: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // فتح مودال التعديل
  const openEditModal = (q) => {
    setEditForm({
      text: q.text,
      choices: q.choices.map((c) => ({ ...c })),
    });
    setEditModal({ open: true, question: q });
  };

  // حفظ التعديل
  const handleEditSave = async () => {
    const { question } = editModal;
    try {
      const token = localStorage.getItem("token");
      await baseUrl.put(
        `/api/course/course-exam/question/${question.id}`,
        { text: editForm.text, choices: editForm.choices.map((c) => ({ id: c.id, text: c.text })) },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setQuestions((prev) => prev.map((q) =>
        q.id === question.id
          ? { ...q, text: editForm.text, choices: editForm.choices.map((c) => ({ ...c })) }
          : q
      ));
      toast({ title: "تم التعديل بنجاح", status: "success" });
      setEditModal({ open: false, question: null });
    } catch {
      toast({ title: "فشل التعديل", status: "error" });
    }
  };

  // تعيين الإجابة الصحيحة
  const handleSetCorrect = async (qid, cid) => {
    setPendingCorrect((prev) => ({ ...prev, [qid]: cid }));
    setQuestions((prev) => prev.map((q) =>
      q.id === qid
        ? { ...q, choices: q.choices.map((c) => ({ ...c, is_correct: c.id === cid })) }
        : q
    ));
    try {
      const token = localStorage.getItem("token");
      await baseUrl.patch(
        `/api/course/course-exam/question/${qid}/correct-answer`,
        { correct_choice_id: cid },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      toast({ title: "تم تحديد الإجابة الصحيحة", status: "success" });
      setPendingCorrect((prev) => {
        const copy = { ...prev };
        delete copy[qid];
        return copy;
      });
    } catch {
      toast({ title: "فشل تحديد الإجابة", status: "error" });
      setQuestions((prev) => prev.map((q) =>
        q.id === qid
          ? { ...q, choices: q.choices.map((c) => ({ ...c, is_correct: false })) }
          : q
      ));
      setPendingCorrect((prev) => {
        const copy = { ...prev };
        delete copy[qid];
        return copy;
      });
    }
  };

  // إضافة/تحديث صورة لسؤال — PATCH /api/course/course-exam/question/:questionId/image
  const triggerQuestionImageInput = (q) => {
    setImageUploadQuestionId(q.id);
    questionImageInputRef.current?.click();
  };

  const handleQuestionImageUpload = async (e) => {
    const file = e.target?.files?.[0];
    const qid = imageUploadQuestionId;
    e.target.value = "";
    if (!file || !qid) {
      setImageUploadQuestionId(null);
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "صيغة غير مدعومة", description: "المدعوم: jpeg, jpg, png, gif, webp", status: "warning" });
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: "الملف كبير", description: "الحد الأقصى 10 ميجابايت", status: "warning" });
      return;
    }

    setImageUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("questionImage", file);
      const res = await baseUrl.patch(
        `/api/course/course-exam/question/${qid}/image`,
        formData,
        authHeaders
      );
      const newImage = res.data?.questionImage ?? res.data?.question?.question_image ?? res.data?.question?.questionImage;
      if (newImage) {
        setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, image: newImage } : q)));
      }
      toast({ title: res.data?.message || "تمت إضافة صورة السؤال بنجاح", status: "success" });
    } catch (err) {
      toast({
        title: "فشل رفع الصورة",
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
      });
    } finally {
      setImageUploadLoading(false);
      setImageUploadQuestionId(null);
    }
  };

  // للطالب: عند اختيار إجابة بحرف (A/B/C/D) - مثل التطبيق المرجعي
  const handleStudentChoice = (questionId, selectedAnswer) => {
    if (submitResult) return;
    setStudentAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }));
  };

  // للطالب: الانتقال لسؤال (كالتطبيق المرجعي - لا تنقل بعد التسليم)
  const goToQuestion = (index) => {
    if (submitResult) return;
    if (index < 0 || index >= questions.length) return;
    setCurrent(index);
  };

  // للطالب: تسليم الامتحان — نفس الطريقة في التطبيق المرجعي (نفس الـ endpoint ونفس صيغة الإجابات)
  const handleSubmitExam = useCallback(async (autoSubmit = false) => {
    if (!examId || !attemptId) {
      toast({ title: "خطأ", description: "لا توجد محاولة نشطة لتسليمها", status: "error" });
      return;
    }
    if (submitLoading || submitResult) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "يجب تسجيل الدخول لتسليم الامتحان", status: "error" });
      return;
    }

    setSubmitLoading(true);
    timerExpiredRef.current = autoSubmit;

    try {
      const answersArr = Object.entries(studentAnswers).map(([questionId, selectedAnswer]) => ({
        questionId: Number(questionId),
        selectedAnswer,
      }));

      const res = await baseUrl.post(
        `/api/exams/${examId}/submit`,
        { attemptId, answers: answersArr },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data;
      setSubmitResult(result);
      setRemainingSeconds(null);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (!autoSubmit) {
        toast({
          title: "تم تسليم الامتحان!",
          description: `الدرجة: ${result.totalGrade}/${result.maxGrade}`,
          status: "success",
        });
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
      const errorMessage = err?.response?.data?.message || "حدث خطأ غير متوقع";
      if (!autoSubmit) {
        toast({ title: "فشل تسليم الامتحان", description: errorMessage, status: "error" });
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [examId, attemptId, studentAnswers, submitLoading, submitResult]);

  // للطالب: أثناء التحميل أو قبل بدء الامتحان نعرض التحميل أو الخطأ (بدء تلقائي)
  if (isStudentView && !examStarted) {
    if (error) {
      return (
        <Box maxW="2xl" mx="auto" py={10} px={4} className="mt-[80px]">
          <VStack spacing={6}>
            <Alert status="error" borderRadius="md" w="full">
              <AlertIcon />
              {error}
            </Alert>
            <Button leftIcon={<MdArrowBack />} onClick={() => navigate(-1)}>العودة</Button>
          </VStack>
        </Box>
      );
    }
    return <BrandLoadingScreen />;
  }

  if (loading) {
    return <BrandLoadingScreen />;
  }

  if (error && !isStudentView) {
    return (
      <Center minH="60vh">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  const formatRemainingTime = (value) => {
    if (value == null) return "--:--";
    const s = Math.max(0, value);
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const teacherCardBg = useColorModeValue("white", "gray.800");
  const teacherCardBorder = useColorModeValue("gray.200", "gray.600");
  const teacherHeadingColor = useColorModeValue("blue.700", "blue.200");
  const teacherAccent = useColorModeValue("blue.500", "blue.400");

  return (
    <Box
      maxW={isTeacher || isAdmin ? "4xl" : "2xl"}
      mx="auto"
      py={{ base: 6, md: 10 }}
      px={{ base: 3, sm: 4, md: 6 }}
      className="mt-[80px]"
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      {/* هيدر الطالب: زر رجوع + عنوان + مؤقت (مثل التطبيق المرجعي) */}
      {isStudentView && (
        <HStack
          mb={4}
          p={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          shadow="sm"
          spacing={3}
          align="center"
        >
          <IconButton
            aria-label="العودة"
            icon={<MdArrowBack />}
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          />
          <VStack align="stretch" flex={1} spacing={0}>
            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
              {examMeta?.examTitle || "الامتحان الشامل"}
            </Text>
            {remainingSeconds !== null && (
              <Text fontSize="sm" fontWeight="600" color="blue.600">
                {formatRemainingTime(remainingSeconds)}
              </Text>
            )}
          </VStack>
        </HStack>
      )}
      {/* هيدر المدرس: عنوان + إحصائيات + زر التبديل */}
      {!isStudentView && (isTeacher || isAdmin) && (
        <Box
          mb={{ base: 6, md: 8 }}
          p={{ base: 4, md: 5 }}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={teacherCardBorder}
          bg={teacherCardBg}
          shadow="sm"
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
            justify="space-between"
            gap={4}
          >
            <VStack align={{ base: "center", sm: "flex-start" }} spacing={1}>
              <Heading size={{ base: "md", md: "lg" }} color={teacherHeadingColor} display="flex" alignItems="center" gap={2}>
                <FaBookOpen />
                أسئلة الامتحان الشامل
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {questions.length} سؤال
              </Text>
            </VStack>
            {isTeacher && (
              <Button
                colorScheme={showGrades ? "gray" : "blue"}
                size={{ base: "sm", md: "md" }}
                leftIcon={<FaUser />}
                onClick={() => {
                  if (!showGrades && gradesData.length === 0) fetchGrades();
                  setShowGrades((prev) => !prev);
                }}
                borderRadius="xl"
                fontWeight="600"
              >
                {showGrades ? "عرض الأسئلة" : "عرض درجات الطلاب"}
              </Button>
            )}
          </Flex>
        </Box>
      )}
      {/* عرض درجات الطلاب للمدرس — يتوافق مع الـ API: submission_id, obtained_grade, total_grade, attempt_number */}
      {showGrades && isTeacher ? (
        <Box w="full" maxW="4xl" mx="auto" px={{ base: 2, sm: 4 }}>
          <Heading mb={{ base: 4, md: 6 }} textAlign="center" color="blue.600" fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}>
            درجات الطلاب في الامتحان
          </Heading>
          <Box w="full" maxW={{ base: "100%", sm: "400px" }} mx="auto" mb={{ base: 4, md: 6 }}>
            <InputGroup size="lg">
              <Input
                placeholder="ابحث بالاسم، رقم الطالب، رقم التسليم أو المحاولة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                borderRadius="full"
                bg="gray.50"
                borderColor="gray.200"
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                fontSize={{ base: "sm", md: "md" }}
              />
              <InputRightElement pointerEvents="none" height="100%">
                <BiSearch color="gray.400" boxSize={5} />
              </InputRightElement>
            </InputGroup>
          </Box>
          {gradesLoading ? (
            <Center py={12}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : gradesData.length === 0 ? (
            <Center py={12}>
              <Text fontSize="lg" color="gray.600" fontWeight="medium">
                لا توجد درجات بعد
              </Text>
            </Center>
          ) : (
            (() => {
              const filtered = gradesData.filter(s => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                return (
                  (s.name && s.name.toLowerCase().includes(term)) ||
                  (s.student_id != null && String(s.student_id).includes(term)) ||
                  (s.submission_id != null && String(s.submission_id).includes(term)) ||
                  (s.attempt_number != null && String(s.attempt_number).includes(term)) ||
                  (s.email && s.email.toLowerCase().includes(term)) ||
                  (s.phone && s.phone.includes(term))
                );
              });
              const percentage = (s) => (s.total_grade > 0 ? Math.round((s.obtained_grade / s.total_grade) * 100) : 0);
              return (
                <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                  {filtered.length === 0 ? (
                    <Center py={8}>
                      <Text color="gray.500" fontSize="md">لا توجد نتائج مطابقة للبحث</Text>
                    </Center>
                  ) : (
                    filtered.map((s) => (
                      <Box
                        key={s.submission_id}
                        p={{ base: 4, sm: 5, md: 6 }}
                        borderRadius="2xl"
                        boxShadow="md"
                        bg="white"
                        borderWidth="2px"
                        borderColor={s.passed ? "blue.200" : "orange.200"}
                        bgGradient={s.passed ? "linear(to-br, blue.50, white)" : "linear(to-br, orange.50, white)"}
                        transition="all 0.2s"
                        _hover={{ boxShadow: "lg", borderColor: s.passed ? "blue.400" : "orange.400" }}
                      >
                        <HStack
                          spacing={{ base: 3, sm: 4, md: 6 }}
                          align={{ base: "flex-start", sm: "center" }}
                          flexWrap="wrap"
                          justify="space-between"
                        >
                          <HStack spacing={{ base: 3, md: 4 }} align="center" flex={1} minW="0">
                            <Box
                              bg={s.passed ? "blue.500" : "orange.500"}
                              color="white"
                              w={{ base: "48px", sm: "56px", md: "60px" }}
                              h={{ base: "48px", sm: "56px", md: "60px" }}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="full"
                              fontSize={{ base: "xl", md: "2xl" }}
                              fontWeight="bold"
                              flexShrink={0}
                            >
                              {s.name && s.name.trim().length > 0 ? s.name.trim()[0] : <FaUser />}
                            </Box>
                            <VStack align="stretch" spacing={1} flex={1} minW="0">
                              <Text fontWeight="bold" fontSize={{ base: "md", sm: "lg", md: "xl" }} color="gray.800" noOfLines={1}>
                                {s.name || "—"}
                              </Text>
                              <HStack spacing={2} flexWrap="wrap">
                                <Badge colorScheme="gray" fontSize="xs" px={2} py={0.5} borderRadius="md">
                                  <FaIdBadge style={{ marginLeft: 4, display: "inline" }} /> {s.student_id}
                                </Badge>
                                <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5} borderRadius="md">
                                  محاولة {s.attempt_number ?? "—"}
                                </Badge>
                                {s.phone && (
                                  <Badge colorScheme="gray" variant="outline" fontSize="xs" px={2} py={0.5} borderRadius="md">
                                    <FaPhone style={{ marginLeft: 4, display: "inline" }} /> {s.phone}
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="xs" color="gray.500">
                                <FaCalendarAlt style={{ marginLeft: 4, display: "inline" }} />
                                {s.submitted_at ? new Date(s.submitted_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) : "—"}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack spacing={{ base: 3, md: 5 }} align="center" flexShrink={0}>
                            <Box textAlign="center">
                              <CircularProgress
                                value={Math.min(100, percentage(s))}
                                size={{ base: "64px", sm: "72px", md: "80px" }}
                                color={s.passed ? "blue.500" : "orange.500"}
                                thickness="10px"
                                trackColor="gray.100"
                                capIsRound
                              >
                                <CircularProgressLabel fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color="gray.800">
                                  {s.obtained_grade != null ? s.obtained_grade : "—"} / {s.total_grade != null ? s.total_grade : "—"}
                                </CircularProgressLabel>
                              </CircularProgress>
                              <Text fontSize="xs" color="gray.500" mt={1}>الدرجة</Text>
                            </Box>
                            <Badge
                              bg={s.passed ? "blue.500" : "orange.500"}
                              color="white"
                              fontSize={{ base: "sm", md: "md" }}
                              px={3}
                              py={1.5}
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              gap={2}
                            >
                              {s.passed ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} />}
                              {s.passed ? "ناجح" : "راسب"}
                            </Badge>
                          </HStack>
                        </HStack>
                      </Box>
                    ))
                  )}
                </VStack>
              );
            })()
          )}
        </Box>
      ) : (
        <>
          {/* للطالب: عرض سؤال واحد مع pagination */}
          {!isTeacher && !isAdmin && student ? (
            <>
              {/* عرض النتيجة إذا تم التسليم (بنفس تصميم التطبيق المرجعي) */}
              {submitResult ? (
                <Box
                  p={6}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  bg="white"
                  boxShadow="lg"
                >
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={3}>
                      <FaCheckCircle size={48} color="#10B981" />
                      <Heading size="lg" color="gray.800">تم تسليم الامتحان</Heading>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                        {submitResult.totalGrade}
                      </Text>
                      <Text fontSize="lg" color="gray.600">من {submitResult.maxGrade}</Text>
                    </VStack>
                    <HStack spacing={4} justify="center" w="full">
                      <Box flex={1} p={4} borderRadius="xl" bg="green.50" borderWidth="1px" borderColor="green.200" textAlign="center">
                        <FaCheckCircle size={24} color="#10B981" style={{ margin: "0 auto 8px" }} />
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                          {submitResult.correctCount ?? (questions.length - (submitResult.wrongQuestions?.length ?? 0))}
                        </Text>
                        <Text fontSize="sm" color="gray.600">صحيح</Text>
                      </Box>
                      <Box flex={1} p={4} borderRadius="xl" bg="red.50" borderWidth="1px" borderColor="red.200" textAlign="center">
                        <FaTimesCircle size={24} color="#DC2626" style={{ margin: "0 auto 8px" }} />
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                          {submitResult.wrongCount ?? (submitResult.wrongQuestions?.length ?? 0)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">خاطئ</Text>
                      </Box>
                    </HStack>
                    {submitResult.wrongQuestions && submitResult.wrongQuestions.length > 0 && (
                      <VStack align="stretch" spacing={4}>
                        <Text fontWeight="600" fontSize="lg" color="gray.800">
                          الأسئلة الخاطئة ({submitResult.wrongQuestions.length})
                        </Text>
                        {submitResult.wrongQuestions.map((wq, idx) => {
                          const getAnswerText = (answer) => {
                            if (!answer) return "—";
                            if (answer === "A") return wq.optionA ?? "—";
                            if (answer === "B") return wq.optionB ?? "—";
                            if (answer === "C") return wq.optionC ?? "—";
                            if (answer === "D") return wq.optionD ?? "—";
                            return "—";
                          };
                          const yourText = wq.yourAnswer != null ? getAnswerText(wq.yourAnswer) : (wq.yourChoice?.text || "لم تجب");
                          const correctText = wq.correctAnswer != null ? getAnswerText(wq.correctAnswer) : (wq.correctChoice?.text || "—");
                          return (
                            <Box
                              key={wq.questionId}
                              p={4}
                              borderRadius="xl"
                              borderWidth="1px"
                              borderColor="gray.200"
                              bg="gray.50"
                            >
                              <Text fontWeight="600" color="gray.800" mb={2}>سؤال {idx + 1}</Text>
                              {wq.questionText && (
                                <Text fontSize="md" color="gray.700" mb={3}>{wq.questionText}</Text>
                              )}
                              {wq.questionImage && (
                                <Box mb={3} cursor="pointer" onClick={() => { setImageModalSrc(wq.questionImage); setImageModalOpen(true); }}>
                                  <Image src={wq.questionImage} alt="السؤال" maxH="200px" borderRadius="md" objectFit="contain" />
                                </Box>
                              )}
                              <VStack align="stretch" spacing={2}>
                                <HStack spacing={2}>
                                  <AiOutlineCloseCircle color="#DC2626" size={16} />
                                  <Text fontSize="sm" color="red.600">إجابتك: {wq.yourAnswer ? `${wq.yourAnswer} (${yourText})` : yourText}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <AiOutlineCheckCircle color="#16A34A" size={16} />
                                  <Text fontSize="sm" color="green.600">الصحيحة: {wq.correctAnswer ? `${wq.correctAnswer} (${correctText})` : correctText}</Text>
                                </HStack>
                              </VStack>
                            </Box>
                          );
                        })}
                      </VStack>
                    )}
                    <Button colorScheme="blue" w="full" size="lg" leftIcon={<MdArrowBack />} onClick={() => navigate(-1)}>
                      العودة للكورس
                    </Button>
                  </VStack>
                </Box>
              ) : (
                <>
                  {/* بطاقة التقدم (مثل التطبيق المرجعي) */}
                  {questions.length > 0 && (
                    <Box p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.200" bg="white" mb={4}>
                      <HStack justify="space-between" mb={3}>
                        <Text fontSize="sm" color="gray.700">
                          السؤال {current + 1} من {questions.length}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          تم الإجابة على {Object.keys(studentAnswers).length} من {questions.length}
                        </Text>
                      </HStack>
                      <Box w="full" h="2" bg="gray.200" borderRadius="full" overflow="hidden">
                        <Box
                          h="full"
                          bg="blue.500"
                          borderRadius="full"
                          w={`${questions.length ? (Object.keys(studentAnswers).length / questions.length) * 100 : 0}%`}
                          transition="width 0.3s"
                        />
                      </Box>
                    </Box>
                  )}

                  {/* بطاقة السؤال الحالي */}
                  {questions.length > 0 && (
                    <Box
                      key={questions[current].id}
                      p={5}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="gray.200"
                      bg="white"
                      boxShadow="md"
                      mb={4}
                    >
                      <HStack align="flex-start" spacing={3} mb={4}>
                        <Box bg="blue.500" color="white" w="36px" h="36px" borderRadius="full" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" fontSize="md">
                          {current + 1}
                        </Box>
                        <VStack align="stretch" flex={1} spacing={1}>
                          <HStack spacing={2}>
                            <MdHelpOutline size={24} color="#3182CE" />
                            <Text fontWeight="600" fontSize="lg" color="gray.800">
                              {questions[current].text || `سؤال ${current + 1}`}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      {questions[current].image && (
                        <Box
                          mb={4}
                          position="relative"
                          borderRadius="xl"
                          overflow="hidden"
                          cursor="pointer"
                          onClick={() => { setImageModalSrc(questions[current].image); setImageModalOpen(true); }}
                        >
                          <Image
                            src={questions[current].image}
                            alt="صورة السؤال"
                            maxH="300px"
                            objectFit="contain"
                            borderRadius="md"
                          />
                          <HStack
                            position="absolute"
                            bottom={3}
                            right={3}
                            bg="blackAlpha.600"
                            color="white"
                            px={3}
                            py={1.5}
                            borderRadius="md"
                            spacing={2}
                          >
                            <MdZoomIn size={20} />
                            <Text fontSize="sm">اضغط للتكبير</Text>
                          </HStack>
                        </Box>
                      )}
                      {questions[current].choices && questions[current].choices.length > 0 ? (
                        <VStack align="stretch" spacing={3}>
                          {["A", "B", "C", "D"].slice(0, questions[current].choices.length).map((letter, cidx) => {
                            const choice = questions[current].choices[cidx];
                            const isSelected = studentAnswers[questions[current].id] === letter;
                            return (
                              <Box
                                key={choice.id}
                                as="label"
                                p={4}
                                borderRadius="xl"
                                borderWidth="2px"
                                borderColor={isSelected ? "blue.500" : "gray.200"}
                                bg={isSelected ? "blue.50" : "white"}
                                cursor="pointer"
                                display="flex"
                                alignItems="center"
                                gap={3}
                              >
                                <Radio
                                  value={letter}
                                  isChecked={isSelected}
                                  onChange={() => handleStudentChoice(questions[current].id, letter)}
                                  colorScheme="blue"
                                />
                                <Text fontWeight="500" fontSize="md" color={isSelected ? "blue.800" : "gray.700"}>
                                  {letter}. {choice.text}
                                </Text>
                              </Box>
                            );
                          })}
                        </VStack>
                      ) : (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          لا توجد اختيارات متاحة لهذا السؤال.
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* أزرار التنقل والتسليم (السابق | تسليم | التالي) */}
                  {questions.length > 0 && (
                    <HStack spacing={3} w="full" flexWrap="wrap">
                      <Button
                        flex={1}
                        minW="100px"
                        variant="outline"
                        borderColor="gray.300"
                        leftIcon={<FaChevronRight />}
                        onClick={() => goToQuestion(current - 1)}
                        isDisabled={current === 0}
                      >
                        السابق
                      </Button>
                      {Object.keys(studentAnswers).length === questions.length ? (
                        <Button
                          flex={1}
                          minW="140px"
                          colorScheme="green"
                          leftIcon={<FaCheckCircle />}
                          isLoading={submitLoading}
                          onClick={handleSubmitExam}
                        >
                          تسليم الامتحان
                        </Button>
                      ) : (
                        <Box flex={1} minW="140px" />
                      )}
                      <Button
                        flex={1}
                        minW="100px"
                        variant="outline"
                        borderColor="gray.300"
                        rightIcon={<FaChevronLeft />}
                        onClick={() => goToQuestion(current + 1)}
                        isDisabled={current === questions.length - 1}
                      >
                        {current === questions.length - 1 ? "آخر سؤال" : "التالي"}
                      </Button>
                    </HStack>
                  )}
                </>
              )}
            </>
          ) : (
            // للمدرس: عرض جميع الأسئلة
            <>
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                ref={questionImageInputRef}
                onChange={handleQuestionImageUpload}
                hidden
                id="question-image-upload"
              />
              {questions.length === 0 ? (
                <Center py={16} px={4}>
                  <VStack spacing={4}>
                    <Box p={4} borderRadius="full" bg="blue.50" color="blue.500">
                      <FaBookOpen size={48} />
                    </Box>
                    <Text fontSize="lg" fontWeight="600" color="gray.600">
                      لا توجد أسئلة بعد
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      أضف أسئلة من صفحة تفاصيل الكورس (تبويب الامتحانات)
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <VStack spacing={6} align="stretch">
                  {questions.map((q, idx) => (
                    <Box
                      key={q.id}
                      p={{ base: 4, md: 6 }}
                      borderRadius="2xl"
                      shadow="md"
                      bg={teacherCardBg}
                      borderWidth="1px"
                      borderColor={teacherCardBorder}
                      position="relative"
                      overflow="hidden"
                      _hover={{ shadow: "lg", borderColor: teacherAccent }}
                      transition="all 0.2s"
                    >
                      <Box h="1" w="full" bg={teacherAccent} position="absolute" top={0} left={0} right={0} />
                      <Flex
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "stretch", sm: "center" }}
                        gap={3}
                        mb={4}
                        pt={2}
                      >
                        <HStack spacing={3} align="center" flex={1} minW={0}>
                          <Box
                            bg={teacherAccent}
                            color="white"
                            w={{ base: "36px", md: "40px" }}
                            h={{ base: "36px", md: "40px" }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            fontWeight="bold"
                            fontSize="lg"
                            flexShrink={0}
                          >
                            {idx + 1}
                          </Box>
                          <Text fontWeight="600" fontSize={{ base: "md", md: "lg" }} color={teacherHeadingColor} noOfLines={2}>
                            {q.text || `سؤال ${idx + 1}`}
                          </Text>
                        </HStack>
                        <HStack spacing={1} flexShrink={0}>
                          <Badge colorScheme="purple" fontSize="sm" px={3} py={1.5} borderRadius="lg">
                            درجة {q.grade ?? 0}
                          </Badge>
                          <Tooltip label="إضافة أو تحديث صورة السؤال" placement="top" hasArrow>
                            <IconButton
                              icon={<FaImage />}
                              colorScheme="blue"
                              variant="ghost"
                              size="sm"
                              aria-label="صورة السؤال"
                              onClick={() => triggerQuestionImageInput(q)}
                              isLoading={imageUploadLoading && imageUploadQuestionId === q.id}
                            />
                          </Tooltip>
                          <IconButton
                            icon={<AiFillEdit />}
                            colorScheme="yellow"
                            variant="ghost"
                            size="sm"
                            aria-label="تعديل"
                            onClick={() => openEditModal(q)}
                          />
                          <IconButton
                            icon={<AiFillDelete />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            aria-label="حذف"
                            onClick={() => setDeleteModal({ open: true, qid: q.id })}
                          />
                        </HStack>
                      </Flex>
                      {q.image && (
                        <Box
                          mb={4}
                          borderRadius="xl"
                          overflow="hidden"
                          borderWidth="1px"
                          borderColor={teacherCardBorder}
                          bg="gray.50"
                          p={2}
                          cursor="pointer"
                          onClick={() => { setImageModalSrc(q.image); setImageModalOpen(true); }}
                          _hover={{ borderColor: teacherAccent }}
                          transition="border-color 0.2s"
                        >
                          <Image
                            src={q.image}
                            alt="صورة السؤال"
                            maxH="280px"
                            objectFit="contain"
                            borderRadius="md"
                            mx="auto"
                          />
                          <HStack justify="center" mt={2} spacing={2} color="gray.500" fontSize="xs">
                            <MdZoomIn size={14} />
                            <Text>اضغط للتكبير</Text>
                          </HStack>
                        </Box>
                      )}
                      {q.choices && q.choices.length > 0 ? (
                        <RadioGroup>
                          <Stack direction="column" spacing={3}>
                            {q.choices.map((choice, cidx) => (
                              <Tooltip key={choice.id} label={choice.is_correct ? "الإجابة الصحيحة" : "انقر لتعيين كإجابة صحيحة"} placement="left" hasArrow>
                                <Box
                                  as="label"
                                  p={{ base: 3, md: 4 }}
                                  borderRadius="xl"
                                  borderWidth="2px"
                                  borderColor={choice.is_correct ? "green.400" : teacherCardBorder}
                                  bg={choice.is_correct ? "green.50" : teacherCardBg}
                                  color={choice.is_correct ? "green.800" : "gray.700"}
                                  display="flex"
                                  alignItems="center"
                                  transition="all 0.2s"
                                  cursor="pointer"
                                  onClick={() => handleSetCorrect(q.id, choice.id)}
                                  _hover={{ borderColor: choice.is_correct ? "green.500" : teacherAccent }}
                                >
                                  <Radio
                                    value={String(choice.id)}
                                    colorScheme="green"
                                    isChecked={choice.is_correct}
                                    isReadOnly
                                    mr={3}
                                  />
                                  <Text fontWeight="500" fontSize="md" flex={1}>
                                    {String.fromCharCode(65 + cidx)}. {choice.text}
                                  </Text>
                                  {choice.is_correct && <FaCheckCircle color="var(--chakra-colors-green-500)" size={20} style={{ marginRight: 8 }} />}
                                </Box>
                              </Tooltip>
                            ))}
                          </Stack>
                        </RadioGroup>
                      ) : (
                        <Alert status="info" borderRadius="xl" mt={2}>
                          <AlertIcon />
                          لا توجد اختيارات متاحة لهذا السؤال.
                        </Alert>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, question: null })} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader color={teacherHeadingColor} borderBottomWidth="1px" pb={4}>تعديل السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2} fontWeight="600" fontSize="sm" color="gray.600">نص السؤال</Text>
                <Input
                  value={editForm.text}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="نص السؤال..."
                  borderRadius="lg"
                  size="md"
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="600" fontSize="sm" color="gray.600">الاختيارات</Text>
                <VStack spacing={3}>
                  {editForm.choices.map((choice, idx) => (
                    <Input
                      key={choice.id}
                      value={choice.text}
                      onChange={(e) => setEditForm((prev) => {
                        const choices = [...prev.choices];
                        choices[idx].text = e.target.value;
                        return { ...prev, choices };
                      })}
                      placeholder={`اختيار ${String.fromCharCode(65 + idx)}`}
                      borderRadius="lg"
                      size="md"
                    />
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" pt={4} gap={2}>
            <Button colorScheme="blue" onClick={handleEditSave} borderRadius="lg">
              حفظ التعديل
            </Button>
            <Button variant="ghost" onClick={() => setEditModal({ open: false, question: null })}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, qid: null })} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader color="red.600" borderBottomWidth="1px" pb={4}>تأكيد الحذف</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Text color="gray.600">
              هل أنت متأكد أنك تريد حذف هذا السؤال؟ لا يمكن التراجع عن هذه العملية.
            </Text>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" pt={4} gap={2}>
            <Button colorScheme="red" onClick={handleDelete} isLoading={deleting} borderRadius="lg">
              تأكيد الحذف
            </Button>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, qid: null })}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* مودال تكبير صورة السؤال */}
      <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" maxW="100vw">
          <ModalBody display="flex" alignItems="center" justifyContent="center" p={4}>
            <IconButton
              aria-label="إغلاق"
              icon={<AiOutlineCloseCircle size={28} />}
              position="absolute"
              top={4}
              right={4}
              zIndex={10}
              colorScheme="whiteAlpha"
              color="white"
              onClick={() => setImageModalOpen(false)}
            />
            {imageModalSrc && (
              <Image
                src={imageModalSrc}
                alt="تكبير"
                maxH="90vh"
                maxW="100%"
                objectFit="contain"
                borderRadius="md"
                onClick={() => setImageModalOpen(false)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Exam;