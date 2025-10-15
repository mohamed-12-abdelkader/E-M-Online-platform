import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Image,
  Button,
  IconButton,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  Spinner,
  Center,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useToast,
  Divider,
  Icon,
  Flex,
  Spacer,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  FaUser,
  FaBookOpen,
  FaUsers,
  FaFileAlt,
  FaClipboardList,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChartLine,
  FaStar,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import baseUrl from "../../api/baseUrl";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

// Motion Components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);
const MotionGrid = motion(Grid);
const MotionCenter = motion(Center);

const TeacherDashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  
  // States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [grades, setGrades] = useState([]);
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    description: "",
    grade_id: ""
  });
  const [courseAvatar, setCourseAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editData, setEditData] = useState({
    id: null,
    title: "",
    price: 0,
    description: "",
    grade_id: ""
  });
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const toast = useToast();
  const cancelRef = useRef();

  // Quick Links data
  const quickLinks = [
    {
      id: 1,
      title: "بنك الأسئلة",
      description: "إدارة الأسئلة والامتحانات",
      icon: FaClipboardList,
      color: "blue",
      link: "/Teacher_subjects",
      gradient: "linear(to-br, blue.400, blue.600)"
    },
    {
      id: 2,
      title: "سيستم إدارة السنتر",
      description: "إدارة الطلاب والصفوف",
      icon: FaUsers,
      color: "green",
      link: "/center_groups",
      gradient: "linear(to-br, green.400, green.600)"
    },
    {
      id: 3,
      title: "الرسائل",
      description: "التواصل مع الطلاب",
      icon: FaEnvelope,
      color: "purple",
      link: "/TeacherChat",
      gradient: "linear(to-br, purple.400, purple.600)"
    },
    {
      id: 4,
      title: "EM Social",
      description: "الشبكة الاجتماعية التعليمية",
      icon: FaChartLine,
      color: "orange",
      link: "/social",
      gradient: "linear(to-br, orange.400, orange.600)"
    }
  ];

  // Color mode values
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Check if token exists
      if (!token) {
        throw new Error('No token found');
      }
      
      console.log('Fetching courses with token:', token); // Debug log
      const response = await baseUrl.get('api/course/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API Response:', response.data); // Debug log
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('حدث خطأ في تحميل الكورسات');
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch grades
  const fetchGrades = async () => {
    try {
      const response = await baseUrl.get('api/teacher/grades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف صورة صحيح",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ في حجم الملف",
          description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setCourseAvatar(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear avatar
  const clearAvatar = () => {
    setCourseAvatar(null);
    setAvatarPreview(null);
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Create course
  const handleCreateCourse = async () => {
    if (!formData.title || !formData.price || !formData.description || !formData.grade_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setFormLoading(true);
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', parseInt(formData.price));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('grade_id', parseInt(formData.grade_id));
      
      // Add avatar if selected
      if (courseAvatar) {
        formDataToSend.append('avatar', courseAvatar);
      }

      await baseUrl.post('api/course', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "تم إنشاء الكورس بنجاح",
        description: "تم إضافة الكورس الجديد إلى قائمة كورساتك",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setFormData({ title: "", price: 0, description: "", grade_id: "" });
      clearAvatar();
      onClose();
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "خطأ في إنشاء الكورس",
        description: error.response?.data?.message || "حدث خطأ أثناء إنشاء الكورس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Edit course
  const handleEditCourse = (course) => {
    setEditData({
      id: course.id,
      title: course.title,
      price: parseFloat(course.price),
      description: course.description,
      grade_id: course.grade_id.toString()
    });
    onEditOpen();
  };

  // Update course
  const handleUpdateCourse = async () => {
    if (!editData.title || !editData.price || !editData.description || !editData.grade_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setEditLoading(true);
      await baseUrl.put(`api/course/${editData.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "تم تحديث الكورس بنجاح",
        description: "تم تحديث بيانات الكورس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditData({ id: null, title: "", price: 0, description: "", grade_id: "" });
      onEditClose();
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "خطأ في تحديث الكورس",
        description: error.response?.data?.message || "حدث خطأ أثناء تحديث الكورس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    onDeleteOpen();
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      setDeleteLoading(true);
      await baseUrl.delete(`api/course/${courseToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "تم حذف الكورس بنجاح",
        description: "تم حذف الكورس من قائمة كورساتك",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "خطأ في حذف الكورس",
        description: error.response?.data?.message || "حدث خطأ أثناء حذف الكورس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter courses by grade
  const filteredCourses = selectedGrade 
    ? courses.filter(course => course.grade_id === parseInt(selectedGrade))
    : courses;

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    console.log('User:', user);
    console.log('Token:', token);
    fetchCourses();
    fetchGrades();
  }, []);

  return (
    <Box minH="100vh" bg={bg} p={6} dir="rtl">
      <Container maxW="7xl" mx="auto">
        <MotionVStack
          spacing={8}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Welcome Section */}
          <MotionCard
            w="full"
            bgGradient="linear(135deg, blue.500 0%, blue.600 100%)"
            color="white"
            borderRadius="2xl"
            shadow="2xl"
            overflow="hidden"
            variants={itemVariants}
          >
            <CardBody p={8}>
              <HStack spacing={6} align="center">
                <Box position="relative">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    w="120px"
                    h="120px"
                    borderRadius="full"
                    objectFit="cover"
                    border="4px solid"
                    borderColor="white"
                    shadow="lg"
                  />
                  <Box
                    position="absolute"
                    bottom={2}
                    right={2}
                    w="30px"
                    h="30px"
                    bg="green.500"
                    borderRadius="full"
                    border="3px solid"
                    borderColor="white"
                  />
                </Box>
                
                <VStack align="flex-start" spacing={3} flex={1}>
                  <MotionHeading size="2xl" fontWeight="bold">
                    مرحباً بك، {user.name}! 👋
                  </MotionHeading>
                  <MotionText fontSize="lg" opacity={0.9}>
                    أهلاً وسهلاً بك في لوحة تحكم المدرس
                  </MotionText>
                  <HStack spacing={4}>
                    <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                      <Icon as={FaUser} mr={1} />
                      {user.role}
                    </Badge>
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                      <Icon as={FaCalendarAlt} mr={1} />
                      عضو منذ 2024
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </MotionCard>

          {/* Quick Links Section */}
          <MotionBox w="full" variants={itemVariants}>
            <MotionHeading size="xl" mb={6} color={headingColor} textAlign="center">
              روابط سريعة
            </MotionHeading>
            <MotionGrid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
              gap={6}
              variants={containerVariants}
            >
              {quickLinks.map((link) => (
                <Link key={link.id} to={link.link} style={{ textDecoration: 'none' }}>
                  <MotionCard
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="lg"
                    variants={cardVariants}
                    whileHover="hover"
                    cursor="pointer"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      borderColor: `${link.color}.300`
                    }}
                    transition="all 0.3s ease"
                  >
                    <CardBody p={6} textAlign="center">
                      <VStack spacing={4}>
                        <Box
                          p={4}
                          borderRadius="full"
                          bgGradient={link.gradient}
                          color="white"
                          shadow="lg"
                          _hover={{
                            transform: "scale(1.1)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          <Icon as={link.icon} boxSize={8} />
                        </Box>
                        <VStack spacing={2}>
                          <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                            {link.title}
                          </Text>
                          <Text color={textColor} fontSize="sm" textAlign="center">
                            {link.description}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </Link>
              ))}
            </MotionGrid>
          </MotionBox>

          {/* Courses Section */}
          <MotionBox w="full" variants={itemVariants}>
            <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
              <MotionHeading size="xl" color={headingColor}>
                كورساتي
              </MotionHeading>
              <HStack spacing={4} flexWrap="wrap">
                <Select
                  placeholder="كل الصفوف"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  w="200px"
                  bg={cardBg}
                  borderColor={borderColor}
                >
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>
                <MotionButton
                  colorScheme="green"
                  leftIcon={<FaPlus />}
                  onClick={onOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  إضافة كورس جديد
                </MotionButton>
              </HStack>
            </HStack>

            <AnimatePresence mode="wait">
              {loading ? (
                <MotionCenter py={12} variants={itemVariants}>
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color={textColor}>جاري تحميل الكورسات...</Text>
                  </VStack>
                </MotionCenter>
              ) : error ? (
                <MotionCenter py={12} variants={itemVariants}>
                  <VStack spacing={4}>
                    <Icon as={FaBookOpen} boxSize={16} color="red.500" />
                    <Text color="red.500" fontSize="lg">{error}</Text>
                    <Text color="gray.500" fontSize="sm">Debug: {JSON.stringify({loading, error, courses: courses.length})}</Text>
                    <Button colorScheme="blue" onClick={fetchCourses}>
                      إعادة المحاولة
                    </Button>
                  </VStack>
                </MotionCenter>
              ) : filteredCourses.length === 0 ? (
                <MotionCenter py={12} variants={itemVariants}>
                  <VStack spacing={4}>
                    <Icon as={FaBookOpen} boxSize={16} color="gray.400" />
                    <Text color="gray.500" fontSize="lg">لا توجد كورسات متاحة</Text>
                  </VStack>
                </MotionCenter>
              ) : (
                <MotionGrid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                  gap={6}
                  variants={containerVariants}
                >
                  {filteredCourses.map((course) => (
                    <MotionCard
                      key={course.id}
                      bg={cardBg}
                      borderRadius="xl"
                      shadow="lg"
                      variants={cardVariants}
                      whileHover="hover"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      {/* Course Image */}
                      {course.avatar && (
                        <Box position="relative" overflow="hidden">
                          <Image
                            src={course.avatar}
                            alt={course.title}
                            w="full"
                            h="200px"
                            objectFit="cover"
                            borderRadius="xl"
                          />
                          <Badge
                            position="absolute"
                            top={3}
                            right={3}
                            colorScheme="blue"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            كورس تعليمي
                          </Badge>
                        </Box>
                      )}
                      
                      <CardHeader pb={4}>
                        <HStack justify="space-between" align="flex-start">
                          <VStack align="flex-start" spacing={2} flex={1}>
                            <Heading size="md" color={headingColor} noOfLines={2}>
                              {course.title}
                            </Heading>
                            <Text fontSize="sm" color={textColor} noOfLines={2}>
                              {course.description}
                            </Text>
                          </VStack>
                          <HStack spacing={2}>
                            <Tooltip label="تعديل الكورس">
                              <MotionIconButton
                                icon={<FaEdit />}
                                aria-label="تعديل"
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEditCourse(course)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              />
                            </Tooltip>
                            <Tooltip label="حذف الكورس">
                              <MotionIconButton
                                icon={<FaTrash />}
                                aria-label="حذف"
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteCourse(course)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              />
                            </Tooltip>
                          </HStack>
                        </HStack>
                      </CardHeader>
                      
                      <CardBody pt={0}>
                        <VStack spacing={4} align="stretch">
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Icon as={FaCalendarAlt} color="blue.500" />
                              <Text fontSize="sm" color={textColor}>
                                {new Date(course.created_at).toLocaleDateString('ar-EG')}
                              </Text>
                            </HStack>
                            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                              {course.price} ج.م
                            </Badge>
                          </HStack>
                          
                          <Divider />
                          
                          <HStack justify="space-between">
                            <Link className="w-full" to={`/CourseDetailsPage/${course.id}`}>
                            <Button colorScheme="blue" w="full">
                              ادارة الكورس 
                            </Button>
                            </Link>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </MotionGrid>
              )}
            </AnimatePresence>
          </MotionBox>
        </MotionVStack>
      </Container>

      {/* Create Course Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            <HStack spacing={3}>
              <Icon as={FaPlus} color="green.500" boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">إضافة كورس جديد</Text>
            </HStack>
          </ModalHeader>
          
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>عنوان الكورس</FormLabel>
                <Input
                  placeholder="مثال: كورس فيزياء أولى ثانوي"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "green.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>وصف الكورس</FormLabel>
                <Textarea
                  placeholder="اكتب وصفاً مفصلاً للكورس..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  borderRadius="xl"
                  rows={4}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "green.500" }}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="bold" color={headingColor}>السعر</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) => handleInputChange('price', value)}
                    min={0}
                    max={10000}
                  >
                    <NumberInputField
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: "green.500" }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="bold" color={headingColor}>المرحلة الدراسية</FormLabel>
                  <Select
                    placeholder="اختر المرحلة"
                    value={formData.grade_id}
                    onChange={(e) => handleInputChange('grade_id', e.target.value)}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "green.500" }}
                  >
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              {/* Avatar Upload Section */}
              <FormControl>
                <FormLabel fontWeight="bold" color={headingColor}>صورة الكورس</FormLabel>
                <VStack spacing={4} align="stretch">
                  {avatarPreview ? (
                    <Box position="relative" w="full">
                      <Image
                        src={avatarPreview}
                        alt="Course Avatar Preview"
                        w="full"
                        h="200px"
                        objectFit="cover"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="green.200"
                      />
                      <IconButton
                        icon={<FaTrash />}
                        aria-label="حذف الصورة"
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="red"
                        size="sm"
                        borderRadius="full"
                        onClick={clearAvatar}
                      />
                    </Box>
                  ) : (
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="xl"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{
                        borderColor: "green.400",
                        bg: "green.50"
                      }}
                      transition="all 0.2s"
                    >
                      <VStack spacing={4}>
                        <Icon as={FaFileAlt} boxSize={8} color="gray.400" />
                        <VStack spacing={2}>
                          <Text fontWeight="medium" color={textColor}>
                            انقر لاختيار صورة الكورس
                          </Text>
                          <Text fontSize="sm" color={textColor}>
                            PNG, JPG, JPEG حتى 5 ميجابايت
                          </Text>
                        </VStack>
                      </VStack>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="full"
                        opacity={0}
                        cursor="pointer"
                      />
                    </Box>
                  )}
                </VStack>
              </FormControl>

              <Box
                p={4}
                bg={useColorModeValue("green.50", "green.900")}
                borderRadius="xl"
                border="1px solid"
                borderColor="green.200"
              >
                <HStack spacing={3}>
                  <Icon as={FaFileAlt} color="green.500" />
                  <Text fontSize="sm" color="green.700" fontWeight="medium">
                    يمكنك إضافة صورة للكورس لتحسين مظهره وجذب الطلاب. الصورة اختيارية.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button
              colorScheme="green"
              onClick={handleCreateCourse}
              isLoading={formLoading}
              loadingText="جاري الإنشاء..."
            >
              إنشاء الكورس
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" shadow="2xl">
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            <HStack spacing={3}>
              <Icon as={FaEdit} color="blue.500" boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">تعديل الكورس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>عنوان الكورس</FormLabel>
                <Input
                  placeholder="مثال: كورس فيزياء أولى ثانوي"
                  value={editData.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>وصف الكورس</FormLabel>
                <Textarea
                  placeholder="اكتب وصفاً مفصلاً للكورس..."
                  value={editData.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  borderRadius="xl"
                  rows={4}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500" }}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="bold" color={headingColor}>السعر</FormLabel>
                  <NumberInput
                    value={editData.price}
                    onChange={(value) => handleEditChange('price', value)}
                    min={0}
                    max={10000}
                  >
                    <NumberInputField
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: "blue.500" }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="bold" color={headingColor}>المرحلة الدراسية</FormLabel>
                  <Select
                    placeholder="اختر المرحلة"
                    value={editData.grade_id}
                    onChange={(e) => handleEditChange('grade_id', e.target.value)}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.500" }}
                  >
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              إلغاء
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateCourse}
              isLoading={editLoading}
              loadingText="جاري التحديث..."
            >
              تحديث الكورس
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={cardBg} borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={headingColor}>
              تأكيد حذف الكورس
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text color={textColor}>
                هل أنت متأكد من حذف الكورس "{courseToDelete?.title}"؟ 
                هذا الإجراء لا يمكن التراجع عنه.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={deleteLoading}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <ScrollToTop />
    </Box>
  );
};

export default TeacherDashboardHome;
