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
  Select,
} from "@chakra-ui/react";
import {
  FaBook,
  FaGraduationCap,
  FaQuestionCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUpload,
  FaTimes,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const SubjectPage = () => {
  const { id } = useParams();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [subjectData, setSubjectData] = useState(null);
  const [chapters, setChapters] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Edit states
  const [editingChapter, setEditingChapter] = useState(null);
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
  const { isOpen: isPermissionOpen, onOpen: onPermissionOpen, onClose: onPermissionClose } = useDisclosure();
  const [deletingChapter, setDeletingChapter] = useState(null);

  // Permission states
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // تحديد الألوان بناءً على وضع الثيم (فاتح/داكن)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const hoverBg = useColorModeValue("blue.50", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch subject data
  const fetchSubjectData = async () => {
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

      const response = await baseUrl.get(`/api/subjects/${id}/with-chapters`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Subject API Response:", response.data);
      
      if (response.data.success) {
        setSubjectData(response.data.data.subject);
        setChapters(response.data.data.chapters);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب بيانات المادة";
      setError(errorMsg);
      console.error("Error fetching subject:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new chapter
  const createChapter = async (formData) => {
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

      console.log("Creating chapter with data:", formData);
      
      const response = await baseUrl.post(`/api/subjects/${id}/chapters`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Create Chapter API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم إنشاء الفصل بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating chapter:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء الفصل";
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

  // Update chapter
  const updateChapter = async (formData) => {
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

      console.log("Updating chapter:", editingChapter.id);
      
      const response = await baseUrl.put(`/api/chapters/${editingChapter.id}`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update Chapter API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم تحديث الفصل بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating chapter:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث الفصل";
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

  // Delete chapter
  const deleteChapter = async () => {
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

      console.log("Deleting chapter:", deletingChapter.id);
      
      const response = await baseUrl.delete(`/api/chapters/${deletingChapter.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete Chapter API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم حذف الفصل بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting chapter:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف الفصل";
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

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      
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

      const response = await baseUrl.get(`/api/users/teachers`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Teachers API Response:", response.data);
      
      if (response.data.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب المدرسين";
      toast({
        title: "خطأ",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error fetching teachers:", err);
    } finally {
      setTeachersLoading(false);
    }
  };

  // Assign subject to teacher
  const assignSubjectToTeacher = async () => {
    try {
      setPermissionLoading(true);
      
      if (!selectedTeacher) {
        toast({
          title: "خطأ",
          description: "يجب اختيار مدرس",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

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
        teacherId: parseInt(selectedTeacher),
        subjectId: parseInt(id)
      };

      console.log("Assigning subject to teacher:", requestData);
      
      const response = await baseUrl.post(`/api/admin/assign-subject`, requestData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Assign Subject API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم منح الصلاحية للمدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error assigning subject:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في منح الصلاحية";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setPermissionLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSubjectData();
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
        description: "يجب ملء اسم الفصل",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await createChapter(formData);
    
    if (result.success) {
      onClose();
      resetForm();
      fetchSubjectData(); // Refresh data
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم الفصل",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await updateChapter(editFormData);
    
    if (result.success) {
      onEditClose();
      resetEditForm();
      fetchSubjectData(); // Refresh data
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteChapter();
    
    if (result.success) {
      onDeleteClose();
      setDeletingChapter(null);
      fetchSubjectData(); // Refresh data
    }
  };

  // Handle permission submit
  const handlePermissionSubmit = async () => {
    const result = await assignSubjectToTeacher();
    
    if (result.success) {
      onPermissionClose();
      setSelectedTeacher("");
    }
  };

  // Handle permission modal open
  const handlePermissionOpen = () => {
    fetchTeachers();
    onPermissionOpen();
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
  const handleEditClick = (chapter) => {
    setEditingChapter(chapter);
    setEditFormData({
      name: chapter.name,
      description: chapter.description || ''
    });
    setImagePreview(chapter.image_url);
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (chapter) => {
    setDeletingChapter(chapter);
    onDeleteOpen();
  };

  // Filter chapters based on search
  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chapter.description && chapter.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>جاري تحميل بيانات المادة...</Text>
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

  if (!subjectData) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
            <Text color="red.600">لم يتم العثور على المادة</Text>
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
                <Icon as={FaBook} color="white" boxSize={6} />
              </Box>
              <Box>
                <Heading 
                  size={{ base: "lg", md: "xl" }} 
                  bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  {subjectData.name}
                </Heading>
                <Text color="gray.600" fontSize="sm" mt={1}>
                  {chapters.length} فصل - {subjectData.description}
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
              إضافة فصل جديد
            </MotionButton>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8} position="relative" zIndex={1}>
      {/* رأس الصفحة - معلومات المادة */}
      <Flex
        direction={{ base: "column", md: "row" }}
        mb={10}
        p={6}
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="xl"
        align="center"
        justify="space-between"
      >
        <VStack align={{ base: "center", md: "flex-start" }} spacing={3} mb={{ base: 6, md: 0 }}>
          <HStack spacing={4} align="center">
            <Icon as={FaBook} color={accentColor} boxSize={10} />
            <Heading size={{ base: "xl", md: "2xl" }} color={headingColor}>
              {subjectData.name}
            </Heading>
            <Badge colorScheme="blue" ml={3} fontSize="lg" px={3} py={1} borderRadius="full">
              {chapters.length} فصل
            </Badge>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} color={textColor} textAlign={{ base: "center", md: "right" }}>
            {subjectData.description}
          </Text>
          <HStack spacing={4} mt={4}>
            <Badge colorScheme="green" variant="subtle" p={2} borderRadius="md">
              {subjectData.question_bank_name}
            </Badge>
            <Badge colorScheme="blue" variant="subtle" p={2} borderRadius="md">
              {subjectData.grade_name}
            </Badge>
            <Badge colorScheme={subjectData.is_active ? "green" : "red"} variant="subtle" p={2} borderRadius="md">
              {subjectData.is_active ? "نشط" : "غير نشط"}
            </Badge>
          </HStack>
        </VStack>

        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          onClick={onOpen}
          size={{ base: "sm", md: "md" }}
          borderRadius="full"
        >
          إضافة فصل جديد
        </Button>
      </Flex>

      {/* أزرار الإدارة */}
      <Flex justify="center" mb={8} gap={4}>
        <Button
          leftIcon={<FaGraduationCap />}
          colorScheme="green"
          onClick={handlePermissionOpen}
          size="md"
          borderRadius="full"
          variant="outline"
        >
          منح صلاحية
        </Button>
      </Flex>

      {/* شريط البحث */}
      <Box mb={8}>
        <InputGroup size="lg" boxShadow="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="ابحث عن فصل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={cardBg}
            borderRadius="full"
            boxShadow="sm"
            _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
            py={6}
          />
        </InputGroup>
      </Box>

      {/* عرض الفصول */}
      <Box>
        <Heading size="lg" mb={6} color={headingColor} textAlign="center">
          <Icon as={FaGraduationCap} mr={2} color={accentColor} />
          فصول المادة ({filteredChapters.length})
        </Heading>

        {filteredChapters.length === 0 ? (
          <Box textAlign="center" py={12} bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor}>
            <FaBook size={48} color="gray.400" style={{ margin: "0 auto 16px" }} />
            <Text color="gray.500" fontSize="lg">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد فصول بعد"}
            </Text>
            {!searchTerm && (
              <Button mt={4} colorScheme="blue" onClick={onOpen}>
                إضافة أول فصل
              </Button>
            )}
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredChapters.map((chapter) => (
              <MotionCard
                key={chapter.id}
                whileHover={{ scale: 1.02, y: -5 }}
                bg={cardBg}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{
                  boxShadow: "xl",
                  borderColor: "blue.400"
                }}
              >
                <CardHeader pb={2}>
                  {chapter.image_url && (
                    <Box mb={4}>
                      <Image
                        src={chapter.image_url}
                        alt={chapter.name}
                        borderRadius="md"
                        maxH="180px"
                        objectFit="cover"
                        w="full"
                      />
                    </Box>
                  )}
                  <Flex align="center">
                  
                    <Box>
                      <Heading size="md" color={headingColor} mb={1}>{chapter.name}</Heading>
                      {chapter.description && (
                        <Text fontSize="sm" color={textColor} noOfLines={2}>
                          {chapter.description}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </CardHeader>

                <CardBody py={4}>
                  
                  
                  <VStack spacing={3} align="stretch">
                
                    
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      تم الإنشاء: {new Date(chapter.created_at).toLocaleDateString('ar-EG')}
                    </Text>
                  </VStack>
                </CardBody>

                <CardFooter pt={0}>
                  <HStack spacing={2} w="full">
                    <IconButton
                      icon={<FaEdit />}
                      size="sm"
                      variant="outline"
                      colorScheme="green"
                      onClick={() => handleEditClick(chapter)}
                      aria-label="تعديل الفصل"
                    />
                    <IconButton
                      icon={<FaTrash />}
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleDeleteClick(chapter)}
                      aria-label="حذف الفصل"
                    />
                    <Link to={`/chapter/${chapter.id}`} style={{ flex: 1 }}>
                      <Button
                        rightIcon={<FaBook />}
                        variant="solid"
                        colorScheme="blue"
                        w="full"
                        size="sm"
                      >
                        عرض الدروس
                      </Button>
                    </Link>
                  </HStack>
                </CardFooter>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Add Chapter Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaPlus color="blue.500" />
              <Text>إضافة فصل جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>اسم الفصل</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الفصل"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>وصف الفصل (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف الفصل"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>صورة الفصل (اختياري)</FormLabel>
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
                إضافة الفصل
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaEdit color="green.500" />
              <Text>تعديل الفصل</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>اسم الفصل</FormLabel>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="أدخل اسم الفصل"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>وصف الفصل (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="أدخل وصف الفصل"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>صورة الفصل (اختياري)</FormLabel>
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
                تحديث الفصل
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
                <FaBook size={48} color="red.400" style={{ margin: "0 auto 16px" }} />
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  هل أنت متأكد من حذف الفصل؟
                </Text>
                <Text mt={2} color="gray.600">
                  "{deletingChapter?.name}"
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
                حذف الفصل
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Grant Permission Modal */}
      <Modal isOpen={isPermissionOpen} onClose={onPermissionClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaGraduationCap color="green.500" />
              <Text>منح صلاحية للمدرس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6}>
              <Box textAlign="center" p={4} bg="blue.50" borderRadius="lg">
                <Text fontSize="md" color="blue.600" fontWeight="semibold">
                  منح صلاحية الوصول للمادة: {subjectData?.name}
                </Text>
                <Text fontSize="sm" color="blue.500" mt={2}>
                  اختر المدرس الذي تريد منحه صلاحية الوصول لهذه المادة
                </Text>
              </Box>

              <FormControl isRequired>
                <FormLabel>اختر المدرس</FormLabel>
                {teachersLoading ? (
                  <Box textAlign="center" py={8}>
                    <Spinner size="lg" color={accentColor} />
                    <Text mt={2} color={textColor}>جاري تحميل المدرسين...</Text>
                  </Box>
                ) : (
                  <Select
                    placeholder="اختر المدرس"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    size="lg"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject} ({teacher.email})
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>

              {selectedTeacher && (
                <Box p={4} bg="gray.50" borderRadius="lg" w="full">
                  <Text fontSize="sm" color={textColor} fontWeight="semibold" mb={2}>
                    معلومات المدرس المختار:
                  </Text>
                  {(() => {
                    const teacher = teachers.find(t => t.id === parseInt(selectedTeacher));
                    if (!teacher) return null;
                    
                    return (
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>الاسم:</Text>
                          <Text fontSize="sm" color={headingColor} fontWeight="semibold">{teacher.name}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>التخصص:</Text>
                          <Text fontSize="sm" color={headingColor} fontWeight="semibold">{teacher.subject}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>البريد الإلكتروني:</Text>
                          <Text fontSize="sm" color={headingColor} fontWeight="semibold">{teacher.email}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>عدد الطلاب:</Text>
                          <Text fontSize="sm" color={headingColor} fontWeight="semibold">{teacher.students_count}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>عدد الدورات:</Text>
                          <Text fontSize="sm" color={headingColor} fontWeight="semibold">{teacher.courses_count}</Text>
                        </HStack>
                      </VStack>
                    );
                  })()}
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={() => setSelectedTeacher("")}>
                إعادة تعيين
              </Button>
              <Button variant="ghost" onClick={onPermissionClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="green"
                onClick={handlePermissionSubmit}
                isLoading={permissionLoading}
                loadingText="جاري منح الصلاحية..."
                leftIcon={<FaGraduationCap />}
                isDisabled={!selectedTeacher}
              >
                منح الصلاحية
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <ScrollToTop/>
      </Box>
    </Box>
  );
};

export default SubjectPage;