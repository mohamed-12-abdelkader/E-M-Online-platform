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
  SimpleGrid,
  useToast,
  Divider,
  Icon,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  FaRocket,
  FaGem,
  FaBell,
  FaSearch,
  FaFilter,
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

const StatsCard = ({ icon, label, value, color }) => (
  <VStack
    className="modern-card"
    p={5}
    spacing={2}
    align="center"
    justify="center"
    role="group"
  >
    <Flex
      w={12}
      h={12}
      align="center"
      justify="center"
      borderRadius="full"
      bg={`${color}.50`}
      color={`${color}.500`}
      transition="all 0.3s"
      _groupHover={{ bg: `${color}.500`, color: "white", transform: "scale(1.1) rotate(5deg)" }}
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Text fontSize="3xl" fontWeight="800" color="gray.800">
      {value}
    </Text>
    <Text fontSize="sm" fontWeight="medium" color="gray.500">
      {label}
    </Text>
  </VStack>
);

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
      description: "اضافة اسئلة جديدة",
      icon: FaClipboardList,
      color: "blue",
      link: "/Teacher_subjects",
    },
    {
      id: 2,
      title: "إدارة السنتر",
      description: "المجموعات والطلاب",
      icon: FaUsers,
      color: "orange",
      link: "/center_groups",
    },
    {
      id: 3,
      title: "الرسائل",
      description: "تواصل مع طلابك",
      icon: FaEnvelope,
      color: "blue",
      link: "/TeacherChat",
    },
    {
      id: 4,
      title: "EM Social",
      description: "المجتمع التعليمي",
      icon: FaRocket,
      color: "orange",
      link: "/social",
    }
  ];

  // Color mode values
  const bg = useColorModeValue("white", "gray.900"); // Plain white background
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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 }
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

  const WEEKDAY_LABELS = {
    sat: "السبت",
    sun: "الأحد",
    mon: "الاثنين",
    tue: "الثلاثاء",
    wed: "الأربعاء",
    thu: "الخميس",
    fri: "الجمعة",
  };

  const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "";
    return days.map((d) => WEEKDAY_LABELS[d] || d).join(" - ");
  };

  // Fetch teacher package subjects with groups
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await baseUrl.get('/api/teacher/package-subjects/groups', {
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
    <Box className="home-page" bg="white" minH="100vh" p={{ base: 2, sm: 4, md: 6, lg: 8 }} dir="rtl">
      <Container
        maxW="8xl"
        mx="auto"
        px={{ base: 2, md: 4 }}
      >
        <MotionVStack
          spacing={{ base: 8, md: 10 }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Modern Welcome Banner */}
          <MotionBox
            w="full"
            bgGradient="linear(to-l, blue.600, orange.500)"
            borderRadius="3xl"
            p={{ base: 6, md: 10 }}
            position="relative"
            overflow="hidden"
            variants={itemVariants}
            boxShadow="0 10px 40px -10px rgba(66, 153, 225, 0.5)"
          >
            {/* Background patterns */}
            <Box position="absolute" right="-10%" top="-50%" w="400px" h="400px" border="50px solid rgba(255,255,255,0.05)" borderRadius="full" />
            <Box position="absolute" left="-10%" bottom="-50%" w="300px" h="300px" bg="white" opacity="0.05" borderRadius="full" />

            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              gap={8}
            >
              <HStack spacing={6}>
                <Image
                  src={user.avatar}
                  alt={user.name}
                  w={{ base: "80px", md: "100px" }}
                  h={{ base: "80px", md: "100px" }}
                  borderRadius="full"
                  border="4px solid white"
                  boxShadow="lg"
                />
                <VStack align="start" spacing={1} color="white">
                  <Text fontSize="lg" opacity={0.9}>أهلاً بعودتك 👋</Text>
                  <Heading size="xl" fontWeight="black">{user.name}</Heading>
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    px={3} py={1}
                    borderRadius="full"
                    backdropFilter="blur(10px)"
                    fontSize="sm"
                  >
                    {user.role}
                  </Badge>
                </VStack>
              </HStack>

              <HStack spacing={4} w={{ base: "full", md: "auto" }}>
                <StatsCard icon={FaBookOpen} label="كورسات" value={courses.length} color="blue" />
                <StatsCard icon={FaUsers} label="طلاب" value="250+" color="orange" />
                <StatsCard icon={FaStar} label="تقييم" value="4.9" color="orange" />
              </HStack>
            </Flex>
          </MotionBox>

          {/* Quick Links with new clean design */}
          <MotionBox w="full" variants={itemVariants}>
            <Heading
              size="lg"
              className="brand-section-title"
              mb={8}
            >
              الوصول السريع
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
              {quickLinks.map((link) => (
                <Link key={link.id} to={link.link} style={{ textDecoration: 'none' }}>
                  <MotionBox
                    className="modern-card"
                    p={6}
                    cursor="pointer"
                    whileHover={{ y: -5 }}
                    role="group"
                  >
                    <HStack spacing={4}>
                      <Flex
                        w={14}
                        h={14}
                        align="center"
                        justify="center"
                        borderRadius="2xl"
                        bg={`${link.color}.50`}
                        color={`${link.color}.500`}
                        transition="all 0.3s"
                        _groupHover={{
                          bgGradient: `linear(to-br, ${link.color}.400, ${link.color}.600)`,
                          color: "white",
                          transform: "rotate(10deg)"
                        }}
                      >
                        <Icon as={link.icon} boxSize={6} />
                      </Flex>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color="gray.800">
                          {link.title}
                        </Text>

                      </VStack>
                    </HStack>
                  </MotionBox>
                </Link>
              ))}
            </SimpleGrid>
          </MotionBox>

          {/* Subjects Section */}
          {(subjectsLoading || subjects.length > 0) && (
            <MotionBox w="full" variants={itemVariants}>
              <Heading
                size="lg"
                className="brand-section-title"
                mb={8}
              >
                المواد الدراسية
              </Heading>

              {subjectsLoading ? (
                <MotionCenter py={12} className="modern-card" borderRadius="xl">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="orange.500" thickness="4px" />
                    <Text color="gray.500">جاري تحميل المواد...</Text>
                  </VStack>
                </MotionCenter>
              ) : subjects.length === 0 ? (
                <MotionCenter py={10} className="modern-card" borderRadius="xl">
                  <VStack spacing={3}>
                    <Icon as={FaBookOpen} boxSize={12} color="gray.300" />
                    <Text color="gray.500" fontSize="md">
                      لا توجد مواد دراسية حالياً
                    </Text>
                  </VStack>
                </MotionCenter>
              ) : (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  spacing={6}
                  w="full"
                >
                  {subjects.map((subject) => (
                    <MotionBox
                      key={subject.id}
                      className="modern-card"
                      borderRadius="2xl"
                      overflow="hidden"
                      variants={cardVariants}
                      whileHover="hover"
                      as={Link}
                      to={`/subject/${subject.id}`}
                      position="relative"
                      bg="white"
                      cursor="pointer"
                      w="full"
                      role="group"
                    >
                      {/* Image section with cleaner overlay */}
                      <Box position="relative" h="200px" overflow="hidden">
                        <Image
                          src={subject.image || "https://placehold.co/600x400/e2e8f0/475569?text=Subject"}
                          alt={subject.name}
                          w="full"
                          h="full"
                          objectFit="cover"
                          transition="transform 0.5s ease"
                          _groupHover={{ transform: "scale(1.1)" }}
                        />
                        <Box
                          position="absolute"
                          inset={0}
                          bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)"
                        />

                        <Flex
                          position="absolute"
                          bottom={4}
                          right={4}
                          left={4}
                          justify="space-between"
                          align="flex-end"
                        >
                          <Badge
                            bg="orange.500"
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="lg"
                            fontSize="xs"
                            fontWeight="bold"
                            boxShadow="md"
                          >
                            {subject.grade_name || "مادة دراسية"}
                          </Badge>
                        </Flex>
                      </Box>

                      <Box p={5}>
                        <VStack align="start" spacing={3}>
                          <Grid templateColumns="1fr auto" gap={2} w="full" alignItems="center">
                            <Heading size="md" color="gray.800" noOfLines={1}>
                              {subject.name}
                            </Heading>
                            <Box color="blue.500">
                              <Icon as={FaBookOpen} />
                            </Box>
                          </Grid>

                          <HStack fontSize="sm" color="gray.500" spacing={4}>
                            <HStack>
                              <Icon as={FaUsers} color="orange.400" />
                              <Text>{subject.groups_count || 0} مجموعات</Text>
                            </HStack>
                          </HStack>

                          <Divider borderColor="gray.100" />

                          <Button
                            w="full"
                            variant="outline"
                            colorScheme="blue"
                            borderColor="blue.200"
                            color="blue.600"
                            _hover={{
                              bg: "blue.50",
                              borderColor: "blue.500",
                              color: "blue.700"
                            }}
                            size="md"
                            borderRadius="xl"
                          >
                            إدارة المادة
                          </Button>
                        </VStack>
                      </Box>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              )}
            </MotionBox>
          )}

          {/* Courses Section */}
          <MotionBox w="full" variants={itemVariants}>
            <Flex mb={8} align="center" justify="space-between" wrap="wrap" gap={4}>
              <Heading
                size="lg"
                className="brand-section-title"
              >
                كورساتي
              </Heading>

              <HStack spacing={3}>
                <Select
                  placeholder="تصفية حسب الصف"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  w={{ base: "full", md: "200px" }}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: "blue.500", ring: 2, ringColor: "blue.100" }}
                  size="md"
                  icon={<Icon as={FaFilter} color="blue.500" />}
                >
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>
                <MotionButton
                  leftIcon={<FaPlus />}
                  onClick={onOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  size="md"
                  borderRadius="xl"
                  px={6}
                  bg="blue.600"
                  color="white"
                  _hover={{
                    bg: "blue.700",
                    shadow: "lg"
                  }}
                >
                  إضافة كورس
                </MotionButton>
              </HStack>
            </Flex>

            <AnimatePresence mode="wait">
              {loading ? (
                <MotionCenter py={12} className="modern-card" borderRadius="xl">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color="gray.500">جاري تحميل الكورسات...</Text>
                  </VStack>
                </MotionCenter>
              ) : error ? (
                <MotionCenter py={12} className="modern-card" borderRadius="xl">
                  <VStack spacing={4}>
                    <Icon as={FaBookOpen} boxSize={16} color="red.400" />
                    <Text color="red.500" fontSize="lg">{error}</Text>
                    <Button colorScheme="blue" onClick={fetchCourses} borderRadius="xl">
                      إعادة المحاولة
                    </Button>
                  </VStack>
                </MotionCenter>
              ) : filteredCourses.length === 0 ? (
                <MotionCenter py={12} className="modern-card" borderRadius="xl">
                  <VStack spacing={4}>
                    <Icon as={FaBookOpen} boxSize={16} color="gray.300" />
                    <Text color="gray.500" fontSize="lg">لا توجد كورسات متاحة</Text>
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={onOpen}
                      borderRadius="xl"
                      leftIcon={<FaPlus />}
                    >
                      إضافة أول كورس
                    </Button>
                  </VStack>
                </MotionCenter>
              ) : (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  spacing={6}
                  w="full"
                >
                  {filteredCourses.map((course) => (
                    <MotionBox
                      key={course.id}
                      className="modern-card"
                      borderRadius="2xl"
                      overflow="hidden"
                      variants={cardVariants}
                      whileHover="hover"
                      position="relative"
                      bg="white"
                      w="full"
                      role="group"
                    >
                      {/* Image section */}
                      <Box position="relative" h="200px" overflow="hidden">
                        <Image
                          src={course.avatar || "https://placehold.co/600x400/e2e8f0/475569?text=Course"}
                          alt={course.title}
                          w="full"
                          h="full"
                          objectFit="cover"
                          transition="transform 0.5s ease"
                          _groupHover={{ transform: "scale(1.1)" }}
                        />
                        <Box
                          position="absolute"
                          inset={0}
                          bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)"
                        />

                        <Flex
                          position="absolute"
                          top={3}
                          right={3}
                          left={3}
                          justify="space-between"
                          align="center"
                        >
                          <Badge
                            bg="blue.500"
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="lg"
                            fontSize="xs"
                            fontWeight="bold"
                            boxShadow="lg"
                          >
                            {course.price > 0 ? `${course.price} ج.م` : 'مجاني'}
                          </Badge>

                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit"
                              icon={<Icon as={FaEdit} />}
                              size="sm"
                              bg="whiteAlpha.900"
                              color="blue.600"
                              borderRadius="full"
                              _hover={{ bg: "white", color: "blue.700" }}
                              onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<Icon as={FaTrash} />}
                              size="sm"
                              bg="whiteAlpha.900"
                              color="red.500"
                              borderRadius="full"
                              _hover={{ bg: "white", color: "red.600" }}
                              onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course); }}
                            />
                          </HStack>
                        </Flex>
                      </Box>

                      <Box p={5}>
                        <VStack align="start" spacing={3}>
                          <Heading size="md" color="gray.800" noOfLines={1} lineHeight={1.4}>
                            {course.title}
                          </Heading>
                          <Text fontSize="sm" color="gray.500" noOfLines={2} h="40px">
                            {course.description}
                          </Text>

                          <HStack fontSize="xs" color="gray.400" spacing={4} w="full" pt={2} borderTop="1px solid" borderColor="gray.100">
                            <HStack>
                              <Icon as={FaCalendarAlt} color="blue.400" />
                              <Text>{new Date(course.created_at).toLocaleDateString('ar-EG')}</Text>
                            </HStack>
                          </HStack>

                          <Link to={`/CourseDetailsPage/${course.id}`} style={{ width: '100%' }}>
                            <Button
                              w="full"
                              bg="gray.900"
                              color="white"
                              _hover={{
                                bg: "gray.700",
                                shadow: "lg",
                                transform: "translateY(-1px)"
                              }}
                              borderRadius="xl"
                              rightIcon={<Icon as={FaBookOpen} />}
                            >
                              إدارة الكورس
                            </Button>
                          </Link>
                        </VStack>
                      </Box>
                    </MotionBox>
                  ))}
                </SimpleGrid>
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
