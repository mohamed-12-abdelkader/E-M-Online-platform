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
  FaTrash
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const QuestionBankDashboard = () => {
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grade_id: "",
    is_active: true
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
      // البيانات تأتي في response.data.data.question_banks
      const banks = response.data.data?.question_banks || [];
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
      is_active: true
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
      is_active: bank.is_active
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
        mt="80px"
      >
        <Container maxW="container.xl" py={6}>
          <Flex justify="space-between" align="center">
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
                <FaBook size={24} color="white" />
              </Box>
              <Box>
                <Heading 
                  as="h1" 
                  size="xl" 
                  bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  بنوك الأسئلة
                </Heading>
                <Text color="gray.600" fontSize="sm" mt={1}>
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
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(20px)"
          borderRadius="25px"
          p={6}
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.2)"
        >
          <Flex direction={{ base: "column", md: "row" }} gap={6} align="center">
            <Button
              leftIcon={<FaPlus />}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              size="lg"
              onClick={onOpen}
              borderRadius="15px"
                                boxShadow="0 10px 30px rgba(49, 130, 206, 0.3)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
                bg: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
              }}
              transition="all 0.3s"
              px={8}
              py={6}
              fontWeight="medium"
            >
              إنشاء بنك أسئلة جديد
            </Button>
            
            <Spacer />
            
            <HStack spacing={4} w={{ base: "full", md: "auto" }}>
              {/* Grade Filter */}
              <Box
                bg="rgba(255, 255, 255, 0.9)"
                borderRadius="15px"
                p={1}
                boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.3)"
              >
                <Select
                  placeholder="فلترة حسب الصف"
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  w={{ base: "full", md: "220px" }}
                  border="none"
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                  _focus={{ bg: "transparent", boxShadow: "none" }}
                  borderRadius="12px"
                  fontWeight="medium"
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
                bg="rgba(255, 255, 255, 0.9)"
                borderRadius="15px"
                p={1}
                boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.3)"
              >
                <InputGroup w={{ base: "full", md: "300px" }}>
                  <InputLeftElement pointerEvents="none" pl={4}>
                    <FaSearch color="#3182ce" />
                  </InputLeftElement>
                  <Input
                    placeholder="البحث في بنوك الأسئلة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    border="none"
                    bg="transparent"
                    _hover={{ bg: "transparent" }}
                    _focus={{ bg: "transparent", boxShadow: "none" }}
                    borderRadius="12px"
                    pl={12}
                    fontWeight="medium"
                    _placeholder={{ color: "gray.500" }}
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
            py={16}
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(20px)"
            borderRadius="25px"
            boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            <Box
              w="80px"
              h="80px"
              bg="linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Spinner size="xl" color="#667eea" thickness="4px" />
            </Box>
            <Text color="gray.600" fontSize="lg" fontWeight="medium">جاري تحميل بنوك الأسئلة...</Text>
          </Box>
        ) : !Array.isArray(filteredBanks) || filteredBanks.length === 0 ? (
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
              bg="linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={6}
            >
              <FaBook size={40} color="#3182ce" />
            </Box>
            <Heading size="lg" color="gray.700" mb={3}>
              {questionBanks.length === 0 ? "لا توجد بنوك أسئلة بعد" : "لا توجد نتائج للبحث"}
            </Heading>
            <Text color="gray.500" fontSize="lg" mb={6}>
              {questionBanks.length === 0 ? "ابدأ بإنشاء أول بنك أسئلة" : "جرب البحث بكلمات مختلفة"}
            </Text>
            {questionBanks.length === 0 && (
              <Button
                bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                color="white"
                size="lg"
                borderRadius="15px"
                                  boxShadow="0 10px 30px rgba(49, 130, 206, 0.3)"
                onClick={onOpen}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
                }}
                transition="all 0.3s"
                px={8}
                py={6}
                leftIcon={<FaPlus />}
                fontWeight="medium"
              >
                إنشاء أول بنك أسئلة
              </Button>
            )}
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {filteredBanks.map((bank, index) => (
              <Card 
                key={bank.id} 
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
                  transform: "translateY(-8px)",
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
                          w="40px"
                          h="40px"
                          bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                          borderRadius="12px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="0 5px 15px rgba(49, 130, 206, 0.3)"
                        >
                          <FaBook color="white" size={16} />
                        </Box>
                        <Box flex={1}>
                          <Heading 
                            size="md" 
                            noOfLines={2}
                            bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                            bgClip="text"
                            fontWeight="bold"
                            mb={1}
                          >
                            {bank.name}
                          </Heading>
                          <Box
                            bg={bank.is_active ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)" : "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"}
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="15px"
                            fontSize="xs"
                            fontWeight="medium"
                            display="inline-block"
                            boxShadow={bank.is_active ? "0 3px 10px rgba(72, 187, 120, 0.3)" : "0 3px 10px rgba(245, 101, 101, 0.3)"}
                          >
                            {bank.is_active ? "نشط" : "غير نشط"}
                          </Box>
                        </Box>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      {bank.description && (
                        <Text color="gray.600" mb={4} noOfLines={3} lineHeight="1.6">
                          {bank.description}
                        </Text>
                      )}
                      
                      <HStack mb={4}>
                        <Box
                          w="30px"
                          h="30px"
                          bg="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                          borderRadius="8px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="0 3px 10px rgba(72, 187, 120, 0.3)"
                        >
                          <FaGraduationCap color="white" size={12} />
                        </Box>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          {bank.grade_name || "غير محدد"}
                        </Text>
                      </HStack>
                    </CardBody>
                  </Box>
                </Link>
                
                {/* Action Buttons */}
                <Box p={4} pt={0} position="relative" zIndex={1}>
                  <HStack spacing={2} justify="center">
                    <Link to={`/question-bank/${bank.id}`}>
                      <Button 
                        size="sm" 
                        leftIcon={<FaEye />} 
                        bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
                        color="white"
                        borderRadius="12px"
                        boxShadow="0 5px 15px rgba(49, 130, 206, 0.3)"
                        _hover={{ 
                          bg: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                          transform: "scale(1.05)"
                        }}
                        transition="all 0.2s"
                        fontWeight="medium"
                      >
                        عرض
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      leftIcon={<FaEdit />} 
                      bg="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                      color="white"
                      borderRadius="12px"
                      boxShadow="0 5px 15px rgba(72, 187, 120, 0.3)"
                      onClick={() => handleEditClick(bank)}
                      _hover={{ 
                        bg: "linear-gradient(135deg, #38a169 0%, #2f855a 100%)",
                        transform: "scale(1.05)"
                      }}
                      transition="all 0.2s"
                      fontWeight="medium"
                    >
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      leftIcon={<FaTrash />} 
                      bg="linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"
                      color="white"
                      borderRadius="12px"
                      boxShadow="0 5px 15px rgba(245, 101, 101, 0.3)"
                      onClick={() => handleDeleteClick(bank)}
                      _hover={{ 
                        bg: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
                        transform: "scale(1.05)"
                      }}
                      transition="all 0.2s"
                      fontWeight="medium"
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
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>
            <HStack>
              <FaPlus color="blue.500" />
              <Text>إنشاء بنك أسئلة جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* اسم بنك الأسئلة */}
                <FormControl isRequired>
                  <FormLabel>اسم بنك الأسئلة</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم بنك الأسئلة"
                    size="lg"
                  />
                </FormControl>

                {/* وصف بنك الأسئلة */}
                <FormControl>
                  <FormLabel>وصف بنك الأسئلة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف بنك الأسئلة"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                {/* اختيار الصف */}
                <FormControl isRequired>
                  <FormLabel>الصف الدراسي</FormLabel>
                  <Select
                    name="grade_id"
                    value={formData.grade_id}
                    onChange={handleInputChange}
                    placeholder="اختر الصف الدراسي"
                    size="lg"
                    isDisabled={gradesLoading}
                  >
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                  {gradesLoading && (
                    <HStack mt={2}>
                      <Spinner size="sm" />
                      <Text fontSize="sm" color="gray.500">جاري تحميل الصفوف...</Text>
                    </HStack>
                  )}
                </FormControl>

                {/* حالة النشاط */}
                <FormControl>
                  <FormLabel>حالة النشاط</FormLabel>
                  <Select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleInputChange}
                    placeholder="اختر حالة النشاط"
                    size="lg"
                  >
                    <option value={true}>نشط</option>
                    <option value={false}>غير نشط</option>
                  </Select>
                </FormControl>

                {/* رفع الصورة */}
                <FormControl>
                  <FormLabel>صورة بنك الأسئلة (اختياري)</FormLabel>
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
                leftIcon={<FaPlus />}
              >
                إنشاء بنك الأسئلة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Question Bank Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>
            <HStack>
              <FaEdit color="green.500" />
              <Text>تعديل بنك الأسئلة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                {/* اسم بنك الأسئلة */}
                <FormControl isRequired>
                  <FormLabel>اسم بنك الأسئلة</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم بنك الأسئلة"
                    size="lg"
                  />
                </FormControl>

                {/* وصف بنك الأسئلة */}
                <FormControl>
                  <FormLabel>وصف بنك الأسئلة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف بنك الأسئلة"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                {/* اختيار الصف */}
                <FormControl isRequired>
                  <FormLabel>الصف الدراسي</FormLabel>
                  <Select
                    name="grade_id"
                    value={formData.grade_id}
                    onChange={handleInputChange}
                    placeholder="اختر الصف الدراسي"
                    size="lg"
                    isDisabled={gradesLoading}
                  >
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                  {gradesLoading && (
                    <HStack mt={2}>
                      <Spinner size="sm" />
                      <Text fontSize="sm" color="gray.500">جاري تحميل الصفوف...</Text>
                    </HStack>
                  )}
                </FormControl>

                {/* حالة النشاط */}
                <FormControl>
                  <FormLabel>حالة النشاط</FormLabel>
                  <Select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleInputChange}
                    placeholder="اختر حالة النشاط"
                    size="lg"
                  >
                    <option value={true}>نشط</option>
                    <option value={false}>غير نشط</option>
                  </Select>
                </FormControl>

                {/* رفع الصورة */}
                <FormControl>
                  <FormLabel>صورة بنك الأسئلة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="edit-image-upload"
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
              <Button variant="ghost" onClick={resetForm}>
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
                تحديث بنك الأسئلة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
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
                <FaBook size={48} color="red.400" style={{ margin: "0 auto 16px" }} />
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  هل أنت متأكد من حذف بنك الأسئلة؟
                </Text>
                <Text mt={2} color="gray.600">
                  "{deletingBank?.name}"
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
                leftIcon={<FaTrash />}
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