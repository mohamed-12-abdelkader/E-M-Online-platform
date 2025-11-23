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
  
  // Colors for light/dark mode with blue.500 as primary
  const pageBg = useColorModeValue("blue.50", "gray.900");
  const cardBackground = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blue.100", "blue.900");
  const cardHoverBorder = useColorModeValue("blue.300", "blue.700");
  const textPrimary = useColorModeValue("blue.600", "blue.300");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("blue.50", "gray.700");
  const inputBorder = useColorModeValue("blue.200", "blue.800");
  const inputHoverBorder = useColorModeValue("blue.300", "blue.700");
  const inputFocusBorder = useColorModeValue("blue.500", "blue.400");
  const modalBg = useColorModeValue("white", "gray.800");
  const modalBorder = useColorModeValue("blue.200", "blue.900");
  const modalHeaderBg = useColorModeValue("blue.500", "blue.600");
  const modalFooterBg = useColorModeValue("blue.50", "gray.700");
  const buttonPrimary = useColorModeValue("blue.500", "blue.400");
  const buttonPrimaryHover = useColorModeValue("blue.600", "blue.500");
  const buttonSecondary = useColorModeValue("blue.400", "blue.500");
  const buttonSecondaryHover = useColorModeValue("blue.500", "blue.600");
  const iconBg = useColorModeValue("blue.50", "blue.900");
  const iconBorder = useColorModeValue("blue.200", "blue.800");
  const spinnerColor = useColorModeValue("blue.500", "blue.400");
  const badgeActiveBg = useColorModeValue("blue.100", "blue.900");
  const badgeActiveColor = useColorModeValue("blue.700", "blue.300");

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
    <Box minH="100vh" bg={pageBg} position="relative">
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={useColorModeValue(0.05, 0.1)}
        backgroundImage={useColorModeValue(
          "radial-gradient(circle at 25px 25px, blue.500 2px, transparent 0), radial-gradient(circle at 75px 75px, blue.500 2px, transparent 0)",
          "radial-gradient(circle at 25px 25px, blue.400 2px, transparent 0), radial-gradient(circle at 75px 75px, blue.400 2px, transparent 0)"
        )}
        backgroundSize="100px 100px"
      />
      
      {/* Header */}
      <Box
        as={motion.header}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        bg={headerBg}
        borderBottom="3px solid"
        borderColor={useColorModeValue("blue.500", "blue.400")}
        boxShadow={useColorModeValue("0 4px 20px rgba(66, 153, 225, 0.15)", "0 4px 20px rgba(0, 0, 0, 0.3)")}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
          <Flex align="center" gap={4}>
            <Box
              w="70px"
              h="70px"
              bg={buttonPrimary}
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow={useColorModeValue("0 8px 25px rgba(66, 153, 225, 0.4)", "0 8px 25px rgba(0, 0, 0, 0.4)")}
              transition="all 0.3s"
              _hover={{
                transform: "rotate(5deg) scale(1.05)",
                boxShadow: useColorModeValue("0 12px 35px rgba(66, 153, 225, 0.5)", "0 12px 35px rgba(0, 0, 0, 0.5)")
              }}
            >
              <Icon as={FiGrid} color="white" boxSize={7} />
            </Box>
            <Box>
              <Heading 
                size={{ base: "lg", md: "xl" }} 
                color={textPrimary}
                fontWeight="800"
                fontFamily="'Cairo', 'Tajawal', sans-serif"
                letterSpacing="-0.02em"
              >
                {questionBank.name}
              </Heading>
              <Text 
                color={textSecondary} 
                fontSize="md" 
                mt={1} 
                fontWeight="600"
                fontFamily="'Cairo', 'Tajawal', sans-serif"
              >
                إدارة بنك الأسئلة والمواد الدراسية
              </Text>
            </Box>
          </Flex>

          <MotionButton
            leftIcon={<FiPlus />}
            bg={buttonPrimary}
            color="white"
            onClick={onOpen}
            size={{ base: "md", md: "lg" }}
            borderRadius="12px"
            boxShadow={useColorModeValue("0 6px 20px rgba(66, 153, 225, 0.35)", "0 6px 20px rgba(0, 0, 0, 0.4)")}
            _hover={{
              transform: "translateY(-3px)",
              boxShadow: useColorModeValue("0 10px 30px rgba(66, 153, 225, 0.45)", "0 10px 30px rgba(0, 0, 0, 0.5)"),
              bg: buttonPrimaryHover
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            px={8}
            py={6}
            fontWeight="bold"
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
          bg={cardBackground}
          p={{ base: 6, md: 8 }}
          borderRadius="20px"
          boxShadow={useColorModeValue("0 8px 30px rgba(66, 153, 225, 0.12)", "0 8px 30px rgba(0, 0, 0, 0.3)")}
          mb={8}
          border="2px solid"
          borderColor={cardBorder}
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
            bg={iconBg}
            borderRadius="50%"
            opacity={0.5}
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="150px"
            h="150px"
            bg={iconBg}
            borderRadius="50%"
            opacity={0.5}
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
                  bg={buttonPrimary}
                  borderRadius="15px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mr={4}
                  boxShadow={useColorModeValue("0 4px 15px rgba(66, 153, 225, 0.35)", "0 4px 15px rgba(0, 0, 0, 0.4)")}
                >
                  <Icon as={FiBookOpen} color="white" boxSize={5} />
                </Box>
                <Box>
                  <Heading 
                    size={{ base: "lg", md: "xl" }} 
                    mb={2} 
                    color={textPrimary}
                    fontWeight="800"
                    fontFamily="'Cairo', 'Tajawal', sans-serif"
                    letterSpacing="-0.02em"
                  >
                    {questionBank.name}
                  </Heading>
                  <Text 
                    fontSize={{ base: "md", md: "lg" }} 
                    color={textSecondary} 
                    lineHeight="1.7"
                    fontWeight="500"
                    fontFamily="'Cairo', 'Tajawal', sans-serif"
                  >
                    {questionBank.description}
                  </Text>
                </Box>
              </Flex>
              
              <HStack spacing={4} flexWrap="wrap">
                <Badge
                  bg={buttonPrimary}
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="12px"
                  fontWeight="bold"
                  fontSize="sm"
                  boxShadow={useColorModeValue("0 4px 12px rgba(66, 153, 225, 0.3)", "0 4px 12px rgba(0, 0, 0, 0.3)")}
                >
                  {questionBank.grade_name}
                </Badge>
                <Badge
                  bg={questionBank.is_active ? badgeActiveBg : useColorModeValue("gray.200", "gray.600")}
                  color={questionBank.is_active ? badgeActiveColor : useColorModeValue("gray.600", "gray.300")}
                  px={4}
                  py={2}
                  borderRadius="12px"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {questionBank.is_active ? "نشط" : "غير نشط"}
                </Badge>
                <Badge
                  bg={iconBg}
                  color={textPrimary}
                  px={4}
                  py={2}
                  borderRadius="12px"
                  fontWeight="bold"
                  fontSize="sm"
                  border="2px solid"
                  borderColor={iconBorder}
                >
                  {filteredSubjects.length} مادة
                </Badge>
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
            bg={inputBg}
            borderRadius="12px"
            p={2}
            boxShadow={useColorModeValue("0 5px 15px rgba(66, 153, 225, 0.1)", "0 5px 15px rgba(0, 0, 0, 0.2)")}
            border="2px solid"
            borderColor={inputBorder}
            _hover={{ borderColor: inputHoverBorder }}
            transition="all 0.2s"
          >
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" pl={6}>
                <Icon as={FiSearch} color={useColorModeValue("#4299e1", "#63b3ed")} boxSize={5} />
              </InputLeftElement>
              <Input
                placeholder="ابحث عن مادة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="transparent"
                border="none"
                _hover={{ bg: useColorModeValue("blue.100", "gray.600") }}
                _focus={{
                  bg: useColorModeValue("blue.100", "gray.600"),
                  boxShadow: "none",
                  outline: "none"
                }}
                borderRadius="10px"
                py={6}
                pl={16}
                fontSize="lg"
                fontWeight="medium"
                color={textPrimary}
                _placeholder={{ color: useColorModeValue("blue.400", "blue.500") }}
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
                bg={buttonPrimary}
                borderRadius="15px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow={useColorModeValue("0 4px 15px rgba(66, 153, 225, 0.35)", "0 4px 15px rgba(0, 0, 0, 0.4)")}
              >
                <Icon as={FiBook} color="white" boxSize={5} />
              </Box>
              <Box>
                <Heading 
                  size="xl" 
                  color={textPrimary}
                  fontWeight="800"
                  fontFamily="'Cairo', 'Tajawal', sans-serif"
                  letterSpacing="-0.02em"
                  mb={1}
                >
                  المواد الدراسية
                </Heading>
                <Text 
                  color={textSecondary} 
                  fontSize="md" 
                  fontWeight="600"
                  fontFamily="'Cairo', 'Tajawal', sans-serif"
                >
                  {filteredSubjects.length} مادة متاحة
                </Text>
              </Box>
            </Flex>
          </Flex>

          {filteredSubjects.length === 0 ? (
            <MotionBox
              textAlign="center"
              py={16}
              bg={cardBackground}
              borderRadius="20px"
              boxShadow={useColorModeValue("0 8px 30px rgba(66, 153, 225, 0.12)", "0 8px 30px rgba(0, 0, 0, 0.3)")}
              border="2px solid"
              borderColor={cardBorder}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                w="120px"
                h="120px"
                bg={iconBg}
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={6}
                border="3px solid"
                borderColor={iconBorder}
              >
                <FiBook size={50} color={useColorModeValue("#4299e1", "#63b3ed")} />
              </Box>
              <Heading 
                size="lg" 
                color={textPrimary} 
                mb={3} 
                fontWeight="800"
                fontFamily="'Cairo', 'Tajawal', sans-serif"
                letterSpacing="-0.01em"
              >
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مواد دراسية بعد"}
              </Heading>
              <Text 
                color={useColorModeValue("blue.500", "blue.400")} 
                fontSize="lg" 
                mb={8} 
                fontWeight="600"
                fontFamily="'Cairo', 'Tajawal', sans-serif"
              >
                {searchTerm ? "جرب البحث بكلمات مختلفة" : "ابدأ بإضافة أول مادة دراسية"}
              </Text>
              {!searchTerm && (
                <MotionButton
                  bg={buttonPrimary}
                  color="white"
                  size="lg"
                  borderRadius="12px"
                  boxShadow={useColorModeValue("0 6px 20px rgba(66, 153, 225, 0.35)", "0 6px 20px rgba(0, 0, 0, 0.4)")}
                  onClick={onOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  px={8}
                  py={6}
                  leftIcon={<FiPlus />}
                  fontWeight="bold"
                  _hover={{
                    bg: buttonPrimaryHover,
                    boxShadow: useColorModeValue("0 10px 30px rgba(66, 153, 225, 0.45)", "0 10px 30px rgba(0, 0, 0, 0.5)")
                  }}
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
                  bg={cardBackground}
                  borderRadius="20px"
                  border="2px solid"
                  borderColor={cardBorder}
                  boxShadow={useColorModeValue("0 8px 25px rgba(66, 153, 225, 0.15)", "0 8px 25px rgba(0, 0, 0, 0.3)")}
                  overflow="hidden"
                  position="relative"
                  whileHover={{ 
                    y: -5,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  _hover={{
                    boxShadow: useColorModeValue("0 15px 40px rgba(66, 153, 225, 0.25)", "0 15px 40px rgba(0, 0, 0, 0.4)"),
                    borderColor: cardHoverBorder
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  custom={index}
                >
                  {/* Top Border */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="5px"
                    bg={buttonPrimary}
                  />

                  {/* Decorative Element */}
                  <Box
                    position="absolute"
                    top="-30px"
                    right="-30px"
                    w="100px"
                    h="100px"
                    bg={iconBg}
                    borderRadius="50%"
                    opacity={0.5}
                  />

                  <CardHeader pb={4} position="relative" zIndex={1}>
                    {subject.image_url && (
                      <Box mb={6} position="relative" borderRadius="15px" overflow="hidden">
                        <Image
                          src={subject.image_url}
                          alt={subject.name}
                          borderRadius="15px"
                          maxH="220px"
                          objectFit="cover"
                          w="full"
                          boxShadow={useColorModeValue("0 8px 20px rgba(66, 153, 225, 0.2)", "0 8px 20px rgba(0, 0, 0, 0.3)")}
                          transition="transform 0.3s"
                          _hover={{ transform: "scale(1.05)" }}
                        />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg={useColorModeValue("rgba(66, 153, 225, 0.1)", "rgba(66, 153, 225, 0.2)")}
                          borderRadius="15px"
                          opacity={0}
                          transition="all 0.3s"
                          _hover={{ opacity: 1 }}
                        />
                      </Box>
                    )}
                    
                    <Flex align="flex-start" mb={4} gap={4}>
                      <Box
                        w="60px"
                        h="60px"
                        bg={buttonPrimary}
                        borderRadius="15px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        boxShadow={useColorModeValue("0 6px 20px rgba(66, 153, 225, 0.4)", "0 6px 20px rgba(0, 0, 0, 0.4)")}
                        transition="all 0.3s"
                        _hover={{
                          transform: "rotate(5deg) scale(1.1)",
                          boxShadow: useColorModeValue("0 8px 25px rgba(66, 153, 225, 0.5)", "0 8px 25px rgba(0, 0, 0, 0.5)")
                        }}
                      >
                        <Icon as={FiBookOpen} color="white" boxSize={6} />
                      </Box>
                      <Box flex={1} minW={0}>
                        <Heading 
                          size="lg" 
                          color={textPrimary}
                          fontWeight="800"
                          mb={3}
                          fontFamily="'Cairo', 'Tajawal', sans-serif"
                          lineHeight="1.3"
                          letterSpacing="-0.02em"
                        >
                          {subject.name}
                        </Heading>
                        {subject.description && (
                          <Text 
                            fontSize="md" 
                            color={textSecondary} 
                            noOfLines={3} 
                            lineHeight="1.7"
                            fontWeight="500"
                            fontFamily="'Cairo', 'Tajawal', sans-serif"
                          >
                            {subject.description}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </CardHeader>

                  <CardBody py={4} position="relative" zIndex={1} bg={iconBg} borderRadius="12px" mb={4}>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between" flexWrap="wrap" gap={2}>
                        <Badge
                          bg={subject.is_active ? buttonPrimary : useColorModeValue("gray.300", "gray.600")}
                          color="white"
                          px={4}
                          py={2}
                          borderRadius="10px"
                          fontSize="sm"
                          fontWeight="700"
                          fontFamily="'Cairo', 'Tajawal', sans-serif"
                          boxShadow={useColorModeValue("0 3px 10px rgba(66, 153, 225, 0.3)", "0 3px 10px rgba(0, 0, 0, 0.3)")}
                        >
                          {subject.is_active ? "✓ نشط" : "✗ غير نشط"}
                        </Badge>
                        <HStack spacing={2}>
                          <Icon as={FiAward} color={useColorModeValue("blue.400", "blue.500")} boxSize={4} />
                          <Text 
                            fontSize="sm" 
                            color={textPrimary} 
                            fontWeight="600"
                            fontFamily="'Cairo', 'Tajawal', sans-serif"
                          >
                            {new Date(subject.created_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>

                  <CardFooter pt={0} position="relative" zIndex={1}>
                    <VStack spacing={3} w="full">
                      <HStack spacing={3} w="full">
                        <MotionButton
                          as={IconButton}
                          icon={<FiEdit />}
                          size="md"
                          bg={buttonSecondary}
                          color="white"
                          borderRadius="12px"
                          onClick={() => handleEditClick(subject)}
                          aria-label="تعديل المادة"
                          boxShadow={useColorModeValue("0 5px 15px rgba(66, 153, 225, 0.35)", "0 5px 15px rgba(0, 0, 0, 0.4)")}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          _hover={{ 
                            bg: buttonSecondaryHover,
                            boxShadow: useColorModeValue("0 8px 20px rgba(66, 153, 225, 0.45)", "0 8px 20px rgba(0, 0, 0, 0.5)")
                          }}
                          transition="all 0.2s"
                        />
                        <MotionButton
                          as={IconButton}
                          icon={<FiTrash />}
                          size="md"
                          bg={useColorModeValue("blue.300", "blue.600")}
                          color="white"
                          borderRadius="12px"
                          onClick={() => handleDeleteClick(subject)}
                          aria-label="حذف المادة"
                          boxShadow={useColorModeValue("0 5px 15px rgba(66, 153, 225, 0.35)", "0 5px 15px rgba(0, 0, 0, 0.4)")}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          _hover={{ 
                            bg: useColorModeValue("blue.400", "blue.700"),
                            boxShadow: useColorModeValue("0 8px 20px rgba(66, 153, 225, 0.45)", "0 8px 20px rgba(0, 0, 0, 0.5)")
                          }}
                          transition="all 0.2s"
                        />
                        <Link to={`/supject/${subject.id}`} style={{ flex: 1 }}>
                          <MotionButton
                            rightIcon={<FiArrowRight />}
                            bg={buttonPrimary}
                            color="white"
                            w="full"
                            size="md"
                            borderRadius="12px"
                            boxShadow={useColorModeValue("0 5px 15px rgba(66, 153, 225, 0.35)", "0 5px 15px rgba(0, 0, 0, 0.4)")}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            _hover={{ 
                              bg: buttonPrimaryHover,
                              boxShadow: useColorModeValue("0 8px 20px rgba(66, 153, 225, 0.45)", "0 8px 20px rgba(0, 0, 0, 0.5)")
                            }}
                            fontWeight="700"
                            fontSize="md"
                            fontFamily="'Cairo', 'Tajawal', sans-serif"
                            letterSpacing="0.02em"
                            transition="all 0.2s"
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
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={modalBg} borderRadius="20px" border="2px solid" borderColor={modalBorder}>
          <ModalHeader bg={modalHeaderBg} color="white" borderRadius="18px 18px 0 0" py={4}>
            <HStack>
              <Box
                w="40px"
                h="40px"
                bg="white"
                borderRadius="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiPlus color="#4299e1" size={18} />
              </Box>
              <Text fontSize="xl" fontWeight="bold">إضافة مادة جديدة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: buttonPrimaryHover }} />
          
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold">اسم المادة</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المادة"
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">وصف المادة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف المادة"
                    rows={4}
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">صورة المادة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        leftIcon={<FiUpload />}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        border="2px solid"
                        borderColor={inputHoverBorder}
                        color={useColorModeValue("blue.500", "blue.400")}
                        _hover={{ bg: iconBg, borderColor: inputFocusBorder }}
                        borderRadius="10px"
                        fontWeight="bold"
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

          <ModalFooter bg={modalFooterBg} borderRadius="0 0 18px 18px" py={4}>
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={resetForm}
                color={textPrimary}
                _hover={{ bg: iconBg }}
                fontWeight="bold"
              >
                إعادة تعيين
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose}
                color={textPrimary}
                _hover={{ bg: iconBg }}
                fontWeight="bold"
              >
                إلغاء
              </Button>
              <Button
                bg={buttonPrimary}
                color="white"
                onClick={handleSubmit}
                isLoading={submitLoading}
                loadingText="جاري الإنشاء..."
                leftIcon={<FiPlus />}
                _hover={{ bg: buttonPrimaryHover, transform: "translateY(-2px)" }}
                boxShadow={useColorModeValue("0 4px 15px rgba(66, 153, 225, 0.35)", "0 4px 15px rgba(0, 0, 0, 0.4)")}
                borderRadius="10px"
                fontWeight="bold"
                transition="all 0.2s"
              >
                إضافة المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={modalBg} borderRadius="20px" border="2px solid" borderColor={modalBorder}>
          <ModalHeader bg={buttonSecondary} color="white" borderRadius="18px 18px 0 0" py={4}>
            <HStack>
              <Box
                w="40px"
                h="40px"
                bg="white"
                borderRadius="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiEdit color="#4299e1" size={18} />
              </Box>
              <Text fontSize="xl" fontWeight="bold">تعديل المادة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: buttonSecondaryHover }} />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold">اسم المادة</FormLabel>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="أدخل اسم المادة"
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">وصف المادة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="أدخل وصف المادة"
                    rows={4}
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">صورة المادة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="edit-image-upload"
                        leftIcon={<FiUpload />}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        border="2px solid"
                        borderColor={inputHoverBorder}
                        color={useColorModeValue("blue.500", "blue.400")}
                        _hover={{ bg: iconBg, borderColor: inputFocusBorder }}
                        borderRadius="10px"
                        fontWeight="bold"
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

          <ModalFooter bg={modalFooterBg} borderRadius="0 0 18px 18px" py={4}>
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={resetEditForm}
                color={textPrimary}
                _hover={{ bg: iconBg }}
                fontWeight="bold"
              >
                إعادة تعيين
              </Button>
              <Button 
                variant="ghost" 
                onClick={onEditClose}
                color={textPrimary}
                _hover={{ bg: iconBg }}
                fontWeight="bold"
              >
                إلغاء
              </Button>
              <Button
                bg={buttonSecondary}
                color="white"
                onClick={handleEditSubmit}
                isLoading={editLoading}
                loadingText="جاري التحديث..."
                leftIcon={<FiEdit />}
                _hover={{ bg: buttonSecondaryHover, transform: "translateY(-2px)" }}
                boxShadow={useColorModeValue("0 4px 15px rgba(66, 153, 225, 0.35)", "0 4px 15px rgba(0, 0, 0, 0.4)")}
                borderRadius="10px"
                fontWeight="bold"
                transition="all 0.2s"
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