import React, { useState, useEffect } from 'react';
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
  Avatar,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Button,
  Icon,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Image,
  IconButton,
  Spinner,
  HStack,
  VStack,
  Badge,
  Divider
} from '@chakra-ui/react';
import {
  FiBook,
  FiBookOpen,
  FiAward,
  FiSearch,
  FiArrowRight,
  FiGrid,
  FiUser,
  FiPlus,
  FiEdit,
  FiTrash,
  FiUpload,
  FiX
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import baseUrl from '../../api/baseUrl';

// مكونات Motion لإضافة الحركات
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const QuestionBank = () => {
  const { id } = useParams();
  const toast = useToast();
  
  // States
  const [questionBank, setQuestionBank] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Edit states
  const [editingSubject, setEditingSubject] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: ''
  });
  
  // Loading states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingSubject, setDeletingSubject] = useState(null);

  // ألوان مخصصة للثيم الفاتح والداكن
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const accentLightBg = useColorModeValue("blue.50", "blue.900");

  // Fetch question bank data
  const fetchQuestionBankData = async () => {
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

      const response = await baseUrl.get(`/api/question-banks/${id}/with-subjects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Question Bank API Response:", response.data);
      
      if (response.data.success) {
        setQuestionBank(response.data.data.question_bank);
        setSubjects(response.data.data.subjects);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب بيانات بنك الأسئلة";
      setError(errorMsg);
      console.error("Error fetching question bank:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new subject
  const createSubject = async (formData) => {
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

      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description);
      
      if (selectedImage) {
        submitFormData.append("image", selectedImage);
      }

      console.log("Creating subject with data:", formData);
      
      const response = await baseUrl.post(`/api/question-banks/${id}/subjects`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Create Subject API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم إنشاء المادة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating subject:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء المادة";
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

  // Update subject
  const updateSubject = async (formData) => {
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

      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description);
      
      if (selectedImage) {
        submitFormData.append("image", selectedImage);
      }

      console.log("Updating subject:", editingSubject.id);
      
      const response = await baseUrl.put(`/api/subjects/${editingSubject.id}`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update Subject API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم تحديث المادة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating subject:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث المادة";
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

  // Delete subject
  const deleteSubject = async () => {
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

      console.log("Deleting subject:", deletingSubject.id);
      
      const response = await baseUrl.delete(`/api/subjects/${deletingSubject.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete Subject API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم حذف المادة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting subject:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف المادة";
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

  // Load data on component mount
  useEffect(() => {
    fetchQuestionBankData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم المادة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await createSubject(formData);
    
    if (result.success) {
      onClose();
      resetForm();
      fetchQuestionBankData(); // Refresh data
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم المادة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await updateSubject(editFormData);
    
    if (result.success) {
      onEditClose();
      resetEditForm();
      fetchQuestionBankData(); // Refresh data
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteSubject();
    
    if (result.success) {
      onDeleteClose();
      setDeletingSubject(null);
      fetchQuestionBankData(); // Refresh data
    }
  };

  // Reset forms
  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const resetEditForm = () => {
    setEditFormData({ name: '', description: '' });
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle edit button click
  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setEditFormData({
      name: subject.name,
      description: subject.description || ''
    });
    setImagePreview(subject.image_url);
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (subject) => {
    setDeletingSubject(subject);
    onDeleteOpen();
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <Flex minH="100vh" bg={bgColor} justify="center" align="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={accentColor} />
          <Text color={textColor}>جاري تحميل بيانات بنك الأسئلة...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" bg={bgColor} justify="center" align="center">
        <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
          <Text color="red.600">خطأ في تحميل البيانات: {error}</Text>
        </Box>
      </Flex>
    );
  }

  if (!questionBank) {
    return (
      <Flex minH="100vh" bg={bgColor} justify="center" align="center">
        <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
          <Text color="red.600">لم يتم العثور على بنك الأسئلة</Text>
        </Box>
      </Flex>
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
        as={motion.header}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        position="sticky"
        top={0}
        zIndex={10}
      
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
          <Flex align="center" gap={4}>
            <Box
              w="60px"
              h="60px"
              bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 10px 30px rgba(102, 126, 234, 0.3)"
            >
              <Icon as={FiGrid} color="white" boxSize={6} />
            </Box>
            <Box>
              <Heading 
                size={{ base: "lg", md: "xl" }} 
                bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                bgClip="text"
                fontWeight="bold"
              >
                {questionBank.name}
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                إدارة بنك الأسئلة والمواد الدراسية
              </Text>
            </Box>
          </Flex>

          <MotionButton
            leftIcon={<FiPlus />}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            onClick={onOpen}
            size={{ base: "md", md: "lg" }}
            borderRadius="15px"
            boxShadow="0 10px 30px rgba(102, 126, 234, 0.3)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            px={8}
            py={6}
          >
            إضافة مادة جديدة
          </MotionButton>
        </Flex>
      </Box>

      {/* Main Content */}
      <MotionBox
        flex={1}
        p={{ base: 4, md: 8 }}
        maxW="1400px"
        mx="auto"
        w="full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        position="relative"
        zIndex={1}
      >
        {/* Question Bank Info */}
        <MotionBox
          variants={itemVariants}
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(20px)"
          p={{ base: 6, md: 8 }}
          borderRadius="25px"
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
          mb={8}
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative Elements */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="200px"
            h="200px"
            bg="linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
            borderRadius="50%"
            filter="blur(40px)"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="150px"
            h="150px"
            bg="linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)"
            borderRadius="50%"
            filter="blur(30px)"
          />

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            wrap="wrap"
            position="relative"
            zIndex={1}
          >
            <Box mb={{ base: 6, md: 0 }} flex={1}>
              <Flex align="center" mb={4}>
                <Box
                  w="50px"
                  h="50px"
                  bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                  borderRadius="15px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mr={4}
                  boxShadow="0 8px 25px rgba(102, 126, 234, 0.3)"
                >
                  <Icon as={FiBookOpen} color="white" boxSize={5} />
                </Box>
                <Box>
                  <Heading 
                    size={{ base: "lg", md: "xl" }} 
                    mb={2} 
                    bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                    bgClip="text"
                    fontWeight="bold"
                  >
                    {questionBank.name}
                  </Heading>
                  <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" lineHeight="1.6">
                    {questionBank.description}
                  </Text>
                </Box>
              </Flex>
              
              <HStack spacing={4} flexWrap="wrap">
                <Box
                  bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="20px"
                  fontWeight="medium"
                  fontSize="sm"
                  boxShadow="0 5px 15px rgba(49, 130, 206, 0.3)"
                >
                  {questionBank.grade_name}
                </Box>
                <Box
                  bg={questionBank.is_active ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)" : "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"}
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="20px"
                  fontWeight="medium"
                  fontSize="sm"
                  boxShadow={questionBank.is_active ? "0 5px 15px rgba(72, 187, 120, 0.3)" : "0 5px 15px rgba(245, 101, 101, 0.3)"}
                >
                  {questionBank.is_active ? "نشط" : "غير نشط"}
                </Box>
                <Box
                  bg="rgba(102, 126, 234, 0.1)"
                  color="#3182ce"
                  px={4}
                  py={2}
                  borderRadius="20px"
                  fontWeight="medium"
                  fontSize="sm"
                  border="1px solid"
                                      borderColor="rgba(49, 130, 206, 0.2)"
                >
                  {filteredSubjects.length} مادة
                </Box>
              </HStack>
            </Box>

            {questionBank.image_url && (
              <Box position="relative">
                <Image
                  src={questionBank.image_url}
                  alt={questionBank.name}
                  maxH="150px"
                  maxW="200px"
                  borderRadius="20px"
                  objectFit="cover"
                  boxShadow="0 15px 35px rgba(0, 0, 0, 0.15)"
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="linear-gradient(45deg, rgba(49, 130, 206, 0.1), rgba(44, 90, 160, 0.1))"
                  borderRadius="20px"
                  opacity={0}
                  transition="all 0.3s"
                  _hover={{ opacity: 1 }}
                />
              </Box>
            )}
          </Flex>
        </MotionBox>

        {/* Search Bar */}
        <MotionBox variants={itemVariants} mb={8}>
          <Box
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(20px)"
            borderRadius="25px"
            p={2}
            boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" pl={6}>
                <Icon as={FiSearch} color="#3182ce" boxSize={5} />
              </InputLeftElement>
              <Input
                placeholder="ابحث عن مادة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="transparent"
                border="none"
                _hover={{ bg: "transparent" }}
                _focus={{
                  bg: "transparent",
                  boxShadow: "none",
                  outline: "none"
                }}
                borderRadius="20px"
                py={6}
                pl={16}
                fontSize="lg"
                fontWeight="medium"
                color="gray.700"
                _placeholder={{ color: "gray.500" }}
              />
            </InputGroup>
          </Box>
        </MotionBox>

        {/* Subjects Section */}
        <MotionBox variants={itemVariants}>
          <Flex justify="space-between" align="center" mb={8}>
            <Flex align="center" gap={4}>
              <Box
                w="50px"
                h="50px"
                bg="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                borderRadius="15px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 25px rgba(72, 187, 120, 0.3)"
              >
                <Icon as={FiBook} color="white" boxSize={5} />
              </Box>
              <Box>
                <Heading 
                  size="xl" 
                  bgGradient="linear(to-r, #48bb78, #38a169)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  المواد الدراسية
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {filteredSubjects.length} مادة متاحة
                </Text>
              </Box>
            </Flex>
          </Flex>

          {filteredSubjects.length === 0 ? (
            <MotionBox
              textAlign="center"
              py={16}
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(20px)"
              borderRadius="25px"
              boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                w="100px"
                h="100px"
                bg="linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={6}
              >
                <FiBook size={40} color="#3182ce" />
              </Box>
              <Heading size="lg" color="gray.700" mb={3}>
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مواد دراسية بعد"}
              </Heading>
              <Text color="gray.500" fontSize="lg" mb={6}>
                {searchTerm ? "جرب البحث بكلمات مختلفة" : "ابدأ بإضافة أول مادة دراسية"}
              </Text>
              {!searchTerm && (
                <MotionButton
                  bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                  color="white"
                  size="lg"
                  borderRadius="15px"
                  boxShadow="0 10px 30px rgba(102, 126, 234, 0.3)"
                  onClick={onOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  px={8}
                  py={6}
                  leftIcon={<FiPlus />}
                >
                  إضافة أول مادة
                </MotionButton>
              )}
            </MotionBox>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredSubjects.map((subject, index) => (
                <MotionCard
                  key={subject.id}
                  variants={itemVariants}
                  bg="rgba(255, 255, 255, 0.95)"
                  backdropFilter="blur(20px)"
                  borderRadius="25px"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
                  overflow="hidden"
                  position="relative"
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  _hover={{
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                    borderColor: "rgba(49, 130, 206, 0.3)"
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  custom={index}
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
                    {subject.image_url && (
                      <Box mb={6} position="relative">
                        <Image
                          src={subject.image_url}
                          alt={subject.name}
                          borderRadius="20px"
                          maxH="200px"
                          objectFit="cover"
                          w="full"
                          boxShadow="0 10px 25px rgba(0, 0, 0, 0.1)"
                        />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="linear-gradient(45deg, rgba(49, 130, 206, 0.1), rgba(44, 90, 160, 0.1))"
                          borderRadius="20px"
                          opacity={0}
                          transition="all 0.3s"
                          _hover={{ opacity: 1 }}
                        />
                      </Box>
                    )}
                    
                    <Flex align="center" mb={4}>
                      <Box
                        w="40px"
                        h="40px"
                        bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                        borderRadius="12px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mr={3}
                        boxShadow="0 5px 15px rgba(49, 130, 206, 0.3)"
                      >
                        <Icon as={FiBookOpen} color="white" boxSize={4} />
                      </Box>
                      <Box flex={1}>
                        <Heading 
                          size="md" 
                          bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                          bgClip="text"
                          fontWeight="bold"
                          mb={1}
                        >
                          {subject.name}
                        </Heading>
                        {subject.description && (
                          <Text fontSize="sm" color="gray.600" noOfLines={2} lineHeight="1.5">
                            {subject.description}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </CardHeader>

                  <CardBody py={4} position="relative" zIndex={1}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" flexWrap="wrap">
                        <Box
                          bg={subject.is_active ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)" : "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"}
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="15px"
                          fontSize="xs"
                          fontWeight="medium"
                          boxShadow={subject.is_active ? "0 3px 10px rgba(72, 187, 120, 0.3)" : "0 3px 10px rgba(245, 101, 101, 0.3)"}
                        >
                          {subject.is_active ? "نشط" : "غير نشط"}
                        </Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                          {new Date(subject.created_at).toLocaleDateString('ar-EG')}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>

                  <CardFooter pt={0} position="relative" zIndex={1}>
                    <VStack spacing={3} w="full">
                      <HStack spacing={2} w="full">
                        <MotionButton
                          as={IconButton}
                          icon={<FiEdit />}
                          size="sm"
                          bg="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                          color="white"
                          borderRadius="12px"
                          onClick={() => handleEditClick(subject)}
                          aria-label="تعديل المادة"
                          boxShadow="0 5px 15px rgba(72, 187, 120, 0.3)"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          _hover={{ bg: "linear-gradient(135deg, #38a169 0%, #2f855a 100%)" }}
                        />
                        <MotionButton
                          as={IconButton}
                          icon={<FiTrash />}
                          size="sm"
                          bg="linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"
                          color="white"
                          borderRadius="12px"
                          onClick={() => handleDeleteClick(subject)}
                          aria-label="حذف المادة"
                          boxShadow="0 5px 15px rgba(245, 101, 101, 0.3)"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          _hover={{ bg: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)" }}
                        />
                        <Link to={`/supject/${subject.id}`} style={{ flex: 1 }}>
                          <MotionButton
                            rightIcon={<FiArrowRight />}
                            bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                            color="white"
                            w="full"
                            size="sm"
                            borderRadius="12px"
                            boxShadow="0 5px 15px rgba(49, 130, 206, 0.3)"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            _hover={{ bg: "linear-gradient(135deg, #2c5aa0 0%, #2a4d8f 100%)" }}
                            fontWeight="medium"
                          >
                            عرض الأسئلة
                          </MotionButton>
                        </Link>
                      </HStack>
                    </VStack>
                  </CardFooter>
                </MotionCard>
              ))}
            </SimpleGrid>
          )}
        </MotionBox>
      </MotionBox>
      {/* Add Subject Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack>
              <FiPlus color="blue.500" />
              <Text>إضافة مادة جديدة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>اسم المادة</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المادة"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>وصف المادة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف المادة"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>صورة المادة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        leftIcon={<FiUpload />}
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
                          icon={<FiX />}
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
            </form>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetForm}>
                إعادة تعيين
              </Button>
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={submitLoading}
                loadingText="جاري الإنشاء..."
                leftIcon={<FiPlus />}
              >
                إضافة المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack>
              <FiEdit color="green.500" />
              <Text>تعديل المادة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>اسم المادة</FormLabel>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="أدخل اسم المادة"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>وصف المادة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="أدخل وصف المادة"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>صورة المادة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="edit-image-upload"
                        leftIcon={<FiUpload />}
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
                          icon={<FiX />}
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
                      id="edit-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      display="none"
                    />
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
                leftIcon={<FiEdit />}
              >
                تحديث المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack>
              <FiTrash color="red.500" />
              <Text>تأكيد الحذف</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box textAlign="center">
                <FiBook size={48} color="red.400" style={{ margin: "0 auto 16px" }} />
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  هل أنت متأكد من حذف المادة؟
                </Text>
                <Text mt={2} color="gray.600">
                  "{deletingSubject?.name}"
                </Text>
                <Text mt={2} color="gray.500" fontSize="sm">
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
                leftIcon={<FiTrash />}
              >
                حذف المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionBank;