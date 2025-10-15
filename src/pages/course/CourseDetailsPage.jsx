import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Flex,
  Badge,
  Icon,
  Button,
  SimpleGrid,
  Divider,
  Progress,
  Collapse,
  Avatar,
  Link as ChakraLink,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Fade, // For smooth transitions
  Spinner,
  Center,
  Skeleton,
  SkeletonText,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Textarea,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaStar,
  FaUsers,
  FaBookOpen,
  FaChalkboardTeacher,
  FaPlayCircle,
  FaCalendarAlt,
  FaLaptopCode,
  FaArrowRight,
  FaClock,
  FaAngleDown,
  FaAngleUp,
  FaVideo,
  FaCheckCircle,
  FaDownload,
  FaFilePdf,
  FaLightbulb,
  FaGraduationCap, // New: For course completion
  FaRegCalendarCheck, // New: For upcoming live sessions
  FaRegPaperPlane, // For messages
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserGraduate,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaKey,
  FaLock, // New: For locked lectures
  FaSearch,
  FaRegFileAlt,
  FaListOl,
  FaTimes,
  FaCheck,
  FaFilm, // For no data component
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";
import UserType from "../../Hooks/auth/userType";
import { useParams } from "react-router-dom";
import CourseHeroSection from "./components/CourseHeroSection";
import LectureCard from "./components/LectureCard";
import LecturesTab from "./components/LecturesTab";
import CourseExamsTab from "./components/CourseExamsTab";
import VideoPlayer from "./components/VideoPlayer";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import CourseStreams from "../../components/stream/courseStreams";
import StudentStreamsList from "../../components/stream/studentStreamsList";

// Modal Components
const LectureModal = ({ isOpen, onClose, type, data, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    position: data?.position || 1
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        position: data.position || 1
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'edit') {
      onSubmit(data.id, formData);
    } else {
      onSubmit(formData);
    }
    // لا نغلق الموديل هنا، سيتم إغلاقه بعد نجاح العملية
  };

  return (
     <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} closeOnOverlayClick={!loading} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="2xl" boxShadow="2xl">
        <ModalHeader display="flex" alignItems="center" fontWeight="bold" fontSize="xl" color="blue.600">
          <Icon as={FaChalkboardTeacher} className="ml-2" />
          {type === "add" ? "إضافة محاضرة جديدة" : "تعديل المحاضرة"}
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={5} align="stretch">
              {/* عنوان المحاضرة */}
              <FormControl isRequired>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <FaChalkboardTeacher /> عنوان المحاضرة
                </FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان المحاضرة"
                  borderRadius="lg"
                />
              </FormControl>

              {/* وصف المحاضرة */}
              <FormControl>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <FaRegFileAlt /> وصف المحاضرة (اختياري)
                </FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف المحاضرة"
                  rows={3}
                  borderRadius="lg"
                />
              </FormControl>

              {/* ترتيب المحاضرة */}
              <FormControl isRequired>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <FaListOl /> ترتيب المحاضرة
                </FormLabel>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: parseInt(e.target.value) })
                  }
                  placeholder="أدخل ترتيب المحاضرة"
                  borderRadius="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              colorScheme="red"
              mr={3}
              onClick={onClose}
              leftIcon={<FaTimes />}
              borderRadius="xl"
            >
              إلغاء
            </Button>
            <Button
            className="mx-2"
              colorScheme="blue"
              type="submit"
              isLoading={loading}
              leftIcon={<FaCheck />}
              borderRadius="xl"
            >
              {type === "add" ? "إضافة" : "تعديل"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const VideoModal = ({ isOpen, onClose, type, data, lectureId, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    video_url: data?.video_url || '',
    title: data?.title || '',
    position: data?.position || 1
  });

  useEffect(() => {
    if (data) {
      setFormData({
        video_url: data.video_url || '',
        title: data.title || '',
        position: data.position || 1
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'edit') {
      onSubmit(data.id, formData);
    } else {
      onSubmit(lectureId, formData);
    }
    // لا نغلق الموديل هنا، سيتم إغلاقه بعد نجاح العملية
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      closeOnOverlayClick={!loading}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent borderRadius="2xl" boxShadow="2xl">
        <ModalHeader
          display="flex"
          alignItems="center"
          gap={2}
          fontWeight="bold"
          fontSize="xl"
          color="blue.600"
        >
          <Icon as={FaFilm} />
          {type === "add" ? "إضافة فيديو جديد" : "تعديل الفيديو"}
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={5} align="stretch">
              {/* رابط الفيديو */}
             

              {/* عنوان الفيديو */}
              <FormControl>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <FaRegFileAlt /> عنوان الفيديو (اختياري)
                </FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان الفيديو"
                  isDisabled={loading}
                  borderRadius="lg"
                />
              </FormControl>
 <FormControl isRequired>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <FaVideo /> رابط الفيديو
                </FormLabel>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="أدخل رابط الفيديو"
                  isDisabled={loading}
                  borderRadius="lg"
                />
              </FormControl>
              {/* ترتيب الفيديو */}
              <FormControl isRequired>
                <FormLabel display="flex" alignItems="center" gap={2}>
                  <FaListOl /> ترتيب الفيديو
                </FormLabel>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  placeholder="أدخل ترتيب الفيديو"
                  isDisabled={loading}
                  borderRadius="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              colorScheme="red"
              mr={3}
              onClick={onClose}
              isDisabled={loading}
              leftIcon={<FaTimes />}
              borderRadius="xl"
            >
              إلغاء
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={loading}
              loadingText={type === "add" ? "جاري الإضافة..." : "جاري التعديل..."}
              leftIcon={!loading && <FaCheck />}
              borderRadius="xl"
              className="mx-2"
            >
              {type === "add" ? "إضافة" : "تعديل"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const FileModal = ({ isOpen, onClose, type, data, lectureId, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    file_url: data?.file_url || '',
    filename: data?.filename || ''
  });

  useEffect(() => {
    if (data) {
      setFormData({
        file_url: data.file_url || '',
        filename: data.filename || ''
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'edit') {
      onSubmit(data.id, formData);
    } else {
      onSubmit(lectureId, formData);
    }
    // لا نغلق الموديل هنا، سيتم إغلاقه بعد نجاح العملية
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {type === 'add' ? 'إضافة ملف جديد' : 'تعديل الملف'}
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>رابط الملف</FormLabel>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                  placeholder="أدخل رابط الملف"
                  isDisabled={loading}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>اسم الملف</FormLabel>
                <Input
                  value={formData.filename}
                  onChange={(e) => setFormData({...formData, filename: e.target.value})}
                  placeholder="أدخل اسم الملف"
                  isDisabled={loading}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
              إلغاء
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={loading} loadingText={type === 'add' ? 'جاري الإضافة...' : 'جاري التعديل...'}>
              {type === 'add' ? 'إضافة' : 'تعديل'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

// Static Images - الصور الثابتة
const courseHeroImage = "/lE7lWBexvOTPM2MPEKyTRRBo1TQtNGMoL1pxWCxD.jpg";
const instructorImage = "/lE7lWBexvOTPM2MPEKyTRRBo1TQtNGMoL1pxWCxD.jpg";

// Custom keyframes for shimmer effect
// const shimmer = keyframes`
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// `;

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);
const MotionHStack = motion(HStack);

const CourseDetailsPage = () => {
  const {id}=useParams()
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const [expandedLecture, setExpandedLecture] = React.useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [courseData, setCourseData] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Lecture management states
  const [lectureModal, setLectureModal] = useState({ isOpen: false, type: 'add', data: null });
  const [videoModal, setVideoModal] = useState({ isOpen: false, type: 'add', lectureId: null, data: null });
  const [fileModal, setFileModal] = useState({ isOpen: false, type: 'add', lectureId: null, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, type: '', id: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const cancelRef = React.useRef();

  // 1. أضف State لإدارة مودال الامتحان وحذف الامتحان
  const [examModal, setExamModal] = useState({ isOpen: false, type: 'add', lectureId: null, data: null });
  const [deleteExamDialog, setDeleteExamDialog] = useState({ isOpen: false, examId: null, title: '' });
  const [examActionLoading, setExamActionLoading] = useState(false);
  
  // State لمودال إضافة الأسئلة بالجملة
  const [bulkQuestionsModal, setBulkQuestionsModal] = useState({ isOpen: false, examId: null, examTitle: '', examType: '' });
  const [bulkQuestionsLoading, setBulkQuestionsLoading] = useState(false);
  const [bulkQuestionsText, setBulkQuestionsText] = useState('');

  // دالة فتح مودال إضافة الأسئلة بالجملة
  const handleOpenBulkQuestionsModal = (examId, examTitle, examType) => {
    setBulkQuestionsModal({ isOpen: true, examId, examTitle, examType });
  };

  // 1. State لإدارة الامتحانات الشاملة
  const [courseExams, setCourseExams] = useState([]);
  const [courseExamsLoading, setCourseExamsLoading] = useState(false);
  const [courseExamsError, setCourseExamsError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  // State لمودال إنشاء الأكواد
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeCount, setCodeCount] = useState(1);
  const [codeExpiresAt, setCodeExpiresAt] = useState(dayjs().add(30, 'day').format('YYYY-MM-DDTHH:mm'));
  const [codeLoading, setCodeLoading] = useState(false);

  // State لمودال عرض الأكواد
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [codesLoading, setCodesLoading] = useState(false);
  const [activationCodes, setActivationCodes] = useState([]);
  const [codesError, setCodesError] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStartIndex, setExportStartIndex] = useState(1);
  const [exportEndIndex, setExportEndIndex] = useState(50);
  const [searchCode, setSearchCode] = useState('');
  const [filteredCodes, setFilteredCodes] = useState([]);

  // State للفيديو
  const [videoPlayer, setVideoPlayer] = useState({
    isVisible: false,
    videoUrl: '',
    videoTitle: '',
    isVisible: false
  });

  // تحديث نطاق التصدير عند تغيير عدد الأكواد
  useEffect(() => {
    if (activationCodes.length > 0) {
      setExportEndIndex(Math.min(50, activationCodes.length));
    }
  }, [activationCodes.length]);

  // فلترة الأكواد عند تغيير نص البحث
  useEffect(() => {
    if (searchCode.trim() === '') {
      setFilteredCodes(activationCodes);
    } else {
      const filtered = activationCodes.filter(code => 
        code.code.toLowerCase().includes(searchCode.toLowerCase())
      );
      setFilteredCodes(filtered);
    }
  }, [searchCode, activationCodes]);

  // فلترة الطلاب عند تغيير نص البحث
  useEffect(() => {
    if (searchStudent.trim() === '') {
      setFilteredEnrollments(enrollments);
    } else {
      const filtered = enrollments.filter(student => 
        student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        (student.phone && student.phone.includes(searchStudent)) ||
        (student.email && student.email.toLowerCase().includes(searchStudent.toLowerCase())) ||
        (student.activation_code && student.activation_code.toLowerCase().includes(searchStudent.toLowerCase()))
      );
      setFilteredEnrollments(filtered);
    }
  }, [searchStudent, enrollments]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCourseLoading(true);
        setError(null);
        const response = await baseUrl.get(`api/course/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseData(response.data);
      } catch (error) {
        console.log("Error fetching data:", error);
        setError("حدث خطأ في تحميل البيانات");
      } finally {
        setCourseLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Fetch enrollments function
  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const response = await baseUrl.get(`api/course/${id}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(response.data.students);
    } catch (error) {
      console.log("Error fetching enrollments:", error);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  // 2. جلب الامتحانات الشاملة
  useEffect(() => {
    const fetchCourseExams = async () => {
      try {
        setCourseExamsLoading(true);
        setCourseExamsError(null);
        const response = await baseUrl.get(`api/course/${id}/course-exams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseExams(response.data.exams || []);
      } catch (error) {
        setCourseExamsError('حدث خطأ في تحميل الامتحانات الشاملة');
      } finally {
        setCourseExamsLoading(false);
      }
    };
    fetchCourseExams();
  }, [id, token]);

  // بعد useEffect الخاص بجلب الامتحانات الشاملة:
  const refreshExams = async () => {
    try {
      setCourseExamsLoading(true);
      setCourseExamsError(null);
      const response = await baseUrl.get(`api/course/${id}/course-exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseExams(response.data.exams || []);
    } catch (error) {
      setCourseExamsError('حدث خطأ في تحميل الامتحانات الشاملة');
    } finally {
      setCourseExamsLoading(false);
    }
  };

  // دالة جلب الأكواد
  const fetchActivationCodes = async () => {
    setCodesLoading(true);
    setCodesError(null);
    try {
      const res = await baseUrl.get(`api/course/my-activation-codes?course_id=${course.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivationCodes(res.data.activation_codes || []);
    } catch (error) {
      setCodesError("حدث خطأ في جلب الأكواد");
      setActivationCodes([]);
    } finally {
      setCodesLoading(false);
    }
  };

  // دالة جلب امتحان المحاضرة
  const fetchLectureExam = async (lectureId) => {
    try {
      const response = await baseUrl.get(`/api/course/lecture/${lectureId}/exam`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.log("Error fetching lecture exam:", error);
      return null;
    }
  };

  // Colors for light and dark mode
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const sectionBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("blue.700", "blue.200");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const dividerColor = useColorModeValue("gray.200", "gray.600");
  const itemBg = useColorModeValue("gray.50", "gray.700");
  const activeItemBg = useColorModeValue("blue.50", "blue.900");
  const liveNowBg = useColorModeValue("red.50", "red.900");

  const tabSelectedBg = useColorModeValue("blue.500", "blue.600");
  const tabSelectedColor = useColorModeValue("white", "white");
  const tabHoverBg = useColorModeValue("blue.100", "gray.700");

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger children appearance
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const resourceIconMap = {
    pdf: FaFilePdf,
    doc: FaDownload, // يمكن استخدام FaFileWord أو FaFileAlt
    default: FaDownload,
  };

  // Lecture Management Functions
  const handleAddLecture = () => {
    setLectureModal({ isOpen: true, type: 'add', data: null });
  };

  const handleEditLecture = (lecture) => {
    setLectureModal({ isOpen: true, type: 'edit', data: lecture });
  };

  const handleDeleteLecture = (lectureId, title) => {
    setDeleteDialog({ isOpen: true, type: 'lecture', id: lectureId, title });
  };

  const handleAddVideo = (lectureId) => {
    setVideoModal({ isOpen: true, type: 'add', lectureId, data: null });
  };

  const handleEditVideo = (video, lectureId) => {
    setVideoModal({ isOpen: true, type: 'edit', lectureId, data: video });
  };

  const handleDeleteVideo = (videoId, title) => {
    setDeleteDialog({ isOpen: true, type: 'video', id: videoId, title });
  };

  const handleAddFile = (lectureId) => {
    setFileModal({ isOpen: true, type: 'add', lectureId, data: null });
  };

  const handleEditFile = (file, lectureId) => {
    setFileModal({ isOpen: true, type: 'edit', lectureId, data: file });
  };

  const handleDeleteFile = (fileId, title) => {
    setDeleteDialog({ isOpen: true, type: 'file', id: fileId, title });
  };

  // API Functions
  const createLecture = async (data) => {
    try {
      setActionLoading(true);
      const response = await baseUrl.post(`api/course/${id}/lectures`, data, {
        headers: { Authorization: `bearer ${token}` },
      });
      toast({
        title: "تم إضافة المحاضرة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setLectureModal({ isOpen: false, type: 'add', data: null });
    } catch (error) {
      toast({
        title: "خطأ في إضافة المحاضرة",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateLecture = async (lectureId, data) => {
    try {
      setActionLoading(true);
      const response = await baseUrl.put(`api/course-content/lectures/${lectureId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم تعديل المحاضرة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setLectureModal({ isOpen: false, type: 'edit', data: null });
    } catch (error) {
      toast({
        title: "خطأ في تعديل المحاضرة",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteLecture = async (lectureId) => {
    try {
      setActionLoading(true);
      await baseUrl.delete(`api/course-content/lectures/${lectureId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم حذف المحاضرة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
    } catch (error) {
      toast({
        title: "خطأ في حذف المحاضرة",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const createVideo = async (lectureId, data) => {
    try {
      setActionLoading(true);
      const response = await baseUrl.post(`api/course/lecture/${lectureId}/videos`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم إضافة الفيديو بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setVideoModal({ isOpen: false, type: 'add', data: null, lectureId: null });
    } catch (error) {
      toast({
        title: "خطأ في إضافة الفيديو",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateVideo = async (videoId, data) => {
    try {
      setActionLoading(true);
      const response = await baseUrl.put(`api/course/lecture-video/${videoId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم تعديل الفيديو بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setVideoModal({ isOpen: false, type: 'edit', data: null, lectureId: null });
    } catch (error) {
      toast({
        title: "خطأ في تعديل الفيديو",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      setActionLoading(true);
      await baseUrl.delete(`api/course/lecture-video/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم حذف الفيديو بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
    } catch (error) {
      toast({
        title: "خطأ في حذف الفيديو",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const createFile = async (lectureId, data) => {
    try {
      setActionLoading(true);
      const response = await baseUrl.post(`api/course/lecture/${lectureId}/files`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم إضافة الملف بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setFileModal({ isOpen: false, type: 'add', data: null, lectureId: null });
    } catch (error) {
      toast({
        title: "خطأ في إضافة الملف",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateFile = async (fileId, data) => {
    try {
      setActionLoading(true);
      const response = await baseUrl.put(`api/course/lecture-file/${fileId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم تعديل الملف بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setFileModal({ isOpen: false, type: 'edit', data: null, lectureId: null });
    } catch (error) {
      toast({
        title: "خطأ في تعديل الملف",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setActionLoading(true);
      await baseUrl.delete(`api/course/lecture-file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم حذف الملف بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
    } catch (error) {
      toast({
        title: "خطأ في حذف الملف",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const { type, id } = deleteDialog;
    
    switch (type) {
      case 'lecture':
        await deleteLecture(id);
        break;
      case 'video':
        await deleteVideo(id);
        break;
      case 'file':
        await deleteFile(id);
        break;
    }
    
    setDeleteDialog({ isOpen: false, type: '', id: null, title: '' });
  };

  // 2. دوال API للامتحان
  const createExam = async (lectureId, data) => {
    try {
      setExamActionLoading(true);
      await baseUrl.post(`/api/course/lecture/${lectureId}/exam`, {
        title: data.title,
        total_grade: data.total_grade,
        duration: data.duration
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'تم إضافة الامتحان بنجاح', status: 'success', duration: 3000, isClosable: true });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setExamModal({ isOpen: false, type: 'add', data: null });
    } catch (error) {
      toast({ title: 'خطأ في إضافة الامتحان', description: error.response?.data?.message || 'حدث خطأ غير متوقع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setExamActionLoading(false);
    }
  };
  const updateExam = async (examId, data) => {
    try {
      setExamActionLoading(true);
      await baseUrl.patch(`api/course/lecture/exam/${examId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'تم تعديل الامتحان بنجاح', status: 'success', duration: 3000, isClosable: true });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setExamModal({ isOpen: false, type: 'edit', data: null });
    } catch (error) {
      toast({ title: 'خطأ في تعديل الامتحان', description: error.response?.data?.message || 'حدث خطأ غير متوقع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setExamActionLoading(false);
    }
  };
  const deleteExam = async (examId) => {
    try {
      setExamActionLoading(true);
      await baseUrl.delete(`api/course/lecture/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'تم حذف الامتحان بنجاح', status: 'success', duration: 3000, isClosable: true });
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
    } catch (error) {
      toast({ title: 'خطأ في حذف الامتحان', description: error.response?.data?.message || 'حدث خطأ غير متوقع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setExamActionLoading(false);
    }
  };

  // دالة إضافة الأسئلة بالجملة
  const addBulkQuestions = async (examId, data, questionType, examType) => {
    try {
      setBulkQuestionsLoading(true);
      
      if (questionType === 'text') {
        // Handle text questions
        const endpoint = examType === 'comprehensive'
          ? `/api/course/course-exam/${examId}/bulk-questions`
          : `/api/questions/lecture-exam/${examId}/bulk`;
        await baseUrl.post(endpoint, {
          bulk_text: data
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Handle image questions
        const formData = new FormData();
        formData.append('exam_id', examId);
        
        // Append each image file
        data.forEach((file, index) => {
          formData.append('images', file);
        });
        
        await baseUrl.post('/api/questions/lecture-exam-question', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });
      }
      
      toast({ 
        title: 'تم إضافة الأسئلة بنجاح', 
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      setBulkQuestionsModal({ isOpen: false, examId: null, examTitle: '', examType: '' });
      setBulkQuestionsText('');
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
    } catch (error) {
      toast({ 
        title: 'خطأ في إضافة الأسئلة', 
        description: error.response?.data?.message || 'حدث خطأ غير متوقع', 
        status: 'error', 
        duration: 3000, 
        isClosable: true 
      });
    } finally {
      setBulkQuestionsLoading(false);
    }
  };

  // 3. مودال إضافة/تعديل امتحان
  const ExamModal = ({ isOpen, onClose, type, data, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
      title: data?.title || '',
      total_grade: data?.total_grade || 10,
      duration: data?.duration || 30,
    });
    useEffect(() => {
      if (data) setFormData({
        title: data.title || '',
        total_grade: data.total_grade || 10,
        duration: data.duration || 30,
      });
    }, [data]);
    const handleSubmit = (e) => {
      e.preventDefault();
      if (type === 'edit') onSubmit(data.id, formData);
      else onSubmit(formData);
      // لا نغلق الموديل هنا، سيتم إغلاقه بعد نجاح العملية
    };
    return (
      <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} closeOnOverlayClick={!loading}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{type === 'add' ? 'إضافة امتحان' : 'تعديل الامتحان'}</ModalHeader>
          <ModalCloseButton isDisabled={loading} />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>عنوان الامتحان</FormLabel>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="أدخل عنوان الامتحان"
                    isDisabled={loading}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>الدرجة الكلية</FormLabel>
                  <Input 
                    type="number" 
                    value={formData.total_grade} 
                    onChange={e => setFormData({ ...formData, total_grade: parseInt(e.target.value) })}
                    placeholder="أدخل الدرجة الكلية"
                    min={1}
                    isDisabled={loading}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>مدة الامتحان (بالدقائق)</FormLabel>
                  <Input 
                    type="number" 
                    value={formData.duration} 
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    placeholder="أدخل مدة الامتحان بالدقائق"
                    min={1}
                    isDisabled={loading}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>إلغاء</Button>
              <Button colorScheme="blue" type="submit" isLoading={loading} loadingText={type === 'add' ? 'جاري الإضافة...' : 'جاري التعديل...'}>{type === 'add' ? 'إضافة' : 'تعديل'}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };

  // مودال إضافة الأسئلة بالجملة
  const BulkQuestionsModal = ({ isOpen, onClose, examId, examTitle, onSubmit, loading }) => {
    const [questionType, setQuestionType] = useState('text'); // 'text' or 'images'
    const [formData, setFormData] = useState({
      bulk_text: '',
      images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
      console.log('BulkQuestionsModal useEffect - isOpen:', isOpen, 'examId:', examId, 'examTitle:', examTitle);
      setFormData({ bulk_text: '', images: [] });
      setImagePreviews([]);
      setQuestionType('text');
    }, [isOpen, examId, examTitle]);

    const handleImageChange = (event) => {
      const files = Array.from(event.target.files);
      
      // Validate file count
      if (files.length > 10) {
        toast({
          title: "خطأ في عدد الصور",
          description: "يمكن رفع حتى 10 صور فقط",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const invalidFiles = files.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast({
          title: "خطأ في نوع الملفات",
          description: "يرجى اختيار ملفات صورة صحيحة (JPG, PNG, GIF)",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file sizes (max 5MB each)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "خطأ في حجم الملفات",
          description: "حجم كل صورة يجب أن يكون أقل من 5 ميجابايت",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setFormData(prev => ({ ...prev, images: files }));

      // Create previews
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    };

    const removeImage = (index) => {
      const newImages = formData.images.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      
      // Revoke the URL to free memory
      URL.revokeObjectURL(imagePreviews[index]);
      
      setFormData(prev => ({ ...prev, images: newImages }));
      setImagePreviews(newPreviews);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (questionType === 'text') {
        onSubmit(examId, formData.bulk_text, 'text');
      } else {
        onSubmit(examId, formData.images, 'images');
      }
      // لا نغلق الموديل هنا، سيتم إغلاقه بعد نجاح العملية
    };

    console.log('BulkQuestionsModal render - isOpen:', isOpen, 'examId:', examId, 'examTitle:', examTitle);
    return (
      <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} size="4xl" closeOnOverlayClick={!loading} closeOnEsc={!loading}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" spacing={3}>
              <Icon as={FaPlus} color="blue.500" mr={3} />
              <Text>إضافة أسئلة بالجملة - {examTitle}</Text>
            </Flex>
            {console.log('Modal header rendered with examTitle:', examTitle)}
          </ModalHeader>
          <ModalCloseButton isDisabled={loading} />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              {console.log('Modal body content starting')}
              <VStack spacing={6} align="stretch">
                {/* Question Type Selection */}
                <Box>
                  <FormLabel fontWeight="bold" mb={3}>
                    نوع الأسئلة
                  </FormLabel>
                  <HStack spacing={4} mb={4}>
                    <Button
                      colorScheme={questionType === 'text' ? 'blue' : 'gray'}
                      variant={questionType === 'text' ? 'solid' : 'outline'}
                      onClick={() => setQuestionType('text')}
                      leftIcon={<Icon as={FaRegFileAlt} />}
                    >
                      أسئلة نصية
                    </Button>
                    <Button
                      colorScheme={questionType === 'images' ? 'blue' : 'gray'}
                      variant={questionType === 'images' ? 'solid' : 'outline'}
                      onClick={() => setQuestionType('images')}
                      leftIcon={<Icon as={FaFilePdf} />}
                    >
                      أسئلة بالصور
                    </Button>
                  </HStack>
                </Box>

                {/* Text Questions Section */}
                {questionType === 'text' && (
                  <Box>
                    <FormLabel fontWeight="bold" mb={2}>
                      نص الأسئلة
                    </FormLabel>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      أدخل الأسئلة بالشكل التالي:
                    </Text>
                    <Box 
                      bg="gray.50" 
                      p={4} 
                      borderRadius="md" 
                      border="1px solid" 
                      borderColor="gray.200"
                      mb={4}
                    >
                    <Text fontSize="sm" fontFamily="mono" color="gray.700">
                      {`You were __________ to escape unharmed.
A) unfortunately
B) fortunately
C) fortunate
D) unfortunate

Mai as well as her sisters __________ a promise to help their mother at home.
A) has done
B) have done
C) have made
D) has made`}
                    </Text>
                    </Box>
                    <Textarea
                      value={formData.bulk_text}
                      onChange={(e) => setFormData({ ...formData, bulk_text: e.target.value })}
                      placeholder="أدخل الأسئلة هنا..."
                      rows={15}
                      fontFamily="mono"
                      fontSize="sm"
                      resize="vertical"
                      isRequired
                    />
                  
                    <Box>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        ملاحظات:
                      </Text>
                      <VStack spacing={2} align="start" mt={2}>
                        <Text fontSize="xs" color="gray.600">
                          • كل سؤال يجب أن يحتوي على 4 خيارات (A, B, C, D)
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          • اترك سطر فارغ بين كل سؤال
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          • تأكد من صحة تنسيق الأسئلة قبل الإرسال
                        </Text>
                      </VStack>
                    </Box>
                  </Box>
                )}

                {/* Image Questions Section */}
                {questionType === 'images' && (
                  <Box>
                    <FormLabel fontWeight="bold" mb={2}>
                      رفع صور الأسئلة
                    </FormLabel>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      يمكنك رفع حتى 10 صور للأسئلة
                    </Text>
                    
                    {/* File Upload Area */}
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="lg"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{
                        borderColor: "blue.400",
                        bg: "blue.50"
                      }}
                      transition="all 0.2s"
                      mb={4}
                    >
                      <VStack spacing={4}>
                        <Icon as={FaFilePdf} boxSize={8} color="gray.400" />
                        <VStack spacing={2}>
                          <Text fontWeight="medium" color="gray.700">
                            انقر لاختيار صور الأسئلة
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            JPG, PNG, GIF حتى 5 ميجابايت لكل صورة
                          </Text>
                        </VStack>
                      </VStack>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="full"
                        opacity={0}
                        cursor="pointer"
                      />
                    </Box>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={3}>
                          الصور المحددة ({imagePreviews.length}/10):
                        </Text>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                          {imagePreviews.map((preview, index) => (
                            <Box key={index} position="relative">
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                w="full"
                                h="120px"
                                objectFit="cover"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                              />
                              <IconButton
                                icon={<Icon as={FaTimes} />}
                                aria-label="حذف الصورة"
                                position="absolute"
                                top={1}
                                right={1}
                                size="sm"
                                colorScheme="red"
                                variant="solid"
                                borderRadius="full"
                                onClick={() => removeImage(index)}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    <Box>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        ملاحظات:
                      </Text>
                      <VStack spacing={2} align="start" mt={2}>
                        <Text fontSize="xs" color="gray.600">
                          • يمكن رفع حتى 10 صور للأسئلة
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          • حجم كل صورة يجب أن يكون أقل من 5 ميجابايت
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          • الأنواع المدعومة: JPG, PNG, GIF
                        </Text>
                      </VStack>
                    </Box>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
                إلغاء
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={loading}
                loadingText="جاري إضافة الأسئلة..."
                isDisabled={
                  loading || 
                  (questionType === 'text' && !formData.bulk_text.trim()) ||
                  (questionType === 'images' && formData.images.length === 0)
                }
              >
                {questionType === 'text' ? 'إضافة الأسئلة النصية' : 'إضافة الأسئلة بالصور'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };

  // دالة إرسال الأكواد
  const handleCreateCodes = async (e) => {
    e.preventDefault();
    setCodeLoading(true);
    try {
      await baseUrl.post("api/course/activation-code", {
        course_id: course.id,
        count: parseInt(codeCount),
        expires_at: new Date(codeExpiresAt).toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم إنشاء الأكواد بنجاح!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCodeModalOpen(false);
      setCodeCount(1);
      setCodeExpiresAt(dayjs().add(30, 'day').format('YYYY-MM-DDTHH:mm'));
      // تحديث البيانات بدون إعادة تحميل
      await fetchActivationCodes();
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الأكواد",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCodeLoading(false);
    }
  };

  // دالة تصدير الأكواد كـ PDF مع معالجة أخطاء واضحة
  const handleExportCodesPdf = async () => {
    if (!activationCodes || activationCodes.length === 0) {
      toast({
        title: "لا توجد أكواد متاحة للتصدير!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // التحقق من صحة النطاق المحدد
    if (exportStartIndex > exportEndIndex) {
      toast({
        title: "خطأ في تحديد النطاق!",
        description: "يجب أن يكون رقم البداية أقل من أو يساوي رقم النهاية",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // تحديد الأكواد المراد تصديرها
    const startIndex = Math.max(0, exportStartIndex - 1); // تحويل إلى index
    const endIndex = Math.min(activationCodes.length, exportEndIndex);
    const codesToExport = activationCodes.slice(startIndex, endIndex);

    if (codesToExport.length === 0) {
      toast({
        title: "لا توجد أكواد في النطاق المحدد!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsExportingPdf(true);
    try {
      const codesPerPage = 12; // 3 columns × 4 rows
      const pageWidth = 297; // mm
      const pageHeight = 210; // mm
      const pdf = new jsPDF('l', 'mm', 'a4');
      for (let i = 0; i < codesToExport.length; i += codesPerPage) {
        const tempDiv = document.createElement("div");
        tempDiv.style.display = "block";
        tempDiv.style.width = `${pageWidth}mm`;
        tempDiv.style.height = `${pageHeight}mm`;
        tempDiv.style.background = "#fff";
        document.body.appendChild(tempDiv);
        tempDiv.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(4, 1fr); gap: 5mm; width: 100%; height: 100%; align-content: start;">
            ${codesToExport
              .slice(i, i + codesPerPage)
              .map(
                (code, index) => `
                  <div class="code" style="padding: 3mm; width: 100%; height: 100%; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); text-align: center; position: relative; overflow: hidden; background: #fff; display: flex; flex-direction: column; justify-content: space-between; min-height: 45mm;">
                  <div style='margin-bottom: 8px; padding: 6px 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <h2 style='font-size: 14px; font-weight: bold; color: #ffffff; margin: 0; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.3);'>
                      ${user.name || 'اسم المستخدم'}
                    </h2>
                    </div>
                    <div style='display: flex; margin-top: 8px; justify-content: space-between; align-items: center; padding: 2px 0;'>
                      <span style='font-size: 12px; font-weight: bold; color: #3182ce; margin-bottom: 2px;'>${course?.title || 'اسم الكورس'}</span>
                      <span style='font-size: 12px; font-weight: bold; color: #3182ce; margin-bottom: 2px;'>${code.grade_name || ''}</span>
                    </div>
                    <div style='display: flex; margin-top: 8px; justify-content: space-between; align-items: center; padding: 2px 0; flex-wrap: wrap;'>
                      <span style='font-size: 14px; font-weight: bold; color: #c53030;'>كود التفعيل :</span>
                      <span style='font-size: 14px; font-weight: bold; color: #c53030; word-break: break-all; max-width: 60%;'>${code.code}</span>
                    </div>
                    
                    <div style='margin-top: 8px;'>
                      <p style='font-size: 11px; font-weight: 600; color: #4a5568; text-align: center; margin: 0; white-space: nowrap;'>
                        01210726096 | 01032127531 | 01288781012 | 01289587761
                      </p>
                    </div>
                  </div>`
              )
              .join("")}
          </div>
        `;
        await new Promise((resolve) => setTimeout(resolve, 100));
        try {
          const pxPerMm = 3.78;
          const canvas = await html2canvas(tempDiv, {
            scale: 1.5,
            useCORS: true,
            width: pageWidth * pxPerMm,
            height: pageHeight * pxPerMm,
          });
          pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.8),
            "JPEG",
            0,
            0,
            pageWidth,
            pageHeight
          );
        } catch (err) {
          console.error("PDF Export Error (canvas):", err);
          toast({
            title: "خطأ أثناء إنشاء صورة الصفحة!",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
        if (i + codesPerPage < codesToExport.length) pdf.addPage();
        document.body.removeChild(tempDiv);
      }
      pdf.save("activation-codes.pdf");
      toast({
        title: "تم التصدير بنجاح!",
        description: `تم تصدير ${codesToExport.length} كود من ${exportStartIndex} إلى ${exportEndIndex}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast({
        title: "حدث خطأ أثناء تصدير PDF!",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle view enrollments
  const handleViewEnrollments = () => {
    fetchEnrollments();
    onOpen();
  };

  // State for delete student confirmation
  const [deleteStudentDialog, setDeleteStudentDialog] = useState({
    isOpen: false,
    studentId: null,
    studentName: '',
  });

  // Handle delete student confirmation
  const handleDeleteStudentConfirm = (studentId, studentName) => {
    setDeleteStudentDialog({
      isOpen: true,
      studentId,
      studentName,
    });
  };

  // Handle delete student from course
  const handleDeleteStudent = async () => {
    const { studentId, studentName } = deleteStudentDialog;
    try {
      setActionLoading(true);
      await baseUrl.delete(`api/course/${id}/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم حذف الطالب بنجاح",
        description: `تم حذف ${studentName} من الكورس`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // تحديث قائمة الطلبة
      await fetchEnrollments();
      // إغلاق dialog التأكيد
      setDeleteStudentDialog({ isOpen: false, studentId: null, studentName: '' });
    } catch (error) {
      toast({
        title: "خطأ في حذف الطالب",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // دالة فتح الفيديو
  const handleOpenVideo = (videoUrl, videoTitle) => {
    setVideoPlayer({
      isVisible: true,
      videoUrl,
      videoTitle,
      isVisible: true
    });
  };

  // دالة إغلاق الفيديو
  const handleCloseVideo = () => {
    setVideoPlayer({
      isVisible: false,
      videoUrl: '',
      videoTitle: '',
      isVisible: false
    });
  };

  // دالة تبديل ظهور الفيديو
  const handleToggleVideoVisibility = () => {
    setVideoPlayer(prev => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  };

  // دالة تحديث البيانات بدون إعادة تحميل
  const refreshCourseData = async () => {
    try {
      const response = await baseUrl.get(`api/course/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseData(response.data);
    } catch (error) {
      console.log("Error refreshing course data:", error);
    }
  };

  // Enhanced Loading Component
  if (courseLoading) {
    return (
      <Box minH="100vh" bg={pageBg} dir="rtl" className="mt-[80px]">
        <Center minH="70vh">
          <VStack spacing={8}>
            {/* Animated Book Icon */}
       
            
            {/* Main Loading Container */}
          <Box
              p={{ base: 8, md: 12 }}
              borderRadius="3xl"
            boxShadow="2xl"
              bgGradient="linear(to-br, blue.50, white, purple.50)"
              border="3px solid"
              borderColor="blue.200"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
              minW={{ base: '90vw', md: '500px' }}
              position="relative"
              overflow="hidden"
            >
              {/* Animated Background Elements */}
              <Box
                position="absolute"
                top="-50%"
                left="-50%"
                w="200%"
                h="200%"
                bgGradient="linear(45deg, transparent 30%, rgba(49, 130, 206, 0.1) 50%, transparent 70%)"
                animation="shimmer 3s ease-in-out infinite"
                transform="rotate(45deg)"
              />
              
              {/* Content */}
              <VStack spacing={6} position="relative" zIndex={1}>
                <Spinner 
                  size="xl" 
                  color="blue.500" 
                  thickness="8px" 
                  speed="0.8s"
                  mb={4}
                />
                <VStack spacing={3}>
                  <Text 
                    fontSize={{ base: "xl", md: "2xl" }} 
                    color="blue.700" 
                    fontWeight="bold"
                    textAlign="center"
                  >
              جاري تحميل تفاصيل الكورس...
            </Text>
                  <Text 
                    fontSize="sm" 
                    color="blue.600" 
                    opacity="0.8"
                    textAlign="center"
                  >
                    يرجى الانتظار قليلاً
                  </Text>
                </VStack>
                
                {/* Progress Bar */}
                <Box w="full" maxW="300px">
                  <Box
                    w="full"
                    h="4px"
                    bg="blue.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      bgGradient="linear(to-r, blue.400, purple.400)"
                      borderRadius="full"
                      animation="progress 2s ease-in-out infinite"
                      transformOrigin="left"
                    />
          </Box>
                </Box>
              </VStack>
            </Box>
          </VStack>
          
          {/* CSS Animations */}
          <style>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.7; }
              50% { transform: scale(1.2); opacity: 1; }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%) rotate(45deg); }
              100% { transform: translateX(100%) rotate(45deg); }
            }
            @keyframes progress {
              0% { transform: scaleX(0); }
              50% { transform: scaleX(0.7); }
              100% { transform: scaleX(1); }
            }
          `}</style>
        </Center>
      </Box>
    );
  }

  // Enhanced Error Component
  if (error) {
    return (
      <Box minH="100vh" bg={pageBg} dir="rtl" className="mt-[80px]">
        <Center minH="50vh">
          <VStack spacing={8}>
            {/* Error Icon with Animation */}
            <Box position="relative">
              <Icon 
                as={FaLightbulb} 
                boxSize={20} 
                color="red.500"
                style={{ 
                  animation: 'shake 0.5s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 4px rgba(245, 101, 101, 0.3))'
                }}
              />
              <Box
                position="absolute"
                top="-5px"
                right="-5px"
                w="12px"
                h="12px"
                bg="red.400"
                borderRadius="full"
                opacity="0.8"
                animation="pulse 2s ease-in-out infinite"
              />
            </Box>
            
            {/* Error Container */}
            <Box
              p={{ base: 8, md: 10 }}
              borderRadius="2xl"
              boxShadow="xl"
              bgGradient="linear(to-br, red.50, white, orange.50)"
              border="2px solid"
              borderColor="red.200"
              textAlign="center"
              maxW={{ base: '90vw', md: '500px' }}
            >
          <VStack spacing={6}>
                <Text 
                  fontSize={{ base: "lg", md: "xl" }} 
                  color="red.600" 
                  fontWeight="bold"
                >
                  حدث خطأ أثناء تحميل البيانات
                </Text>
                <Text 
                  fontSize="md" 
                  color="red.500" 
                  opacity="0.9"
                >
              {error}
            </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => window.location.reload()}
                  size="lg"
                  px={8}
                  borderRadius="full"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
              إعادة المحاولة
            </Button>
          </VStack>
            </Box>
          </VStack>
          
          {/* CSS Animations */}
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
            }
          `}</style>
        </Center>
      </Box>
    );
  }

  // Enhanced No Data Component
  if (!courseData) {
    return (
      <Box minH="100vh" bg={pageBg} dir="rtl" className="mt-[80px]">
        <Center minH="50vh">
          <VStack spacing={8}>
            {/* No Data Icon */}
            <Box position="relative">
              <Icon 
                as={FaSearch} 
                boxSize={20} 
                color="gray.500"
                style={{ 
                  animation: 'float 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 4px rgba(113, 128, 150, 0.3))'
                }}
              />
            </Box>
            
            {/* No Data Container */}
            <Box
              p={{ base: 8, md: 10 }}
              borderRadius="2xl"
              boxShadow="lg"
              bgGradient="linear(to-br, gray.50, white)"
              border="2px solid"
              borderColor="gray.200"
              textAlign="center"
              maxW={{ base: '90vw', md: '500px' }}
            >
              <VStack spacing={6}>
                <Text 
                  fontSize={{ base: "lg", md: "xl" }} 
                  color="gray.600" 
                  fontWeight="bold"
                >
                  لا توجد بيانات متاحة
                </Text>
                <Text 
                  fontSize="md" 
                  color="gray.500" 
                  opacity="0.8"
                >
                  لم يتم العثور على معلومات الكورس المطلوب
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => window.location.reload()}
                  size="md"
                  px={6}
                  borderRadius="full"
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  تحديث الصفحة
                </Button>
              </VStack>
            </Box>
          </VStack>
          
          {/* CSS Animations */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </Center>
      </Box>
    );
  }

  const { course, lectures } = courseData;
  return (
    <Box minH={{ base: '100vh', md: '100vh' }} bg={pageBg} dir="rtl" className="mt-[=5 0px]">
      {/* Hero Section - Full Width Image with Overlay */}
      <CourseHeroSection 
        course={course}
        isTeacher={isTeacher}
        isAdmin={isAdmin}
        handleViewEnrollments={handleViewEnrollments}
      />

      {/* Video Player */}
      <VideoPlayer
        videoUrl={videoPlayer.videoUrl}
        videoTitle={videoPlayer.videoTitle}
        isVisible={videoPlayer.isVisible}
        onClose={handleCloseVideo}
        onToggleVisibility={handleToggleVideoVisibility}
        isTeacher={isTeacher}
      />
      {/* زر إنشاء أكواد للمدرس فقط */}
      {isTeacher && (
        <Flex 
          justify={{ base: 'center', md: 'flex-end' }} 
          align="center" 
          px={{ base: 4, sm: 6, md: 10 }} 
          mt={{ base: 2, md: 4 }} 
          mb={{ base: 0, md: -8 }} 
          gap={{ base: 2, md: 3 }} 
          direction={{ base: 'column', sm: 'row' }}
          flexWrap="wrap"
        >
          <Button 
            colorScheme="purple" 
            leftIcon={<FaKey />} 
            borderRadius="xl" 
            onClick={() => setCodeModalOpen(true)} 
            w={{ base: '100%', sm: 'auto' }}
            size={{ base: 'sm', md: 'md' }}
            fontSize={{ base: 'xs', md: 'sm' }}
          >
            إنشاء أكواد
          </Button>
          <Button 
            colorScheme="blue" 
            leftIcon={<FaKey />} 
            borderRadius="xl" 
            onClick={() => { setShowCodesModal(true); fetchActivationCodes(); }} 
            w={{ base: '100%', sm: 'auto' }}
            size={{ base: 'sm', md: 'md' }}
            fontSize={{ base: 'xs', md: 'sm' }}
          >
            عرض أكواد الكورس
          </Button>
        </Flex>
      )}
      {/* مودال إنشاء الأكواد */}
      <Modal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إنشاء أكواد تفعيل للكورس</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateCodes}>
            <ModalBody>
              <VStack spacing={5} align="stretch">
                <FormControl isRequired>
                  <FormLabel>عدد الأكواد</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={codeCount}
                    onChange={e => setCodeCount(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>تاريخ انتهاء الصلاحية</FormLabel>
                  <Input
                    type="datetime-local"
                    value={codeExpiresAt}
                    onChange={e => setCodeExpiresAt(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setCodeModalOpen(false)} mr={3}>إلغاء</Button>
              <Button colorScheme="purple" type="submit" isLoading={codeLoading}>إنشاء</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* مودال عرض الأكواد */}
      <Modal isOpen={showCodesModal} onClose={() => {
        setShowCodesModal(false);
        setSearchCode('');
      }} size="3xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>أكواد تفعيل الكورس</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* حقل البحث */}
            {activationCodes.length > 0 && (
              <Box mb={4} p={4} borderWidth={1} borderRadius="md" bg="blue.50">
                <Text fontWeight="bold" mb={3} color="blue.700">البحث في الأكواد:</Text>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="blue.500" />
                  </InputLeftElement>
                  <Input
                    placeholder="ابحث بالكود..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    bg="white"
                    borderColor="blue.200"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  />
                  {searchCode && (
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<Icon as={FaTimes} />}
                        onClick={() => setSearchCode('')}
                        aria-label="مسح البحث"
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
                {searchCode && (
                  <Text fontSize="sm" color="blue.600" mt={2}>
                    تم العثور على {filteredCodes.length} كود من أصل {activationCodes.length}
                  </Text>
                )}
              </Box>
            )}
            
            {activationCodes.length > 0 && (
              <Box mb={4} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                <Text fontWeight="bold" mb={3}>تحديد نطاق التصدير:</Text>
                <Flex gap={4} alignItems="center" flexWrap="wrap">
                  <Box>
                    <Text fontSize="sm" mb={1}>من الكود رقم:</Text>
                    <NumberInput 
                      min={1} 
                      max={activationCodes.length} 
                      value={exportStartIndex} 
                      onChange={(valueString, valueNumber) => setExportStartIndex(valueNumber)}
                      size="sm"
                      w="100px"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box>
                    <Text fontSize="sm" mb={1}>إلى الكود رقم:</Text>
                    <NumberInput 
                      min={1} 
                      max={activationCodes.length} 
                      value={exportEndIndex} 
                      onChange={(valueString, valueNumber) => setExportEndIndex(valueNumber)}
                      size="sm"
                      w="100px"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => {
                      setExportStartIndex(1);
                      setExportEndIndex(activationCodes.length);
                    }}
                  >
                    تحديد الكل
              </Button>
                  <Text fontSize="sm" color="gray.600">
                    (إجمالي {activationCodes.length} كود)
                  </Text>
                </Flex>
                <Button 
                  colorScheme="teal" 
                  mt={3} 
                  onClick={handleExportCodesPdf} 
                  disabled={isExportingPdf || exportStartIndex > exportEndIndex}
                >
                  {isExportingPdf ? <Spinner size="sm" mr={2} /> : null} 
                  تصدير الأكواد من {exportStartIndex} إلى {exportEndIndex}
                </Button>
              </Box>
            )}
            {codesLoading ? (
              <Center py={8}><Spinner size="lg" color="blue.500" /></Center>
            ) : codesError ? (
              <Text color="red.500" textAlign="center">{codesError}</Text>
            ) : activationCodes.length === 0 ? (
              <Text color="gray.500" textAlign="center">لا توجد أكواد لهذا الكورس</Text>
            ) : filteredCodes.length === 0 && searchCode ? (
              <Box textAlign="center" py={8}>
                <Icon as={FaSearch} boxSize={12} color="gray.400" mb={4} />
                <Text color="gray.500" fontSize="lg" mb={2}>لم يتم العثور على نتائج</Text>
                <Text color="gray.400" fontSize="sm">لا توجد أكواد تطابق البحث: "{searchCode}"</Text>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  variant="outline" 
                  mt={3}
                  onClick={() => setSearchCode('')}
                >
                  مسح البحث
                </Button>
              </Box>
            ) : (
              <>
                <Box overflowX="auto">
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th>الكود</Th>
                        <Th>الاستخدامات</Th>
                        <Th>تاريخ الانتهاء</Th>
                        <Th>الحالة</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredCodes.map(code => (
                        <Tr key={code.id}>
                          <Td fontFamily="mono" fontWeight="bold">{code.code}</Td>
                          <Td>{code.uses} / {code.max_uses}</Td>
                          <Td>{code.expires_at ? new Date(code.expires_at).toLocaleString('ar-EG') : '-'}</Td>
                          <Td>
                            {code.is_expired ? (
                              <Badge colorScheme="red">منتهي</Badge>
                            ) : code.is_fully_used ? (
                              <Badge colorScheme="orange">مستخدم بالكامل</Badge>
                            ) : (
                              <Badge colorScheme="green">فعال</Badge>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                {/* عنصر مخفي لتصدير الأكواد ككروت PDF */}
                <Box id="codes-pdf-export" style={{ display: "none", width: "297mm", height: "210mm", background: "#fff", position: "absolute", top: 0, left: 0, zIndex: -1, direction: "rtl" }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(4, 1fr)',
                    gap: '5mm',
                    width: '100%',
                    height: '100%',
                    alignContent: 'start'
                  }}>
                    {activationCodes.slice(exportStartIndex - 1, exportEndIndex).map((code, index) => (
                      <div
                        key={code.id}
                        style={{
                          margin: '5px',
                          padding: '3mm',
                          width: '100%',
                          height: '100%',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '45mm',
                        }}
                      >
                        <div style={{ marginBottom: '8px', padding: '6px 10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {user.name || 'اسم المستخدم'}
                          </h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3182ce', marginBottom: '2px' }}>{course?.title || 'اسم الكورس'}</span>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3182ce', marginBottom: '2px' }}>{code.grade_name || ''}</span>
                        </div>
                        <div style={{ display: 'flex', marginTop: '8px', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#c53030' }}>كود التفعيل :</span>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#c53030', wordBreak: 'break-all', maxWidth: '60%' }}>{code.code}</span>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textAlign: 'center', margin: 0, whiteSpace: 'nowrap' }}>
                            01210726096 | 01274620654 | 01288781012 | 01289587761
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => {
              setShowCodesModal(false);
              setSearchCode('');
            }} colorScheme="blue">إغلاق</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

     

      <VStack
        spacing={{ base: 4, sm: 6, md: 12, lg: 16 }}
        align="stretch"
        maxW="container.xl"
        mx="auto"
        py={{ base: 4, sm: 6, md: 16 }}
       
        gap={{ base: 4, sm: 6, md: 8 }}
      >
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          bg={sectionBg}
          borderRadius={{ base: 'xl', md: '2xl' }}
          shadow={{ base: 'lg', md: 'xl' }}
        
          w="100%"
          minW={0}
          overflowX="hidden"
        >
          <Tabs
            isFitted
            variant="soft-rounded"
            colorScheme="blue"
            orientation={{ base: 'vertical', lg: 'horizontal' }}
            index={tabIndex}
            onChange={setTabIndex}
            size={{ base: 'sm', md: 'md' }}
          >
        
            <TabPanels p={{ base: 3, sm: 4, md: 6, lg: 8 }}>
              <Box
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="2xl"
                shadow="lg"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "2xl",
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)",
                  zIndex: -1
                }}
              >
              {/* Tab Panel للمحاضرات */}
              <TabPanel>
                <LecturesTab
                  lectures={lectures}
                  isTeacher={isTeacher}
                  isAdmin={isAdmin}
                  expandedLecture={expandedLecture}
                  setExpandedLecture={setExpandedLecture}
                  handleAddLecture={handleAddLecture}
                  handleEditLecture={handleEditLecture}
                  handleDeleteLecture={handleDeleteLecture}
                  handleAddVideo={handleAddVideo}
                  handleEditVideo={handleEditVideo}
                  handleDeleteVideo={handleDeleteVideo}
                  handleAddFile={handleAddFile}
                  handleEditFile={handleEditFile}
                  handleDeleteFile={handleDeleteFile}
                  setExamModal={setExamModal}
                  setDeleteExamDialog={setDeleteExamDialog}
                  examActionLoading={actionLoading}
                  itemBg={itemBg}
                  sectionBg={sectionBg}
                  headingColor={headingColor}
                  subTextColor={subTextColor}
                  borderColor={borderColor}
                  dividerColor={dividerColor}
                  textColor={textColor}
                  formatDate={formatDate}
                  onAddBulkQuestions={handleOpenBulkQuestionsModal}
                  handleOpenVideo={handleOpenVideo}
                />
              </TabPanel>

              {/* Tab Panel للجلسات المباشرة */}
              {(isAdmin || isTeacher) ? <CourseStreams courseId={id} /> : <StudentStreamsList courseId={id}/>}
              

              {/* Tab Panel للامتحانات */}
              <TabPanel>
                <CourseExamsTab
                  courseExams={courseExams}
                  courseExamsLoading={courseExamsLoading}
                  courseExamsError={courseExamsError}
                  headingColor={headingColor}
                  sectionBg={sectionBg}
                  dividerColor={dividerColor}
                  formatDate={formatDate}
                  isTeacher={isTeacher}
                  token={token}
                  courseId={id}
                  refreshExams={refreshExams}
                  onAddBulkQuestions={handleOpenBulkQuestionsModal}
                />
              </TabPanel>
                            </Box>
              </TabPanels>
            </Tabs>
          </MotionBox>
      </VStack>

      {/* Lecture Modal */}
      <LectureModal 
        isOpen={lectureModal.isOpen}
        onClose={() => setLectureModal({ isOpen: false, type: 'add', data: null })}
        type={lectureModal.type}
        data={lectureModal.data}
        onSubmit={lectureModal.type === 'add' ? createLecture : updateLecture}
        loading={actionLoading}
      />

      {/* Video Modal */}
      <VideoModal 
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, type: 'add', lectureId: null, data: null })}
        type={videoModal.type}
        data={videoModal.data}
        lectureId={videoModal.lectureId}
        onSubmit={videoModal.type === 'add' ? createVideo : updateVideo}
        loading={actionLoading}
      />

      {/* File Modal */}
      <FileModal 
        isOpen={fileModal.isOpen}
        onClose={() => setFileModal({ isOpen: false, type: 'add', lectureId: null, data: null })}
        type={fileModal.type}
        data={fileModal.data}
        lectureId={fileModal.lectureId}
        onSubmit={fileModal.type === 'add' ? createFile : updateFile}
        loading={actionLoading}
      />

      {/* Exam Modal */}
      <ExamModal
        isOpen={examModal.isOpen}
        onClose={() => setExamModal({ isOpen: false, type: 'add', lectureId: null, data: null })}
        type={examModal.type}
        data={examModal.data}
        onSubmit={examModal.type === 'add' ? (formData => createExam(examModal.lectureId, formData)) : updateExam}
        loading={examActionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteDialog({ isOpen: false, type: '', id: null, title: '' })}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              تأكيد الحذف
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف "{deleteDialog.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteDialog({ isOpen: false, type: '', id: null, title: '' })}>
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3} isLoading={actionLoading}>
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Exam Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteExamDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteExamDialog({ isOpen: false, examId: null, title: '' })}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">تأكيد حذف الامتحان</AlertDialogHeader>
            <AlertDialogBody>هل أنت متأكد من حذف "{deleteExamDialog.title}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteExamDialog({ isOpen: false, examId: null, title: '' })}>إلغاء</Button>
              <Button colorScheme="red" onClick={() => { deleteExam(deleteExamDialog.examId); setDeleteExamDialog({ isOpen: false, examId: null, title: '' }); }} ml={3} isLoading={examActionLoading}>حذف</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Bulk Questions Modal */}
      <BulkQuestionsModal
        isOpen={bulkQuestionsModal.isOpen}
        onClose={() => {
          setBulkQuestionsModal({ isOpen: false, examId: null, examTitle: '', examType: '' });
        }}
        examId={bulkQuestionsModal.examId}
        examTitle={bulkQuestionsModal.examTitle}
        examType={bulkQuestionsModal.examType}
        onSubmit={(examId, data, questionType) => addBulkQuestions(examId, data, questionType, bulkQuestionsModal.examType)}
        loading={bulkQuestionsLoading}
      />
      {console.log('BulkQuestionsModal state:', bulkQuestionsModal)}
      {console.log('BulkQuestionsModal isOpen:', bulkQuestionsModal.isOpen)}

      {/* Enrollments Modal */}
      <Modal isOpen={isOpen} onClose={() => {
        onClose();
        setSearchStudent('');
      }} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" spacing={3}>
              <Icon as={FaUserGraduate} color="blue.500" mr={3} />
              <Text>قائمة الطلاب المشتركين في الكورس</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* حقل البحث في الطلاب */}
            {enrollments.length > 0 && (
              <Box mb={4} p={4} borderWidth={1} borderRadius="md" bg="green.50">
                <Text fontWeight="bold" mb={3} color="green.700">البحث في الطلاب:</Text>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="green.500" />
                  </InputLeftElement>
                  <Input
                    placeholder="ابحث بالاسم، الهاتف، البريد الإلكتروني، أو كود التفعيل..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    bg="white"
                    borderColor="green.200"
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px green.400" }}
                  />
                  {searchStudent && (
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<Icon as={FaTimes} />}
                        onClick={() => setSearchStudent('')}
                        aria-label="مسح البحث"
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
                {searchStudent && (
                  <Text fontSize="sm" color="green.600" mt={2}>
                    تم العثور على {filteredEnrollments.length} طالب من أصل {enrollments.length}
                  </Text>
                )}
              </Box>
            )}

            {enrollmentsLoading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text>جاري تحميل بيانات الطلاب...</Text>
                </VStack>
              </Center>
            ) : enrollments.length > 0 ? (
              filteredEnrollments.length === 0 && searchStudent ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FaSearch} boxSize={12} color="gray.400" mb={4} />
                  <Text color="gray.500" fontSize="lg" mb={2}>لم يتم العثور على نتائج</Text>
                  <Text color="gray.400" fontSize="sm">لا يوجد طلاب يطابقون البحث: "{searchStudent}"</Text>
                  <Button 
                    size="sm" 
                    colorScheme="green" 
                    variant="outline" 
                    mt={3}
                    onClick={() => setSearchStudent('')}
                  >
                    مسح البحث
                  </Button>
                </Box>
              ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>الطالب</Th>
                      <Th>رقم الهاتف</Th>
                      <Th>البريد الإلكتروني</Th>
                      <Th>تاريخ الاشتراك</Th>
                      <Th>كود التفعيل</Th>
                      <Th>الإجراءات</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredEnrollments.map((student) => (
                      <Tr key={student.id}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar 
                              size="sm" 
                              name={student.name}
                              src={student.avatar}
                              bg="blue.500"
                            />
                            <Text fontWeight="medium">{student.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={FaPhone} color="green.500" />
                            <Text>{student.phone || "غير متوفر"}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={FaEnvelope} color="blue.500" />
                            <Text>{student.email || "غير متوفر"}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={FaCalendar} color="orange.500" />
                            <Text>{formatDate(student.enrolled_at)}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={FaKey} color="purple.500" />
                            <Text fontFamily="mono" fontSize="sm">
                              {student.activation_code}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Tooltip label="حذف الطالب من الكورس" hasArrow>
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              icon={<Icon as={FaTrash} boxSize={4} />}
                              onClick={() => handleDeleteStudentConfirm(student.id, student.name)}
                              isLoading={actionLoading}
                              _hover={{ bg: 'red.50' }}
                              aria-label="حذف الطالب"
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              )
            ) : (
              <Center py={10}>
                <VStack spacing={4}>
                  <Icon as={FaUserGraduate} boxSize={12} color="gray.400" />
                  <Text color="gray.500">لا يوجد طلاب مشتركين في هذا الكورس</Text>
                </VStack>
              </Center>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => {
              onClose();
              setSearchStudent('');
            }}>
              إغلاق
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Student Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteStudentDialog.isOpen}
        onClose={() => setDeleteStudentDialog({ isOpen: false, studentId: null, studentName: '' })}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            تأكيد حذف الطالب
          </AlertDialogHeader>

          <AlertDialogBody>
            هل أنت متأكد من حذف الطالب{" "}
            <Text as="span" fontWeight="bold" color="red.500">
              {deleteStudentDialog.studentName}
            </Text>{" "}
            من هذا الكورس؟
            <Text fontSize="sm" color="gray.600" mt={2}>
              هذا الإجراء لا يمكن التراجع عنه.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              onClick={() => setDeleteStudentDialog({ isOpen: false, studentId: null, studentName: '' })}
              isDisabled={actionLoading}
            >
              إلغاء
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteStudent}
              isLoading={actionLoading}
              loadingText="جاري الحذف..."
              mr={3}
            >
              حذف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ScrollToTop/>
    </Box>
  );
};

export default CourseDetailsPage;