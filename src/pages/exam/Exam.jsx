import React, { useEffect, useState } from "react";
import {
  Box, VStack, Heading, Text, Spinner, Center, RadioGroup, Radio, Stack,
  Alert, AlertIcon, IconButton, HStack, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Divider, Badge, Tooltip, InputGroup, InputRightElement
} from "@chakra-ui/react";
import { AiFillEdit, AiFillDelete, AiFillCheckCircle, AiOutlineCheckCircle, AiOutlineCloseCircle, AiFillStar } from "react-icons/ai";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import baseUrl from "../../api/baseUrl";
import { useParams } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";
import { 
  FaBookOpen, FaCheckCircle, FaChevronLeft, FaChevronRight, 
  FaUser, FaTimesCircle, FaPhone, FaIdBadge, FaCalendarAlt
} from 'react-icons/fa';
import { BiSearch } from "react-icons/bi";


const Exam = () => {
  const { examId } = useParams();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: null });
  const [editForm, setEditForm] = useState({ text: "", choices: [] });
  const [deleteModal, setDeleteModal] = useState({ open: false, qid: null });
  const [deleting, setDeleting] = useState(false);
  const [pendingCorrect, setPendingCorrect] = useState({});
  const [studentAnswers, setStudentAnswers] = useState({}); // { [questionId]: choiceId }
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

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [examId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/course/course-exam/${examId}/questions`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError("حدث خطأ أثناء تحميل الأسئلة");
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

  // للطالب: عند اختيار إجابة
  const handleStudentChoice = (qid, cid) => {
    setStudentAnswers((prev) => ({ ...prev, [qid]: cid }));
  };

  // للطالب: تسليم الامتحان
  const handleSubmitExam = async () => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const answersArr = Object.entries(studentAnswers).map(([questionId, choiceId]) => ({
        questionId: Number(questionId),
        choiceId: Number(choiceId),
      }));
      const res = await baseUrl.post(
        `/api/course/course-exam/${examId}/submit`,
        { answers: answersArr },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setSubmitResult(res.data);
      toast({ title: "تم تسليم الامتحان!", status: "success" });
    } catch {
      toast({ title: "فشل تسليم الامتحان", status: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

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
    <Box maxW="2xl" mx="auto" py={10} px={4} className="mt-[80px]">
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
      {/* زر عرض درجات الطلاب للمدرس */}
      {isTeacher && (
        <Button
          colorScheme={showGrades ? "gray" : "blue"}
          mb={6}
          onClick={() => {
            if (!showGrades && gradesData.length === 0) fetchGrades();
            setShowGrades((prev) => !prev);
          }}
        >
          {showGrades ? "عرض الأسئلة" : "عرض درجات الطلاب"}
        </Button>
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
      ) : (
        <>
        {/* للطالب: عرض سؤال واحد مع pagination */}
        {!isTeacher && !isAdmin && student ? (
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

                {/* تفاصيل الأخطاء */}
                {submitResult.wrongQuestions && submitResult.wrongQuestions.length > 0 && (
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
                          الأسئلة الخاطئة
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
                              {/* نص السؤال */}
                              <Text 
                                fontWeight="bold" 
                                color="orange.800" 
                                fontSize={{ base: 'md', sm: 'lg' }}
                                lineHeight="1.5"
                              >
                                {wq.questionText}
                              </Text>

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
                                    {wq.yourChoice?.text || "لم تجب"}
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
                                    {wq.correctChoice?.text}
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
                         ) : (
               <>
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
                    <Text fontWeight="bold" fontSize="lg" color="blue.800">{questions[current].text}</Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="md">
                    درجة السؤال: {questions[current].grade || 0}
                  </Badge>
                </HStack>
                <Divider mb={4} />
                {questions[current].choices && questions[current].choices.length > 0 ? (
                       <RadioGroup 
                         value={studentAnswers[questions[current].id] ? String(studentAnswers[questions[current].id]) : ""}
                         onChange={(value) => handleStudentChoice(questions[current].id, parseInt(value))}
                       >
                    <Stack direction="column" spacing={4}>
                      {questions[current].choices.map((choice, cidx) => {
                        const isSelected = studentAnswers[questions[current].id] === choice.id;
                        return (
                          <Tooltip key={choice.id} label="اختر هذه الإجابة" placement="left" hasArrow>
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
                                value={String(choice.id)}
                                colorScheme="blue"
                                mr={3}
                              />
                              <Text fontWeight="bold" fontSize="md">
                                {String.fromCharCode(65 + cidx)}. {choice.text}
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
                    <Text fontWeight="bold" fontSize="lg" color="blue.800">{q.text}</Text>
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
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="md">
                    درجة السؤال: {q.grade || 0}
                  </Badge>
                </HStack>
                <Divider mb={4} />
                {q.choices && q.choices.length > 0 ? (
                  <RadioGroup>
                    <Stack direction="column" spacing={4}>
                      {q.choices.map((choice, cidx) => (
                        <Tooltip key={choice.id} label={choice.is_correct ? "الإجابة الصحيحة" : "تعيين كإجابة صحيحة"} placement="left" hasArrow>
                          <Box
                            as="label"
                            p={3}
                            borderRadius="lg"
                            border={choice.is_correct ? '2px solid #38A169' : '1px solid #e2e8f0'}
                            boxShadow={choice.is_correct ? 'md' : 'sm'}
                            bg={choice.is_correct ? 'green.50' : 'white'}
                            color={choice.is_correct ? 'green.800' : 'gray.800'}
                            display="flex"
                            alignItems="center"
                            transition="all 0.2s"
                            cursor="pointer"
                            onClick={() => handleSetCorrect(q.id, choice.id)}
                          >
                            <Radio
                              value={String(choice.id)}
                              colorScheme="green"
                              isChecked={choice.is_correct}
                              isReadOnly
                              mr={3}
                            />
                            <Text fontWeight="bold" fontSize="md">
                              {String.fromCharCode(65 + cidx)}. {choice.text}
                            </Text>
                            {choice.is_correct && <FaCheckCircle color="#38A169" style={{marginRight:8}} />}
                          </Box>
                        </Tooltip>
                      ))}
                    </Stack>
                  </RadioGroup>
                ) : (
                  <Alert status="info" borderRadius="md" mt={2}>
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

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, question: null })}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>نص السؤال:</Text>
            <Input
              value={editForm.text}
              onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
              mb={4}
            />
            <Text mb={2}>الاختيارات:</Text>
            <VStack spacing={2}>
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
                />
              ))}
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