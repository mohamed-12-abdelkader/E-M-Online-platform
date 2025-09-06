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
} from "@chakra-ui/react";
import {
  FaBook,
  FaGraduationCap,
  FaQuestionCircle,
  FaClock,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUpload,
  FaTimes,
  FaPlay,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const ChapterQuestion = () => {
  const { id } = useParams();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [chapterData, setChapterData] = useState(null);
  const [lessons, setLessons] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Edit states
  const [editingLesson, setEditingLesson] = useState(null);
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
  const [deletingLesson, setDeletingLesson] = useState(null);

  // تحديد الألوان بناءً على وضع الثيم (فاتح/داكن)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const hoverBg = useColorModeValue("blue.50", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch chapter data
  const fetchChapterData = async () => {
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

      const response = await baseUrl.get(`/api/chapters/${id}/with-lessons`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Chapter API Response:", response.data);
      
      if (response.data.success) {
        setChapterData(response.data.data.chapter);
        setLessons(response.data.data.lessons);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب بيانات الفصل";
      setError(errorMsg);
      console.error("Error fetching chapter:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new lesson
  const createLesson = async (formData) => {
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

      console.log("Creating lesson with data:", formData);
      
      const response = await baseUrl.post(`/api/chapters/${id}/lessons`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Create Lesson API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم إنشاء الدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating lesson:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء الدرس";
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

  // Update lesson
  const updateLesson = async (formData) => {
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

      console.log("Updating lesson:", editingLesson.id);
      
      const response = await baseUrl.put(`/api/lessons/${editingLesson.id}`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update Lesson API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم تحديث الدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating lesson:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث الدرس";
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

  // Delete lesson
  const deleteLesson = async () => {
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

      console.log("Deleting lesson:", deletingLesson.id);
      
      const response = await baseUrl.delete(`/api/lessons/${deletingLesson.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete Lesson API Response:", response.data);
      
      toast({
        title: "نجح",
        description: "تم حذف الدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting lesson:", error);
      
      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف الدرس";
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
    fetchChapterData();
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
        description: "يجب ملء اسم الدرس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await createLesson(formData);
    
    if (result.success) {
      onClose();
      resetForm();
      fetchChapterData(); // Refresh data
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم الدرس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await updateLesson(editFormData);
    
    if (result.success) {
      onEditClose();
      resetEditForm();
      fetchChapterData(); // Refresh data
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteLesson();
    
    if (result.success) {
      onDeleteClose();
      setDeletingLesson(null);
      fetchChapterData(); // Refresh data
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
  const handleEditClick = (lesson) => {
    setEditingLesson(lesson);
    setEditFormData({
      name: lesson.name,
      description: lesson.description || ''
    });
    setImagePreview(lesson.image_url);
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (lesson) => {
    setDeletingLesson(lesson);
    onDeleteOpen();
  };

  // Filter lessons based on search
  const filteredLessons = lessons.filter(lesson =>
    lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>جاري تحميل بيانات الفصل...</Text>
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

  if (!chapterData) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
            <Text color="red.600">لم يتم العثور على الفصل</Text>
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
                <Icon as={FaGraduationCap} color="white" boxSize={6} />
              </Box>
              <Box>
                <Heading 
                  size={{ base: "lg", md: "xl" }} 
                  bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  {chapterData.name}
                </Heading>
                <Text color="gray.600" fontSize="sm" mt={1}>
                  {lessons.length} درس - {chapterData.description}
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
              إنشاء درس جديد
            </MotionButton>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8} position="relative" zIndex={1}>

      {/* شريط البحث */}
      <Box mb={8}>
        <InputGroup size="lg" boxShadow="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="ابحث عن درس..."
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

      {/* عرض الدروس */}
      <Box>
        <Heading size="lg" mb={6} color={headingColor} textAlign="center">
          <Icon as={FaBook} mr={2} color={accentColor} />
          دروس الفصل ({filteredLessons.length})
        </Heading>

        {filteredLessons.length === 0 ? (
          <Box textAlign="center" py={12} bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor}>
            <FaBook size={48} color="gray.400" style={{ margin: "0 auto 16px" }} />
            <Text color="gray.500" fontSize="lg">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد دروس بعد"}
            </Text>
            {!searchTerm && (
              <Button mt={4} colorScheme="blue" onClick={onOpen}>
                إضافة أول درس
              </Button>
            )}
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredLessons.map((lesson) => (
              <MotionCard
                key={lesson.id}
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

{lesson.image_url && (
                    <Box mb={4}>
                      <Image
                        src={lesson.image_url}
                        alt={lesson.name}
                        borderRadius="md"
                        maxH="180px"
                        objectFit="cover"
                        w="full"
                      />
                    </Box>
                  )}

                  <Flex align="center">
                  
                    <Box>
                      <Heading size="md" color={headingColor} mb={1}>{lesson.name}</Heading>
                      {lesson.description && (
                        <Text fontSize="sm" color={textColor} noOfLines={2}>
                          {lesson.description}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </CardHeader>

                <CardBody py={4}>
                  
                  
                  <VStack spacing={3} align="stretch">
                 
                    
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      تم الإنشاء: {new Date(lesson.created_at).toLocaleDateString('ar-EG')}
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
                      onClick={() => handleEditClick(lesson)}
                      aria-label="تعديل الدرس"
                    />
                    <IconButton
                      icon={<FaTrash />}
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleDeleteClick(lesson)}
                      aria-label="حذف الدرس"
                    />
                    <Link to={`/lesson/${lesson.id}`} style={{ flex: 1 }}>
                      <Button
                        rightIcon={<FaPlay />}
                        variant="solid"
                        colorScheme="blue"
                        w="full"
                        size="sm"
                      >
                        بدء الدرس
                      </Button>
                    </Link>
                  </HStack>
                </CardFooter>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Add Lesson Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaPlus color="blue.500" />
              <Text>إنشاء درس جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>اسم الدرس</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الدرس"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>وصف الدرس (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف الدرس"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>صورة الدرس (اختياري)</FormLabel>
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
                إنشاء الدرس
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack>
              <FaEdit color="green.500" />
              <Text>تعديل الدرس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>اسم الدرس</FormLabel>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="أدخل اسم الدرس"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>وصف الدرس (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="أدخل وصف الدرس"
                    rows={4}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>صورة الدرس (اختياري)</FormLabel>
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
                تحديث الدرس
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
                  هل أنت متأكد من حذف الدرس؟
                </Text>
                <Text mt={2} color="gray.600">
                  "{deletingLesson?.name}"
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
                حذف الدرس
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

export default ChapterQuestion;
