import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
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
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Textarea,
  Image,
  IconButton,
  Spinner,
  HStack,
  VStack,
  useToast,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FaQuestionCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaImage,
  FaCheck,
  FaTimes,
  FaUpload,
  FaEye,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const Lesson = () => {
  const { id } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [questions, setQuestions] = useState([]);
  
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
  
  
  // Loading states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
  const { isOpen: isAnswerOpen, onOpen: onAnswerOpen, onClose: onAnswerClose } = useDisclosure();
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // تحديد الألوان بناءً على وضع الثيم (فاتح/داكن)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const successColor = useColorModeValue("green.500", "green.400");

  // Fetch questions data
  const fetchQuestionsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await baseUrl.get(`/api/lessons/${id}/questions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Questions API Response:", response.data);
      
      if (response.data.success) {
        setQuestions(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب الأسئلة";
      setError(errorMsg);
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create bulk questions
  const createBulkQuestions = async () => {
    try {
      setSubmitLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const requestData = {
        questions: bulkQuestions
      };

      console.log("Creating bulk questions with data:", requestData);
      
      const response = await baseUrl.post(`/api/lessons/${id}/questions/bulk`, requestData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Create Bulk Questions API Response:", response.data);
      
      // تحديث البيانات مباشرة في state
      if (response.data.success && response.data.data) {
        const newQuestions = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setQuestions(prev => [...prev, ...newQuestions]);
      }
      
      toast({
        title: "نجح",
        description: "تم إنشاء الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating bulk questions:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء الأسئلة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setSubmitLoading(false);
    }
  };

  // Update question
  const updateQuestion = async (formData) => {
    try {
      setEditLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const requestData = {};
      if (formData.text) requestData.text = formData.text;
      if (formData.options.some(opt => opt.trim() !== '')) {
        requestData.options = formData.options.filter(opt => opt.trim() !== '');
      }

      console.log("Updating question:", editingQuestion.id, requestData);
      
      const response = await baseUrl.put(`api/lesson-questions/${editingQuestion.id}`, requestData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Update Question API Response:", response.data);
      
      // تحديث البيانات مباشرة في state
      if (response.data.success) {
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion.id 
            ? { ...q, ...requestData, updated_at: new Date().toISOString() }
            : q
        ));
      }
      
      toast({
        title: "نجح",
        description: "تم تحديث السؤال بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating question:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث السؤال";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setEditLoading(false);
    }
  };

  // Delete question
  const deleteQuestion = async () => {
    try {
      setDeleteLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      console.log("Deleting question:", deletingQuestion.id);
      
      const response = await baseUrl.delete(`api/lesson-questions/${deletingQuestion.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete Question API Response:", response.data);
      
      // تحديث البيانات مباشرة في state
      if (response.data.success) {
        setQuestions(prev => prev.filter(q => q.id !== deletingQuestion.id));
      }
      
      toast({
        title: "نجح",
        description: "تم حذف السؤال بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting question:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف السؤال";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setDeleteLoading(false);
    }
  };

  // Set correct answer (modal)
  const setCorrectAnswer = async () => {
    try {
      setAnswerLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const requestData = {
        correctAnswer: selectedAnswer
      };

      console.log("Setting correct answer for question:", currentQuestion.id, requestData);
      
      const response = await baseUrl.put(`api/lesson-questions/${currentQuestion.id}/answer`, requestData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Set Correct Answer API Response:", response.data);
      
      // تحديث البيانات مباشرة في state
      if (response.data.success) {
        setQuestions(prev => prev.map(q => 
          q.id === currentQuestion.id 
            ? { ...q, correct_answer: selectedAnswer, updated_at: new Date().toISOString() }
            : q
        ));
      }
      
      toast({
        title: "نجح",
        description: "تم تحديد الإجابة الصحيحة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error setting correct answer:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديد الإجابة الصحيحة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setAnswerLoading(false);
    }
  };

  // Upload image
  const uploadImage = async () => {
    try {
      setImageLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      if (!selectedImage) {
        toast({
          title: "خطأ",
          description: "يجب اختيار صورة",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const formData = new FormData();
      formData.append("image", selectedImage);

      console.log("Uploading image for question:", currentQuestion.id);
      
      const response = await baseUrl.put(`api/lesson-questions/${currentQuestion.id}/image`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Upload Image API Response:", response.data);
      
      // تحديث البيانات مباشرة في state
      if (response.data.success) {
        const imageUrl = URL.createObjectURL(selectedImage);
        setQuestions(prev => prev.map(q => 
          q.id === currentQuestion.id 
            ? { ...q, image: imageUrl, updated_at: new Date().toISOString() }
            : q
        ));
      }
      
      toast({
        title: "نجح",
        description: "تم رفع الصورة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error uploading image:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في رفع الصورة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setImageLoading(false);
    }
  };

  // Set correct answer directly from option click
  const setCorrectAnswerDirectly = async (questionId, answer) => {
    try {
      setAnswerLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const requestData = {
        correctAnswer: answer
      };

      console.log("Setting correct answer directly for question:", questionId, requestData);
      
      const response = await baseUrl.put(`api/lesson-questions/${questionId}/answer`, requestData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Set Correct Answer Directly API Response:", response.data);
      
      // تحديث البيانات مباشرة في state
      if (response.data.success) {
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, correct_answer: answer, updated_at: new Date().toISOString() }
            : q
        ));
      }
      
      toast({
        title: "نجح",
        description: "تم تحديد الإجابة الصحيحة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error setting correct answer directly:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديد الإجابة الصحيحة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setAnswerLoading(false);
    }
  };

  // Handle option click
  const handleOptionClick = async (questionId, option) => {
    const result = await setCorrectAnswerDirectly(questionId, option);
    // لا حاجة لـ fetchQuestionsData() بعد الآن
  };

  // Load data on component mount
  useEffect(() => {
    fetchQuestionsData();
  }, [id]);

  // Handle form input changes
  const handleBulkQuestionsChange = (e) => {
    setBulkQuestions(e.target.value);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const index = parseInt(name.replace('option', ''));
      const newOptions = [...editFormData.options];
      newOptions[index] = value;
      setEditFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle form submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (!bulkQuestions.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء الأسئلة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await createBulkQuestions();
    
    if (result.success) {
      onClose();
      resetBulkForm();
      // لا حاجة لـ fetchQuestionsData() بعد الآن
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.text && editFormData.options.every(opt => !opt.trim())) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء نص السؤال أو الخيارات",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await updateQuestion(editFormData);
    
    if (result.success) {
      onEditClose();
      resetEditForm();
      // لا حاجة لـ fetchQuestionsData() بعد الآن
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteQuestion();
    
    if (result.success) {
      onDeleteClose();
      setDeletingQuestion(null);
      // لا حاجة لـ fetchQuestionsData() بعد الآن
    }
  };

  // Handle answer submit
  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) {
      toast({
        title: "خطأ",
        description: "يجب اختيار إجابة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await setCorrectAnswer();
    
    if (result.success) {
      onAnswerClose();
      setSelectedAnswer("");
      setCurrentQuestion(null);
      // لا حاجة لـ fetchQuestionsData() بعد الآن
    }
  };

  // Handle image submit
  const handleImageSubmit = async () => {
    const result = await uploadImage();
    
    if (result.success) {
      onImageClose();
      removeImage();
      setCurrentQuestion(null);
      // لا حاجة لـ fetchQuestionsData() بعد الآن
    }
  };

  // Reset forms
  const resetBulkForm = () => {
    setBulkQuestions("");
  };

  const resetEditForm = () => {
    setEditFormData({ text: '', options: ['', '', '', ''] });
  };

  // Handle edit button click
  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setEditFormData({
      text: question.text,
      options: question.options
    });
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (question) => {
    setDeletingQuestion(question);
    onDeleteOpen();
  };

  // Handle image button click
  const handleImageClick = (question) => {
    setCurrentQuestion(question);
    setImagePreview(question.image);
    onImageOpen();
  };

  // Handle answer button click
  const handleAnswerClick = (question) => {
    setCurrentQuestion(question);
    setSelectedAnswer(question.correct_answer || "");
    onAnswerOpen();
  };

  if (loading) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>جاري تحميل الأسئلة...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
            <Text color="red.600">خطأ في تحميل البيانات: {error}</Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)" position="relative">
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        backgroundImage="radial-gradient(circle at 25px 25px, white 2px, transparent 0), radial-gradient(circle at 75px 75px, white 2px, transparent 0)"
        backgroundSize="100px 100px"
      />
      
      {/* Header */}
      <Box
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        position="sticky"
        top={0}
        zIndex={10}
        mt="50px"
      >
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
            gap={6}
          >
            <Flex align="center" gap={4}>
              <Box
                w="60px"
                h="60px"
                bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                borderRadius="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 10px 30px rgba(49, 130, 206, 0.3)"
              >
                <Icon as={FaQuestionCircle} color="white" boxSize={6} />
              </Box>
              <Box>
                <Heading 
                  size={{ base: "lg", md: "xl" }} 
                  bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  أسئلة الدرس
                </Heading>
                <Text color="gray.600" fontSize="sm" mt={1}>
                  إدارة أسئلة الدرس رقم {id} - {questions.length} سؤال
                </Text>
              </Box>
            </Flex>

            <MotionButton
              leftIcon={<FaPlus />}
              bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
              color="white"
              onClick={onOpen}
              size={{ base: "md", md: "lg" }}
              borderRadius="15px"
              boxShadow="0 10px 30px rgba(49, 130, 206, 0.3)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 15px 40px rgba(49, 130, 206, 0.4)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              px={8}
              py={6}
            >
              إضافة أسئلة
            </MotionButton>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8} position="relative" zIndex={1}>

        {/* عرض الأسئلة */}
        {questions.length === 0 ? (
          <Box
            textAlign="center"
            py={16}
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(20px)"
            borderRadius="25px"
            boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            <Box
              w="100px"
              h="100px"
              bg="linear-gradient(135deg, rgba(49, 130, 206, 0.1) 0%, rgba(44, 90, 160, 0.1) 100%)"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={6}
            >
              <FaQuestionCircle size={40} color="#3182ce" />
            </Box>
            <Heading size="lg" color="gray.700" mb={3}>
              لا توجد أسئلة بعد
            </Heading>
            <Text color="gray.500" fontSize="lg" mb={6}>
              ابدأ بإضافة أول سؤال للدرس
            </Text>
            <MotionButton
              bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
              color="white"
              size="lg"
              borderRadius="15px"
              boxShadow="0 10px 30px rgba(49, 130, 206, 0.3)"
              onClick={onOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              px={8}
              py={6}
              leftIcon={<FaPlus />}
            >
              إضافة أول سؤال
            </MotionButton>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {questions.map((question, index) => (
              <MotionCard
                key={question.id}
                whileHover={{ scale: 1.02, y: -8 }}
                bg="rgba(255, 255, 255, 0.95)"
                backdropFilter="blur(20px)"
                borderRadius="25px"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
                boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
                overflow="hidden"
                position="relative"
                _hover={{
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                  borderColor: "rgba(49, 130, 206, 0.3)"
                }}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {/* Gradient Overlay */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="4px"
                  bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                />

                {/* Decorative Element */}
                <Box
                  position="absolute"
                  top="-20px"
                  right="-20px"
                  w="80px"
                  h="80px"
                  bg="linear-gradient(135deg, rgba(49, 130, 206, 0.1) 0%, rgba(44, 90, 160, 0.1) 100%)"
                  borderRadius="50%"
                  filter="blur(20px)"
                />
                <CardHeader pb={4} position="relative" zIndex={1}>
                  <Flex align="center" justify="space-between" mb={4}>
                    <HStack spacing={3}>
                      <Box
                        w="40px"
                        h="40px"
                        bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                        borderRadius="12px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 5px 15px rgba(49, 130, 206, 0.3)"
                      >
                        <Text fontWeight="bold" color="white" fontSize="sm">{index + 1}</Text>
                      </Box>
                      <Box>
                        <Heading 
                          size="md" 
                          bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                          bgClip="text"
                          fontWeight="bold"
                        >
                          السؤال {index + 1}
                        </Heading>
                        {question.correct_answer && (
                          <Box
                            bg="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="10px"
                            fontSize="xs"
                            fontWeight="medium"
                            display="inline-block"
                            mt={1}
                            boxShadow="0 3px 10px rgba(72, 187, 120, 0.3)"
                          >
                            تم تحديد الإجابة الصحيحة
                          </Box>
                        )}
                      </Box>
                    </HStack>
                    <HStack spacing={2}>
                      <MotionButton
                        as={IconButton}
                        icon={<FaImage />}
                        size="sm"
                        bg="linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)"
                        color="white"
                        borderRadius="10px"
                        onClick={() => handleImageClick(question)}
                        aria-label="إضافة صورة"
                        boxShadow="0 3px 10px rgba(159, 122, 234, 0.3)"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <MotionButton
                        as={IconButton}
                        icon={<FaCheck />}
                        size="sm"
                        bg="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                        color="white"
                        borderRadius="10px"
                        onClick={() => handleAnswerClick(question)}
                        aria-label="تحديد الإجابة الصحيحة"
                        boxShadow="0 3px 10px rgba(72, 187, 120, 0.3)"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <MotionButton
                        as={IconButton}
                        icon={<FaEdit />}
                        size="sm"
                        bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                        color="white"
                        borderRadius="10px"
                        onClick={() => handleEditClick(question)}
                        aria-label="تعديل السؤال"
                        boxShadow="0 3px 10px rgba(49, 130, 206, 0.3)"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                      <MotionButton
                        as={IconButton}
                        icon={<FaTrash />}
                        size="sm"
                        bg="linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"
                        color="white"
                        borderRadius="10px"
                        onClick={() => handleDeleteClick(question)}
                        aria-label="حذف السؤال"
                        boxShadow="0 3px 10px rgba(245, 101, 101, 0.3)"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    </HStack>
                  </Flex>
                </CardHeader>

                <CardBody py={4}>
                  {question.image && (
                    <Box mb={4}>
                      <Image
                        src={question.image}
                        alt="صورة السؤال"
                        borderRadius="md"
                        maxH="120px"
                        objectFit="cover"
                        w="full"
                      />
                    </Box>
                  )}
                  
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="md" color={headingColor} fontWeight="semibold" mb={2}>
                        نص السؤال:
                      </Text>
                      <Text fontSize="sm" color={textColor} bg="gray.50" p={3} borderRadius="md">
                        {question.text}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="md" color={headingColor} fontWeight="semibold" mb={2}>
                        الخيارات:
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {question.options.map((option, optIndex) => (
                          <HStack 
                            key={optIndex} 
                            p={2} 
                            bg={question.correct_answer === option ? "green.100" : "gray.50"} 
                            borderRadius="md"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{
                              bg: question.correct_answer === option ? "green.200" : "blue.50",
                              transform: "translateX(5px)",
                              boxShadow: "sm"
                            }}
                            onClick={() => handleOptionClick(question.id, option)}
                            position="relative"
                          >
                            <Text fontSize="sm" fontWeight="bold" color="blue.600" minW="20px">
                              {String.fromCharCode(65 + optIndex)})
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {option}
                            </Text>
                            {question.correct_answer === option && (
                              <Icon as={FaCheck} color="green.500" />
                            )}
                          
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                    
                  
                  </VStack>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Add Bulk Questions Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaPlus color="blue.500" />
              <Text>إضافة أسئلة متعددة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleBulkSubmit}>
              <VStack spacing={6}>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>تنسيق الأسئلة:</AlertTitle>
                    <AlertDescription>
                      اكتب الأسئلة بالشكل التالي:<br/>
                      السؤال الأول؟<br/>
                      A) الخيار الأول<br/>
                      B) الخيار الثاني<br/>
                      C) الخيار الثالث<br/>
                      D) الخيار الرابع<br/><br/>
                      السؤال الثاني؟<br/>
                      A) الخيار الأول<br/>
                      B) الخيار الثاني<br/>
                      C) الخيار الثالث<br/>
                      D) الخيار الرابع
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <FormControl isRequired>
                  <FormLabel>الأسئلة</FormLabel>
                  <Textarea
                    name="questions"
                    value={bulkQuestions}
                    onChange={handleBulkQuestionsChange}
                    placeholder="اكتب الأسئلة هنا..."
                    rows={15}
                    size="lg"
                  />
                </FormControl>
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetBulkForm}>
                إعادة تعيين
              </Button>
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleBulkSubmit}
                isLoading={submitLoading}
                loadingText="جاري الإنشاء..."
                leftIcon={<FaPlus />}
              >
                إضافة الأسئلة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Question Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaEdit color="green.500" />
              <Text>تعديل السؤال</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>نص السؤال</FormLabel>
                  <Textarea
                    name="text"
                    value={editFormData.text}
                    onChange={handleEditInputChange}
                    placeholder="أدخل نص السؤال"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>الخيارات</FormLabel>
                  <VStack spacing={3}>
                    {editFormData.options.map((option, index) => (
                      <Input
                        key={index}
                        name={`option${index}`}
                        value={option}
                        onChange={handleEditInputChange}
                        placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                        size="lg"
                      />
                    ))}
                  </VStack>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetEditForm}>
                إعادة تعيين
              </Button>
              <Button variant="ghost" onClick={onEditClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="green"
                onClick={handleEditSubmit}
                isLoading={editLoading}
                loadingText="جاري التحديث..."
                leftIcon={<FaEdit />}
              >
                تحديث السؤال
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaTrash color="red.500" />
              <Text>تأكيد الحذف</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box textAlign="center">
                <FaQuestionCircle size={48} color="red.400" style={{ margin: "0 auto 16px" }} />
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  هل أنت متأكد من حذف السؤال؟
                </Text>
                <Text mt={2} color="gray.600" fontSize="sm">
                  هذا الإجراء لا يمكن التراجع عنه
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onDeleteClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                isLoading={deleteLoading}
                loadingText="جاري الحذف..."
                leftIcon={<FaTrash />}
              >
                حذف السؤال
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Set Correct Answer Modal */}
      <Modal isOpen={isAnswerOpen} onClose={onAnswerClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaCheck color="green.500" />
              <Text>تحديد الإجابة الصحيحة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" color={textColor}>
                اختر الإجابة الصحيحة للسؤال:
              </Text>
              <Text fontSize="sm" color={headingColor} bg="gray.50" p={3} borderRadius="md">
                {currentQuestion?.text}
              </Text>
              
              <RadioGroup value={selectedAnswer} onChange={setSelectedAnswer}>
                <Stack spacing={3}>
                  {currentQuestion?.options?.map((option, index) => (
                    <Radio key={index} value={option} colorScheme="green">
                      <Text fontSize="sm">
                        {String.fromCharCode(65 + index)}) {option}
                      </Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onAnswerClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="green"
                onClick={handleAnswerSubmit}
                isLoading={answerLoading}
                loadingText="جاري الحفظ..."
                leftIcon={<FaCheck />}
              >
                حفظ الإجابة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Image Modal */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaImage color="purple.500" />
              <Text>إضافة صورة للسؤال</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6}>
              <Text fontSize="md" color={textColor}>
                السؤال: {currentQuestion?.text}
              </Text>
              
              <FormControl>
                <FormLabel>صورة السؤال</FormLabel>
                <VStack spacing={4} align="stretch">
                  {!imagePreview ? (
                    <Button
                      as="label"
                      htmlFor="image-upload"
                      leftIcon={<FaUpload />}
                      variant="outline"
                      size="lg"
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                    >
                      اختر صورة
                    </Button>
                  ) : (
                    <Box position="relative" display="inline-block">
                      <Image
                        src={imagePreview}
                        alt="معاينة الصورة"
                        maxH="200px"
                        borderRadius="md"
                      />
                      <IconButton
                        icon={<FaTimes />}
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="red"
                        size="sm"
                        onClick={removeImage}
                        aria-label="إزالة الصورة"
                      />
                    </Box>
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none"
                  />
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onImageClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleImageSubmit}
                isLoading={imageLoading}
                loadingText="جاري الرفع..."
                leftIcon={<FaImage />}
              >
                رفع الصورة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <ScrollToTop/>
    </Box>
  );
};

export default Lesson;
