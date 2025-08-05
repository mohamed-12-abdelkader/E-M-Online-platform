import React, { useEffect, useState } from "react";
import {
  Box, VStack, Heading, Text, Spinner, Center, RadioGroup, Radio, Stack,
  Alert, AlertIcon, Badge, IconButton, HStack, useToast, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Divider, Checkbox, CheckboxGroup, Image, FormControl, FormLabel,
  Icon
} from "@chakra-ui/react";
// استبدال أيقونات chakra-ui بأيقونات react-icons
import { AiFillEdit, AiFillDelete, AiFillCheckCircle, AiOutlineCheckCircle, AiOutlineCloseCircle, AiFillStar } from "react-icons/ai";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import baseUrl from "../../api/baseUrl";
import { useParams } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";

const ComprehensiveExam = () => {
  const { id } = useParams();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, question: null });
  const [editForm, setEditForm] = useState({ text: "", choices: [], image: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, qid: null });
  const toast = useToast();
  const [studentAnswers, setStudentAnswers] = useState({}); // { [questionId]: choiceId }
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  // State لعرض درجات الطلاب
  const [showGrades, setShowGrades] = useState(false);
  const [gradesData, setGradesData] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState(null);
  // State للتنقل بين الأسئلة
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // جلب درجات الطلاب
  const fetchGrades = async () => {
    setGradesLoading(true);
    setGradesError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/course/lecture-exam/${id}/submissions`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setGradesData(res.data.submissions || []);
      setShowGrades(true);
    } catch (err) {
      setGradesError("حدث خطأ أثناء تحميل الدرجات");
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [id]);

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
      const res = await baseUrl.get(
        `/api/questions/lecture-exam/${id}/details`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
        setQuestions(res.data.questions || []);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل الأسئلة");
      } finally {
        setLoading(false);
      }
    };

  // Delete question
  const handleDelete = async () => {
    if (!deleteModal.qid) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/questions/lecture-exam-question/${deleteModal.qid}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      // حذف السؤال محلياً
      setQuestions((prev) => prev.filter((q) => q.id !== deleteModal.qid));
      toast({ title: "تم حذف السؤال", status: "success" });
      setDeleteModal({ open: false, qid: null });
    } catch {
      toast({ title: "فشل الحذف", status: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const openEditModal = (q) => {
    setEditForm({
      text: q.text,
      choices: q.choices.map((c) => ({ ...c })),
      image: q.image || ""
    });
    setImagePreview(q.image || '');
    setSelectedFile(null);
    setEditModal({ open: true, question: q });
  };

  // Handle edit form change
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file change for question image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleChoiceChange = (idx, value) => {
    setEditForm((prev) => {
      const choices = [...prev.choices];
      choices[idx].text = value;
      return { ...prev, choices };
    });
  };

  // Save edit
  const handleEditSave = async () => {
    const { question } = editModal;
    try {
      const token = localStorage.getItem("token");
      
      let requestData;
      let config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      // إنشاء FormData إذا كان هناك ملف محدد
      if (selectedFile) {
        // تحويل الصورة إلى base64 وإرسالها كـ JSON
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(selectedFile);
        });
        
        requestData = {
          text: editForm.text,
          choices: editForm.choices.map((c) => ({ id: c.id, text: c.text })),
          image: base64Image
        };
        config.headers['Content-Type'] = 'application/json';
        console.log("Sending JSON with base64 image");
      } else {
        requestData = { 
          text: editForm.text, 
          choices: editForm.choices.map((c) => ({ id: c.id, text: c.text })),
          image: editForm.image // إرسال رابط الصورة إذا كان موجوداً
        };
        config.headers['Content-Type'] = 'application/json';
        console.log("Sending JSON with URL image");
      }
      
      console.log("API Endpoint:", `/api/questions/lecture-exam-question/${question.id}`);
      console.log("Request Data:", requestData);
      
      let response;
      
      // إذا كان هناك ملف جديد، جرب رفعه أولاً
      if (selectedFile) {
        try {
          // محاولة رفع الصورة إلى endpoint منفصل
          const imageFormData = new FormData();
          imageFormData.append('image', selectedFile);
          
          const imageResponse = await baseUrl.post(
            '/api/upload/image', // أو أي endpoint مناسب لرفع الصور
            imageFormData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                // لا نضيف Content-Type للـ FormData
              } 
            }
          );
          
          console.log("Image upload response:", imageResponse.data);
          
          // إذا نجح رفع الصورة، استخدم الرابط في تحديث السؤال
          if (imageResponse.data.image_url) {
            requestData.image = imageResponse.data.image_url;
          }
        } catch (imageError) {
          console.log("Image upload failed, using base64:", imageError);
          // إذا فشل رفع الصورة، استخدم base64
        }
      }
      
      response = await baseUrl.patch(
        `/api/questions/lecture-exam-question/${question.id}`,
        requestData,
        config
      );
      
      console.log("Response:", response.data);
      
      // عدل السؤال محلياً
      setQuestions((prev) => prev.map((q) =>
        q.id === question.id
          ? { 
              ...q, 
              text: editForm.text, 
              choices: editForm.choices.map((c) => ({ ...c })),
              image: response.data.image || imagePreview || editForm.image
            }
          : q
      ));
      
      toast({ title: "تم التعديل بنجاح", status: "success" });
      setEditModal({ open: false, question: null });
      setSelectedFile(null);
      setImagePreview('');
    } catch (error) {
      console.error("Error updating question:", error);
      console.error("Error response:", error.response?.data);
      toast({ 
        title: "فشل التعديل", 
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error" 
      });
    }
  };

  // Set correct answer
  const [pendingCorrect, setPendingCorrect] = useState({}); // { [qid]: cid }
  const handleSetCorrect = async (qid, cid) => {
    // أظهر مباشرةً أن هذا هو الاختيار الحالي
    setPendingCorrect((prev) => ({ ...prev, [qid]: cid }));
    // عدل محلياً
    setQuestions((prev) => prev.map((q) =>
      q.id === qid
        ? { ...q, choices: q.choices.map((c) => ({ ...c, is_correct: c.id === cid })) }
        : q
    ));
    try {
      const token = localStorage.getItem("token");
      await baseUrl.patch(
        `/api/questions/lecture-exam-question/${qid}/answer`,
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
      // أعد الحالة كما كانت
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

  // دوال التنقل بين الأسئلة
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
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
        `/api/questions/lecture-exam/${id}/submit`,
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
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>جاري تحميل الأسئلة...</Text>
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

  // عرض درجات الطلاب
  if (showGrades) {
    return (
      <Box maxW="2xl" mx="auto" py={10} px={4} className="mt-[80px]">
        <Heading mb={8} textAlign="center" color="blue.600">درجات الطلاب في الامتحان</Heading>
        <Button mb={6} colorScheme="blue" onClick={() => setShowGrades(false)}>
          عودة للأسئلة
        </Button>
        {gradesLoading ? (
          <Center minH="40vh"><Spinner size="xl" color="blue.500" /><Text mt={4}>جاري تحميل الدرجات...</Text></Center>
        ) : gradesError ? (
          <Alert status="error" borderRadius="md"><AlertIcon />{gradesError}</Alert>
        ) : gradesData && gradesData.length > 0 ? (
          <VStack spacing={5} align="stretch">
            {gradesData.map((s, idx) => (
              <Box key={s.submission_id} p={5} borderRadius="xl" boxShadow="md" bgGradient={s.passed ? "linear(to-r, green.50, white)" : "linear(to-r, red.50, white)"} border="1px solid #e2e8f0">
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg" color="blue.700">{idx + 1}. {s.name}</Text>
                  <Badge colorScheme={s.passed ? "green" : "red"} fontSize="md">
                    {s.passed ? "ناجح" : "راسب"}
                  </Badge>
                </HStack>
                <HStack spacing={4} mt={2}>
                  <Badge colorScheme="blue">الدرجة: {s.total_grade}</Badge>
                  <Badge colorScheme="gray">ID: {s.student_id}</Badge>
                  {s.phone && <Badge colorScheme="purple">{s.phone}</Badge>}
                </HStack>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  {s.submitted_at ? `تاريخ التسليم: ${new Date(s.submitted_at).toLocaleString('ar-EG')}` : "لم يتم التسليم"}
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" textAlign="center">لا يوجد نتائج بعد.</Text>
        )}
      </Box>
    );
  }

  return (
    <Box maxW={{ base: "100%", sm: "90%", md: "2xl" }} mx="auto" py={{ base: 6, sm: 8, md: 10 }} px={{ base: 2, sm: 4, md: 6 }} className="mt-[80px]">
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
      <VStack spacing={{ base: 4, sm: 5, md: 6 }} mb={{ base: 6, sm: 7, md: 8 }}>
        <Heading textAlign="center" color="blue.600" size={{ base: 'lg', sm: 'xl', md: '2xl' }}>
          {isTeacher || isAdmin ? "عرض الامتحان" : "الامتحان الشامل"}
        </Heading>
        {!isTeacher && !isAdmin && student && (
          <Text color="gray.600" textAlign="center" fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} px={{ base: 2, sm: 4 }}>
            أجب على جميع الأسئلة ثم اضغط على "تسليم الامتحان"
          </Text>
        )}
      </VStack>
      {/* زر عرض درجات الطلاب للمدرس فقط */}
      {isTeacher && (
          <Button 
            mb={{ base: 6, sm: 7, md: 8 }} 
            colorScheme="green" 
            onClick={fetchGrades}
            size={{ base: 'sm', sm: 'md', md: 'lg' }}
            fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
            px={{ base: 4, sm: 6, md: 8 }}
            py={{ base: 2, sm: 3, md: 4 }}
            minW={{ base: '160px', sm: '180px', md: '200px' }}
            h={{ base: '40px', sm: '44px', md: '48px' }}
            borderRadius="full"
          >
          عرض درجات الطلاب
        </Button>
      )}
              <VStack spacing={{ base: 6, sm: 7, md: 8 }} align="stretch">
        {/* إذا الطالب سلّم الامتحان، اعرض النتيجة والأخطاء */}
        {submitResult && !isTeacher && !isAdmin && student ? (
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
                    size={{ base: 'lg', sm: 'xl', md: 'xl' }} 
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
                  <Text 
                          color="orange.600" 
                          fontSize={{ base: 'md', sm: 'lg' }}
                          textAlign="center"
                        >
                          عدد الأسئلة الخاطئة: {submitResult.wrongQuestions ? submitResult.wrongQuestions.length : 0}
              </Text>
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
          // الوضع العادي: عرض الأسئلة
          <>
            {/* للمدرسين: عرض جميع الأسئلة */}
            {isTeacher || isAdmin ? (
              questions.map((q, idx) => (
              <Box
                key={q.id}
                  p={{ base: 4, sm: 5, md: 6 }}
                borderRadius="xl"
                boxShadow="lg"
                bgGradient="linear(to-r, blue.50, white)"
                border="1px solid #e2e8f0"
                position="relative"
              >
                  <HStack justify="space-between" mb={2} align="start">
                    <VStack align="start" flex={1} spacing={{ base: 2, sm: 3 }}>
                      <Text fontWeight="bold" fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} color="blue.700" lineHeight="1.4">
              {idx + 1}. {q.text}
            </Text>
                      {/* عرض صورة السؤال إذا كانت موجودة */}
                      {q.image && (
                        <Box mt={2} w="full">
                          <Image 
                            src={q.image} 
                            alt="صورة السؤال" 
                            borderRadius="md" 
                            maxH={{ base: '200px', sm: '250px', md: '300px' }} 
                            w="full"
                            objectFit="cover"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="sm"
                          />
                        </Box>
                      )}
                    </VStack>
                    <HStack spacing={{ base: 1, sm: 2 }}>
                      <IconButton
                        aria-label="تعديل"
                        size={{ base: 'xs', sm: 'sm' }}
                        colorScheme="yellow"
                        onClick={() => openEditModal(q)}
                        minW={{ base: '28px', sm: '32px' }}
                        h={{ base: '28px', sm: '32px' }}
                        icon={<AiFillEdit boxSize={{ base: 3, sm: 4 }} />}
                      />
                      <IconButton
                        aria-label="حذف"
                        size={{ base: 'xs', sm: 'sm' }}
                        colorScheme="red"
                        isLoading={deleting}
                        onClick={() => setDeleteModal({ open: true, qid: q.id })}
                        minW={{ base: '28px', sm: '32px' }}
                        h={{ base: '28px', sm: '32px' }}
                        icon={<AiFillDelete boxSize={{ base: 3, sm: 4 }} />}
                      />
                    </HStack>
                </HStack>
                <Divider mb={3} />
                {q.choices && q.choices.length > 0 ? (
            <RadioGroup>
              <Stack direction="column" spacing={3}>
                {q.choices.map((choice, cidx) => (
                          <HStack key={choice.id} align="center">
                            <Radio
                              value={String(choice.id)}
                              colorScheme="blue"
                              isChecked={choice.is_correct}
                              isReadOnly
                            >
                              <Box
                                p={2}
                                borderRadius="md"
                                bg={choice.is_correct ? "green.50" : "white"}
                                fontWeight={choice.is_correct ? "bold" : "normal"}
                                color={choice.is_correct ? "green.700" : "gray.800"}
                              >
                    {String.fromCharCode(65 + cidx)}. {choice.text}
                              </Box>
                  </Radio>
                              <IconButton
                                aria-label="تعيين كإجابة صحيحة"
                                size="sm"
                                colorScheme={
                                  (pendingCorrect[q.id] === choice.id) || choice.is_correct
                                    ? "green"
                                    : "gray"
                                }
                                variant={
                                  (pendingCorrect[q.id] === choice.id) || choice.is_correct
                                    ? "solid"
                                    : "outline"
                                }
                                ml={2}
                                onClick={() => handleSetCorrect(q.id, choice.id)}
                                isDisabled={pendingCorrect[q.id] || choice.is_correct}
                              icon={<AiFillCheckCircle boxSize={{ base: 3, sm: 4 }} />}
                              />
                          </HStack>
                ))}
              </Stack>
            </RadioGroup>
                ) : (
                  <Alert status="info" borderRadius="md" mt={2}>
                    <AlertIcon />
                    هذا السؤال يتطلب إجابة كتابية أو لا توجد اختيارات متاحة.
                  </Alert>
                )}
          </Box>
              ))
            ) : (
              // للطلاب: عرض سؤال واحد مع التنقل
              questions.length > 0 && (
                <>
                  {/* السؤال الحالي */}
                  <Box
                    p={{ base: 4, sm: 5, md: 6 }}
                    borderRadius="xl"
                    boxShadow="lg"
                    bgGradient="linear(to-r, blue.50, white)"
                    border="1px solid #e2e8f0"
                    position="relative"
                  >
                    <VStack align="start" spacing={{ base: 3, sm: 4 }}>
                      <Text fontWeight="bold" fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }} color="blue.700" lineHeight="1.4">
                        {currentQuestionIndex + 1}. {questions[currentQuestionIndex].text}
                      </Text>
                      
                      {/* عرض صورة السؤال إذا كانت موجودة */}
                      {questions[currentQuestionIndex].image && (
                        <Box mt={2} w="full">
                          <Image 
                            src={questions[currentQuestionIndex].image} 
                            alt="صورة السؤال" 
                            borderRadius="md" 
                            maxH={{ base: '200px', sm: '250px', md: '300px' }} 
                            w="full"
                            objectFit="cover"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="sm"
                          />
                        </Box>
                      )}
                    </VStack>
                    
                    <Divider my={4} />
                    
                    {questions[currentQuestionIndex].choices && questions[currentQuestionIndex].choices.length > 0 ? (
                      <CheckboxGroup value={studentAnswers[questions[currentQuestionIndex].id] ? [String(studentAnswers[questions[currentQuestionIndex].id])] : []}>
                        <Stack direction="column" spacing={3}>
                          {questions[currentQuestionIndex].choices.map((choice, cidx) => (
                            <Checkbox
                              key={choice.id}
                              value={String(choice.id)}
                              colorScheme="blue"
                              isChecked={studentAnswers[questions[currentQuestionIndex].id] === choice.id}
                              onChange={() => handleStudentChoice(questions[currentQuestionIndex].id, choice.id)}
                              isDisabled={!!submitResult}
                            >
                              <Box p={3} borderRadius="md" bg="white" border="1px solid" borderColor="gray.200" _hover={{ bg: "blue.50" }}>
                                <Text fontSize={{ base: 'md', sm: 'lg' }} fontWeight="medium">
                                  {String.fromCharCode(65 + cidx)}. {choice.text}
                                </Text>
                              </Box>
                            </Checkbox>
                          ))}
                        </Stack>
                      </CheckboxGroup>
                    ) : (
                      <Alert status="info" borderRadius="md" mt={2}>
                        <AlertIcon />
                        هذا السؤال يتطلب إجابة كتابية أو لا توجد اختيارات متاحة.
                      </Alert>
                    )}
                  </Box>

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
                            الحالي ({currentQuestionIndex + 1})
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
                            const isCurrent = currentQuestionIndex === index;
                            return (
                              <Button
                                key={index}
                                size={{ base: 'xs', sm: 'sm' }}
                                variant={isCurrent ? "solid" : isAnswered ? "outline" : "ghost"}
                                colorScheme={isCurrent ? "blue" : isAnswered ? "green" : "gray"}
                                onClick={() => goToQuestion(index)}
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
                          onClick={goToPreviousQuestion}
                          isDisabled={currentQuestionIndex === 0}
                          size={{ base: 'sm', sm: 'md' }}
                          px={{ base: 4, sm: 6 }}
                          py={{ base: 2, sm: 3 }}
                          minW={{ base: '80px', sm: '100px' }}
                          leftIcon={<Icon as={AiOutlineCloseCircle} boxSize={{ base: 3, sm: 4 }} />}
                        >
                          السابق
                        </Button>
                        <Button
                          colorScheme="blue"
                          onClick={goToNextQuestion}
                          isDisabled={currentQuestionIndex === questions.length - 1}
                          size={{ base: 'sm', sm: 'md' }}
                          px={{ base: 4, sm: 6 }}
                          py={{ base: 2, sm: 3 }}
                          minW={{ base: '80px', sm: '100px' }}
                          rightIcon={<Icon as={AiOutlineCheckCircle} boxSize={{ base: 3, sm: 4 }} />}
                        >
                          التالي
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </>
              )
            )}
          </>
        )}
      </VStack>

      {/* زر تسليم الامتحان للطالب فقط */}
      {!isTeacher && !isAdmin && student && questions.length > 0 && !submitResult && (
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
              leftIcon={<Icon as={AiFillCheckCircle} boxSize={{ base: 4, sm: 5, md: 6 }} />}
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

      {/* عرض نتيجة التسليم */}
      {submitResult && (
        <Box mt={8} p={6} borderRadius="xl" boxShadow="lg" bg="white" border="1px solid #e2e8f0">
          <Heading size="md" color="green.600" mb={4}>نتيجة الامتحان</Heading>
          {/* مثال: عرض عدد الإجابات الصحيحة والنتيجة النهائية */}
          {submitResult.score !== undefined && (
            <Text fontWeight="bold" color="blue.700">درجتك: {submitResult.score}</Text>
          )}
          {submitResult.correctAnswersCount !== undefined && (
            <Text color="green.700">عدد الإجابات الصحيحة: {submitResult.correctAnswersCount}</Text>
          )}
          {/* إذا كان هناك تفاصيل أخرى */}
          {submitResult.details && Array.isArray(submitResult.details) && (
            <VStack mt={4} align="stretch">
              {submitResult.details.map((item, idx) => (
                <Box key={idx} p={2} borderRadius="md" bg="gray.50">
                  <Text>{item}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, question: null })} size={{ base: 'sm', sm: 'md', md: 'lg' }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 2, sm: 4 }}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>تعديل السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={{ base: 3, sm: 4 }} align="stretch">
              <FormControl>
                <FormLabel>نص السؤال:</FormLabel>
            <Input
              value={editForm.text}
              onChange={(e) => handleEditChange("text", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize={{ base: 'sm', sm: 'md' }}>صورة السؤال:</FormLabel>
                <VStack spacing={{ base: 2, sm: 3 }} align="stretch">
                  {/* معاينة الصورة الحالية */}
                  {imagePreview && (
                    <Box>
                      <Text fontSize={{ base: 'xs', sm: 'sm' }} color="gray.600" mb={2}>الصورة الحالية:</Text>
                      <Image 
                        src={imagePreview} 
                        alt="معاينة الصورة" 
                        borderRadius="md" 
                        maxH={{ base: '150px', sm: '180px', md: '200px' }} 
                        w="full"
                        objectFit="cover"
                        border="1px solid"
                        borderColor="gray.200"
                      />
                    </Box>
                  )}
                  
                  {/* رفع ملف جديد */}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    p={{ base: 1, sm: 2 }}
                    border="2px dashed"
                    borderColor="blue.200"
                    borderRadius="md"
                    _hover={{ borderColor: "blue.300" }}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                  />
                  
                  {/* رابط الصورة (اختياري) */}
                  <FormControl>
                    <FormLabel fontSize={{ base: 'xs', sm: 'sm' }} color="gray.600">أو رابط الصورة (اختياري)</FormLabel>
                    <Input 
                      value={editForm.image} 
                      onChange={(e) => handleEditChange("image", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      fontSize={{ base: 'xs', sm: 'sm' }}
                    />
                  </FormControl>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>الاختيارات:</FormLabel>
            <VStack spacing={2}>
              {editForm.choices.map((choice, idx) => (
                <Input
                  key={choice.id}
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(idx, e.target.value)}
                  placeholder={`اختيار ${String.fromCharCode(65 + idx)}`}
                />
              ))}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleEditSave}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              حفظ
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setEditModal({ open: false, question: null })}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
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
            <Button 
              colorScheme="red" 
              mr={3} 
              onClick={handleDelete} 
              isLoading={deleting}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '100px', sm: '120px' }}
            >
              تأكيد الحذف
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setDeleteModal({ open: false, qid: null })}
              size={{ base: 'sm', sm: 'md' }}
              fontSize={{ base: 'sm', sm: 'md' }}
              px={{ base: 3, sm: 4 }}
              py={{ base: 2, sm: 3 }}
              minW={{ base: '80px', sm: '100px' }}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ComprehensiveExam;
