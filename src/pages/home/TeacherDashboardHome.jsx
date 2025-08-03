import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Flex,
  Spacer,
  Badge,
  Divider,
  Progress,
  Link as ChakraLink,
  Avatar,
  Image,
  useBreakpointValue,
  IconButton,
  Tooltip,
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
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaUserGraduate,
  FaChartLine,
  FaStar,
  FaBell,
  FaClock,
  FaArrowRight,
  FaPercent,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaEnvelope,
  FaEdit,
  FaEye,
  FaPlay,
  FaTrophy,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";
import { Link } from "react-router-dom";

// Motion Components for animations
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Mock Data - بيانات وهمية للمدرس
const teacherInfo = {
  name: "أ. محمود السيد",
  avatar: "https://bit.ly/code-beast",
  bio: "مدرس لغة عربية وخبير في تصميم المناهج الرقمية.",
  joinDate: "منذ 3 سنوات",
  totalStudents: 345,
  totalCourses: 5,
  averageRating: 4.7,
};

const quickStats = [
  { 
    id: 1, 
    label: "إجمالي الكورسات", 
    value: "0", 
    icon: FaBookOpen, 
    colorScheme: "blue",
    gradient: "linear(to-br, blue.400, blue.600)",
    change: "+0 هذا الشهر",
    key: "total_courses"
  },
  { 
    id: 2, 
    label: "الكورسات النشطة", 
    value: "0", 
    icon: FaPlay, 
    colorScheme: "green",
    gradient: "linear(to-br, green.400, green.600)",
    change: "+0 هذا الأسبوع",
    key: "active_courses"
  },
  { 
    id: 3, 
    label: "إجمالي الطلاب", 
    value: "0", 
    icon: FaUserGraduate, 
    colorScheme: "purple",
    gradient: "linear(to-br, purple.400, purple.600)",
    change: "+0 هذا الشهر",
    key: "total_students"
  },
  { 
    id: 4, 
    label: "إجمالي الأسئلة", 
    value: "0", 
    icon: FaClipboardList, 
    colorScheme: "orange",
    gradient: "linear(to-br, orange.400, orange.600)",
    change: "+0 هذا الأسبوع",
    key: "total_questions"
  },
  { 
    id: 5, 
    label: "إجمالي المحاضرات", 
    value: "0", 
    icon: FaFileAlt, 
    colorScheme: "teal",
    gradient: "linear(to-br, teal.400, teal.600)",
    change: "+0 هذا الشهر",
    key: "total_lectures"
  },
  { 
    id: 6, 
    label: "إجمالي الامتحانات", 
    value: "0", 
    icon: FaClipboardList, 
    colorScheme: "red",
    gradient: "linear(to-br, red.400, red.600)",
    change: "+0 هذا الأسبوع",
    key: "total_exams"
  },
];



const recentActivities = [
  { 
    id: 1, 
    type: "assignment", 
    text: "تم رفع واجب جديد: 'تحليل قصيدة المتنبي'", 
    time: "منذ 10 دقائق", 
    courseId: 2,
    icon: FaClipboardList,
    color: "blue.500"
  },
  { 
    id: 2, 
    type: "student_progress", 
    text: "أحرز الطالب أحمد تقدمًا في كورس 'اللغة العربية للمبتدئين'", 
    time: "منذ ساعة", 
    courseId: 1,
    icon: FaTrophy,
    color: "green.500"
  },
  { 
    id: 3, 
    type: "message", 
    text: "رسالة جديدة من الطالبة سارة بخصوص درس القواعد", 
    time: "منذ 3 ساعات", 
    courseId: 1,
    icon: FaEnvelope,
    color: "purple.500"
  },
  { 
    id: 4, 
    type: "rating", 
    text: "حصل كورس 'مهارات الكتابة الإبداعية' على تقييم 5 نجوم جديد", 
    time: "أمس", 
    courseId: 3,
    icon: FaStar,
    color: "yellow.500"
  },
];

const TeacherDashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  const [grades, setGrades] = useState([]); // الصفوف من API
  const [selectedGrade, setSelectedGrade] = useState(""); // للفلترة
  const [statsData, setStatsData] = useState(null); // إحصائيات المدرس
  const [statsLoading, setStatsLoading] = useState(true); // حالة تحميل الإحصائيات
  
  // Modal and form state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    description: "",
    grade_id: ""
  });
  const [courseAvatar, setCourseAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const toast = useToast();

  // Edit modal state
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    title: "",
    price: 0,
    description: "",
    grade_id: ""
  });
  const [editCourseAvatar, setEditCourseAvatar] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Handle edit avatar file selection
  const handleEditAvatarChange = (event) => {
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

      setEditCourseAvatar(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear edit avatar
  const clearEditAvatar = () => {
    setEditCourseAvatar(null);
    setEditAvatarPreview(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
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

      const response = await baseUrl.post('/api/course', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      toast({
        title: "تم إنشاء الكورس بنجاح",
        description: "تم إضافة الكورس الجديد إلى قائمة كورساتك",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setFormData({
        title: "",
        price: 0,
        description: "",
        grade_id: ""
      });
      clearAvatar();
      onClose();

      // Refresh courses list
      const updatedResponse = await baseUrl.get('api/course/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(updatedResponse.data.courses);

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

  // Handle edit course
  const handleEditCourse = (course) => {
    setEditData({
      id: course.id,
      title: course.title,
      price: course.price,
      description: course.description,
      grade_id: course.grade_id?.toString() || ""
    });
    // Reset edit avatar
    setEditCourseAvatar(null);
    setEditAvatarPreview(null);
    onEditOpen();
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
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
      
      // Create FormData object for edit
      const formDataToSend = new FormData();
      formDataToSend.append('title', editData.title);
      formDataToSend.append('price', parseInt(editData.price));
      formDataToSend.append('description', editData.description);
      formDataToSend.append('grade_id', parseInt(editData.grade_id));
      
      // Add avatar if selected
      if (editCourseAvatar) {
        formDataToSend.append('avatar', editCourseAvatar);
      }

      const response = await baseUrl.put(`/api/course/${editData.id}`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      toast({
        title: "تم تحديث الكورس بنجاح",
        description: "تم تحديث بيانات الكورس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setEditData({
        id: null,
        title: "",
        price: 0,
        description: "",
        grade_id: ""
      });
      setEditCourseAvatar(null);
      setEditAvatarPreview(null);
      onEditClose();

      // Refresh courses list
      const updatedResponse = await baseUrl.get('api/course/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(updatedResponse.data.courses);

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

  // Handle delete course
  const handleDeleteCourse = async (courseId) => {
    // Find the course to show its name in the confirmation modal
    const course = courses.find(c => c.id === courseId);
    setCourseToDelete(course);
    onDeleteOpen();
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setDeleteLoading(courseToDelete.id);
      await baseUrl.delete(`/api/course/${courseToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "تم حذف الكورس بنجاح",
        description: "تم حذف الكورس من قائمة كورساتك",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset and close modal
      setCourseToDelete(null);
      onDeleteClose();

      // Refresh courses list
      const updatedResponse = await baseUrl.get('api/course/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(updatedResponse.data.courses);

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
      setDeleteLoading(null);
    }
  };

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get('api/course/my-courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('حدث خطأ في تحميل الكورسات');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  // Fetch grades from API
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await baseUrl.get("/api/teacher/grades", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGrades(response.data.grades || []);
      } catch (error) {
        setGrades([]);
      }
    };
    fetchGrades();
  }, [token]);

  // Fetch teacher stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await baseUrl.get("/api/teacher/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatsData(response.data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsData(null);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // Fetch teacher activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await baseUrl.get('/api/teacher/activity-log', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(response.data.activities || []);
      } catch (error) {
        setActivitiesError('حدث خطأ في تحميل الأنشطة');
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, [token]);

  console.log(user)
  // استخدام نظام ألوان Chakra المدمج
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  // Responsive values - تم إزالتها لأننا نستخدم responsive props مباشرة

  // Variants for card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const staggerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const hoverVariants = {
    hover: { 
      scale: 1.02, 
      boxShadow: useColorModeValue(
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
      ),
      transition: { duration: 0.2 }
    }
  };
  console.log(courses)
  // فلترة الكورسات حسب الصف
  const filteredCourses = selectedGrade
    ? courses.filter(course => course.grade_id === parseInt(selectedGrade))
    : courses;

  // تحديث الإحصائيات بالبيانات الحقيقية
  const updatedStats = quickStats.map(stat => ({
    ...stat,
    value: statsData ? statsData[stat.key]?.toString() || "0" : "0"
  }));

  return (
    <Box minH="100vh" bg={pageBg} className="mt-[0px]" p={{ base: 1, sm: 2, md: 4, lg: 6, xl: 8 }} dir="rtl">
      <VStack 
        spacing={{ base: 3, sm: 4, md: 5, lg: 6, xl: 8 }} 
        align="stretch" 
        maxW="1400px" 
        mx="auto" 
        px={{ base: 2, sm: 3, md: 4 }}
        justify="center"
        minH={{ base: "calc(100vh - 80px)", md: "auto" }}
      >
        {/* Welcome Section */}
        <MotionCard
          bgGradient="linear(to-r, blue.600, blue.400)"
          color="white"
          borderRadius={{ base: "lg", sm: "xl", md: "2xl" }}
          shadow="2xl"
          p={{ base: 4, sm: 5, md: 6, lg: 8 }}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          overflow="hidden"
          position="relative"
          mx={{ base: "auto", md: "0" }}
          maxW={{ base: "95%", sm: "100%" }}
        >
          <Box position="absolute" top={-10} right={-10} opacity={0.1} display={{ base: "none", md: "block" }}>
            <Icon as={FaBookOpen} w={32} h={32} />
          </Box>
          <VStack spacing={{ base: 4, sm: 5, md: 6, lg: 8 }} alignItems="center">
            <VStack align="center" spacing={{ base: 3, sm: 4 }} flex={1} w="full">
              <Heading 
                as="h1" 
                size={{ base: "lg", sm: "xl", md: "2xl" }} 
                fontWeight="extrabold" 
                letterSpacing="tight"
                textAlign="center"
                lineHeight={{ base: "1.3", md: "1.1" }}
              >
                مرحباً بك، {user.name}! 👋
              </Heading>
              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }} 
                opacity={0.9} 
                fontWeight="medium"
                textAlign="center"
                lineHeight={{ base: "1.5", md: "1.3" }}
                maxW={{ base: "280px", sm: "100%" }}
              >
                {user.description}
              </Text>
              <SimpleGrid 
                columns={{ base: 1, sm: 2, md: 3 }} 
                spacing={{ base: 2, sm: 3, md: 4, lg: 6 }} 
                mt={{ base: 2, sm: 3 }}
                w="full"
                justifyItems="center"
                maxW={{ base: "300px", sm: "100%" }}
              >
                <HStack spacing={2}>
                  <Icon as={FaCalendarAlt} />
                  <Text fontSize="sm" opacity={0.8}>{teacherInfo.joinDate}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaUsers} />
                  <Text fontSize="sm" opacity={0.8}>{teacherInfo.totalStudents} طالب</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaStar} />
                  <Text fontSize="sm" opacity={0.8}>{teacherInfo.averageRating} تقييم</Text>
                </HStack>
              </SimpleGrid>
            </VStack>
            <Box 
              display={{ base: "none", lg: "block" }}
              w={{ base: "120px", md: "160px", lg: "180px", xl: "200px" }}
              h={{ base: "120px", md: "160px", lg: "180px", xl: "200px" }}
            >
              <img 
                src={user.avatar} 
                className="w-full h-full rounded-full object-cover"
                alt="Teacher Avatar"
              />
            </Box>
          </VStack>
        </MotionCard>

        {/* Quick Stats Section */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
          w="full"
        >
          <Heading 
            as="h2" 
            size={{ base: "md", sm: "lg", md: "xl" }} 
            mb={{ base: 4, sm: 5, md: 6, lg: 7 }} 
            color={headingColor} 
            textAlign="center"
          >
            إحصائيات سريعة
          </Heading>
          <SimpleGrid 
            columns={{ base: 1, sm: 2, md: 3, lg: 6 }} 
            spacing={{ base: 3, sm: 4, md: 5, lg: 6, xl: 7 }}
            justifyItems="center"
            maxW={{ base: "350px", sm: "100%" }}
            mx="auto"
          >
            {statsLoading ? (
              // Loading skeleton for stats
              Array.from({ length: 6 }).map((_, index) => (
                <MotionCard
                  key={`skeleton-${index}`}
                  bg={cardBg}
                  borderRadius={{ base: "lg", sm: "xl", md: "2xl" }}
                  shadow="xl"
                  p={{ base: 4, sm: 5, md: 6, lg: 7 }}
                  textAlign="center"
                  variants={cardVariants}
                  border="1px solid"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  w={{ base: "280px", sm: "auto" }}
                  mx="auto"
                >
                  <VStack spacing={4}>
                    <Box
                      p={4}
                      borderRadius="full"
                      bg={useColorModeValue("gray.200", "gray.600")}
                      color="white"
                      shadow="lg"
                    >
                      <Icon as={quickStats[index]?.icon || FaBookOpen} boxSize={8} color={useColorModeValue("gray.400", "gray.500")} />
                    </Box>
                    <VStack spacing={1}>
                      <Box
                        w="60%"
                        h="8"
                        bg={useColorModeValue("gray.200", "gray.600")}
                        borderRadius="md"
                        mx="auto"
                      />
                      <Box
                        w="80%"
                        h="4"
                        bg={useColorModeValue("gray.200", "gray.600")}
                        borderRadius="md"
                        mx="auto"
                      />
                    </VStack>
                  </VStack>
                </MotionCard>
              ))
            ) : (
              updatedStats.map((stat) => (
              <MotionCard
                key={stat.id}
                bg={cardBg}
                borderRadius={{ base: "lg", sm: "xl", md: "2xl" }}
                shadow="xl"
                p={{ base: 4, sm: 5, md: 6, lg: 7 }}
                textAlign="center"
                variants={cardVariants}
                whileHover="hover"
                border="1px solid"
                borderColor={borderColor}
                position="relative"
                overflow="hidden"
                w={{ base: "280px", sm: "auto" }}
                mx="auto"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="4px"
                  bgGradient={stat.gradient}
                />
                                  <VStack spacing={{ base: 3, sm: 4, md: 5 }}>
                    <Box
                      p={{ base: 3, sm: 4, md: 5 }}
                      borderRadius="full"
                      bgGradient={stat.gradient}
                      color="white"
                      shadow="lg"
                    >
                      <Icon as={stat.icon} boxSize={{ base: 6, sm: 7, md: 8, lg: 9 }} />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} fontWeight="extrabold" color={headingColor}>
                        {stat.value}
                      </Text>
                      <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} color={subTextColor} fontWeight="medium">
                        {stat.label}
                      </Text>
                      <Badge colorScheme={stat.colorScheme} fontSize="sm" px={3} py={1} borderRadius="full">
                        {stat.change}
                      </Badge>
                    </VStack>
                  </VStack>
              </MotionCard>
            ))
            )}
          </SimpleGrid>
        </MotionBox>

        {/* My Courses Section */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
          w="full"
        >
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                        <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="center" w="full">
              <Heading 
                as="h2" 
                size={{ base: "lg", sm: "xl", md: "2xl" }} 
                color={headingColor}
                textAlign="center"
              >
                كورساتي
              </Heading>
              <VStack spacing={{ base: 3, sm: 4 }} w={{ base: "full", sm: "auto" }} maxW={{ base: "320px", sm: "100%" }} mx="auto">
                <Select
                  placeholder="كل الصفوف"
                  value={selectedGrade}
                  onChange={e => setSelectedGrade(e.target.value)}
                  w={{ base: "full", sm: "200px", md: "220px" }}
                  borderRadius="xl"
                  bg={cardBg}
                  borderColor={borderColor}
                  size={{ base: "md", md: "lg" }}
                >
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                  ))}
                </Select>
                <VStack spacing={{ base: 2, sm: 3 }} w={{ base: "full", sm: "auto" }}>
                  <Button 
                    colorScheme="green" 
                    leftIcon={<FaBookOpen />} 
                    onClick={onOpen}
                    borderRadius="full"
                    size={{ base: "md", md: "lg" }}
                    w={{ base: "full", sm: "auto" }}
                    px={{ base: 8, sm: 6 }}
                  >
                    إنشاء كورس جديد
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    variant="outline" 
                    rightIcon={<FaArrowRight />} 
                    borderRadius="full"
                    size={{ base: "md", md: "lg" }}
                    w={{ base: "full", sm: "auto" }}
                    px={{ base: 8, sm: 6 }}
                  >
                    عرض جميع الكورسات
                  </Button>
                </VStack>
              </VStack>
            </VStack>
          </VStack>
          
          {loading ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text color={textColor}>جاري تحميل الكورسات...</Text>
              </VStack>
            </Center>
          ) : error ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Icon as={FaBookOpen} boxSize={12} color="red.500" />
                <Text color="red.500" fontSize="lg">{error}</Text>
                <Button colorScheme="blue" onClick={() => window.location.reload()}>
                  إعادة المحاولة
                </Button>
              </VStack>
            </Center>
          ) : filteredCourses.length === 0 ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Icon as={FaBookOpen} boxSize={12} color="gray.400" />
                <Text color="gray.500" fontSize="lg">لا توجد كورسات متاحة</Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid 
              columns={{ base: 1, sm: 1, md: 2, lg: 2, xl: 3 }} 
              spacing={{ base: 4, sm: 5, md: 6, lg: 7 }}
              maxW="100%"
              justifyItems="center"
            >
              {filteredCourses.map((course) => (
                <MotionCard
                  key={course.id}
                  bg={cardBg}
                  borderRadius={{ base: "lg", sm: "xl", md: "2xl" }}
                  shadow="xl"
                  overflow="hidden"
                  variants={cardVariants}
                  whileHover="hover"
                  border="1px solid"
                  borderColor={borderColor}
                  maxW={{ base: "350px", sm: "400px" }}
                  mx="auto"
                  w="full"
                >
                  <Box position="relative">
                    <Image
                      src={course.avatar}
                      alt={course.title}
                      w="full"
                      h={{ base: "180px", sm: "220px", md: "250px", lg: "280px" }}
                      objectFit="cover"
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
                    <HStack
                      position="absolute"
                      top={3}
                      left={3}
                      spacing={2}
                    >
                      <IconButton
                        icon={<FaTrash />}
                        aria-label="حذف الكورس"
                        size="sm"
                        colorScheme="red"
                        variant="solid"
                        borderRadius="full"
                        onClick={() => handleDeleteCourse(course.id)}
                        isLoading={deleteLoading === course.id}
                      />
                      <IconButton
                        icon={<FaEdit />}
                        aria-label="تعديل الكورس"
                        size="sm"
                        colorScheme="whiteAlpha"
                        variant="solid"
                        borderRadius="full"
                        onClick={() => handleEditCourse(course)}
                      />
                    </HStack>
                  </Box>
                  
                  <CardBody p={{ base: 3, sm: 4, md: 5, lg: 6 }}>
                    <VStack align="flex-start" spacing={{ base: 2, sm: 3, md: 4 }}>
                      <VStack align="flex-start" spacing={{ base: 1, sm: 2 }} w="full">
                        <Heading size={{ base: "xs", sm: "sm", md: "md" }} color={headingColor} noOfLines={2}>
                          {course.title}
                        </Heading>
                        <Text color={subTextColor} fontSize={{ base: "2xs", sm: "xs", md: "sm" }} noOfLines={2}>
                          {course.description}
                        </Text>
                      </VStack>
                      
                      <HStack justify="space-between" w="full">
                        <HStack spacing={{ base: 1, sm: 2 }}>
                          <Icon as={FaCalendarAlt} color="blue.500" boxSize={{ base: 3, sm: 4 }} />
                          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={textColor}>
                            {new Date(course.created_at).toLocaleDateString('ar-EG')}
                          </Text>
                        </HStack>
                        <HStack spacing={{ base: 1, sm: 2 }}>
                          <Icon as={FaStar} color="yellow.500" boxSize={{ base: 3, sm: 4 }} />
                          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={textColor}>4.5</Text>
                        </HStack>
                      </HStack>
                      
                      <VStack align="flex-start" spacing={{ base: 1, sm: 2 }} w="full">
                        <HStack justify="space-between" w="full">
                          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={subTextColor}>السعر</Text>
                          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} fontWeight="bold" color={headingColor}>{course.price} </Text>
                        </HStack>
                        <Progress
                          value={75}
                          colorScheme="blue"
                          size={{ base: "xs", sm: "sm", md: "lg" }}
                          borderRadius="full"
                          w="full"
                          hasStripe
                          isAnimated
                        />
                      </VStack>
                      
                      <HStack justify="space-between" w="full" fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={subTextColor}>
                        <HStack spacing={{ base: 0.5, sm: 1 }}>
                          <Icon as={FaClock} boxSize={{ base: 3, sm: 4 }} />
                          <Text>12 أسبوع</Text>
                        </HStack>
                        <Text fontWeight="bold" color="green.500">{course.price} </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                  
                  <CardFooter p={{ base: 3, sm: 4, md: 5, lg: 6 }} pt={0}>
                    <Link to={`/CourseDetailsPage/${course.id}`} className="w-[100%]">
                    <Button
                      colorScheme="blue"
                      variant="solid"
                      rightIcon={<FaPlay />}
                      w="full"
                      size={{ base: "sm", sm: "md", md: "lg" }}
                      borderRadius="xl"
                      >
                      إدارة الكورس
                    </Button>
                      </Link>
                  </CardFooter>
                </MotionCard>
              ))}
            </SimpleGrid>
          )}
        </MotionBox>

        {/* Recent Activities Section */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
          w="full"
        >
          <Heading 
            as="h2" 
            size={{ base: "lg", sm: "xl", md: "2xl" }} 
            mb={{ base: 4, sm: 5, md: 6, lg: 7 }} 
            color={headingColor}
            textAlign="center"
          >
            آخر الأنشطة
          </Heading>
          <Card 
            bg={cardBg} 
            borderRadius={{ base: "lg", sm: "xl", md: "2xl" }} 
            shadow="xl" 
            overflow="hidden" 
            border="1px solid" 
            borderColor={borderColor}
            maxW={{ base: "95%", sm: "100%" }}
            mx="auto"
          >
            <CardHeader bgGradient={useColorModeValue("linear(to-r, blue.50, purple.50)", "linear(to-r, blue.900, purple.900)")} pb={4}>
              <HStack spacing={3}>
                <Icon as={FaBell} color="blue.500" boxSize={6} />
                <Heading size="md" color={headingColor}>النشاطات الحديثة</Heading>
              </HStack>
            </CardHeader>
            <CardBody p={{ base: 3, sm: 4, md: 5, lg: 6 }}>
              <VStack spacing={{ base: 2, sm: 3, md: 4 }} align="stretch">
                {activitiesLoading ? (
                  <Center py={6}><Spinner color="blue.500" size="lg" /></Center>
                ) : activitiesError ? (
                  <Text color="red.500" textAlign="center">{activitiesError}</Text>
                ) : activities.length === 0 ? (
                  <Text color={subTextColor} textAlign="center">لا توجد أنشطة حديثة</Text>
                ) : (
                  activities.map((activity) => (
                  <MotionBox
                    key={activity.id}
                    p={{ base: 2, sm: 3, md: 4 }}
                    borderRadius={{ base: "md", sm: "lg", md: "xl" }}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderLeft="4px solid"
                    borderColor="blue.500"
                    shadow="sm"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    borderRight="1px solid"
                    borderTop="1px solid"
                    borderBottom="1px solid"
                    borderRightColor={borderColor}
                    borderTopColor={borderColor}
                    borderBottomColor={borderColor}
                  >
                    <HStack justify="space-between" align="flex-start">
                        <VStack align="flex-start" spacing={1}>
                          <Text color={textColor} fontWeight="medium">
                            {activity.description}
                          </Text>
                          <Text fontSize="sm" color={subTextColor}>
                            {new Date(activity.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                          </Text>
                        </VStack>
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                          {activity.action}
                      </Badge>
                    </HStack>
                  </MotionBox>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Global Student Performance */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
          w="full"
        >
          <Heading 
            as="h2" 
            size={{ base: "lg", sm: "xl", md: "2xl" }} 
            mb={{ base: 4, sm: 5, md: 6, lg: 7 }} 
            color={headingColor}
            textAlign="center"
          >
            أداء الطلاب العام
          </Heading>
          <Card 
            bg={cardBg} 
            borderRadius={{ base: "lg", sm: "xl", md: "2xl" }} 
            shadow="xl" 
            overflow="hidden" 
            border="1px solid" 
            borderColor={borderColor}
            maxW={{ base: "95%", sm: "100%" }}
            mx="auto"
          >
            <CardHeader bgGradient={useColorModeValue("linear(to-r, green.50, blue.50)", "linear(to-r, green.900, blue.900)")} pb={4}>
              <HStack spacing={3}>
                <Icon as={FaChartLine} color="green.500" boxSize={6} />
                <Heading size="md" color={headingColor}>إحصائيات الأداء</Heading>
              </HStack>
            </CardHeader>
            <CardBody p={{ base: 3, sm: 4, md: 5, lg: 6 }}>
              <VStack spacing={{ base: 3, sm: 4, md: 5, lg: 6 }} align="stretch">
                <SimpleGrid 
                  columns={{ base: 1, sm: 2, md: 3 }} 
                  spacing={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
                >
                  <VStack p={{ base: 2, sm: 3, md: 4 }} bg={useColorModeValue("blue.50", "blue.900")} borderRadius={{ base: "md", sm: "lg", md: "xl" }} border="1px solid" borderColor={useColorModeValue("blue.200", "blue.700")}>
                    <Icon as={FaPercent} color="blue.500" boxSize={{ base: 5, sm: 6, md: 7, lg: 8 }} />
                    <Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }} fontWeight="bold" color={useColorModeValue("blue.600", "blue.300")}>88.5%</Text>
                    <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={subTextColor} textAlign="center">متوسط الدرجات</Text>
                  </VStack>
                  <VStack p={{ base: 2, sm: 3, md: 4 }} bg={useColorModeValue("green.50", "green.900")} borderRadius={{ base: "md", sm: "lg", md: "xl" }} border="1px solid" borderColor={useColorModeValue("green.200", "green.700")}>
                    <Icon as={FaUsers} color="green.500" boxSize={{ base: 5, sm: 6, md: 7, lg: 8 }} />
                    <Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }} fontWeight="bold" color={useColorModeValue("green.600", "green.300")}>300</Text>
                    <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={subTextColor} textAlign="center">طلاب نشطون</Text>
                  </VStack>
                  <VStack p={{ base: 2, sm: 3, md: 4 }} bg={useColorModeValue("orange.50", "orange.900")} borderRadius={{ base: "md", sm: "lg", md: "xl" }} border="1px solid" borderColor={useColorModeValue("orange.200", "orange.700")}>
                    <Icon as={FaTrophy} color="orange.500" boxSize={{ base: 5, sm: 6, md: 7, lg: 8 }} />
                    <Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }} fontWeight="bold" color={useColorModeValue("orange.600", "orange.300")}>2</Text>
                    <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={subTextColor} textAlign="center">كورسات تحتاج انتباه</Text>
                  </VStack>
                </SimpleGrid>
                
                <Divider borderColor={dividerColor} />
                
                <Button 
                  colorScheme="blue" 
                  variant="outline" 
                  rightIcon={<FaChartLine />} 
                  size={{ base: "sm", sm: "md", md: "lg" }}
                  borderRadius="xl"
                  w="full"
                >
                  عرض تقارير الأداء التفصيلية
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

      </VStack>
      
      {/* Create Course Modal */}
              <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent 
          borderRadius={{ base: "none", md: "2xl" }} 
          shadow="2xl" 
          bg={cardBg} 
          border="1px solid" 
          borderColor={borderColor}
          m={{ base: 0, md: "auto" }}
          h={{ base: "100vh", md: "auto" }}
        >
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
            <HStack spacing={3}>
              <Box
                p={3}
                borderRadius="full"
                bgGradient="linear(to-r, green.400, green.600)"
                color="white"
                shadow="lg"
              >
                <Icon as={FaBookOpen} boxSize={6} />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontWeight="bold" fontSize="lg">
                  إنشاء كورس جديد
                </Text>
                <Text fontSize="sm" color={subTextColor}>
                  أضف كورس جديد إلى منصتك التعليمية
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>
                  عنوان الكورس
                </FormLabel>
                <Input
                  placeholder="مثال: كورس فيزياء أولى ثانوي"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  borderRadius="xl"
                  size={{ base: "md", md: "lg" }}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px green.500"
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>
                  وصف الكورس
                </FormLabel>
                <Textarea
                  placeholder="اكتب وصفاً مفصلاً للكورس..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  borderRadius="xl"
                  size={{ base: "md", md: "lg" }}
                  rows={4}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px green.500"
                  }}
                />
              </FormControl>

              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={headingColor}>
                    السعر 
                  </FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) => handleInputChange('price', value)}
                    min={0}
                    max={10000}
                    borderRadius="xl"
                    size={{ base: "md", md: "lg" }}
                  >
                    <NumberInputField
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "green.500",
                        boxShadow: "0 0 0 1px green.500"
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={headingColor}>
                    المرحلة الدراسية
                  </FormLabel>
                  <Select
                    placeholder="اختر المرحلة"
                    value={formData.grade_id}
                    onChange={(e) => handleInputChange('grade_id', e.target.value)}
                    borderRadius="xl"
                    size={{ base: "md", md: "lg" }}
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "green.500",
                      boxShadow: "0 0 0 1px green.500"
                    }}
                  >
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              {/* Avatar Upload Section */}
              <FormControl>
                <FormLabel fontWeight="bold" color={headingColor}>
                  صورة الكورس
                </FormLabel>
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
                          <Text fontSize="sm" color={subTextColor}>
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
                  <Icon as={FaBookOpen} color="green.500" />
                  <Text fontSize="sm" color="green.700" fontWeight="medium">
                    يمكنك إضافة صورة للكورس لتحسين مظهره وجذب الطلاب. الصورة اختيارية.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4}>
            <Button
              colorScheme="green"
              mr={3}
              borderRadius="xl"
              size={{ base: "md", md: "lg" }}
              onClick={handleSubmit}
              isLoading={formLoading}
              loadingText="جاري الإنشاء..."
              leftIcon={<FaBookOpen />}
            >
              إنشاء الكورس
            </Button>
            <Button variant="ghost" onClick={onClose} borderRadius="xl" size={{ base: "md", md: "lg" }}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Edit Course Modal */}
              <Modal isOpen={isEditOpen} onClose={onEditClose} size={{ base: "full", md: "xl" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent 
          borderRadius={{ base: "none", md: "2xl" }} 
          shadow="2xl" 
          bg={cardBg} 
          border="1px solid" 
          borderColor={borderColor}
          m={{ base: 0, md: "auto" }}
          h={{ base: "100vh", md: "auto" }}
        >
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
            <HStack spacing={3}>
              <Box
                p={3}
                borderRadius="full"
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                shadow="lg"
              >
                <Icon as={FaEdit} boxSize={6} />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontWeight="bold" fontSize="lg">
                  تعديل الكورس
                </Text>
                <Text fontSize="sm" color={subTextColor}>
                  قم بتحديث بيانات الكورس
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>
                  عنوان الكورس
                </FormLabel>
                <Input
                  placeholder="مثال: كورس فيزياء أولى ثانوي"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  borderRadius="xl"
                  size="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500"
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={headingColor}>
                  وصف الكورس
                </FormLabel>
                <Textarea
                  placeholder="اكتب وصفاً مفصلاً للكورس..."
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  borderRadius="xl"
                  size="lg"
                  rows={4}
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500"
                  }}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="bold" color={headingColor}>
                    السعر
                  </FormLabel>
                  <NumberInput
                    value={editData.price}
                    onChange={(value) => setEditData(prev => ({ ...prev, price: value }))}
                    min={0}
                    max={10000}
                    borderRadius="xl"
                    size="lg"
                  >
                    <NumberInputField
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px blue.500"
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="bold" color={headingColor}>
                    المرحلة الدراسية
                  </FormLabel>
                  <Select
                    placeholder="اختر المرحلة"
                    value={editData.grade_id}
                    onChange={(e) => setEditData(prev => ({ ...prev, grade_id: e.target.value }))}
                    borderRadius="xl"
                    size="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px blue.500"
                    }}
                  >
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              {/* Edit Avatar Upload Section */}
              <FormControl>
                <FormLabel fontWeight="bold" color={headingColor}>
                  صورة الكورس
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  {editAvatarPreview ? (
                    <Box position="relative" w="full">
                      <Image
                        src={editAvatarPreview}
                        alt="Course Avatar Preview"
                        w="full"
                        h="200px"
                        objectFit="cover"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="blue.200"
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
                        onClick={clearEditAvatar}
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
                        borderColor: "blue.400",
                        bg: "blue.50"
                      }}
                      transition="all 0.2s"
                    >
                      <VStack spacing={4}>
                        <Icon as={FaFileAlt} boxSize={8} color="gray.400" />
                        <VStack spacing={2}>
                          <Text fontWeight="medium" color={textColor}>
                            انقر لاختيار صورة جديدة للكورس
                          </Text>
                          <Text fontSize="sm" color={subTextColor}>
                            PNG, JPG, JPEG حتى 5 ميجابايت
                          </Text>
                        </VStack>
                      </VStack>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleEditAvatarChange}
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
                bg={useColorModeValue("blue.50", "blue.900")}
                borderRadius="xl"
                border="1px solid"
                borderColor="blue.200"
              >
                <HStack spacing={3}>
                  <Icon as={FaEdit} color="blue.500" />
                  <Text fontSize="sm" color="blue.700" fontWeight="medium">
                    يمكنك تحديث صورة الكورس أو تركها كما هي. سيتم حفظ التغييرات فوراً.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4}>
            <Button
              colorScheme="blue"
              mr={3}
              borderRadius="xl"
              size="lg"
              onClick={handleEditSubmit}
              isLoading={editLoading}
              loadingText="جاري التحديث..."
              leftIcon={<FaEdit />}
            >
              تحديث الكورس
            </Button>
            <Button variant="ghost" onClick={onEditClose} borderRadius="xl">
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
              <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size={{ base: "sm", md: "md" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent 
          borderRadius={{ base: "lg", md: "2xl" }} 
          shadow="2xl" 
          bg={cardBg} 
          border="1px solid" 
          borderColor={borderColor}
        >
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
            <HStack spacing={3}>
              <Box
                p={3}
                borderRadius="full"
                bgGradient="linear(to-r, red.400, red.600)"
                color="white"
                shadow="lg"
              >
                <Icon as={FaTrash} boxSize={6} />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontWeight="bold" fontSize="lg">
                  تأكيد حذف الكورس
                </Text>
                <Text fontSize="sm" color={subTextColor}>
                  هذا الإجراء لا يمكن التراجع عنه
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Box
                p={4}
                bg={useColorModeValue("red.50", "red.900")}
                borderRadius="xl"
                border="1px solid"
                borderColor="red.200"
              >
                <HStack spacing={3}>
                  <Icon as={FaTrash} color="red.500" />
                  <Text fontSize="sm" color="red.700" fontWeight="medium">
                    هل أنت متأكد من حذف الكورس التالي؟
                  </Text>
                </HStack>
              </Box>
              
              {courseToDelete && (
                <Box
                  p={4}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack align="flex-start" spacing={2}>
                    <Text fontWeight="bold" color={headingColor} fontSize="md">
                      {courseToDelete.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {courseToDelete.description}
                    </Text>
                    <HStack spacing={4}>
                      <Badge colorScheme="blue" fontSize="xs">
                        السعر: {courseToDelete.price}
                      </Badge>
                      <Badge colorScheme="green" fontSize="xs">
                        ID: {courseToDelete.id}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              )}
              
              <Box
                p={3}
                bg={useColorModeValue("orange.50", "orange.900")}
                borderRadius="lg"
                border="1px solid"
                borderColor="orange.200"
              >
                <HStack spacing={2}>
                  <Icon as={FaBell} color="orange.500" />
                  <Text fontSize="xs" color="orange.700" fontWeight="medium">
                    تحذير: حذف الكورس سيؤدي إلى حذف جميع المحاضرات والمواد المرتبطة به نهائياً
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4}>
            <Button
              colorScheme="red"
              mr={3}
              borderRadius="xl"
              size="lg"
              onClick={handleDeleteConfirm}
              isLoading={deleteLoading === courseToDelete?.id}
              loadingText="جاري الحذف..."
              leftIcon={<FaTrash />}
            >
              حذف الكورس
            </Button>
            <Button variant="ghost" onClick={onDeleteClose} borderRadius="xl">
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <ScrollToTop />
    </Box>
  );
};

export default TeacherDashboardHome;