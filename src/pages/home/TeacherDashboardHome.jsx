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
  FaImage,
  FaTimes,
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
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  
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
    grade_id: "",
    avatar: null
  });
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
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

  // Fetch available subjects
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await baseUrl.get('/api/packages/subjects/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
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

  // Handle edit avatar change
  const handleEditAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => setEditAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
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
      grade_id: course.grade_id.toString(),
      avatar: null
    });
    // عرض الصورة الحالية للكورس إذا كانت موجودة
    setEditAvatarPreview(course.avatar || course.image || null);
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
      
      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('price', editData.price);
      formData.append('description', editData.description);
      formData.append('grade_id', editData.grade_id);
      
      if (editData.avatar) {
        formData.append('avatar', editData.avatar);
      } else if (!editAvatarPreview) {
        // إرسال إشارة لإزالة الصورة الحالية
        formData.append('remove_avatar', 'true');
      }

      await baseUrl.put(`api/course/${editData.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "تم تحديث الكورس بنجاح",
        description: "تم تحديث بيانات الكورس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditData({ id: null, title: "", price: 0, description: "", grade_id: "", avatar: null });
      setEditAvatarPreview(null);
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
    fetchSubjects();
  }, []);

  return (
    <Box className="home-page" minH="100vh" bg={bg} p={{ base: 2, sm: 4, md: 6, lg: 8 }} dir="rtl">
      <Container 
        maxW={{ base: "100%", sm: "100%", md: "6xl", lg: "7xl", xl: "8xl" }} 
        mx="auto"
        px={{ base: 1, sm: 2, md: 2 }}
        sx={{
          '@media (min-width: 840px) and (max-width: 850px)': {
            paddingInline: '4px'
          }
        }}
      >
        <MotionVStack
          spacing={{ base: 4, sm: 6, md: 8, lg: 10 }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Welcome Section */}
          <MotionCard
          className="Welcome-Section"
            w="full"
            bgGradient="linear(135deg, blue.300 0%, blue.600 100%)"
            color="white"
            borderRadius={{ base: "lg", sm: "xl", md: "2xl" }}
            shadow={{ base: "lg", md: "2xl" }}
            overflow="hidden"
            variants={itemVariants}
          >
            <CardBody p={{ base: 3, sm: 4, md: 6, lg: 8 }}>
              <VStack 
                spacing={{ base: 3, sm: 4, md: 6 }} 
                align={{ base: "center", lg: "flex-start" }}
                direction={{ base: "column", lg: "row" }}
              >
                <Box position="relative" flexShrink={0}>
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    w={{ base: "70px", sm: "90px", md: "110px", lg: "120px" }}
                    h={{ base: "70px", sm: "90px", md: "110px", lg: "120px" }}
                    borderRadius="full"
                    objectFit="cover"
                    border="4px solid"
                    borderColor="white"
                    shadow="lg"
                  />
                  <Box
                    position="absolute"
                    bottom={1}
                    right={1}
                    w={{ base: "16px", sm: "20px", md: "25px", lg: "30px" }}
                    h={{ base: "16px", sm: "20px", md: "25px", lg: "30px" }}
                    bg="green.500"
                    borderRadius="full"
                    border="3px solid"
                    borderColor="white"
                  />
                </Box>
                
                <VStack 
                  align={{ base: "center", lg: "flex-start" }} 
                  spacing={{ base: 2, sm: 3, md: 4 }} 
                  flex={1}
                  textAlign={{ base: "center", lg: "left" }}
                >
                  <MotionHeading 
                    size={{ base: "md", sm: "lg", md: "xl", lg: "2xl" }} 
                    fontWeight="bold"
                    textAlign={{ base: "center", lg: "left" }}
                    lineHeight={{ base: 1.2, md: 1.3 }}
                  >
                    مرحباً بك، {user.name}! 👋
                  </MotionHeading>
                  <MotionText 
                    fontSize={{ base: "sm", sm: "md", md: "lg" }} 
                    opacity={0.9}
                    textAlign={{ base: "center", lg: "left" }}
                    lineHeight={{ base: 1.4, md: 1.5 }}
                  >
                    أهلاً وسهلاً بك في لوحة تحكم المدرس
                  </MotionText>
                  <HStack 
                    spacing={{ base: 1, sm: 2, md: 3, lg: 4 }} 
                    flexWrap="wrap" 
                    justify={{ base: "center", lg: "flex-start" }}
                    gap={{ base: 2, sm: 3 }}
                  >
                    <Badge 
                      colorScheme="blue" 
                      px={{ base: 2, sm: 3, md: 4 }} 
                      py={1} 
                      borderRadius="full"
                      fontSize={{ base: "xs", sm: "sm" }}
                    >
                      <Icon as={FaUser} mr={1} boxSize={{ base: 3, sm: 4 }} />
                      {user.role}
                    </Badge>
                    <Badge 
                      colorScheme="green" 
                      px={{ base: 2, sm: 3, md: 4 }} 
                      py={1} 
                      borderRadius="full"
                      fontSize={{ base: "xs", sm: "sm" }}
                    >
                      <Icon as={FaCalendarAlt} mr={1} boxSize={{ base: 3, sm: 4 }} />
                      عضو منذ 2024
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </MotionCard>

          {/* Quick Links Section */}
          <MotionBox w="full" variants={itemVariants}>
            <MotionHeading 
              size={{ base: "md", sm: "lg", md: "xl", lg: "2xl" }} 
              mb={{ base: 3, sm: 4, md: 6, lg: 8 }} 
              color="blue.500" 
              textAlign="center"
              fontWeight={{ base: "semibold", md: "bold" }}
            >
              روابط سريعة
            </MotionHeading>
            <MotionGrid
              templateColumns={{ 
                base: "1fr", 
                sm: "repeat(2, 1fr)", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(4, 1fr)",
                xl: "repeat(4, 1fr)"
              }}
              gap={{ base: 3, sm: 4, md: 5, lg: 6 }}
              variants={containerVariants}
              w="full"
            >
              {quickLinks.map((link) => (
                <Link key={link.id} to={link.link} style={{ textDecoration: 'none', width: '100%' }}>
                  <MotionCard
                  
                    bg={cardBg}
                    borderRadius={{ base: "md", sm: "lg", md: "xl" }}
                    shadow={{ base: "sm", sm: "md", md: "lg" }}
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
                    minH={{ base: "120px", sm: "140px", md: "160px", lg: "180px" }}
                    w="full"
                    h="full"
                    className="mx-auto link-div"
                  >
                    <CardBody  p={{ base: 3, sm: 4, md: 5, lg: 6 }} textAlign="center" h="full">
                      <VStack spacing={{ base: 2, sm: 3, md: 4 }} h="full" justify="center">
                        <Box
                          p={{ base: 2, sm: 3, md: 4 }}
                          borderRadius="full"
                          bgGradient={link.gradient}
                          color="white"
                          shadow="lg"
                          _hover={{
                            transform: "scale(1.1)",
                            transition: "transform 0.2s ease"
                          }}
                          w="fit-content"
                          mx="auto"
                        >
                          <Icon as={link.icon} boxSize={{ base: 5, sm: 6, md: 7, lg: 8 }} />
                        </Box>
                        <VStack spacing={{ base: 1, sm: 2 }} flex={1} justify="center">
                          <Text 
                            fontSize={{ base: "sm", sm: "md", md: "lg" }} 
                            fontWeight={{ base: "semibold", md: "bold" }} 
                            color="blue.500"
                            noOfLines={2}
                            lineHeight={{ base: 1.3, md: 1.4 }}
                          >
                            {link.title}
                          </Text>
                          <Text 
                            color={textColor} 
                            fontSize={{ base: "xs", sm: "sm", md: "sm" }} 
                            textAlign="center"
                            noOfLines={2}
                            lineHeight={{ base: 1.4, md: 1.5 }}
                          >
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

          {/* Subjects Section */}
          {subjects.length > 0 && (
            <MotionBox w="full" variants={itemVariants}>
              <VStack spacing={{ base: 3, sm: 4, md: 6 }} align="stretch" mb={{ base: 4, sm: 5, md: 6, lg: 8 }}>
                <MotionHeading 
                  size={{ base: "md", sm: "lg", md: "xl", lg: "2xl" }} 
                  color="blue.500"
                  textAlign={{ base: "center",  }}
                  fontWeight={{ base: "semibold", md: "bold" }}
                >
                  موادي
                </MotionHeading>

                {subjectsLoading ? (
                  <MotionCenter py={12} variants={itemVariants}>
                    <VStack spacing={4}>
                      <Spinner size="xl" color="blue.500" thickness="4px" />
                      <Text color={textColor}>جاري تحميل المواد...</Text>
                    </VStack>
                  </MotionCenter>
                ) : (
                  <MotionGrid
                    templateColumns={{ 
                      base: "1fr", 
                      sm: "repeat(2, 1fr)", 
                      md: "repeat(2, 1fr)", 
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(3, 1fr)"
                    }}
                    gap={{ base: 3, sm: 3, md: 3, lg: 5 }}
                    variants={containerVariants}
                    w="full"
                    className="mb-10"
                    justifyItems="stretch"
                  >
                    {subjects.map((subject) => (
                      <MotionCard
                        key={subject.id}
                        bg={cardBg}
                        borderRadius={{ base: "md", sm: "lg", md: "xl" }}
                        shadow={{ base: "sm", sm: "md", md: "lg" }}
                        variants={cardVariants}
                        whileHover="hover"
                        border="1px solid"
                        borderColor={borderColor}
                        w="full"
                        h="full"
                        className="mx-auto teacher-subject"
                        as={Link}
                        to={`/subject/${subject.id}`}
                        style={{ textDecoration: 'none' }}
                        cursor="pointer"
                      >
                        {/* Subject Image */}
                        {subject.image && (
                          <Box position="relative" overflow="hidden">
                            <Image
                              src={subject.image}
                              alt={subject.name}
                              w="full"
                              h={{ base: "180px", sm: "180px", md: "180px", lg: "200px" }}
                              objectFit="cover"
                              borderRadius={{ base: "md", sm: "lg", md: "xl" }}
                            />
                            <Badge
                              position="absolute"
                              top={1}
                              right={1}
                              colorScheme="purple"
                              borderRadius="full"
                              px={{ base: 1, sm: 2, md: 3 }}
                              py={1}
                              fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                            >
                              مادة دراسية
                            </Badge>
                          </Box>
                        )}
                        
                        <CardHeader pb={{ base: 2, sm: 3, md: 4 }} px={{ base: 3, sm: 4, md: 5 }}>
                          <VStack align="flex-start" spacing={{ base: 2, sm: 3 }} w="full">
                            <VStack align="flex-start" spacing={{ base: 1, sm: 2 }} flex={1} minW={0} w="full">
                              <Heading 
                                size={{ base: "xs", sm: "sm", md: "md" }} 
                                color="purple.500"
                                noOfLines={2}
                                w="full"
                                lineHeight={{ base: 1.3, md: 1.4 }}
                              >
                                {subject.name}
                              </Heading>
                              <Text 
                                fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                                color={textColor} 
                                noOfLines={1}
                                w="full"
                                lineHeight={{ base: 1.4, md: 1.5 }}
                              >
                                {subject.package_name}
                              </Text>
                              <Text 
                                fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                                color="blue.500" 
                                fontWeight="medium"
                                noOfLines={1}
                                w="full"
                              >
                                {subject.grade_name}
                              </Text>
                            </VStack>
                          </VStack>
                        </CardHeader>
                        
                        <CardBody pt={0} px={{ base: 3, sm: 4, md: 5 }} pb={{ base: 3, sm: 4, md: 5 }}>
                          <VStack spacing={{ base: 2, sm: 3, md: 4 }} align="stretch">
                            <HStack justify="space-between" flexWrap="wrap" gap={2}>
                              <HStack spacing={1} minW={0} flex={1}>
                                <Icon as={FaBookOpen} color="purple.500" boxSize={{ base: 3, sm: 3, md: 4 }} />
                                <Text 
                                  fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                                  color={textColor}
                                  noOfLines={1}
                                >
                                  {subject.courses_count || 0} كورس
                                </Text>
                              </HStack>
                              <Badge 
                                colorScheme="purple" 
                                px={{ base: 1, sm: 2, md: 3 }} 
                                py={1} 
                                borderRadius="full"
                                fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                              >
                                {subject.courses_count || 0} كورس
                              </Badge>
                            </HStack>
                            
                            {/* Courses List */}
                            {subject.courses && subject.courses.length > 0 && (
                              <>
                                <Divider />
                                <VStack align="stretch" spacing={2}>
                                  <Text 
                                    fontSize={{ base: "2xs", sm: "xs" }} 
                                    color={textColor}
                                    fontWeight="medium"
                                  >
                                    الكورسات:
                                  </Text>
                                  {subject.courses.slice(0, 3).map((course) => (
                                    <HStack 
                                      key={course.id}
                                      spacing={2}
                                      p={2}
                                      bg={useColorModeValue("gray.50", "gray.700")}
                                      borderRadius="md"
                                      _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                                    >
                                      {course.avatar && (
                                        <Image
                                          src={course.avatar}
                                          alt={course.title}
                                          w="40px"
                                          h="40px"
                                          borderRadius="md"
                                          objectFit="cover"
                                        />
                                      )}
                                      <VStack align="start" spacing={0} flex={1} minW={0}>
                                        <Text 
                                          fontSize={{ base: "2xs", sm: "xs" }} 
                                          color={textColor}
                                          fontWeight="medium"
                                          noOfLines={1}
                                        >
                                          {course.title}
                                        </Text>
                                        <Text 
                                          fontSize={{ base: "2xs", sm: "xs" }} 
                                          color="blue.500"
                                          noOfLines={1}
                                        >
                                          {course.price} ج.م
                                        </Text>
                                      </VStack>
                                      {course.is_visible ? (
                                        <Icon as={FaEye} color="green.500" boxSize={3} />
                                      ) : (
                                        <Icon as={FaEyeSlash} color="gray.400" boxSize={3} />
                                      )}
                                    </HStack>
                                  ))}
                                  {subject.courses.length > 3 && (
                                    <Text 
                                      fontSize={{ base: "2xs", sm: "xs" }} 
                                      color="blue.500"
                                      textAlign="center"
                                      fontWeight="medium"
                                    >
                                      +{subject.courses.length - 3} كورس آخر
                                    </Text>
                                  )}
                                </VStack>
                              </>
                            )}
                            
                            <Divider />
                            
                            <Button 
                              colorScheme="purple" 
                              w="full"
                              size={{ base: "md", sm: "md", md: "md" }}
                              borderRadius={{ base: "md", md: "lg" }}
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `/subject/${subject.id}`;
                              }}
                            >
                              عرض المادة
                            </Button>
                          </VStack>
                        </CardBody>
                      </MotionCard>
                    ))}
                  </MotionGrid>
                )}
              </VStack>
            </MotionBox>
          )}

          {/* Courses Section */}
          <MotionBox w="full" variants={itemVariants}>
            <VStack spacing={{ base: 3, sm: 4, md: 6 }} align="stretch" mb={{ base: 4, sm: 5, md: 6, lg: 8 }}>
              <MotionHeading 
                size={{ base: "md", sm: "lg", md: "xl", lg: "2xl" }} 
                color="blue.500"
                textAlign={{ base: "center",  }}
                fontWeight={{ base: "semibold", md: "bold" }}
              >
                كورساتي
              </MotionHeading>
              <VStack 
                spacing={{ base: 3, sm: 4 }} 
                align={{ base: "stretch", lg: "flex-end" }}
                direction={{ base: "column", lg: "row" }}
                w="full"
                
              >
                <Select
                  placeholder="كل الصفوف"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  w={{ base: "full", lg: "250px" }}
                  bg={cardBg}
                  borderColor={borderColor}
                  size={{ base: "sm", sm: "md" }}
                  borderRadius={{ base: "md", md: "lg" }}
                >
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>

                <MotionButton
                  colorScheme="blue"
                  leftIcon={<FaPlus />}
                  onClick={onOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  size={{ base: "sm", sm: "md" }}
                  w={{ base: "full", lg: "auto" }}
                  minW={{ base: "auto", lg: "200px" }}
                  borderRadius={{ base: "md", md: "lg" }}
                >
                  إضافة كورس جديد
                </MotionButton>
              </VStack>
            </VStack>

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
                  templateColumns={{ 
                    base: "1fr", 
                    sm: "repeat(2, 1fr)", 
                    md: "repeat(2, 1fr)", 
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(3, 1fr)"
                  }}
                  gap={{ base: 3, sm: 3, md: 3, lg: 5 }}
                  variants={containerVariants}
                  w="full"
                  className="mb-10"
                  justifyItems="stretch"
                  sx={{
                    '@media (min-width: 840px) and (max-width: 850px)': {
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px'
                    }
                  }}
                >
                  {filteredCourses.map((course) => (
                    <MotionCard
                      key={course.id}
                      bg={cardBg}
                      borderRadius={{ base: "md", sm: "lg", md: "xl" }}
                      shadow={{ base: "sm", sm: "md", md: "lg" }}
                      variants={cardVariants}
                      whileHover="hover"
                      border="1px solid"
                      borderColor={borderColor}
                      w="full"
                      h="full"
                      className="mx-auto teacher-course"
                    >
                      {/* Course Image */}
                      {course.avatar && (
                        <Box position="relative" overflow="hidden">
                          <Image
                            src={course.avatar}
                            alt={course.title}
                            w="full"
                            h={{ base: "180px", sm: "180px", md: "180px", lg: "200px" }}
                            objectFit="cover"
                            borderRadius={{ base: "md", sm: "lg", md: "xl" }}
                          />
                          <Badge
                            position="absolute"
                            top={1}
                            right={1}
                            colorScheme="blue"
                            borderRadius="full"
                            px={{ base: 1, sm: 2, md: 3 }}
                            py={1}
                            fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                          >
                            كورس تعليمي
                          </Badge>
                        </Box>
                      )}
                      
                      <CardHeader pb={{ base: 2, sm: 3, md: 4 }} px={{ base: 3, sm: 4, md: 5 }}>
                        <VStack align="flex-start" spacing={{ base: 2, sm: 3 }} w="full">
                          <HStack justify="space-between" align="flex-start" w="full" gap={2}>
                            <VStack align="flex-start" spacing={{ base: 1, sm: 2 }} flex={1} minW={0}>
                              <Heading 
                                size={{ base: "xs", sm: "sm", md: "md" }} 
                                color="blue.500"
                                noOfLines={2}
                                w="full"
                                lineHeight={{ base: 1.3, md: 1.4 }}
                              >
                              {course.title}
                            </Heading>
                              <Text 
                                fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                                color={textColor} 
                                noOfLines={2}
                                w="full"
                                lineHeight={{ base: 1.4, md: 1.5 }}
                              >
                              {course.description}
                            </Text>
                          </VStack>
                            <HStack spacing={1} flexShrink={0}>
                            <Tooltip label="تعديل الكورس">
                              <MotionIconButton
                                icon={<FaEdit />}
                                aria-label="تعديل"
                                  size="2xs"
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
                                  size="2xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteCourse(course)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              />
                            </Tooltip>
                          </HStack>
                        </HStack>
                        </VStack>
                      </CardHeader>
                      
                      <CardBody pt={0} px={{ base: 3, sm: 4, md: 5 }} pb={{ base: 3, sm: 4, md: 5 }}>
                        <VStack spacing={{ base: 2, sm: 3, md: 4 }} align="stretch">
                          <HStack justify="space-between" flexWrap="wrap" gap={2}>
                            <HStack spacing={1} minW={0} flex={1}>
                              <Icon as={FaCalendarAlt} color="blue.500" boxSize={{ base: 3, sm: 3, md: 4 }} />
                              <Text 
                                fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                                color={textColor}
                                noOfLines={1}
                              >
                                {new Date(course.created_at).toLocaleDateString('ar-EG')}
                              </Text>
                            </HStack>
                            <Badge 
                              colorScheme="blue" 
                              px={{ base: 1, sm: 2, md: 3 }} 
                              py={1} 
                              borderRadius="full"
                              fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                            >
                              {course.price} ج.م
                            </Badge>
                          </HStack>
                          
                          <Divider />
                          
                          <Link to={`/CourseDetailsPage/${course.id}`} style={{ width: '100%' }}>
                            <Button 
                              colorScheme="blue" 
                              w="full"
                              size={{ base: "md", sm: "md", md: "md" }}
                              borderRadius={{ base: "md", md: "lg" }}
                            >
                              ادارة الكورس 
                            </Button>
                            </Link>
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
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", sm: "full", md: "lg", lg: "xl", xl: "2xl" }} 
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent 
          bg={cardBg} 
          borderRadius={{ base: "none", sm: "none", md: "xl", lg: "2xl" }} 
          shadow={{ base: "none", md: "2xl" }}
          m={{ base: 0, sm: 0, md: 4, lg: 6 }}
          maxH={{ base: "100vh", sm: "100vh", md: "90vh", lg: "85vh" }}
          maxW={{ base: "100%", sm: "100%", md: "90%", lg: "80%", xl: "70%" }}
        >
          <ModalHeader 
            borderBottom="1px solid" 
            borderColor={borderColor}
            p={{ base: 3, sm: 4, md: 5, lg: 6 }}
          >
            <HStack spacing={{ base: 2, sm: 3 }}>
              <Icon as={FaPlus} color="blue.500" boxSize={{ base: 4, sm: 5, md: 6 }} />
              <Text 
                fontWeight="bold" 
                fontSize={{ base: "sm", sm: "md", md: "lg", lg: "xl" }}
              >
                إضافة كورس جديد
              </Text>
            </HStack>
          </ModalHeader>
          
          <ModalBody 
            py={{ base: 3, sm: 4, md: 5, lg: 6 }} 
            px={{ base: 3, sm: 4, md: 5, lg: 6 }}
          >
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              <FormControl isRequired>
                <FormLabel 
                  fontWeight="bold" 
                  color={headingColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  عنوان الكورس
                </FormLabel>
                <Input
                  placeholder="مثال: كورس فيزياء أولى ثانوي"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "green.500" }}
                  size={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel 
                  fontWeight="bold" 
                  color={headingColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  وصف الكورس
                </FormLabel>
                <Textarea
                  placeholder="اكتب وصفاً مفصلاً للكورس..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  borderRadius="xl"
                  rows={{ base: 3, md: 4 }}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "green.500" }}
                  size={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <VStack spacing={4} direction={{ base: "column", sm: "row" }}>
                <FormControl isRequired flex={1}>
                  <FormLabel 
                    fontWeight="bold" 
                    color={headingColor}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    السعر
                  </FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) => handleInputChange('price', value)}
                    min={0}
                    max={10000}
                    size={{ base: "sm", md: "md" }}
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
                  <FormLabel 
                    fontWeight="bold" 
                    color={headingColor}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    المرحلة الدراسية
                  </FormLabel>
                  <Select
                    placeholder="اختر المرحلة"
                    value={formData.grade_id}
                    onChange={(e) => handleInputChange('grade_id', e.target.value)}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "green.500" }}
                    size={{ base: "sm", md: "md" }}
                  >
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              {/* Avatar Upload Section */}
              <FormControl>
                <FormLabel 
                  fontWeight="bold" 
                  color={headingColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  صورة الكورس
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  {avatarPreview ? (
                    <Box position="relative" w="full">
                      <Image
                        src={avatarPreview}
                        alt="Course Avatar Preview"
                        w="full"
                        h={{ base: "150px", md: "200px" }}
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
                      p={{ base: 6, md: 8 }}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{
                        borderColor: "green.400",
                        bg: "green.50"
                      }}
                      transition="all 0.2s"
                    >
                      <VStack spacing={4}>
                        <Icon as={FaFileAlt} boxSize={{ base: 6, md: 8 }} color="gray.400" />
                        <VStack spacing={2}>
                          <Text 
                            fontWeight="medium" 
                            color={textColor}
                            fontSize={{ base: "sm", md: "md" }}
                          >
                            انقر لاختيار صورة الكورس
                          </Text>
                          <Text 
                            fontSize={{ base: "xs", md: "sm" }} 
                            color={textColor}
                          >
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
                p={{ base: 3, md: 4 }}
                bg={useColorModeValue("green.50", "green.900")}
                borderRadius="xl"
                border="1px solid"
                borderColor="green.200"
              >
                <HStack spacing={3}>
                  <Icon as={FaFileAlt} color="green.500" boxSize={{ base: 4, md: 5 }} />
                  <Text 
                    fontSize={{ base: "xs", md: "sm" }} 
                    color="green.700" 
                    fontWeight="medium"
                  >
                    يمكنك إضافة صورة للكورس لتحسين مظهره وجذب الطلاب. الصورة اختيارية.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTop="1px solid" 
            borderColor={borderColor}
            p={{ base: 4, md: 6 }}
            flexDirection={{ base: "column", sm: "row" }}
            gap={{ base: 3, sm: 0 }}
          >
            <Button 
              variant="ghost" 
              mr={{ base: 0, sm: 3 }} 
              onClick={onClose}
              w={{ base: "full", sm: "auto" }}
              size={{ base: "sm", md: "md" }}
            >
              إلغاء
            </Button>
            <Button
              colorScheme="green"
              onClick={handleCreateCourse}
              isLoading={formLoading}
              loadingText="جاري الإنشاء..."
              w={{ base: "full", sm: "auto" }}
              size={{ base: "sm", md: "md" }}
            >
              إنشاء الكورس
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Course Modal */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={onEditClose} 
        size={{ base: "full", sm: "full", md: "lg", lg: "xl", xl: "2xl" }} 
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent 
          bg={cardBg} 
          borderRadius={{ base: "none", sm: "none", md: "xl", lg: "2xl" }} 
          shadow={{ base: "none", md: "2xl" }}
          m={{ base: 0, sm: 0, md: 4, lg: 6 }}
          maxH={{ base: "100vh", sm: "100vh", md: "90vh", lg: "85vh" }}
          maxW={{ base: "100%", sm: "100%", md: "90%", lg: "80%", xl: "70%" }}
        >
          <ModalHeader 
            borderBottom="1px solid" 
            borderColor={borderColor}
            p={{ base: 4, md: 6 }}
          >
            <HStack spacing={3}>
              <Icon as={FaEdit} color="blue.500" boxSize={{ base: 5, md: 6 }} />
              <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                تعديل الكورس
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              {/* Avatar Upload */}
              <FormControl>
                <FormLabel 
                  fontWeight="bold" 
                  color={headingColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  صورة الكورس
                </FormLabel>
                <VStack spacing={4}>
                  {/* Current Avatar Preview */}
                  {editAvatarPreview && (
                    <Box position="relative">
                      <Image
                        src={editAvatarPreview}
                        alt="صورة الكورس الحالية"
                        boxSize={{ base: "120px", md: "150px" }}
                        objectFit="cover"
                        borderRadius="xl"
                        border="3px solid"
                        borderColor="blue.200"
                        shadow="lg"
                      />
                      <IconButton
                        icon={<FaTimes />}
                        size="sm"
                        colorScheme="red"
                        variant="solid"
                        borderRadius="full"
                        position="absolute"
                        top={-2}
                        right={-2}
                        onClick={() => {
                          setEditData(prev => ({ ...prev, avatar: null }));
                          setEditAvatarPreview(null);
                        }}
                        aria-label="إزالة الصورة"
                      />
                    </Box>
                  )}
                  
                  {/* Remove Current Image Button */}
                  {editAvatarPreview && (
                    <Button
                      leftIcon={<FaTrash />}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditData(prev => ({ ...prev, avatar: null }));
                        setEditAvatarPreview(null);
                      }}
                    >
                      إزالة الصورة الحالية
                    </Button>
                  )}
                  
                  {/* Upload Button */}
                  <Box>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleEditAvatarChange}
                      display="none"
                      id="edit-avatar-upload"
                    />
                    <Button
                      as="label"
                      htmlFor="edit-avatar-upload"
                      leftIcon={<FaImage />}
                      colorScheme="blue"
                      variant="outline"
                      size={{ base: "sm", md: "md" }}
                      cursor="pointer"
                      borderRadius="xl"
                      border="2px dashed"
                      borderColor="blue.300"
                      _hover={{
                        borderColor: "blue.500",
                        bg: "blue.50"
                      }}
                    >
                      {editAvatarPreview ? "تغيير الصورة" : "اختر صورة للكورس"}
                    </Button>
                  </Box>
                  
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    الصور المقبولة: JPG, PNG, GIF (حد أقصى 5MB)
                  </Text>
                  
                  {!editAvatarPreview && (
                    <Text fontSize="sm" color="blue.600" textAlign="center" fontWeight="medium">
                      💡 يمكنك إضافة صورة للكورس أو تغيير الصورة الحالية
                    </Text>
                  )}
                </VStack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel 
                  fontWeight="bold" 
                  color={headingColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  عنوان الكورس
                </FormLabel>
                <Input
                  placeholder="مثال: كورس فيزياء أولى ثانوي"
                  value={editData.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500" }}
                  size={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel 
                  fontWeight="bold" 
                  color={headingColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  وصف الكورس
                </FormLabel>
                <Textarea
                  placeholder="اكتب وصفاً مفصلاً للكورس..."
                  value={editData.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  borderRadius="xl"
                  rows={{ base: 3, md: 4 }}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500" }}
                  size={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <VStack spacing={4} direction={{ base: "column", sm: "row" }}>
                <FormControl isRequired flex={1}>
                  <FormLabel 
                    fontWeight="bold" 
                    color={headingColor}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    السعر
                  </FormLabel>
                  <NumberInput
                    value={editData.price}
                    onChange={(value) => handleEditChange('price', value)}
                    min={0}
                    max={10000}
                    size={{ base: "sm", md: "md" }}
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
                  <FormLabel 
                    fontWeight="bold" 
                    color={headingColor}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    المرحلة الدراسية
                  </FormLabel>
                  <Select
                    placeholder="اختر المرحلة"
                    value={editData.grade_id}
                    onChange={(e) => handleEditChange('grade_id', e.target.value)}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.500" }}
                    size={{ base: "sm", md: "md" }}
                  >
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTop="1px solid" 
            borderColor={borderColor}
            p={{ base: 4, md: 6 }}
            flexDirection={{ base: "column", sm: "row" }}
            gap={{ base: 3, sm: 0 }}
          >
            <Button 
              variant="ghost" 
              mr={{ base: 0, sm: 3 }} 
              onClick={onEditClose}
              w={{ base: "full", sm: "auto" }}
              size={{ base: "sm", md: "md" }}
            >
              إلغاء
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateCourse}
              isLoading={editLoading}
              loadingText="جاري التحديث..."
              w={{ base: "full", sm: "auto" }}
              size={{ base: "sm", md: "md" }}
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
        size={{ base: "xs", sm: "sm", md: "md", lg: "lg" }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent 
            bg={cardBg} 
            borderRadius={{ base: "lg", sm: "xl", md: "2xl" }}
            m={{ base: 3, sm: 4, md: 0 }}
            maxW={{ base: "95%", sm: "90%", md: "md", lg: "lg" }}
          >
            <AlertDialogHeader 
              fontSize={{ base: "md", md: "lg" }} 
              fontWeight="bold" 
              color={headingColor}
              p={{ base: 4, md: 6 }}
            >
              تأكيد حذف الكورس
            </AlertDialogHeader>
            <AlertDialogBody p={{ base: 4, md: 6 }} pt={0}>
              <Text 
                color={textColor}
                fontSize={{ base: "sm", md: "md" }}
                lineHeight={{ base: 1.5, md: 1.6 }}
              >
                هل أنت متأكد من حذف الكورس "{courseToDelete?.title}"؟ 
                هذا الإجراء لا يمكن التراجع عنه.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter 
              p={{ base: 4, md: 6 }}
              pt={0}
              flexDirection={{ base: "column", sm: "row" }}
              gap={{ base: 3, sm: 0 }}
            >
              <Button 
                ref={cancelRef} 
                onClick={onDeleteClose}
                w={{ base: "full", sm: "auto" }}
                size={{ base: "sm", md: "md" }}
              >
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={{ base: 0, sm: 3 }}
                isLoading={deleteLoading}
                loadingText="جاري الحذف..."
                w={{ base: "full", sm: "auto" }}
                size={{ base: "sm", md: "md" }}
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
