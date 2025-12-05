import React, { useEffect, useRef, useState } from "react";
import {
  Box, VStack, Heading, Text, Spinner, Center, RadioGroup, Radio, Stack,
  Alert, AlertIcon, IconButton, HStack, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Divider, Badge, Tooltip, InputGroup, InputRightElement, Image, Collapse, useDisclosure
} from "@chakra-ui/react";
import { AiFillEdit, AiFillDelete, AiFillCheckCircle, AiOutlineCheckCircle, AiOutlineCloseCircle, AiFillStar } from "react-icons/ai";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import baseUrl from "../../api/baseUrl";
import { useParams } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";
import { 
  FaBookOpen, FaCheckCircle, FaChevronLeft, FaChevronRight, 
  FaUser, FaTimesCircle, FaPhone, FaIdBadge, FaCalendarAlt, FaChartBar, FaFileAlt,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { BiSearch } from "react-icons/bi";

// مكون لعرض قائمة الطلاب بشكل قابل للطي
const StudentListCollapse = ({ title, students, colorScheme = "blue" }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  const colorMap = {
    green: { bg: "green.50", border: "green.200", text: "green.800", header: "green.700" },
    red: { bg: "red.50", border: "red.200", text: "red.800", header: "red.700" },
    blue: { bg: "blue.50", border: "blue.200", text: "blue.800", header: "blue.700" }
  };
  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Box flex={1} minW="200px">
      <Button
        onClick={onToggle}
        size="sm"
        variant="ghost"
        colorScheme={colorScheme}
        fontWeight="bold"
        fontSize="sm"
        w="full"
        justifyContent="space-between"
        mb={2}
        rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
        _hover={{ bg: `${colorScheme}.100` }}
      >
        {title}
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <Box
          borderRadius="lg"
          border="1px solid"
          borderColor={colors.border}
          bg={colors.bg}
          p={3}
          maxH="300px"
          overflowY="auto"
        >
          <VStack spacing={2} align="stretch">
            {students.map((student) => (
              <Box
                key={student.studentId}
                p={2}
                borderRadius="md"
                bg="white"
                border="1px solid"
                borderColor={colors.border}
              >
                <Text fontSize="xs" color={colors.text} fontWeight="medium">
                  {student.studentName} ({student.selectedAnswer})
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

const Exam = () => {
  const { examId } = useParams();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: null });
  const [editForm, setEditForm] = useState({ text: "", choices: [], image: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, qid: null });
  const [deleting, setDeleting] = useState(false);
  const [pendingCorrect, setPendingCorrect] = useState({});
  const [studentAnswers, setStudentAnswers] = useState({}); // { [questionId]: answerLetter } where answerLetter is "A", "B", "C", or "D"
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
  // State للتقرير
  const [showReport, setShowReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [examSession, setExamSession] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [attemptId, setAttemptId] = useState(null); // ID المحاولة الحالية
  const timerExpiredRef = useRef(false);
  const isStudentUser = !isTeacher && !isAdmin && !!student;

  const getQuestionImageSrc = (imagePath) => {
    if (!imagePath || imagePath === "null") return null;
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const base = (baseUrl.defaults.baseURL || "").replace(/\/$/, "");
    const normalizedPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    // Try to ensure we hit the public storage endpoint by default
    const prefixedPath =
      normalizedPath.startsWith("storage/") || normalizedPath.startsWith("uploads/")
        ? normalizedPath
        : `storage/${normalizedPath}`;
    return `${base}/${prefixedPath}`;
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isTeacher || isAdmin) {
      fetchQuestions();
    } else if (isStudentUser) {
      fetchExamForStudent();
    } else {
      setLoading(false);
    }
  }, [examId, isTeacher, isAdmin, isStudentUser]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
        setError(null);
      const token = localStorage.getItem("token");
      const endpoint = isTeacher
        ? `/api/exams/${examId}/questions`
        : `/api/course/course-exam/${examId}/questions`;
      const res = await baseUrl.get(
        endpoint,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError("حدث خطأ أثناء تحميل الأسئلة");
      } finally {
      setLoading(false);
    }
  };

  const fetchExamForStudent = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      // استخدام POST لبدء محاولة جديدة
      const res = await baseUrl.post(
        `/api/exams/${examId}/start`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      const data = res.data || {};
      
      // حفظ attemptId
      setAttemptId(data.attemptId);
      
      // إعداد معلومات الامتحان
      setExamSession({
        title: data.examTitle,
        durationMinutes: data.durationMinutes,
        startedAt: data.startedAt || new Date().toISOString(),
      });
      
      // إعداد الأسئلة
      setQuestions(data.questions || []);
      
      // إعداد المؤقت
      const initialSeconds = data.durationMinutes
        ? data.durationMinutes * 60
        : null;
      setRemainingSeconds(initialSeconds);
      timerExpiredRef.current = false;
      setSubmitResult(null);
      setStudentAnswers({});
      setCurrent(0);
    } catch (err) {
      // التحقق من وجود محاولة سابقة في الـ error response
      const errorData = err.response?.data || {};
      const previousAttempt = errorData.previousAttempt;
      
      if (previousAttempt) {
        // إذا كان هناك محاولة سابقة، عرض النتيجة بدلاً من الخطأ
        const wrongCount = previousAttempt.wrongQuestions?.length || 0;
        // تقدير عدد الإجابات الصحيحة (الدرجة الكلية - عدد الأسئلة الخاطئة)
        // هذا تقدير، يمكن تحسينه إذا كان API يرجع العدد الفعلي
        const correctCount = previousAttempt.maxGrade - wrongCount;
        
        setSubmitResult({
          attemptId: previousAttempt.attemptId,
          totalGrade: previousAttempt.totalGrade,
          maxGrade: previousAttempt.maxGrade,
          correctCount: correctCount,
          wrongCount: wrongCount,
          showAnswers: previousAttempt.showAnswers,
          releaseReason: previousAttempt.releaseReason,
          answersVisibleAt: previousAttempt.answersVisibleAt,
          wrongQuestions: previousAttempt.wrongQuestions || [],
        });
        
        // جلب معلومات الامتحان لعرض العنوان
        try {
          const token = localStorage.getItem("token");
          const examRes = await baseUrl.get(
            `/api/course/course-exam/${examId}/questions`,
            token ? { headers: { Authorization: `Bearer ${token}` } } : {}
          );
          const examData = examRes.data || {};
          const examInfo = examData.exam || {};
          setExamSession({
            title: examInfo.title || "الامتحان الشامل",
            durationMinutes: examInfo.durationMinutes,
            startedAt: previousAttempt.submittedAt,
          });
        } catch (examErr) {
          // إذا فشل جلب معلومات الامتحان، نستخدم قيم افتراضية
          setExamSession({
            title: "الامتحان الشامل",
            durationMinutes: null,
            startedAt: previousAttempt.submittedAt,
          });
        }
        
      toast({
          title: "تم إكمال هذا الامتحان مسبقاً", 
          description: errorData.message || "يمكنك عرض النتيجة أدناه",
          status: "info",
          duration: 5000,
          isClosable: true
        });
      } else {
        // إذا لم تكن هناك محاولة سابقة، عرض رسالة الخطأ العادية
        const message = errorData.message || "غير مسموح ببدء الامتحان حالياً";
        setError(message);
      toast({
          title: "خطأ في بدء الامتحان", 
          description: message,
        status: "error",
          duration: 5000,
          isClosable: true
      });
      }
    } finally {
      setLoading(false);
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

  // جلب التقرير
  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/course/course-exam/${examId}/report`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setReportData(res.data);
      setShowReport(true);
    } catch (err) {
      toast({ 
        title: "فشل جلب التقرير", 
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error" 
      });
    } finally {
      setReportLoading(false);
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
      // إعادة جلب الأسئلة للتأكد من التحديث
      await fetchQuestions();
    } catch (err) {
      toast({
        title: "فشل الحذف", 
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error" 
      });
    } finally {
      setDeleting(false);
    }
  };

  // فتح مودال التعديل
  const openEditModal = (q) => {
    // تحويل البنية الجديدة إلى البنية القديمة للواجهة
    setEditForm({
      text: q.question_text || "",
      choices: [
        { id: "A", text: q.option_a || "", is_correct: q.correct_answer === "A" },
        { id: "B", text: q.option_b || "", is_correct: q.correct_answer === "B" },
        { id: "C", text: q.option_c || "", is_correct: q.correct_answer === "C" },
        { id: "D", text: q.option_d || "", is_correct: q.correct_answer === "D" },
      ],
      image: q.question_image || null,
    });
    setEditModal({ open: true, question: q });
  };

  // حفظ التعديل
  const handleEditSave = async () => {
    const { question } = editModal;
    if (!question) return;
    
    try {
      const token = localStorage.getItem("token");
      
      // التحقق من وجود نص السؤال
      if (!editForm.text || !editForm.text.trim()) {
      toast({
          title: "خطأ في البيانات", 
          description: "يرجى إدخال نص السؤال",
          status: "error" 
        });
        return;
      }
      
      // التحقق من وجود 4 اختيارات
      if (!editForm.choices || editForm.choices.length !== 4) {
      toast({
          title: "خطأ في البيانات", 
          description: "يجب أن يحتوي السؤال على 4 اختيارات",
          status: "error" 
        });
        return;
      }
      
      // التحقق من وجود إجابة صحيحة واحدة على الأقل
      const hasCorrectAnswer = editForm.choices.some(c => c.is_correct);
      if (!hasCorrectAnswer) {
      toast({
          title: "خطأ في البيانات", 
          description: "يجب تحديد إجابة صحيحة واحدة على الأقل",
          status: "error" 
        });
        return;
      }
      
      // إعداد البيانات بالصيغة المطلوبة
      const requestData = {
        text: editForm.text.trim(),
        choices: editForm.choices.map((c) => ({
          text: c.text.trim(),
          is_correct: c.is_correct || false
        }))
      };
      
      // إضافة الصورة إذا كانت موجودة (اختياري)
      if (editForm.image) {
        requestData.image = editForm.image;
      }
      
      const res = await baseUrl.put(
        `/api/course/course-exam/question/${question.id}`,
        requestData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // تحديث الأسئلة بالبيانات الجديدة
      const updatedQuestion = res.data?.question || res.data;
      if (updatedQuestion) {
        setQuestions((prev) => prev.map((q) =>
          q.id === question.id ? updatedQuestion : q
        ));
      } else {
        // إذا لم يتم إرجاع السؤال المحدث، نحدثه محلياً
        setQuestions((prev) => prev.map((q) =>
          q.id === question.id
            ? { 
                ...q, 
                question_text: editForm.text.trim(),
                option_a: editForm.choices[0]?.text.trim() || "",
                option_b: editForm.choices[1]?.text.trim() || "",
                option_c: editForm.choices[2]?.text.trim() || "",
                option_d: editForm.choices[3]?.text.trim() || "",
                correct_answer: editForm.choices.find(c => c.is_correct)?.id || "A",
                question_image: editForm.image || q.question_image
              }
            : q
        ));
      }
      
      toast({ title: "تم التعديل بنجاح", status: "success" });
      setEditModal({ open: false, question: null });
      
      // إعادة جلب الأسئلة للتأكد من التحديث
      await fetchQuestions();
    } catch (err) {
      toast({ 
        title: "فشل التعديل", 
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error" 
      });
    }
  };

  // تعيين الإجابة الصحيحة
  const handleSetCorrect = async (qid, answerLetter) => {
    // answerLetter يجب أن يكون "A", "B", "C", أو "D"
    setPendingCorrect((prev) => ({ ...prev, [qid]: answerLetter }));
    
    // تحديث محلي فوري
    setQuestions((prev) => prev.map((q) =>
      q.id === qid ? { ...q, correct_answer: answerLetter } : q
    ));
    
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.patch(
        `/api/questions/${qid}/correct-answer`,
        { correctAnswer: answerLetter },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // تحديث بالبيانات من السيرفر
      const updatedQuestion = res.data.question;
      setQuestions((prev) => prev.map((q) =>
        q.id === qid ? updatedQuestion : q
      ));
      
      toast({ title: "تم تحديد الإجابة الصحيحة", status: "success" });
      setPendingCorrect((prev) => {
        const copy = { ...prev };
        delete copy[qid];
        return copy;
      });
    } catch (err) {
      toast({ 
        title: "فشل تحديد الإجابة", 
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error" 
      });
      
      // إعادة الحالة السابقة
      setQuestions((prev) => prev.map((q) => {
        if (q.id === qid) {
          const originalQ = questions.find(orig => orig.id === qid);
          return originalQ ? { ...originalQ } : q;
        }
        return q;
      }));
      
      setPendingCorrect((prev) => {
        const copy = { ...prev };
        delete copy[qid];
        return copy;
      });
    }
  };

  // للطالب: عند اختيار إجابة
  const handleStudentChoice = (qid, answerLetter) => {
    // answerLetter يجب أن يكون "A", "B", "C", أو "D"
    setStudentAnswers((prev) => ({ ...prev, [qid]: answerLetter }));
  };

  // للطالب: تسليم الامتحان
  const handleSubmitExam = async (autoSubmit = false) => {
    if (!isStudentUser) return;
    if (!attemptId) {
      toast({ 
        title: "خطأ", 
        description: "لا توجد محاولة نشطة لتسليمها",
        status: "error" 
      });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "يجب تسجيل الدخول لتسليم الامتحان", status: "error" });
      return;
    }
    setSubmitLoading(true);
    try {
      // تحويل الإجابات من الحروف (A, B, C, D) إلى الشكل المطلوب
      const answersArr = Object.entries(studentAnswers).map(([questionId, answerLetter]) => ({
        questionId: Number(questionId),
        selectedAnswer: answerLetter, // A, B, C, or D
      }));
      
      const res = await baseUrl.post(
        `/api/exams/${examId}/submit`,
        { 
          attemptId: attemptId,
          answers: answersArr 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // معالجة النتيجة حسب البنية الجديدة
      const resultData = res.data || {};
      setSubmitResult({
        attemptId: resultData.attemptId,
        totalGrade: resultData.totalGrade,
        maxGrade: resultData.maxGrade,
        correctCount: resultData.correctCount,
        wrongCount: resultData.wrongCount,
        showAnswers: resultData.showAnswers,
        releaseReason: resultData.releaseReason,
        answersVisibleAt: resultData.answersVisibleAt,
        wrongQuestions: resultData.wrongQuestions || [],
      });
      
      setExamSession(null);
      setRemainingSeconds(null);
      timerExpiredRef.current = false;
      
      // رسالة مختلفة حسب سبب الإظهار
      let successMessage = autoSubmit 
        ? "تم تسليم الامتحان تلقائياً لانتهاء الوقت" 
        : "تم تسليم الامتحان!";
      
      if (resultData.showAnswers) {
        successMessage += " يمكنك الآن عرض الإجابات الصحيحة.";
      } else if (resultData.releaseReason === "scheduled_pending") {
        const visibleDate = resultData.answersVisibleAt 
          ? new Date(resultData.answersVisibleAt).toLocaleString("ar-EG")
          : "لاحقاً";
        successMessage += ` سيتم إظهار الإجابات في: ${visibleDate}`;
      }
      
      toast({ 
        title: successMessage,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "حدث خطأ غير متوقع";
      toast({ 
        title: autoSubmit ? "تعذر التسليم التلقائي" : "فشل تسليم الامتحان",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

    useEffect(() => {
    if (!examSession || remainingSeconds === null) return;
    if (remainingSeconds !== null && remainingSeconds <= 0) {
      if (!timerExpiredRef.current && !submitResult && !submitLoading) {
        timerExpiredRef.current = true;
        toast({ title: "انتهى الوقت! يتم تسليم الامتحان تلقائياً.", status: "warning" });
        handleSubmitExam(true);
      }
      return;
    }
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examSession, remainingSeconds, submitResult, submitLoading]);

  if (loading) {
    return (
      <Center minH="70vh">
        <Box
          p={10}
                  borderRadius="2xl" 
          boxShadow="2xl"
          bgGradient="linear(to-br, blue.50, white)"
          border="2px solid #90cdf4"
                      display="flex" 
          flexDirection="column"
                      alignItems="center" 
          justifyContent="center"
          minW={{ base: '90vw', md: '400px' }}
        >
          <FaBookOpen size={54} color="#3182ce" style={{ marginBottom: 16, animation: 'spin 2s linear infinite' }} />
          <Spinner size="xl" color="blue.500" thickness="6px" speed="0.7s" mb={6} />
          <Text mt={2} fontSize="xl" color="blue.700" fontWeight="bold">
            جاري تحميل أسئلة الامتحان...
          </Text>
                      </Box>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="60vh">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  return (
    <Box maxW="2xl" mx="auto" py={10} px={4} className="mt-[80px] mb-[250px]">
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
      <Heading mb={8} textAlign="center" color="blue.600">أسئلة الامتحان الشامل</Heading>
      {/* أزرار للمدرس */}
      {isTeacher && (
        <HStack spacing={4} mb={6} justify="center" flexWrap="wrap">
          <Button
            colorScheme={showGrades ? "gray" : "blue"}
            onClick={() => {
              if (!showGrades && gradesData.length === 0) fetchGrades();
              setShowGrades((prev) => !prev);
              setShowReport(false);
            }}
            leftIcon={<FaUser />}
          >
            {showGrades ? "عرض الأسئلة" : "عرض درجات الطلاب"}
          </Button>
          <Button
            colorScheme={showReport ? "gray" : "green"}
            onClick={() => {
              if (!showReport && !reportData) fetchReport();
              else setShowReport((prev) => !prev);
              setShowGrades(false);
            }}
            leftIcon={<FaChartBar />}
            isLoading={reportLoading}
          >
            {showReport ? "إخفاء التقرير" : "عرض التقرير"}
          </Button>
        </HStack>
      )}
      {/* عرض درجات الطلاب للمدرس */}
      {showGrades && isTeacher ? (
        <Box>
          <Heading mb={6} textAlign="center" color="blue.700" fontSize={{ base: "2xl", md: "3xl" }}>
            درجات الطلاب في الامتحان
          </Heading>
          {/* مربع البحث */}
          <Box maxW="400px" mx="auto" mb={8}>
            <InputGroup>
                      <Input 
                placeholder="ابحث باسم الطالب أو رقم الطالب أو رقم التسليم..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                        size="lg"
                pr={10}
                borderRadius="full"
                boxShadow="sm"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: 'blue.400', boxShadow: 'md' }}
                fontSize="md"
                fontWeight="medium"
                color="gray.800"
              />
              <InputRightElement pointerEvents="none" height="100%">
                <BiSearch color="gray.400" boxSize={5} />
              </InputRightElement>
            </InputGroup>
                </Box>
          {gradesLoading ? (
            <Center py={12}>
              <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
            </Center>
          ) : gradesData.length === 0 ? (
            <Center py={12}>
              <Text fontSize="lg" color="gray.600" fontWeight="medium">
                لا توجد درجات بعد
              </Text>
            </Center>
          ) : (
            <VStack spacing={7} align="stretch">
              {/* تصفية النتائج حسب البحث */}
              {gradesData.filter(s => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                return (
                  (s.name && s.name.toLowerCase().includes(term)) ||
                  (s.student_id && String(s.student_id).includes(term)) ||
                  (s.submission_id && String(s.submission_id).includes(term))
                );
              }).length === 0 ? (
                <Center py={8}>
                  <Text color="gray.500" fontSize="lg">لا توجد نتائج مطابقة للبحث</Text>
                </Center>
              ) : (
                gradesData.filter(s => {
                  const term = searchTerm.trim().toLowerCase();
                  if (!term) return true;
                  return (
                    (s.name && s.name.toLowerCase().includes(term)) ||
                    (s.student_id && String(s.student_id).includes(term)) ||
                    (s.submission_id && String(s.submission_id).includes(term))
                  );
                }).map((s, idx) => (
                  <Box
                    key={s.submission_id}
                    p={{ base: 5, md: 7 }}
                  borderRadius="2xl" 
                    boxShadow="0 4px 24px 0 rgba(0,0,0,0.07)"
                    bgGradient={s.passed ? "linear(to-br, green.50, white)" : "linear(to-br, red.50, white)"}
                    border="1.5px solid"
                    borderColor={s.passed ? "green.200" : "red.200"}
                    transition="all 0.3s"
                    _hover={{ boxShadow: 'xl', borderColor: s.passed ? 'green.400' : 'red.400', transform: 'scale(1.015)' }}
                  >
                    <HStack spacing={{ base: 4, md: 8 }} align="center" flexWrap="wrap">
                      {/* صورة رمزية دائرية */}
                      <Box
                        bg={s.passed ? "green.500" : "red.500"}
                        color="white"
                        w="60px"
                        h="60px"
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        borderRadius="full"
                        fontSize="2xl"
                        fontWeight="bold" 
                        boxShadow="md"
                        flexShrink={0}
                      >
                        {s.name && s.name.length > 0 ? s.name[0] : <FaUser />}
                        </Box>
                      {/* بيانات الطالب */}
                      <VStack align="start" spacing={1} flex={2} minW="180px">
                        <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }} color="gray.800">
                          {s.name}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="gray" fontSize="sm" px={3} py={1} borderRadius="md">
                            <FaIdBadge style={{ marginLeft: 4, display: "inline" }} /> {s.student_id}
                          </Badge>
                          {s.phone && (
                            <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="md">
                              <FaPhone style={{ marginLeft: 4, display: "inline" }} /> {s.phone}
                            </Badge>
                          )}
                  </HStack>
                        <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="md">
                          <FaCalendarAlt style={{ marginLeft: 4, display: "inline" }} /> {s.submitted_at ? new Date(s.submitted_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }) : "لم يتم التسليم"}
                        </Badge>
                      </VStack>
                      {/* دائرة الدرجة */}
                      <Box textAlign="center" minW={{ base: "90px", md: "120px" }}>
                        <CircularProgress
                          value={Math.min(100, Math.round((s.total_grade / 100) * 100))}
                          size={{ base: "70px", md: "100px" }}
                          color={s.passed ? "green.400" : "red.400"}
                          thickness="12px"
                          capIsRound
                        >
                          <CircularProgressLabel
                            fontWeight="bold"
                            fontSize={{ base: "lg", md: "2xl" }}
                            color={s.passed ? "green.700" : "red.700"}
                          >
                            {s.total_grade}
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500" mt={2}>
                          الدرجة
                      </Text>
                    </Box>
                      {/* حالة النجاح/الرسوب */}
                      <Box minW={{ base: "90px", md: "110px" }} textAlign="center">
                        <Badge
                          colorScheme={s.passed ? "green" : "red"}
                          fontSize={{ base: "md", md: "lg" }}
                          px={4}
                          py={2}
                          borderRadius="full"
                            display="flex" 
                            alignItems="center" 
                          justifyContent="center"
                          gap={2}
                        >
                          {s.passed ? (
                            <FaCheckCircle size={18} />
                          ) : (
                            <FaTimesCircle size={18} />
                          )}
                          <Text>{s.passed ? "ناجح" : "راسب"}</Text>
                        </Badge>
                            </Box>
                    </HStack>
                      </Box>
                ))
                    )}
                  </VStack>
          )}
                </Box>
      ) : showReport && reportData ? (
        // عرض التقرير
        <Box>
          <Heading mb={6} textAlign="center" color="green.700" fontSize={{ base: "2xl", md: "3xl" }}>
            <FaFileAlt style={{ display: "inline", marginLeft: 8 }} />
            تقرير الامتحان الشامل
          </Heading>

          {/* معلومات الامتحان */}
          <Box
            p={6}
            borderRadius="2xl"
            boxShadow="lg"
            bgGradient="linear(to-br, blue.50, white)"
            border="2px solid"
            borderColor="blue.200"
            mb={6}
          >
            <VStack spacing={3} align="stretch">
              <Heading size="md" color="blue.700">
                معلومات الامتحان
              </Heading>
              <HStack spacing={4} flexWrap="wrap">
                <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="md">
                  العنوان: {reportData.exam?.title || "غير محدد"}
                </Badge>
                <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="md">
                  الكورس: {reportData.exam?.courseTitle || "غير محدد"}
                </Badge>
                <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="md">
                  عدد الأسئلة: {reportData.exam?.questionsCount || 0}
                </Badge>
              </HStack>
            </VStack>
          </Box>

          {/* الإحصائيات العامة */}
          <Box
            p={6}
            borderRadius="2xl"
            boxShadow="lg"
            bgGradient="linear(to-br, green.50, white)"
            border="2px solid"
            borderColor="green.200"
            mb={6}
          >
            <Heading size="md" color="green.700" mb={4}>
              الإحصائيات العامة
            </Heading>
            <VStack spacing={4} align="stretch">
              <HStack spacing={6} flexWrap="wrap" justify="space-around">
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {reportData.overallStatistics?.totalStudents || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">إجمالي الطلاب</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {reportData.overallStatistics?.totalAnswers || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">إجمالي الإجابات</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {reportData.overallStatistics?.totalCorrect || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">إجابات صحيحة</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="red.600">
                    {reportData.overallStatistics?.totalWrong || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">إجابات خاطئة</Text>
                </Box>
              </HStack>
              <Divider />
              <HStack spacing={8} justify="center" flexWrap="wrap">
                <Box textAlign="center">
                  <CircularProgress
                    value={reportData.overallStatistics?.overallCorrectPercentage || 0}
                    size="120px"
                    color="green.400"
                    thickness="12px"
                    capIsRound
                  >
                    <CircularProgressLabel
                      fontSize="xl"
                      fontWeight="bold"
                      color="green.700"
                    >
                      {Math.round(reportData.overallStatistics?.overallCorrectPercentage || 0)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="sm" color="green.600" mt={2} fontWeight="medium">
                    نسبة الصحة
                  </Text>
                </Box>
                <Box textAlign="center">
                  <CircularProgress
                    value={reportData.overallStatistics?.overallWrongPercentage || 0}
                    size="120px"
                    color="red.400"
                    thickness="12px"
                    capIsRound
                  >
                    <CircularProgressLabel
                      fontSize="xl"
                      fontWeight="bold"
                      color="red.700"
                    >
                      {Math.round(reportData.overallStatistics?.overallWrongPercentage || 0)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="sm" color="red.600" mt={2} fontWeight="medium">
                    نسبة الخطأ
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </Box>

          {/* أكثر الأسئلة إشكالية */}
          {reportData.mostProblematicQuestions && reportData.mostProblematicQuestions.length > 0 && (
            <Box
              p={6}
              borderRadius="2xl"
              boxShadow="lg"
              bgGradient="linear(to-br, red.50, white)"
              border="2px solid"
              borderColor="red.200"
              mb={6}
            >
              <Heading size="md" color="red.700" mb={4}>
                أكثر الأسئلة إشكالية
              </Heading>
              <VStack spacing={3} align="stretch">
                {reportData.mostProblematicQuestions.map((q, idx) => (
                  <Box
                    key={q.questionId}
                    p={4}
                    borderRadius="xl"
                    bg="white"
                    border="1px solid"
                    borderColor="red.200"
                    boxShadow="sm"
                  >
                    <HStack spacing={3} align="start">
                      <Badge
                        colorScheme="red"
                        fontSize="lg"
                        px={3}
                        py={1}
                        borderRadius="full"
                        minW="40px"
                        textAlign="center"
                      >
                        {idx + 1}
                      </Badge>
                      <VStack align="start" spacing={2} flex={1}>
                        <Text fontWeight="bold" color="gray.800" fontSize="md">
                          {q.questionText || `سؤال ${q.questionId}`}
                        </Text>
                        <HStack spacing={4}>
                          <Badge colorScheme="red" fontSize="sm">
                            أخطاء: {q.wrongAnswers}
                          </Badge>
                          <Badge colorScheme="orange" fontSize="sm">
                            نسبة الخطأ: {Math.round(q.wrongPercentage || 0)}%
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* تفاصيل الأسئلة */}
          {reportData.questions && reportData.questions.length > 0 && (
            <Box>
              <Heading size="lg" color="blue.700" mb={6} textAlign="center">
                تفاصيل الأسئلة
              </Heading>
              <VStack spacing={6} align="stretch">
                {reportData.questions.map((q, idx) => (
                  <Box
                    key={q.questionId}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="lg"
                    bgGradient="linear(to-br, blue.50, white)"
                    border="2px solid"
                    borderColor="blue.200"
                  >
                    <VStack spacing={4} align="stretch">
                      {/* رأس السؤال */}
                      <HStack justify="space-between" align="start" flexWrap="wrap">
                        <HStack spacing={3}>
                          <Badge
                            colorScheme="blue"
                            fontSize="lg"
                            px={4}
                            py={2}
                            borderRadius="full"
                          >
                            سؤال {idx + 1}
                          </Badge>
                          <Text fontWeight="bold" color="blue.800" fontSize="lg">
                            {q.type === "IMAGE" ? "سؤال صوري" : q.questionText}
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme={q.statistics?.correctPercentage >= 70 ? "green" : q.statistics?.correctPercentage >= 50 ? "yellow" : "red"}
                          fontSize="md"
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {Math.round(q.statistics?.correctPercentage || 0)}% صحة
                        </Badge>
                      </HStack>

                      {/* صورة السؤال */}
                      {q.questionImage && getQuestionImageSrc(q.questionImage) && (
                        <Box
                          borderRadius="xl"
                          overflow="hidden"
                          border="1px solid"
                          borderColor="blue.200"
                          mb={4}
                        >
                          <Image
                            src={getQuestionImageSrc(q.questionImage)}
                            alt={`question-${q.questionId}`}
                            w="100%"
                            maxH="400px"
                            objectFit="contain"
                            bg="white"
                          />
                        </Box>
                      )}

                      {/* الاختيارات */}
                      <VStack spacing={2} align="stretch">
                        <Text fontWeight="bold" color="gray.700" fontSize="sm" mb={2}>
                          الاختيارات:
                        </Text>
                        {['A', 'B', 'C', 'D'].map((letter) => {
                          const optionText = q[`option${letter}`];
                          const isCorrect = q.correctAnswer === letter;
                          const count = q.statistics?.answerDistribution?.[letter] || 0;
                          const percentage = q.statistics?.totalAnswers > 0
                            ? Math.round((count / q.statistics.totalAnswers) * 100)
                            : 0;
                          
                          return (
                            <Box
                              key={letter}
                              p={3}
                              borderRadius="lg"
                              border={isCorrect ? '2px solid' : '1px solid'}
                              borderColor={isCorrect ? 'green.400' : 'gray.200'}
                              bg={isCorrect ? 'green.50' : 'white'}
                            >
                              <HStack justify="space-between">
                                <HStack spacing={2}>
                                  <Text fontWeight="bold" color={isCorrect ? "green.700" : "gray.700"}>
                                    {letter}.
                                  </Text>
                                  <Text color={isCorrect ? "green.800" : "gray.800"}>
                                    {optionText}
                                  </Text>
                                  {isCorrect && (
                                    <FaCheckCircle color="#16A34A" size={16} />
                                  )}
                                </HStack>
                                <HStack spacing={2}>
                                  <Text fontSize="sm" color="gray.600">
                                    {count} ({percentage}%)
                                  </Text>
                                  <Box
                                    w="60px"
                                    h="8px"
                                    bg="gray.200"
                                    borderRadius="full"
                                    overflow="hidden"
                                  >
                                    <Box
                                      h="full"
                                      bg={isCorrect ? "green.400" : "blue.400"}
                                      w={`${percentage}%`}
                                      borderRadius="full"
                                    />
                                  </Box>
                                </HStack>
                              </HStack>
                            </Box>
                          );
                        })}
                      </VStack>

                      {/* إحصائيات السؤال */}
                      <Box
                        p={4}
                        borderRadius="lg"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <HStack spacing={6} flexWrap="wrap" justify="space-around">
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="blue.600">
                              {q.statistics?.totalAnswers || 0}
                            </Text>
                            <Text fontSize="xs" color="gray.600">إجمالي الإجابات</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                              {q.statistics?.correctAnswers || 0}
                            </Text>
                            <Text fontSize="xs" color="gray.600">صحيحة</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="red.600">
                              {q.statistics?.wrongAnswers || 0}
                            </Text>
                            <Text fontSize="xs" color="gray.600">خاطئة</Text>
                          </Box>
                        </HStack>
                      </Box>

                      {/* قائمة الطلاب */}
                      <HStack spacing={4} align="start" flexWrap="wrap">
                        {/* الطلاب الصحيحين */}
                        {q.correctStudents && q.correctStudents.length > 0 && (
                          <StudentListCollapse
                            title={`الطلاب الصحيحين (${q.correctStudents.length})`}
                            students={q.correctStudents}
                            colorScheme="green"
                          />
                        )}

                        {/* الطلاب الخاطئين */}
                        {q.wrongStudents && q.wrongStudents.length > 0 && (
                          <StudentListCollapse
                            title={`الطلاب الخاطئين (${q.wrongStudents.length})`}
                            students={q.wrongStudents}
                            colorScheme="red"
                          />
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      ) : (
        <>
        {/* للطالب: عرض سؤال واحد مع pagination */}
        {isStudentUser ? (
          <>
            {/* عرض النتيجة إذا تم التسليم */}
            {submitResult ? (
              <>
                {/* بطاقة النتيجة الرئيسية */}
                <Box 
                  p={{ base: 6, sm: 8, md: 10 }} 
                  borderRadius="2xl" 
                  boxShadow="2xl" 
                  bgGradient="linear(135deg, green.50 0%, white 50%, blue.50 100%)" 
                  border="2px solid" 
                  borderColor="green.200"
                  mb={{ base: 6, sm: 8, md: 10 }} 
                  textAlign="center"
                  position="relative"
                  overflow="hidden"
                >
                  {/* خلفية مزخرفة */}
                  <Box
                    position="absolute"
                    top="-50%"
                    left="-50%"
                    w="200%"
                    h="200%"
                    bgGradient="radial(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)"
                    animation="pulse 3s ease-in-out infinite"
                  />
                  
                  <VStack spacing={6} position="relative" zIndex={1}>
                    {/* أيقونة النجاح */}
                    

                    {/* العنوان الرئيسي */}
                    <VStack spacing={3}>
                      <Heading 
                        size={{ base: 'lg', sm: 'xl', md: '2xl' }} 
                        color="green.700" 
                  fontWeight="bold"
                        textShadow="0 2px 4px rgba(0,0,0,0.1)"
                      >
                        نتيجتك النهائية
                      </Heading>
                      
                      {/* شريط التقدم الدائري */}
                      <Box position="relative" mb={4}>
                        <CircularProgress 
                          value={Math.round((submitResult.totalGrade / submitResult.maxGrade) * 100)} 
                          color="green.400" 
                          size={{ base: '120px', sm: '140px', md: '160px' }} 
                          thickness="12px" 
                          trackColor="gray.200"
                        >
                          <CircularProgressLabel 
                            fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }} 
                            fontWeight="bold"
                            color="green.700"
                          >
                            {submitResult.totalGrade}
                          </CircularProgressLabel>
                        </CircularProgress>
                        
                        {/* النسبة المئوية */}
                        <Text 
                          fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }} 
                          fontWeight="bold" 
                          color="green.600" 
                          mt={2}
                        >
                          من {submitResult.maxGrade} ({Math.round((submitResult.totalGrade / submitResult.maxGrade) * 100)}%)
                    </Text>
                    </Box>

                      {/* رسالة النتيجة */}
                     
                        </VStack>
                      </VStack>
                    </Box>

                {/* رسالة حالة الإجابات */}
                {!submitResult.showAnswers && submitResult.releaseReason === "scheduled_pending" && (
                  <Box 
                    p={{ base: 4, sm: 5, md: 6 }} 
                    borderRadius="xl" 
                    bg="blue.50" 
                    boxShadow="lg"
                                border="1px solid"
                    borderColor="blue.200"
                    mb={6}
                  >
                    <VStack spacing={3} align="center">
                      <AiOutlineCheckCircle size={32} color="#3182CE" />
                      <Heading size="md" color="blue.700">
                        تم تسليم الامتحان بنجاح
                      </Heading>
                      <Text fontSize="md" color="blue.600" textAlign="center">
                        سيتم إظهار الإجابات الصحيحة في:{" "}
                        {submitResult.answersVisibleAt 
                          ? new Date(submitResult.answersVisibleAt).toLocaleString("ar-EG", {
                              dateStyle: "full",
                              timeStyle: "short"
                            })
                          : "لاحقاً"}
                      </Text>
                      <Text fontSize="sm" color="blue.500" textAlign="center">
                        درجتك: {submitResult.totalGrade} من {submitResult.maxGrade}
                        {" "}({submitResult.correctCount} صحيح، {submitResult.wrongCount} خاطئ)
                        </Text>
                      </VStack>
                  </Box>
                )}

                {/* تفاصيل الأخطاء - تظهر فقط إذا كان showAnswers = true */}
                {submitResult.showAnswers && submitResult.wrongQuestions && submitResult.wrongQuestions.length > 0 && (
                  <Box 
                    p={{ base: 4, sm: 5, md: 6 }} 
                    borderRadius="xl" 
                    bg="white" 
                    boxShadow="lg"
                    border="1px solid"
                    borderColor="orange.200"
                  >
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} justify="center" mb={4}>
                        <Box
                          w="40px"
                      h="40px"
                          borderRadius="full"
                          bg="orange.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <AiOutlineCloseCircle size={20} color="#F59E0B" />
                  </Box>
                        <Heading size="lg" color="orange.700">
                          الأسئلة الخاطئة ({submitResult.wrongCount})
                        </Heading>
                      </HStack>
                      
                      <VStack spacing={4} align="stretch">
                        {submitResult.wrongQuestions.map((wq, idx) => (
                          <Box 
                            key={wq.questionId} 
                            p={{ base: 4, sm: 5, md: 6 }} 
                    borderRadius="xl"
                            boxShadow="md" 
                            bgGradient="linear(to-r, orange.50, white)" 
                            border="1px solid" 
                            borderColor="orange.200"
                            position="relative"
                          >
                            {/* رقم السؤال */}
                            <Box
                              position="absolute"
                              top="-10px"
                              right="-10px"
                              w="30px"
                              h="30px"
                              borderRadius="full"
                              bg="orange.500"
                              color="white"
                      display="flex"
                      alignItems="center"
                              justifyContent="center"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {idx + 1}
                    </Box>

                            <VStack spacing={4} align="stretch">
                              {/* صورة السؤال إذا كانت موجودة */}
                              {wq.questionImage && (
                    <Box
                                  mb={4}
                      borderRadius="xl"
                                  overflow="hidden"
                                  border="1px solid"
                                  borderColor="orange.200"
                                >
                                  <Image
                                    src={getQuestionImageSrc(wq.questionImage)}
                                    alt={`question-${idx + 1}`}
                                    w="100%"
                                    maxH="320px"
                                    objectFit="contain"
                                    bg="white"
                />
              </Box>
                              )}
                              
                              {/* نص السؤال */}
                              {wq.questionText && (
                                <Text 
                                  fontWeight="bold" 
                                  color="orange.800" 
                                  fontSize={{ base: 'md', sm: 'lg' }}
                                  lineHeight="1.5"
                                >
                                  {wq.questionText}
                                </Text>
                              )}

                              {/* الإجابات */}
                              <VStack spacing={3} align="stretch">
                                {/* إجابة الطالب */}
                                <Box 
                                  p={3} 
                                  borderRadius="lg" 
                                  bg="red.50" 
              border="1px solid"
                                  borderColor="red.200"
                                >
                                  <HStack spacing={2} mb={1}>
                                    <AiOutlineCloseCircle color="#DC2626" size={16} />
                                    <Text fontWeight="bold" color="red.700" fontSize="sm">
                                      إجابتك:
                                    </Text>
                </HStack>
                                  <Text 
                                    color="red.800" 
                                    fontSize="md" 
                                    fontWeight="medium"
                                    bg="red.100"
                                    p={2}
                                    borderRadius="md"
                                  >
                                    {wq.yourAnswer ? `${wq.yourAnswer}. ${wq[`option${wq.yourAnswer}`] || ""}` : "لم تجب"}
                                  </Text>
                                </Box>

                                {/* الإجابة الصحيحة */}
                                <Box 
                                  p={3} 
                                  borderRadius="lg" 
                                  bg="green.50" 
                      border="1px solid"
                                  borderColor="green.200"
                                >
                                  <HStack spacing={2} mb={1}>
                                    <AiOutlineCheckCircle color="#16A34A" size={16} />
                                    <Text fontWeight="bold" color="green.700" fontSize="sm">
                                      الإجابة الصحيحة:
                                    </Text>
                          </HStack>
                                  <Text 
                                    color="green.800" 
                                    fontSize="md" 
                                    fontWeight="medium"
                                    bg="green.100"
                                    p={2}
                                    borderRadius="md"
                                  >
                                    {wq.correctAnswer ? `${wq.correctAnswer}. ${wq[`option${wq.correctAnswer}`] || ""}` : "غير متوفر"}
                                  </Text>
                                </Box>
                        </VStack>
                            </VStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>
                )}
              </>
            ) : examSession ? (
              <>
                <Box
                  mb={{ base: 4, md: 6 }}
                  p={{ base: 4, md: 5 }}
              borderRadius="2xl"
              border="1px solid"
                  borderColor="blue.200"
                  boxShadow="lg"
                  bgGradient="linear(135deg, blue.50, white)"
                >
                  <VStack spacing={3} align="flex-start">
                    <Heading size="md" color="blue.700">
                      {examSession.title || "الامتحان الشامل"}
                    </Heading>
                    <HStack spacing={3} flexWrap="wrap">
                      <Badge colorScheme="blue" borderRadius="full" px={4} py={2}>
                        الوقت المتبقي: {formatTime(remainingSeconds)}
                      </Badge>
                      {examSession.timeLimitEnabled && examSession.timeLimitMinutes && (
                        <Badge colorScheme="purple" borderRadius="full" px={4} py={2}>
                          مؤقت داخلي: {examSession.timeLimitMinutes} دقيقة
                        </Badge>
                      )}
                      {!examSession.timeLimitEnabled && examSession.durationMinutes && (
                        <Badge colorScheme="green" borderRadius="full" px={4} py={2}>
                          مدة الامتحان: {examSession.durationMinutes} دقيقة
                        </Badge>
                      )}
                    </HStack>
                    {examSession.startedAt && (
                      <Text fontSize="sm" color="gray.600">
                        بدأ عند: {new Date(examSession.startedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    )}
              </VStack>
            </Box>
                 {/* السؤال الحالي */}
            {questions.length > 0 && (
            <Box
                key={questions[current].id}
                p={7}
              borderRadius="2xl"
                boxShadow="2xl"
                     bgGradient="linear(to-br, blue.50, white)"
                border="2px solid #90cdf4"
                position="relative"
                mb={2}
              >
                <HStack justify="space-between" mb={4} align="center">
                  <HStack spacing={3} align="center">
                    <Box bg="blue.400" color="white" w="38px" h="38px" display="flex" alignItems="center" justifyContent="center" borderRadius="full" fontWeight="bold" fontSize="xl" boxShadow="md">
                      {current + 1}
                    </Box>
                    <FaBookOpen color="#3182ce" size={22} />
                    <Text fontWeight="bold" fontSize="lg" color="blue.800">{questions[current].questionText || "سؤال صوري"}</Text>
                  </HStack>
                </HStack>
                <Divider mb={4} />
                {getQuestionImageSrc(questions[current].questionImage) && (
                  <Box
                    mb={4}
                      borderRadius="xl"
                    overflow="hidden"
                      border="1px solid"
                    borderColor="blue.100"
                  >
                    <Image
                      src={getQuestionImageSrc(questions[current].questionImage)}
                      alt={`question-${current + 1}`}
                      w="100%"
                      maxH="320px"
                      objectFit="contain"
                      bg="white"
                    />
                    </Box>
                )}
                {questions[current].optionA ? (
                       <RadioGroup 
                         value={studentAnswers[questions[current].id] || ""}
                         onChange={(value) => handleStudentChoice(questions[current].id, value)}
                       >
                    <Stack direction="column" spacing={4}>
                      {[
                        { letter: "A", arabicLetter: "أ", text: questions[current].optionA },
                        { letter: "B", arabicLetter: "ب", text: questions[current].optionB },
                        { letter: "C", arabicLetter: "ج", text: questions[current].optionC },
                        { letter: "D", arabicLetter: "د", text: questions[current].optionD },
                      ].map((option) => {
                        const isSelected = studentAnswers[questions[current].id] === option.letter;
                        const isImageQuestion = questions[current].type === "IMAGE";
                        const displayText = isImageQuestion ? option.arabicLetter : option.text;
    return (
                          <Tooltip key={option.letter} label="اختر هذه الإجابة" placement="left" hasArrow>
                            <Box
                              as="label"
                              p={3}
                              borderRadius="lg"
                              border={isSelected ? '2px solid #3182ce' : '1px solid #e2e8f0'}
                              boxShadow={isSelected ? 'md' : 'sm'}
                              bg={isSelected ? 'blue.50' : 'white'}
                              color={isSelected ? 'blue.800' : 'gray.800'}
                              display="flex"
                              alignItems="center"
                              cursor="pointer"
                              transition="all 0.2s"
                            >
                              <Radio
                                value={option.letter}
                                colorScheme="blue"
                                mr={3}
                              />
                              <Text fontWeight="bold" fontSize="md">
                                {option.letter}. {displayText}
                              </Text>
            </Box>
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                ) : (
                  <Alert status="info" borderRadius="md" mt={2}>
                    <AlertIcon />
                    لا توجد اختيارات متاحة لهذا السؤال.
                  </Alert>
                )}
              </Box>
            )}

                 {/* شريط التقدم */}
                 <Box 
                   p={{ base: 4, sm: 5, md: 6 }} 
                   borderRadius="lg" 
                   bg="white" 
                   border="1px solid" 
                   borderColor="gray.200"
                   boxShadow="md"
                   mt={{ base: 4, sm: 5, md: 6 }}
                 >
                   <VStack spacing={4}>
                     {/* شريط التقدم العام */}
                     <Box w="full">
                       <HStack justify="space-between" mb={2}>
                         <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color="blue.700">
                           التقدم العام
                </Text>
                         <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color="gray.600">
                           {Object.keys(studentAnswers).length} من {questions.length}
            </Text>
                       </HStack>
                       <Box w="full" h="8px" bg="gray.200" borderRadius="full" overflow="hidden">
                         <Box 
                           h="full" 
                           bgGradient="linear(to-r, blue.400, green.400)" 
                  borderRadius="full"
                           transition="width 0.3s ease"
                           w={`${(Object.keys(studentAnswers).length / questions.length) * 100}%`}
                         />
            </Box>
      </Box>

                     {/* إحصائيات مفصلة */}
                     <HStack spacing={6} justify="center" flexWrap="wrap">
                       <HStack spacing={2}>
                         <Box w="4" h="4" bg="green.500" borderRadius="full" />
                         <Text fontSize={{ base: 'xs', sm: 'sm' }} color="green.600" fontWeight="medium">
                           مكتمل ({Object.keys(studentAnswers).length})
                </Text>
                       </HStack>
                       <HStack spacing={2}>
                         <Box w="4" h="4" bg="gray.300" borderRadius="full" />
                         <Text fontSize={{ base: 'xs', sm: 'sm' }} color="gray.600" fontWeight="medium">
                           متبقي ({questions.length - Object.keys(studentAnswers).length})
                </Text>
                       </HStack>
                       <HStack spacing={2}>
                         <Box w="4" h="4" bg="blue.500" borderRadius="full" />
                         <Text fontSize={{ base: 'xs', sm: 'sm' }} color="blue.600" fontWeight="medium">
                           الحالي ({current + 1})
                         </Text>
                       </HStack>
                     </HStack>

                     {/* أزرار التنقل السريع */}
                     <Box>
                       <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color="gray.700" mb={3} textAlign="center">
                         التنقل السريع
                       </Text>
                       <HStack spacing={2} flexWrap="wrap" justify="center">
                         {questions.map((question, index) => {
                           const isAnswered = studentAnswers[question.id];
                           const isCurrent = current === index;
                  return (
                <Button 
                               key={index}
                               size={{ base: 'xs', sm: 'sm' }}
                               variant={isCurrent ? "solid" : isAnswered ? "outline" : "ghost"}
                               colorScheme={isCurrent ? "blue" : isAnswered ? "green" : "gray"}
                               onClick={() => setCurrent(index)}
                               minW={{ base: '32px', sm: '40px' }}
                               h={{ base: '32px', sm: '40px' }}
                  borderRadius="full"
                               fontSize={{ base: 'xs', sm: 'sm' }}
                        fontWeight="bold"
                               position="relative"
                             >
                               {index + 1}
                               {isAnswered && !isCurrent && (
                                 <Box
                                   position="absolute"
                                   top="-2px"
                                   right="-2px"
                                   w="8px"
                                   h="8px"
                                   bg="green.500"
                                   borderRadius="full"
                                   border="2px solid white"
                                 />
                               )}
                </Button>
                  );
                })}
              </HStack>
            </Box>

                     {/* أزرار السابق والتالي */}
                     <HStack spacing={4} justify="center">
          <Button 
                         colorScheme="blue"
                         variant="outline"
                  onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
                  isDisabled={current === 0}
                         size={{ base: 'sm', sm: 'md' }}
                         px={{ base: 4, sm: 6 }}
                         py={{ base: 2, sm: 3 }}
                         minW={{ base: '80px', sm: '100px' }}
                         leftIcon={<FaChevronRight boxSize={{ base: 3, sm: 4 }} />}
                >
                  السابق
          </Button>
          <Button 
            colorScheme="blue" 
                  onClick={() => setCurrent((prev) => Math.min(questions.length - 1, prev + 1))}
                  isDisabled={current === questions.length - 1}
                         size={{ base: 'sm', sm: 'md' }}
                         px={{ base: 4, sm: 6 }}
                         py={{ base: 2, sm: 3 }}
                         minW={{ base: '80px', sm: '100px' }}
                         rightIcon={<FaChevronLeft boxSize={{ base: 3, sm: 4 }} />}
                >
                  التالي
          </Button>
              </HStack>
              </VStack>
              </Box>

                 {/* زر تسليم الامتحان */}
                 {questions.length > 0 && (
                   <Box 
                     mt={{ base: 6, sm: 7, md: 8 }} 
                     p={{ base: 4, sm: 5, md: 6 }} 
                     borderRadius="xl" 
                     boxShadow="lg" 
                     bg="blue.50" 
                     border="2px solid" 
                     borderColor="blue.200"
                     textAlign="center"
                   >
                     <VStack spacing={{ base: 3, sm: 4 }}>
                       <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} fontWeight="bold" color="blue.700" px={{ base: 2, sm: 4 }}>
                         {Object.keys(studentAnswers).length === questions.length 
                           ? "تم الإجابة على جميع الأسئلة" 
                           : `أجب على ${questions.length - Object.keys(studentAnswers).length} سؤال متبقي`}
                       </Text>
                  <Button 
                         colorScheme="green"
                         size={{ base: 'md', sm: 'lg', md: 'xl' }}
                isLoading={submitLoading}
                onClick={handleSubmitExam}
                isDisabled={Object.keys(studentAnswers).length !== questions.length}
                         borderRadius="full"
                         px={{ base: 6, sm: 8, md: 10 }}
                         py={{ base: 3, sm: 4, md: 5 }}
                         fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                         fontWeight="bold"
                         _hover={{
                           transform: 'translateY(-2px)',
                           boxShadow: 'xl',
                           bg: 'green.600'
                         }}
                         transition="all 0.2s"
                         leftIcon={<AiFillCheckCircle boxSize={{ base: 4, sm: 5, md: 6 }} />}
                         minW={{ base: '200px', sm: '240px', md: '280px' }}
                         h={{ base: '48px', sm: '56px', md: '64px' }}
                       >
                         {Object.keys(studentAnswers).length === questions.length 
                           ? "تسليم الامتحان" 
                           : "أكمل الإجابات أولاً"}
              </Button>
                     </VStack>
              </Box>
            )}
               </>
            ) : (
              <Center py={10}>
                <Text color="gray.600" fontSize="lg">
                  لا توجد بيانات متاحة لهذا الامتحان حالياً.
                </Text>
              </Center>
            )}
          </>
        ) : (
          // للمدرس: عرض جميع الأسئلة
          <VStack spacing={8} align="stretch">
            {questions.map((q, idx) => (
              <Box
                key={q.id}
                p={7}
                borderRadius="2xl"
                boxShadow="2xl"
                bgGradient="linear(to-br, blue.50, white)"
                border="2px solid #90cdf4"
                      position="relative"
                mb={2}
              >
                <HStack justify="space-between" mb={4} align="center">
                  <HStack spacing={3} align="center">
                    <Box bg="blue.400" color="white" w="38px" h="38px" display="flex" alignItems="center" justifyContent="center" borderRadius="full" fontWeight="bold" fontSize="xl" boxShadow="md">
                      {idx + 1}
                    </Box>
                    <FaBookOpen color="#3182ce" size={22} />
                    <Text fontWeight="bold" fontSize="lg" color="blue.800">{q.question_text || "سؤال صوري"}</Text>
                  </HStack>
                  <HStack>
                    <IconButton
                      icon={<AiFillEdit />}
                      colorScheme="yellow"
                      variant="ghost"
                      aria-label="تعديل"
                      onClick={() => openEditModal(q)}
                    />
                    <IconButton
                      icon={<AiFillDelete />}
                      colorScheme="red"
                      variant="ghost"
                      aria-label="حذف"
                      onClick={() => setDeleteModal({ open: true, qid: q.id })}
                    />
                  </HStack>
                </HStack>
                <Divider mb={4} />
                {getQuestionImageSrc(q.question_image) && (
                  <Box
                        mb={4}
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="blue.100"
                  >
                          <Image
                      src={getQuestionImageSrc(q.question_image)}
                      alt={`question-${idx + 1}`}
                      w="100%"
                      maxH="320px"
                      objectFit="contain"
                            bg="white"
                          />
                        </Box>
                      )}
                {q.option_a && (
                  <RadioGroup>
                    <Stack direction="column" spacing={4}>
                      {[
                        { letter: "A", text: q.option_a },
                        { letter: "B", text: q.option_b },
                        { letter: "C", text: q.option_c },
                        { letter: "D", text: q.option_d },
                      ].map((option) => {
                        const isCorrect = q.correct_answer === option.letter;
                        return (
                          <Tooltip 
                            key={option.letter} 
                            label={isCorrect ? "الإجابة الصحيحة" : "تعيين كإجابة صحيحة"} 
                            placement="left" 
                            hasArrow
                          >
                            <Box
                              as="label"
                              p={3}
                        borderRadius="lg"
                              border={isCorrect ? '2px solid #38A169' : '1px solid #e2e8f0'}
                              boxShadow={isCorrect ? 'md' : 'sm'}
                              bg={isCorrect ? 'green.50' : 'white'}
                              color={isCorrect ? 'green.800' : 'gray.800'}
                              display="flex"
                              alignItems="center"
                              transition="all 0.2s"
                              cursor="pointer"
                              onClick={() => handleSetCorrect(q.id, option.letter)}
                            >
                              <Radio
                                value={option.letter}
                                colorScheme="green"
                                isChecked={isCorrect}
                                isReadOnly
                                mr={3}
                              />
                              <Text fontWeight="bold" fontSize="md">
                                {option.letter}. {option.text}
                        </Text>
                              {isCorrect && <FaCheckCircle color="#38A169" style={{marginRight:8}} />}
                      </Box>
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                )}
                    </Box>
                  ))}
          </VStack>
        )}
              </>
            )}

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, question: null })} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2} fontWeight="medium">نص السؤال:</Text>
                  <Input
                  value={editForm.text}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="أدخل نص السؤال"
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">الاختيارات:</Text>
                <RadioGroup
                  value={(() => {
                    if (!editForm.choices) return "0";
                    const correctIndex = editForm.choices.findIndex(c => c.is_correct);
                    return correctIndex >= 0 ? correctIndex.toString() : "0";
                  })()}
                  onChange={(value) => {
                    const correctIndex = parseInt(value);
                    setEditForm((prev) => {
                      const choices = prev.choices.map((c, idx) => ({
                        ...c,
                        is_correct: idx === correctIndex
                      }));
                      return { ...prev, choices };
                    });
                  }}
                >
                  <VStack spacing={2}>
                    {editForm.choices && editForm.choices.map((choice, idx) => {
                      const labels = ["A", "B", "C", "D"];
                      return (
                        <HStack key={choice.id || idx} w="full" spacing={2}>
                          <Radio value={idx.toString()} colorScheme="green" />
                          <Text fontWeight="bold" minW="20px" color="blue.600">
                            {labels[idx]}:
                          </Text>
                          <Input
                            value={choice.text}
                            onChange={(e) => setEditForm((prev) => {
                              const choices = [...prev.choices];
                              choices[idx].text = e.target.value;
                              return { ...prev, choices };
                            })}
                            placeholder={`اختيار ${labels[idx]}`}
                            flex={1}
                          />
                          {choice.is_correct && (
                            <Text fontSize="sm" color="green.600" fontWeight="bold">
                              (صحيح)
                            </Text>
                          )}
                          </HStack>
                      );
                    })}
                </VStack>
                </RadioGroup>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  اختر الإجابة الصحيحة من الخيارات أعلاه
                </Text>
              </Box>
              {editForm.image && (
                <Box>
                  <Text mb={2} fontWeight="medium">صورة السؤال:</Text>
                  <Image
                    src={getQuestionImageSrc(editForm.image)}
                    alt="صورة السؤال"
                    maxH="200px"
                    objectFit="contain"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSave}>
              حفظ
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
        <ModalContent>
          <ModalHeader>تأكيد الحذف</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>هل أنت متأكد أنك تريد حذف هذا السؤال؟ لا يمكن التراجع عن هذه العملية.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDelete} isLoading={deleting}>
              تأكيد الحذف
            </Button>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, qid: null })}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Exam;