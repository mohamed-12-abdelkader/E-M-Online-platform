import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
  Container,
  Image,
  IconButton,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Flex,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider
} from "@chakra-ui/react";
import { 
  FaUpload, 
  FaTimes, 
  FaPlus, 
  FaSearch, 
  FaBook, 
  FaGraduationCap,
  FaEye,
  FaEdit,
  FaTrash,
  FaDollarSign
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const QuestionBankDashboard = () => {
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grade_id: "",
    is_active: true,
    price: 0
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Data states
  const [grades, setGrades] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  
  // Loading states
  const [gradesLoading, setGradesLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Error states
  const [gradesError, setGradesError] = useState(null);
  const [banksError, setBanksError] = useState(null);
  
  // Filter state
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  // Edit and delete states
  const [editingBank, setEditingBank] = useState(null);
  const [deletingBank, setDeletingBank] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "gray.700");
  
  // Colors for light/dark mode
  const pageBg = useColorModeValue("blue.50", "gray.900");
  const headerBg = useColorModeValue("white", "gray.800");
  const headerBorder = useColorModeValue("blue.500", "blue.400");
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
  const buttonTertiary = useColorModeValue("blue.300", "blue.600");
  const buttonTertiaryHover = useColorModeValue("blue.400", "blue.700");
  const iconBg = useColorModeValue("blue.50", "blue.900");
  const iconBorder = useColorModeValue("blue.200", "blue.800");
  const spinnerColor = useColorModeValue("blue.500", "blue.400");
  const badgeActiveBg = useColorModeValue("blue.100", "blue.900");
  const badgeActiveColor = useColorModeValue("blue.700", "blue.300");

  // Fetch grades from API
  const fetchGrades = async () => {
    try {
      setGradesLoading(true);
      setGradesError(null);
      
      const response = await baseUrl.get("/api/users/grades");
      console.log("Grades API Response:", response.data);
      setGrades(response.data.grades);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب الصفوف";
      setGradesError(errorMsg);
      console.error("Error fetching grades:", err);
    } finally {
      setGradesLoading(false);
    }
  };

  // Fetch question banks from API
  const fetchQuestionBanks = async () => {
    try {
      setBanksLoading(true);
      setBanksError(null);
      
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

      const response = await baseUrl.get("/api/question-banks", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      console.log("Question Banks API Response:", response.data);
      // البيانات تأتي في response.data.data مباشرة كـ array
      const banks = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data?.question_banks || [];
      console.log("Extracted banks:", banks);
      console.log("Banks type:", typeof banks);
      console.log("Is array:", Array.isArray(banks));
      setQuestionBanks(banks);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب بنوك الأسئلة";
      setBanksError(errorMsg);
      console.error("Error fetching question banks:", err);
    } finally {
      setBanksLoading(false);
    }
  };

  // Create question bank
  const createQuestionBank = async (formData) => {
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

      console.log("Token:", token);
      console.log("Form Data being sent:", formData);
      
      // Log each field separately
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await baseUrl.post("api/question-banks", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم إنشاء بنك الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating question bank:", error);
      console.error("Error response:", error.response);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء بنك الأسئلة";
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

  // Filter question banks
  useEffect(() => {
    console.log("Filter useEffect triggered");
    console.log("questionBanks:", questionBanks);
    console.log("questionBanks type:", typeof questionBanks);
    console.log("Is array:", Array.isArray(questionBanks));
    
    // تأكد من أن questionBanks هو array
    if (!Array.isArray(questionBanks)) {
      console.log("questionBanks is not an array, setting filteredBanks to empty array");
      setFilteredBanks([]);
      return;
    }
    
    let filtered = questionBanks;
    
    if (selectedGradeFilter) {
      filtered = filtered.filter(bank => bank.grade_id == selectedGradeFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(bank => 
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bank.description && bank.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    console.log("Filtered banks:", filtered);
    setFilteredBanks(filtered);
  }, [questionBanks, selectedGradeFilter, searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchGrades();
    fetchQuestionBanks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    console.log(`Field ${name} changed to:`, newValue);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      console.log("Selected image:", file);
      console.log("Image name:", file.name);
      console.log("Image size:", file.size, "bytes");
      console.log("Image type:", file.type);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    console.log("Image removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", formData);
    console.log("Selected image:", selectedImage);
    
    if (!formData.name || !formData.grade_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم بنك الأسئلة والصف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("description", formData.description);
    submitFormData.append("grade_id", formData.grade_id);
    submitFormData.append("is_active", formData.is_active);
    submitFormData.append("price", formData.price ?? 0);
    
    if (selectedImage) {
      submitFormData.append("image", selectedImage);
    }

    console.log("FormData object created:");
    console.log("FormData entries:");
    for (let [key, value] of submitFormData.entries()) {
      console.log(`${key}:`, value);
    }

    const result = await createQuestionBank(submitFormData);
    
    if (result.success) {
      console.log("Question bank created successfully:", result.data);
      
      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        grade_id: "",
        is_active: true
      });
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
      
      // Refresh question banks
      fetchQuestionBanks();
      
      console.log("Form reset completed");
    } else {
      console.log("Failed to create question bank:", result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      grade_id: "",
      is_active: true,
      price: 0
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getGradeName = (gradeId) => {
    // البيانات تأتي مع grade_name مباشرة
    return "غير محدد";
  };

  // Handle edit button click
  const handleEditClick = (bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      description: bank.description || "",
      grade_id: bank.grade_id,
      is_active: bank.is_active,
      price: bank.price ?? 0
    });
    setImagePreview(bank.image_url);
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (bank) => {
    setDeletingBank(bank);
    onDeleteOpen();
  };

  // Update question bank
  const updateQuestionBank = async (formData) => {
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

      console.log("Updating question bank:", editingBank.id);
      console.log("Form Data being sent:", formData);
      
      const response = await baseUrl.put(`api/question-banks/${editingBank.id}`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم تحديث بنك الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating question bank:", error);
      console.error("Error response:", error.response);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث بنك الأسئلة";
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

  // Delete question bank
  const deleteQuestionBank = async () => {
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

      console.log("Deleting question bank:", deletingBank.id);
      
      const response = await baseUrl.delete(`api/question-banks/${deletingBank.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم حذف بنك الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting question bank:", error);
      console.error("Error response:", error.response);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف بنك الأسئلة";
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

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم بنك الأسئلة والصف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("description", formData.description);
    submitFormData.append("grade_id", formData.grade_id);
    submitFormData.append("is_active", formData.is_active);
    submitFormData.append("price", formData.price ?? 0);
    
    if (selectedImage) {
      submitFormData.append("image", selectedImage);
    }

    const result = await updateQuestionBank(submitFormData);
    
    if (result.success) {
      onEditClose();
      fetchQuestionBanks(); // Refresh the list
      resetForm();
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteQuestionBank();
    
    if (result.success) {
      onDeleteClose();
      fetchQuestionBanks(); // Refresh the list
      setDeletingBank(null);
    }
  };

  if (gradesError || banksError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
          <Text color="red.600">
            {gradesError && `خطأ في تحميل الصفوف: ${gradesError}`}
            {banksError && `خطأ في تحميل بنوك الأسئلة: ${banksError}`}
          </Text>
        </Box>
      </Container>
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
        bg={headerBg}
        borderBottom="3px solid"
        borderColor={headerBorder}
        boxShadow={useColorModeValue("0 4px 20px rgba(66, 153, 225, 0.15)", "0 4px 20px rgba(0, 0, 0, 0.3)")}
        position="sticky"
        top={0}
        zIndex={10}
        mt="0px"
      >
        <Container maxW="container.xl" py={6}>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={4}>
              <Box
                w="70px"
                h="70px"
                bg="blue.500"
                borderRadius="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 25px rgba(66, 153, 225, 0.4)"
                transition="all 0.3s"
                _hover={{
                  transform: "rotate(5deg) scale(1.05)",
                  boxShadow: "0 12px 35px rgba(66, 153, 225, 0.5)"
                }}
              >
                <FaBook size={28} color="white" />
              </Box>
              <Box>
                <Heading 
                  as="h1" 
                  size="xl" 
                  color={textPrimary}
                  fontWeight="bold"
                  mb={1}
                >
                  بنوك الأسئلة
                </Heading>
                <Text color={textSecondary} fontSize="md" fontWeight="medium">
                  إدارة وإنشاء بنوك الأسئلة للمراحل الدراسية المختلفة
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch">

        {/* Controls */}
        <Box
          bg={cardBackground}
          borderRadius="20px"
          p={6}
          boxShadow={useColorModeValue("0 8px 30px rgba(66, 153, 225, 0.12)", "0 8px 30px rgba(0, 0, 0, 0.3)")}
          border="2px solid"
          borderColor={cardBorder}
        >
          <Flex direction={{ base: "column", md: "row" }} gap={6} align="center">
            <Button
              leftIcon={<FaPlus />}
              bg={buttonPrimary}
              color="white"
              size="lg"
              onClick={onOpen}
              borderRadius="12px"
              boxShadow={useColorModeValue("0 6px 20px rgba(66, 153, 225, 0.35)", "0 6px 20px rgba(0, 0, 0, 0.4)")}
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: useColorModeValue("0 10px 30px rgba(66, 153, 225, 0.45)", "0 10px 30px rgba(0, 0, 0, 0.5)"),
                bg: buttonPrimaryHover
              }}
              _active={{
                transform: "translateY(-1px)",
                bg: useColorModeValue("blue.700", "blue.500")
              }}
              transition="all 0.3s ease"
              px={8}
              py={6}
              fontWeight="bold"
              fontSize="md"
            >
              إنشاء بنك أسئلة جديد
            </Button>
            
            <Spacer />
            
            <HStack spacing={4} w={{ base: "full", md: "auto" }}>
              {/* Grade Filter */}
              <Box
                bg={inputBg}
                borderRadius="12px"
                border="2px solid"
                borderColor={inputBorder}
                _hover={{ borderColor: inputHoverBorder }}
                transition="all 0.2s"
              >
                <Select
                  placeholder="فلترة حسب الصف"
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  w={{ base: "full", md: "220px" }}
                  border="none"
                  bg="transparent"
                  _hover={{ bg: useColorModeValue("blue.100", "gray.600") }}
                  _focus={{ bg: useColorModeValue("blue.100", "gray.600"), boxShadow: "none", border: "none" }}
                  borderRadius="10px"
                  fontWeight="medium"
                  color={textPrimary}
                >
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>
              </Box>
              
              {/* Search */}
              <Box
                bg={inputBg}
                borderRadius="12px"
                border="2px solid"
                borderColor={inputBorder}
                _hover={{ borderColor: inputHoverBorder }}
                transition="all 0.2s"
              >
                <InputGroup w={{ base: "full", md: "300px" }}>
                  <InputLeftElement pointerEvents="none" pl={4}>
                    <FaSearch color={useColorModeValue("#4299e1", "#63b3ed")} size={18} />
                  </InputLeftElement>
                  <Input
                    placeholder="البحث في بنوك الأسئلة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    border="none"
                    bg="transparent"
                    _hover={{ bg: useColorModeValue("blue.100", "gray.600") }}
                    _focus={{ bg: useColorModeValue("blue.100", "gray.600"), boxShadow: "none", border: "none" }}
                    borderRadius="10px"
                    pl={12}
                    fontWeight="medium"
                    color={textPrimary}
                    _placeholder={{ color: useColorModeValue("blue.400", "blue.500") }}
                  />
                </InputGroup>
              </Box>
            </HStack>
          </Flex>
        </Box>

        {/* Question Banks Grid */}
        {banksLoading ? (
          <Box
            textAlign="center"
            py={20}
            bg={cardBackground}
            borderRadius="20px"
            boxShadow={useColorModeValue("0 8px 30px rgba(66, 153, 225, 0.12)", "0 8px 30px rgba(0, 0, 0, 0.3)")}
            border="2px solid"
            borderColor={cardBorder}
          >
            <Box
              w="100px"
              h="100px"
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
              <Spinner size="xl" color={spinnerColor} thickness="4px" />
            </Box>
            <Text color={textPrimary} fontSize="lg" fontWeight="bold">جاري تحميل بنوك الأسئلة...</Text>
          </Box>
        ) : !Array.isArray(filteredBanks) || filteredBanks.length === 0 ? (
          <Box
            textAlign="center"
            py={20}
            bg={cardBackground}
            borderRadius="20px"
            boxShadow={useColorModeValue("0 8px 30px rgba(66, 153, 225, 0.12)", "0 8px 30px rgba(0, 0, 0, 0.3)")}
            border="2px solid"
            borderColor={cardBorder}
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
              <FaBook size={50} color={useColorModeValue("#4299e1", "#63b3ed")} />
            </Box>
            <Heading size="lg" color={textPrimary} mb={3} fontWeight="bold">
              {questionBanks.length === 0 ? "لا توجد بنوك أسئلة بعد" : "لا توجد نتائج للبحث"}
            </Heading>
            <Text color={useColorModeValue("blue.500", "blue.400")} fontSize="lg" mb={8} fontWeight="medium">
              {questionBanks.length === 0 ? "ابدأ بإنشاء أول بنك أسئلة" : "جرب البحث بكلمات مختلفة"}
            </Text>
            {questionBanks.length === 0 && (
              <Button
                bg={buttonPrimary}
                color="white"
                size="lg"
                borderRadius="12px"
                boxShadow={useColorModeValue("0 6px 20px rgba(66, 153, 225, 0.35)", "0 6px 20px rgba(0, 0, 0, 0.4)")}
                onClick={onOpen}
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: useColorModeValue("0 10px 30px rgba(66, 153, 225, 0.45)", "0 10px 30px rgba(0, 0, 0, 0.5)"),
                  bg: buttonPrimaryHover
                }}
                transition="all 0.3s ease"
                px={8}
                py={6}
                leftIcon={<FaPlus />}
                fontWeight="bold"
              >
                إنشاء أول بنك أسئلة
              </Button>
            )}
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredBanks.map((bank, index) => (
              <Card 
                key={bank.id} 
                bg={cardBackground}
                borderRadius="20px"
                border="2px solid"
                borderColor={cardBorder}
                boxShadow={useColorModeValue("0 8px 25px rgba(66, 153, 225, 0.15)", "0 8px 25px rgba(0, 0, 0, 0.3)")}
                overflow="hidden"
                position="relative"
                _hover={{ 
                  boxShadow: useColorModeValue("0 15px 40px rgba(66, 153, 225, 0.25)", "0 15px 40px rgba(0, 0, 0, 0.4)"), 
                  transform: "translateY(-5px)",
                  borderColor: cardHoverBorder
                }} 
                transition="all 0.3s ease"
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

                <Link to={`/question-bank/${bank.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Box position="relative" zIndex={1}>
                    <CardHeader pb={4}>
                      {bank.image_url && (
                        <Box mb={4} position="relative">
                          <Image
                            src={bank.image_url}
                            alt={bank.name}
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
                            bg="linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
                            borderRadius="20px"
                            opacity={0}
                            transition="all 0.3s"
                            _hover={{ opacity: 1 }}
                          />
                        </Box>
                      )}
                      
                      <Flex align="center" gap={3} mb={3}>
                        <Box
                          w="50px"
                          h="50px"
                          bg={buttonPrimary}
                          borderRadius="12px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow={useColorModeValue("0 4px 15px rgba(66, 153, 225, 0.35)", "0 4px 15px rgba(0, 0, 0, 0.4)")}
                        >
                          <FaBook color="white" size={20} />
                        </Box>
                        <Box flex={1}>
                          <Heading 
                            size="md" 
                            noOfLines={2}
                            color={textPrimary}
                            fontWeight="bold"
                            mb={2}
                          >
                            {bank.name}
                          </Heading>
                          <Badge
                            bg={bank.is_active ? badgeActiveBg : useColorModeValue("gray.200", "gray.600")}
                            color={bank.is_active ? badgeActiveColor : useColorModeValue("gray.600", "gray.300")}
                            px={3}
                            py={1}
                            borderRadius="8px"
                            fontSize="xs"
                            fontWeight="bold"
                            display="inline-block"
                          >
                            {bank.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </Box>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      {bank.description && (
                        <Text color={textSecondary} mb={4} noOfLines={3} lineHeight="1.6">
                          {bank.description}
                        </Text>
                      )}
                      
                      <HStack mb={4} p={3} bg={iconBg} borderRadius="10px" border="1px solid" borderColor={iconBorder}>
                        <Box
                          w="35px"
                          h="35px"
                          bg={buttonPrimary}
                          borderRadius="8px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow={useColorModeValue("0 2px 8px rgba(66, 153, 225, 0.3)", "0 2px 8px rgba(0, 0, 0, 0.3)")}
                        >
                          <FaGraduationCap color="white" size={16} />
                        </Box>
                        <Text fontSize="sm" color={textPrimary} fontWeight="bold">
                          {bank.grade_name || "غير محدد"}
                        </Text>
                      </HStack>
                    </CardBody>
                  </Box>
                </Link>
                
                {/* Action Buttons */}
                <Box p={4} pt={0} position="relative" zIndex={1} bg={iconBg} borderTop="1px solid" borderColor={iconBorder}>
                  <HStack spacing={2} justify="center">
                    <Link to={`/question-bank/${bank.id}`}>
                      <Button 
                        size="sm" 
                        leftIcon={<FaEye />} 
                        bg={buttonPrimary}
                        color="white"
                        borderRadius="10px"
                        boxShadow={useColorModeValue("0 4px 12px rgba(66, 153, 225, 0.3)", "0 4px 12px rgba(0, 0, 0, 0.3)")}
                        _hover={{ 
                          bg: buttonPrimaryHover,
                          transform: "translateY(-2px)",
                          boxShadow: useColorModeValue("0 6px 18px rgba(66, 153, 225, 0.4)", "0 6px 18px rgba(0, 0, 0, 0.4)")
                        }}
                        transition="all 0.2s"
                        fontWeight="bold"
                      >
                        عرض
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      leftIcon={<FaEdit />} 
                      bg={buttonSecondary}
                      color="white"
                      borderRadius="10px"
                      boxShadow={useColorModeValue("0 4px 12px rgba(66, 153, 225, 0.3)", "0 4px 12px rgba(0, 0, 0, 0.3)")}
                      onClick={() => handleEditClick(bank)}
                      _hover={{ 
                        bg: buttonSecondaryHover,
                        transform: "translateY(-2px)",
                        boxShadow: useColorModeValue("0 6px 18px rgba(66, 153, 225, 0.4)", "0 6px 18px rgba(0, 0, 0, 0.4)")
                      }}
                      transition="all 0.2s"
                      fontWeight="bold"
                    >
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      leftIcon={<FaTrash />} 
                      bg={buttonTertiary}
                      color="white"
                      borderRadius="10px"
                      boxShadow={useColorModeValue("0 4px 12px rgba(66, 153, 225, 0.3)", "0 4px 12px rgba(0, 0, 0, 0.3)")}
                      onClick={() => handleDeleteClick(bank)}
                      _hover={{ 
                        bg: buttonTertiaryHover,
                        transform: "translateY(-2px)",
                        boxShadow: useColorModeValue("0 6px 18px rgba(66, 153, 225, 0.4)", "0 6px 18px rgba(0, 0, 0, 0.4)")
                      }}
                      transition="all 0.2s"
                      fontWeight="bold"
                    >
                      حذف
                    </Button>
                  </HStack>
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        )}
        </VStack>
      </Container>

      {/* Create Question Bank Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
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
                <FaPlus color="#4299e1" size={18} />
              </Box>
              <Text fontSize="xl" fontWeight="bold">إنشاء بنك أسئلة جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: buttonPrimaryHover }} />
          
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* السعر */}
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">
                    <HStack spacing={2}>
                      <FaDollarSign color={useColorModeValue("#4299e1", "#63b3ed")} />
                      <Text>السعر</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <FaDollarSign color={useColorModeValue("#4299e1", "#63b3ed")} />
                    </InputLeftElement>
                    <Input
                      name="price"
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="أدخل السعر"
                      border="2px solid"
                      borderColor={inputBorder}
                      _hover={{ borderColor: inputHoverBorder }}
                      _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                      borderRadius="10px"
                      bg={useColorModeValue("white", "gray.700")}
                    />
                    <InputRightElement pr={3}>
                      <Text color={useColorModeValue("blue.500", "blue.400")} fontSize="sm" fontWeight="bold">جنيه</Text>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                {/* اسم بنك الأسئلة */}
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold">
                    <HStack spacing={2}>
                      <FaBook color={useColorModeValue("#4299e1", "#63b3ed")} />
                      <Text>اسم بنك الأسئلة</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <FaBook color={useColorModeValue("#4299e1", "#63b3ed")} />
                    </InputLeftElement>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم بنك الأسئلة"
                      border="2px solid"
                      borderColor={inputBorder}
                      _hover={{ borderColor: inputHoverBorder }}
                      _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                      borderRadius="10px"
                      bg={useColorModeValue("white", "gray.700")}
                    />
                  </InputGroup>
                </FormControl>

                {/* وصف بنك الأسئلة */}
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">
                    <HStack spacing={2}>
                      <FaEdit color={useColorModeValue("#4299e1", "#63b3ed")} />
                      <Text>وصف بنك الأسئلة (اختياري)</Text>
                    </HStack>
                  </FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف بنك الأسئلة"
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

                {/* اختيار الصف */}
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold">
                    <HStack spacing={2}>
                      <FaGraduationCap color={useColorModeValue("#4299e1", "#63b3ed")} />
                      <Text>الصف الدراسي</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <FaGraduationCap color={useColorModeValue("#4299e1", "#63b3ed")} />
                    </InputLeftElement>
                    <Select
                      name="grade_id"
                      value={formData.grade_id}
                      onChange={handleInputChange}
                      placeholder="اختر الصف الدراسي"
                      isDisabled={gradesLoading}
                      border="2px solid"
                      borderColor={inputBorder}
                      _hover={{ borderColor: inputHoverBorder }}
                      _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                      borderRadius="10px"
                      bg={useColorModeValue("white", "gray.700")}
                    >
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </Select>
                  </InputGroup>
                  {gradesLoading && (
                    <HStack mt={2}>
                      <Spinner size="sm" color={spinnerColor} />
                      <Text fontSize="sm" color={useColorModeValue("blue.500", "blue.400")} fontWeight="medium">جاري تحميل الصفوف...</Text>
                    </HStack>
                  )}
                </FormControl>

                {/* حالة النشاط */}
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">
                    <HStack spacing={2}>
                      <FaEye color={useColorModeValue("#4299e1", "#63b3ed")} />
                      <Text>حالة النشاط</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <FaEye color={useColorModeValue("#4299e1", "#63b3ed")} />
                    </InputLeftElement>
                    <Select
                      name="is_active"
                      value={formData.is_active}
                      onChange={handleInputChange}
                      placeholder="اختر حالة النشاط"
                      border="2px solid"
                      borderColor={inputBorder}
                      _hover={{ borderColor: inputHoverBorder }}
                      _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                      borderRadius="10px"
                      bg={useColorModeValue("white", "gray.700")}
                    >
                      <option value={true}>نشط</option>
                      <option value={false}>غير نشط</option>
                    </Select>
                  </InputGroup>
                </FormControl>

                {/* رفع الصورة */}
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">
                    <HStack spacing={2}>
                      <FaUpload color={useColorModeValue("#4299e1", "#63b3ed")} />
                      <Text>صورة بنك الأسئلة (اختياري)</Text>
                    </HStack>
                  </FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        leftIcon={<FaUpload />}
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
                leftIcon={<FaPlus />}
                _hover={{ bg: buttonPrimaryHover, transform: "translateY(-2px)" }}
                boxShadow={useColorModeValue("0 4px 15px rgba(66, 153, 225, 0.35)", "0 4px 15px rgba(0, 0, 0, 0.4)")}
                borderRadius="10px"
                fontWeight="bold"
                transition="all 0.2s"
              >
                إنشاء بنك الأسئلة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Question Bank Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg="white" borderRadius="20px" border="2px solid" borderColor="blue.200">
          <ModalHeader bg="blue.400" color="white" borderRadius="18px 18px 0 0" py={4}>
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
                <FaEdit color="#4299e1" size={18} />
              </Box>
              <Text fontSize="xl" fontWeight="bold">تعديل بنك الأسئلة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "blue.500" }} />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                {/* اسم بنك الأسئلة */}
                <FormControl isRequired>
                  <FormLabel color="blue.600" fontWeight="bold">اسم بنك الأسئلة</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم بنك الأسئلة"
                    size="lg"
                    border="2px solid"
                    borderColor="blue.200"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
                    borderRadius="10px"
                  />
                </FormControl>

                {/* وصف بنك الأسئلة */}
                <FormControl>
                  <FormLabel color="blue.600" fontWeight="bold">وصف بنك الأسئلة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف بنك الأسئلة"
                    rows={4}
                    size="lg"
                    border="2px solid"
                    borderColor="blue.200"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
                    borderRadius="10px"
                  />
                </FormControl>

                {/* اختيار الصف */}
                <FormControl isRequired>
                  <FormLabel color="blue.600" fontWeight="bold">الصف الدراسي</FormLabel>
                  <Select
                    name="grade_id"
                    value={formData.grade_id}
                    onChange={handleInputChange}
                    placeholder="اختر الصف الدراسي"
                    size="lg"
                    isDisabled={gradesLoading}
                    border="2px solid"
                    borderColor="blue.200"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
                    borderRadius="10px"
                  >
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                  {gradesLoading && (
                    <HStack mt={2}>
                      <Spinner size="sm" color="blue.500" />
                      <Text fontSize="sm" color="blue.500" fontWeight="medium">جاري تحميل الصفوف...</Text>
                    </HStack>
                  )}
                </FormControl>

                {/* حالة النشاط */}
                <FormControl>
                  <FormLabel color="blue.600" fontWeight="bold">حالة النشاط</FormLabel>
                  <Select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleInputChange}
                    placeholder="اختر حالة النشاط"
                    size="lg"
                    border="2px solid"
                    borderColor="blue.200"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
                    borderRadius="10px"
                  >
                    <option value={true}>نشط</option>
                    <option value={false}>غير نشط</option>
                  </Select>
                </FormControl>

                {/* رفع الصورة */}
                <FormControl>
                  <FormLabel color="blue.600" fontWeight="bold">صورة بنك الأسئلة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="edit-image-upload"
                        leftIcon={<FaUpload />}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        border="2px solid"
                        borderColor="blue.300"
                        color="blue.500"
                        _hover={{ bg: "blue.50", borderColor: "blue.400" }}
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

          <ModalFooter bg="blue.50" borderRadius="0 0 18px 18px" py={4}>
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={resetForm}
                color="blue.600"
                _hover={{ bg: "blue.100" }}
                fontWeight="bold"
              >
                إعادة تعيين
              </Button>
              <Button 
                variant="ghost" 
                onClick={onEditClose}
                color="blue.600"
                _hover={{ bg: "blue.100" }}
                fontWeight="bold"
              >
                إلغاء
              </Button>
              <Button
                bg="blue.400"
                color="white"
                onClick={handleEditSubmit}
                isLoading={editLoading}
                loadingText="جاري التحديث..."
                leftIcon={<FaEdit />}
                _hover={{ bg: "blue.500", transform: "translateY(-2px)" }}
                boxShadow="0 4px 15px rgba(66, 153, 225, 0.35)"
                borderRadius="10px"
                fontWeight="bold"
                transition="all 0.2s"
              >
                تحديث بنك الأسئلة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg="white" borderRadius="20px" border="2px solid" borderColor="blue.200">
          <ModalHeader bg="blue.300" color="white" borderRadius="18px 18px 0 0" py={4}>
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
                <FaTrash color="#4299e1" size={18} />
              </Box>
              <Text fontSize="xl" fontWeight="bold">تأكيد الحذف</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "blue.400" }} />
          
          <ModalBody py={8}>
            <VStack spacing={4} align="stretch">
              <Box textAlign="center">
                <Box
                  w="80px"
                  h="80px"
                  bg="blue.50"
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb={4}
                  border="3px solid"
                  borderColor="blue.200"
                >
                  <FaBook size={40} color="#4299e1" />
                </Box>
                <Text fontSize="lg" fontWeight="bold" color="blue.600" mb={2}>
                  هل أنت متأكد من حذف بنك الأسئلة؟
                </Text>
                <Text mt={2} color="blue.500" fontWeight="medium" fontSize="md">
                  "{deletingBank?.name}"
                </Text>
                <Text mt={3} color="blue.400" fontSize="sm" fontWeight="medium">
                  هذا الإجراء لا يمكن التراجع عنه
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter bg="blue.50" borderRadius="0 0 18px 18px" py={4}>
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={onDeleteClose}
                color="blue.600"
                _hover={{ bg: "blue.100" }}
                fontWeight="bold"
              >
                إلغاء
              </Button>
              <Button
                bg="blue.300"
                color="white"
                onClick={handleDeleteConfirm}
                isLoading={deleteLoading}
                loadingText="جاري الحذف..."
                leftIcon={<FaTrash />}
                _hover={{ bg: "blue.400", transform: "translateY(-2px)" }}
                boxShadow="0 4px 15px rgba(66, 153, 225, 0.35)"
                borderRadius="10px"
                fontWeight="bold"
                transition="all 0.2s"
              >
                حذف بنك الأسئلة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionBankDashboard;