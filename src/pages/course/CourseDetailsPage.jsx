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
  Container,
  Switch,
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
  FaCog, // For settings
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
        // استخدام endpoint مختلف للطلاب
        const endpoint = (isAdmin || isTeacher) 
          ? `api/course/${id}/course-exams`
          : `api/exams/course/${id}/student`;
        const response = await baseUrl.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // تسجيل مؤقت للتشخيص
        console.log('Course Exams Response:', response.data);
        
        // التحقق من وجود البيانات في response.data
        if (response.data && response.data.exams) {
          setCourseExams(response.data.exams);
        } else if (Array.isArray(response.data)) {
          // في حالة كانت البيانات مصفوفة مباشرة
          setCourseExams(response.data);
        } else {
          console.warn('Unexpected response structure:', response.data);
          setCourseExams([]);
        }
      } catch (error) {
        console.error('Error fetching course exams:', error);
        const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ في تحميل الامتحانات الشاملة';
        setCourseExamsError(errorMessage);
        setCourseExams([]);
      } finally {
        setCourseExamsLoading(false);
      }
    };
    if (id && token) {
      fetchCourseExams();
    }
  }, [id, token, isAdmin, isTeacher]);

  // بعد useEffect الخاص بجلب الامتحانات الشاملة:
  const refreshExams = async () => {
    try {
      setCourseExamsLoading(true);
      setCourseExamsError(null);
      // استخدام endpoint مختلف للطلاب
      const endpoint = (isAdmin || isTeacher) 
        ? `api/course/${id}/course-exams`
        : `api/exams/course/${id}/student`;
      const response = await baseUrl.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // تسجيل مؤقت للتشخيص
      console.log('Course Exams Refresh Response:', response.data);
      
      // التحقق من وجود البيانات في response.data
      if (response.data && response.data.exams) {
        setCourseExams(response.data.exams);
      } else if (Array.isArray(response.data)) {
        // في حالة كانت البيانات مصفوفة مباشرة
        setCourseExams(response.data);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setCourseExams([]);
      }
    } catch (error) {
      console.error('Error refreshing course exams:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ في تحميل الامتحانات الشاملة';
      setCourseExamsError(errorMessage);
      setCourseExams([]);
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

  // 2. دوال API للامتحان محسنة
  const createExam = async (lectureId, data) => {
    try {
      setExamActionLoading(true);
      
      // تحضير البيانات للإرسال
      const examData = {
        title: data.title,
        total_grade: data.total_grade,
        duration: data.duration,
        is_visible: data.is_visible,
        lock_next_lectures: data.lock_next_lectures,
        show_answers_immediately: data.show_answers_immediately,
        show_answers_after_hours: data.show_answers_after_hours
      };

      // إضافة التواريخ إذا تم تحديدها
      if (data.show_at) {
        examData.show_at = new Date(data.show_at).toISOString();
      }
      if (data.hide_at) {
        examData.hide_at = new Date(data.hide_at).toISOString();
      }

      await baseUrl.post(`/api/course/lecture/${lectureId}/exam`, examData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({ 
        title: 'تم إضافة الامتحان بنجاح', 
        description: `تم إنشاء امتحان "${data.title}" بنجاح`,
        status: 'success', 
        duration: 4000, 
        isClosable: true 
      });
      
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setExamModal({ isOpen: false, type: 'add', data: null });
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({ 
        title: 'خطأ في إضافة الامتحان', 
        description: error.response?.data?.message || 'حدث خطأ غير متوقع', 
        status: 'error', 
        duration: 4000, 
        isClosable: true 
      });
    } finally {
      setExamActionLoading(false);
    }
  };
  const updateExam = async (examId, data) => {
    try {
      setExamActionLoading(true);
      
      // تحضير البيانات للإرسال
      const examData = {
        title: data.title,
        total_grade: data.total_grade,
        duration: data.duration,
        is_visible: data.is_visible,
        lock_next_lectures: data.lock_next_lectures,
        show_answers_immediately: data.show_answers_immediately,
        show_answers_after_hours: data.show_answers_after_hours
      };

      // إضافة التواريخ إذا تم تحديدها
      if (data.show_at) {
        examData.show_at = new Date(data.show_at).toISOString();
      }
      if (data.hide_at) {
        examData.hide_at = new Date(data.hide_at).toISOString();
      }

      await baseUrl.patch(`api/course/lecture/exam/${examId}`, examData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({ 
        title: 'تم تعديل الامتحان بنجاح', 
        description: `تم تحديث امتحان "${data.title}" بنجاح`,
        status: 'success', 
        duration: 4000, 
        isClosable: true 
      });
      
      // تحديث البيانات بدون إعادة تحميل
      await refreshCourseData();
      // إغلاق الموديل بعد النجاح
      setExamModal({ isOpen: false, type: 'edit', data: null });
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({ 
        title: 'خطأ في تعديل الامتحان', 
        description: error.response?.data?.message || 'حدث خطأ غير متوقع', 
        status: 'error', 
        duration: 4000, 
        isClosable: true 
      });
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

  // 3. مودال إضافة/تعديل امتحان محسن
  const ExamModal = ({ isOpen, onClose, type, data, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
      title: data?.title || '',
      total_grade: data?.total_grade || 100,
      duration: data?.duration || 60,
      is_visible: data?.is_visible ?? true,
      show_at: data?.show_at || '',
      hide_at: data?.hide_at || '',
      lock_next_lectures: data?.lock_next_lectures ?? true,
      show_answers_immediately: data?.show_answers_immediately ?? false,
      show_answers_after_hours: data?.show_answers_after_hours || 24,
    });

    useEffect(() => {
      if (data) {
        setFormData({
          title: data.title || '',
          total_grade: data.total_grade || 100,
          duration: data.duration || 60,
          is_visible: data.is_visible ?? true,
          show_at: data.show_at || '',
          hide_at: data.hide_at || '',
          lock_next_lectures: data.lock_next_lectures ?? true,
          show_answers_immediately: data.show_answers_immediately ?? false,
          show_answers_after_hours: data.show_answers_after_hours || 24,
        });
      } else {
        // إعادة تعيين القيم الافتراضية عند إضافة امتحان جديد
        setFormData({
          title: '',
          total_grade: 100,
          duration: 60,
          is_visible: true,
          show_at: '',
          hide_at: '',
          lock_next_lectures: true,
          show_answers_immediately: false,
          show_answers_after_hours: 24,
        });
      }
    }, [data, isOpen]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (type === 'edit') onSubmit(data.id, formData);
      else onSubmit(formData);
    };

    return (
      <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} closeOnOverlayClick={!loading} size="4xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent 
          borderRadius="3xl" 
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          border="1px solid"
          borderColor="blue.200"
          overflow="hidden"
          bg="white"
          _dark={{ bg: "gray.800", borderColor: "blue.700" }}
        >
          <ModalHeader 
            display="flex" 
            alignItems="center" 
            fontWeight="bold" 
            fontSize="2xl" 
            color="white"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="3xl 3xl 0 0"
            py={8}
            px={8}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)",
              zIndex: -1
            }}
          >
            <Box 
              p={3} 
              bg="rgba(255, 255, 255, 0.2)" 
              borderRadius="xl" 
              mr={4}
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
            >
              <Icon as={FaGraduationCap} boxSize={6} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {type === 'add' ? 'إضافة امتحان جديد' : 'تعديل الامتحان'}
              </Text>
              <Text fontSize="sm" opacity="0.9" fontWeight="normal">
                {type === 'add' ? 'إنشاء امتحان محاضرة جديد مع إعدادات متقدمة' : 'تعديل إعدادات الامتحان'}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton 
            isDisabled={loading}
            color="white"
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="full"
            size="lg"
            _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
            top={6}
            right={6}
          />
          <form onSubmit={handleSubmit}>
            <ModalBody py={10} px={8} bg="gray.50" _dark={{ bg: "gray.700" }}>
              <VStack spacing={8} align="stretch">
                {/* عنوان الامتحان */}
                <Box 
                  p={6} 
                  bg="white" 
                  borderRadius="2xl" 
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                  _dark={{ bg: "gray.800", borderColor: "gray.600" }}
                >
                  <FormControl isRequired>
                    <FormLabel 
                      display="flex" 
                      alignItems="center" 
                      gap={3} 
                      fontWeight="bold" 
                      color="gray.700"
                      fontSize="lg"
                      mb={4}
                      _dark={{ color: "gray.200" }}
                    >
                      <Box 
                        p={2} 
                        bg="blue.100" 
                        borderRadius="lg"
                        _dark={{ bg: "blue.900" }}
                      >
                        <Icon as={FaRegFileAlt} color="blue.600" boxSize={5} />
                      </Box>
                      عنوان الامتحان
                    </FormLabel>
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="أدخل عنوان الامتحان"
                      isDisabled={loading}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ 
                        borderColor: "blue.400", 
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                        bg: "blue.50"
                      }}
                      _dark={{
                        borderColor: "gray.600",
                        bg: "gray.700",
                        _focus: {
                          borderColor: "blue.400",
                          bg: "blue.900"
                        }
                      }}
                      size="lg"
                      fontSize="lg"
                      py={6}
                    />
                  </FormControl>
                </Box>

                {/* الدرجة الكلية ومدة الامتحان */}
                <Box 
                  p={6} 
                  bg="white" 
                  borderRadius="2xl" 
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                  _dark={{ bg: "gray.800", borderColor: "gray.600" }}
                >
                  <HStack spacing={6}>
                    <FormControl isRequired flex={1}>
                      <FormLabel 
                        display="flex" 
                        alignItems="center" 
                        gap={3} 
                        fontWeight="bold" 
                        color="gray.700"
                        fontSize="lg"
                        mb={4}
                        _dark={{ color: "gray.200" }}
                      >
                        <Box 
                          p={2} 
                          bg="yellow.100" 
                          borderRadius="lg"
                          _dark={{ bg: "yellow.900" }}
                        >
                          <Icon as={FaStar} color="yellow.600" boxSize={5} />
                        </Box>
                        الدرجة الكلية
                      </FormLabel>
                      <Input 
                        type="number" 
                        value={formData.total_grade} 
                        onChange={e => setFormData({ ...formData, total_grade: parseInt(e.target.value) })}
                        placeholder="100"
                        min={1}
                        max={1000}
                        isDisabled={loading}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ 
                          borderColor: "yellow.400", 
                          boxShadow: "0 0 0 3px rgba(236, 201, 75, 0.1)",
                          bg: "yellow.50"
                        }}
                        _dark={{
                          borderColor: "gray.600",
                          bg: "gray.700",
                          _focus: {
                            borderColor: "yellow.400",
                            bg: "yellow.900"
                          }
                        }}
                        size="lg"
                        fontSize="lg"
                        py={6}
                      />
                    </FormControl>
                    <FormControl isRequired flex={1}>
                      <FormLabel 
                        display="flex" 
                        alignItems="center" 
                        gap={3} 
                        fontWeight="bold" 
                        color="gray.700"
                        fontSize="lg"
                        mb={4}
                        _dark={{ color: "gray.200" }}
                      >
                        <Box 
                          p={2} 
                          bg="green.100" 
                          borderRadius="lg"
                          _dark={{ bg: "green.900" }}
                        >
                          <Icon as={FaClock} color="green.600" boxSize={5} />
                        </Box>
                        المدة (بالدقائق)
                      </FormLabel>
                      <Input 
                        type="number" 
                        value={formData.duration} 
                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        placeholder="60"
                        min={1}
                        max={300}
                        isDisabled={loading}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ 
                          borderColor: "green.400", 
                          boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.1)",
                          bg: "green.50"
                        }}
                        _dark={{
                          borderColor: "gray.600",
                          bg: "gray.700",
                          _focus: {
                            borderColor: "green.400",
                            bg: "green.900"
                          }
                        }}
                        size="lg"
                        fontSize="lg"
                        py={6}
                      />
                    </FormControl>
                  </HStack>
                </Box>

                {/* تواريخ الظهور والإخفاء */}
                <Box 
                  p={6} 
                  bg="white" 
                  borderRadius="2xl" 
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                  _dark={{ bg: "gray.800", borderColor: "gray.600" }}
                >
                  <HStack spacing={6}>
                    <FormControl flex={1}>
                      <FormLabel 
                        display="flex" 
                        alignItems="center" 
                        gap={3} 
                        fontWeight="bold" 
                        color="gray.700"
                        fontSize="lg"
                        mb={4}
                        _dark={{ color: "gray.200" }}
                      >
                        <Box 
                          p={2} 
                          bg="purple.100" 
                          borderRadius="lg"
                          _dark={{ bg: "purple.900" }}
                        >
                          <Icon as={FaCalendarAlt} color="purple.600" boxSize={5} />
                        </Box>
                        تاريخ الظهور
                      </FormLabel>
                      <Input 
                        type="datetime-local" 
                        value={formData.show_at} 
                        onChange={e => setFormData({ ...formData, show_at: e.target.value })}
                        isDisabled={loading}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ 
                          borderColor: "purple.400", 
                          boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.1)",
                          bg: "purple.50"
                        }}
                        _dark={{
                          borderColor: "gray.600",
                          bg: "gray.700",
                          _focus: {
                            borderColor: "purple.400",
                            bg: "purple.900"
                          }
                        }}
                        size="lg"
                        fontSize="lg"
                        py={6}
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel 
                        display="flex" 
                        alignItems="center" 
                        gap={3} 
                        fontWeight="bold" 
                        color="gray.700"
                        fontSize="lg"
                        mb={4}
                        _dark={{ color: "gray.200" }}
                      >
                        <Box 
                          p={2} 
                          bg="red.100" 
                          borderRadius="lg"
                          _dark={{ bg: "red.900" }}
                        >
                          <Icon as={FaCalendarAlt} color="red.600" boxSize={5} />
                        </Box>
                        تاريخ الإخفاء
                      </FormLabel>
                      <Input 
                        type="datetime-local" 
                        value={formData.hide_at} 
                        onChange={e => setFormData({ ...formData, hide_at: e.target.value })}
                        isDisabled={loading}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ 
                          borderColor: "red.400", 
                          boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
                          bg: "red.50"
                        }}
                        _dark={{
                          borderColor: "gray.600",
                          bg: "gray.700",
                          _focus: {
                            borderColor: "red.400",
                            bg: "red.900"
                          }
                        }}
                        size="lg"
                        fontSize="lg"
                        py={6}
                      />
                    </FormControl>
                  </HStack>
                </Box>

                {/* إعدادات الإجابات */}
                <Box 
                  p={8} 
                  bg="linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)" 
                  borderRadius="2xl" 
                  border="2px solid" 
                  borderColor="green.200"
                  boxShadow="0 8px 25px rgba(56, 178, 172, 0.1)"
                  _dark={{ 
                    bg: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
                    borderColor: "green.700"
                  }}
                >
                  <HStack spacing={4} mb={6}>
                    <Box 
                      p={3} 
                      bg="green.100" 
                      borderRadius="xl"
                      _dark={{ bg: "green.900" }}
                    >
                      <Icon as={FaLightbulb} color="green.600" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold" color="green.700" _dark={{ color: "green.300" }}>
                        إعدادات عرض الإجابات
                      </Text>
                      <Text fontSize="sm" color="green.600" _dark={{ color: "green.400" }}>
                        تحكم في كيفية ومتى يتم عرض الإجابات للطلاب
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack spacing={6} align="stretch">
                    <Box 
                      p={6} 
                      bg="white" 
                      borderRadius="xl" 
                      border="1px solid" 
                      borderColor="green.200"
                      _dark={{ bg: "gray.800", borderColor: "green.700" }}
                    >
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold" color="gray.700" fontSize="lg" _dark={{ color: "gray.200" }}>
                            إظهار الإجابات فوراً
                          </Text>
                          <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                            عرض الإجابات مباشرة بعد انتهاء الامتحان
                          </Text>
                        </VStack>
                        <Switch 
                          isChecked={formData.show_answers_immediately}
                          onChange={e => setFormData({ ...formData, show_answers_immediately: e.target.checked })}
                          colorScheme="green"
                          size="lg"
                          isDisabled={loading}
                        />
                      </HStack>
                    </Box>
                    
                    {!formData.show_answers_immediately && (
                      <Box 
                        p={6} 
                        bg="white" 
                        borderRadius="xl" 
                        border="1px solid" 
                        borderColor="green.200"
                        _dark={{ bg: "gray.800", borderColor: "green.700" }}
                      >
                        <FormControl>
                          <FormLabel 
                            display="flex" 
                            alignItems="center" 
                            gap={3} 
                            fontWeight="bold" 
                            color="gray.700"
                            fontSize="lg"
                            mb={4}
                            _dark={{ color: "gray.200" }}
                          >
                            <Box 
                              p={2} 
                              bg="orange.100" 
                              borderRadius="lg"
                              _dark={{ bg: "orange.900" }}
                            >
                              <Icon as={FaClock} color="orange.600" boxSize={5} />
                            </Box>
                            إظهار الإجابات بعد (ساعات)
                          </FormLabel>
                          <Input 
                            type="number" 
                            value={formData.show_answers_after_hours} 
                            onChange={e => setFormData({ ...formData, show_answers_after_hours: parseInt(e.target.value) })}
                            placeholder="24"
                            min={1}
                            max={168}
                            isDisabled={loading}
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="gray.200"
                            _focus={{ 
                              borderColor: "orange.400", 
                              boxShadow: "0 0 0 3px rgba(237, 137, 54, 0.1)",
                              bg: "orange.50"
                            }}
                            _dark={{
                              borderColor: "gray.600",
                              bg: "gray.700",
                              _focus: {
                                borderColor: "orange.400",
                                bg: "orange.900"
                              }
                            }}
                            size="lg"
                            fontSize="lg"
                            py={6}
                          />
                        </FormControl>
                      </Box>
                    )}
                  </VStack>
                </Box>

                {/* إعدادات إضافية */}
                <Box 
                  p={8} 
                  bg="linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)" 
                  borderRadius="2xl" 
                  border="2px solid" 
                  borderColor="blue.200"
                  boxShadow="0 8px 25px rgba(66, 153, 225, 0.1)"
                  _dark={{ 
                    bg: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
                    borderColor: "blue.700"
                  }}
                >
                  <HStack spacing={4} mb={6}>
                    <Box 
                      p={3} 
                      bg="blue.100" 
                      borderRadius="xl"
                      _dark={{ bg: "blue.900" }}
                    >
                      <Icon as={FaCog} color="blue.600" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold" color="blue.700" _dark={{ color: "blue.300" }}>
                        إعدادات إضافية
                      </Text>
                      <Text fontSize="sm" color="blue.600" _dark={{ color: "blue.400" }}>
                        تحكم في رؤية الامتحان وسلوك المحاضرات
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack spacing={6} align="stretch">
                    <Box 
                      p={6} 
                      bg="white" 
                      borderRadius="xl" 
                      border="1px solid" 
                      borderColor="blue.200"
                      _dark={{ bg: "gray.800", borderColor: "blue.700" }}
                    >
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold" color="gray.700" fontSize="lg" _dark={{ color: "gray.200" }}>
                            إظهار الامتحان
                          </Text>
                          <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                            جعل الامتحان مرئياً للطلاب
                          </Text>
                        </VStack>
                        <Switch 
                          isChecked={formData.is_visible}
                          onChange={e => setFormData({ ...formData, is_visible: e.target.checked })}
                          colorScheme="blue"
                          size="lg"
                          isDisabled={loading}
                        />
                      </HStack>
                    </Box>
                    
                    <Box 
                      p={6} 
                      bg="white" 
                      borderRadius="xl" 
                      border="1px solid" 
                      borderColor="blue.200"
                      _dark={{ bg: "gray.800", borderColor: "blue.700" }}
                    >
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold" color="gray.700" fontSize="lg" _dark={{ color: "gray.200" }}>
                            قفل المحاضرات التالية
                          </Text>
                          <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                            منع الوصول للمحاضرات التالية حتى اجتياز الامتحان
                          </Text>
                        </VStack>
                        <Switch 
                          isChecked={formData.lock_next_lectures}
                          onChange={e => setFormData({ ...formData, lock_next_lectures: e.target.checked })}
                          colorScheme="red"
                          size="lg"
                          isDisabled={loading}
                        />
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter 
              py={8} 
              px={8}
              bg="linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)" 
              borderRadius="0 0 3xl 3xl"
              borderTop="1px solid"
              borderColor="gray.200"
              _dark={{ 
                bg: "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)",
                borderColor: "gray.600"
              }}
            >
              <HStack spacing={6} w="full" justify="flex-end">
                <Button 
                  variant="outline" 
                  colorScheme="red" 
                  onClick={onClose} 
                  isDisabled={loading}
                  leftIcon={<Icon as={FaTimes} />}
                  borderRadius="xl"
                  size="lg"
                  px={10}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: 'lg',
                    bg: 'red.50'
                  }}
                  transition="all 0.2s"
                  _dark={{
                    _hover: { bg: 'red.900' }
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={loading}
                  loadingText={type === 'add' ? 'جاري الإضافة...' : 'جاري التعديل...'}
                  leftIcon={!loading ? <Icon as={FaCheck} /> : undefined}
                  borderRadius="xl"
                  size="lg"
                  px={10}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                    bg: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                  }}
                  transition="all 0.2s"
                >
                  {type === 'add' ? 'إضافة الامتحان' : 'تعديل الامتحان'}
                </Button>
              </HStack>
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
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(4, 1fr); gap: 3mm; width: 100%; height: 100%; align-content: start;">
            ${codesToExport
              .slice(i, i + codesPerPage)
              .map(
                (code, index) => `
                  <div class="code" style="padding: 3mm; width: 100%; height: 100%; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; position: relative; overflow: hidden; background: #fff; display: flex; flex-direction: column; justify-content: space-between; min-height: 40mm; direction: rtl;">
                    
                    <!-- Header with Logo and Grade -->
                    <div style='display: flex; background-color:"#e98036" align-items: center; justify-content: space-between; margin-bottom: 3px; padding: 2px 0;'>
                      <div style='display: flex; align-items: center;'>
                         
                          <div style='margin-bottom: 3px;'>
                      <h2 style='font-size: 14px; font-weight: bold; color: #3182ce; margin: 0; text-align: center;'>
                        ${user.name || 'عمرو علي'}
                      </h2>
                    </div>
                      </div>
                      <div style='font-size: 9px; color: #3182ce; font-weight: bold;'>${code.grade_name || 'الصف الثاني الثانوي'}</div>
                    </div>
                    <!-- QR Code and Activation Code -->
                    <div style='display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; margin-top: 10px;'>
                      <!-- Activation Code Section - Left -->
                      <div style='text-align: center;'>
                        <div style='font-size: 9px; color: #3182ce; font-weight: bold; margin-bottom: 2px;'>كود التفعيل</div>
                        <div style='font-size: 9px; color: #3182ce; font-weight: bold;'>${code.code}</div>
                      </div>
                      
                      <!-- Empty Middle Space -->
                      <div style='flex: 1;'></div>
                      
                      <!-- QR Code Section - Right -->
                      <div style='text-align: center;'>
                        ${code.qr_code ? `<img src="${code.qr_code}" alt="QR Code" style="width: 110px; height: 110px; border: 1px solid #ddd; border-radius: 4px; background: white; padding: 2px; display: block; margin: 0 auto;" />` : '<div style="width: 50px; height: 50px; border: 1px dashed #ccc; border-radius: 4px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 8px; color: #999;">QR</div>'}
                      </div>
                    </div>
                    
                    <!-- Contact Numbers -->
                    <div style='margin-top: auto; padding-top: 3px; border-top: 1px solid #e2e8f0;  height: 20px;'>
                      <p style='font-size: 9px; font-weight: 600; color: #3182ce; text-align: center; margin: 0;'>
                        01111272393 | 01288781012 | 01210726096
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
      <Box minH="100vh" bg={pageBg} dir="rtl" className="mb-[100px]">
        {/* Loading Hero Section */}
        <Box
          bg="blue.500"
          py={8}
          px={4}
        >
          <Container dir="rtl" maxW="container.xl">
            <Flex
              direction={{ base: "column", lg: "row" }}
              align="center"
              justify="space-between"
              gap={6}
            >
              {/* Loading Content */}
              <Box flex={1} w="100%">
                <VStack align={{ base: "center", lg: "flex-start" }} spacing={6}>
                  {/* Loading Course Title */}
                  <Box textAlign={{ base: "center", lg: "right" }} w="full">
                    <Box
                      h={{ base: "40px", sm: "50px", md: "60px" }}
                      w={{ base: "300px", sm: "400px", md: "500px" }}
                      bg="whiteAlpha.300"
                      borderRadius="lg"
                      mb={4}
                      mx={{ base: "auto", lg: "0" }}
                    />
                    <Box
                      h="40px"
                      w="200px"
                      bg="orange.400"
                      borderRadius="xl"
                      mx={{ base: "auto", lg: "0" }}
                    />
                  </Box>

                  {/* Loading Description */}
                  <Box 
                    w="full" 
                    maxW="600px"
                    p={4}
                    bg="whiteAlpha.200"
                    borderRadius="xl"
                  >
                    <VStack spacing={2} align="stretch">
                      <Box h="20px" w="100%" bg="whiteAlpha.300" borderRadius="md" />
                      <Box h="20px" w="85%" bg="whiteAlpha.300" borderRadius="md" />
                      <Box h="20px" w="70%" bg="whiteAlpha.300" borderRadius="md" />
                      <Box h="20px" w="90%" bg="whiteAlpha.300" borderRadius="md" />
                    </VStack>
                  </Box>

                  {/* Loading Course Info */}
                  <div className="flex flex-wrap gap-4">
                    <Box
                      px={5}
                      py={3}
                      bg="orange.400"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <Box w="20px" h="20px" bg="whiteAlpha.300" borderRadius="md" />
                      <VStack align="flex-start" spacing={0}>
                        <Box h="16px" w="80px" bg="whiteAlpha.300" borderRadius="sm" />
                        <Box h="24px" w="60px" bg="whiteAlpha.300" borderRadius="sm" />
                      </VStack>
                    </Box>

                    <Box
                      px={5}
                      py={3}
                      bg="whiteAlpha.200"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <Box w="20px" h="20px" bg="whiteAlpha.300" borderRadius="md" />
                      <VStack align="flex-start" spacing={0}>
                        <Box h="16px" w="60px" bg="whiteAlpha.300" borderRadius="sm" />
                        <Box h="24px" w="40px" bg="whiteAlpha.300" borderRadius="sm" />
                      </VStack>
                    </Box>
                  </div>

                  {/* Loading Action Buttons */}
                  <HStack spacing={4} justify={{ base: "center", lg: "flex-start" }}>
                    <Box h="48px" w="150px" bg="whiteAlpha.300" borderRadius="xl" />
                    <Box h="48px" w="120px" bg="whiteAlpha.300" borderRadius="xl" />
                  </HStack>
                </VStack>
              </Box>

              {/* Loading Course Image */}
              <Box>
                <Box
                  width={{ base: "250px", md: "350px" }}
                  height={{ base: "180px", md: "250px" }}
                  bg="whiteAlpha.300"
                  borderRadius="2xl"
                  borderWidth="4px"
                  borderColor="white"
                  boxShadow="lg"
                />
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Loading Course Content */}
        <Container maxW="container.xl" px={4} py={8}>
          {/* Loading Tabs */}
          <Box mb={8}>
            <HStack spacing={4} mb={6}>
              <Box h="40px" w="120px" bg="gray.200" borderRadius="lg" />
              <Box h="40px" w="100px" bg="gray.200" borderRadius="lg" />
              <Box h="40px" w="110px" bg="gray.200" borderRadius="lg" />
              <Box h="40px" w="90px" bg="gray.200" borderRadius="lg" />
            </HStack>
          </Box>

          {/* Loading Course Sections */}
          <VStack spacing={8} align="stretch">
            {/* Loading Lectures Section */}
            <Box
              p={6}
              bg="white"
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.100"
            >
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="center">
                  <Box h="32px" w="200px" bg="gray.200" borderRadius="md" />
                  <Box h="40px" w="120px" bg="gray.200" borderRadius="lg" />
                </HStack>
                
                <VStack spacing={4} align="stretch">
                  {[...Array(4)].map((_, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg="gray.50"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.100"
                    >
                      <HStack spacing={4}>
                        <Box w="60px" h="60px" bg="gray.200" borderRadius="lg" />
                        <VStack align="flex-start" spacing={2} flex={1}>
                          <Box h="20px" w="80%" bg="gray.200" borderRadius="md" />
                          <Box h="16px" w="60%" bg="gray.200" borderRadius="md" />
                          <HStack spacing={4}>
                            <Box h="16px" w="100px" bg="gray.200" borderRadius="sm" />
                            <Box h="16px" w="80px" bg="gray.200" borderRadius="sm" />
                          </HStack>
                        </VStack>
                        <Box h="40px" w="40px" bg="gray.200" borderRadius="full" />
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>

            {/* Loading Teacher Info */}
            <Box
              p={6}
              bg="white"
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.100"
            >
              <VStack spacing={6} align="stretch">
                <Box h="32px" w="180px" bg="gray.200" borderRadius="md" />
                
                <HStack spacing={6}>
                  <Box w="80px" h="80px" bg="gray.200" borderRadius="full" />
                  <VStack align="flex-start" spacing={3} flex={1}>
                    <Box h="24px" w="200px" bg="gray.200" borderRadius="md" />
                    <Box h="20px" w="150px" bg="gray.200" borderRadius="md" />
                    <Box h="16px" w="250px" bg="gray.200" borderRadius="md" />
                    <HStack spacing={3}>
                      <Box w="32px" h="32px" bg="gray.200" borderRadius="lg" />
                      <Box w="32px" h="32px" bg="gray.200" borderRadius="lg" />
                      <Box w="32px" h="32px" bg="gray.200" borderRadius="lg" />
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Loading Comments Section */}
            <Box
              p={6}
              bg="white"
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.100"
            >
              <VStack spacing={6} align="stretch">
                <Box h="32px" w="160px" bg="gray.200" borderRadius="md" />
                
                <VStack spacing={4} align="stretch">
                  {[...Array(3)].map((_, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg="gray.50"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.100"
                    >
                      <HStack spacing={4}>
                        <Box w="40px" h="40px" bg="gray.200" borderRadius="full" />
                        <VStack align="flex-start" spacing={2} flex={1}>
                          <Box h="18px" w="120px" bg="gray.200" borderRadius="md" />
                          <Box h="16px" w="100%" bg="gray.200" borderRadius="md" />
                          <Box h="16px" w="80%" bg="gray.200" borderRadius="md" />
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Container>

        {/* CSS Animations */}
        <style>{`
          @keyframes shimmer {
            0% { opacity: 0.3; }
            50% { opacity: 0.7; }
            100% { opacity: 0.3; }
          }
          .shimmer {
            animation: shimmer 2s ease-in-out infinite;
          }
        `}</style>
        <ScrollToTop/>
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
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredCodes.map(code => (
                    <Box
                      key={code.id}
                      bg="white"
                      borderRadius="xl"
                      p={6}
                      boxShadow="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "xl",
                        borderColor: "blue.300"
                      }}
                      transition="all 0.3s ease"
                      position="relative"
                      overflow="hidden"
                    >
                      {/* Header with gradient */}
                      <Box
                        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                        borderRadius="lg"
                        p={4}
                        mb={4}
                        color="white"
                        textAlign="center"
                        position="relative"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                          borderRadius: "lg"
                        }}
                      >
                        <Text fontSize="lg" fontWeight="bold" mb={1}>
                          {user.name || 'اسم المستخدم'}
                        </Text>
                        <Text fontSize="sm" opacity="0.9">
                          {course?.title || 'اسم الكورس'}
                        </Text>
                      </Box>

                      {/* QR Code */}
                      {code.qr_code && (
                        <Box textAlign="center" mb={4}>
                          <Image
                            src={code.qr_code}
                            alt={`QR Code for ${code.code}`}
                            maxW="150px"
                            maxH="150px"
                            mx="auto"
                            borderRadius="md"
                            border="2px solid"
                            borderColor="gray.100"
                            bg="white"
                            p={2}
                          />
                        </Box>
                      )}

                      {/* Code Display */}
                      <Box
                        bg="red.50"
                        borderRadius="lg"
                        p={4}
                        mb={4}
                        border="2px solid"
                        borderColor="red.200"
                        textAlign="center"
                      >
                        <Text fontSize="sm" color="red.600" fontWeight="bold" mb={2}>
                          كود التفعيل:
                        </Text>
                        <Text
                          fontFamily="mono"
                          fontSize="lg"
                          fontWeight="bold"
                          color="red.700"
                          wordBreak="break-all"
                          bg="white"
                          p={2}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="red.300"
                        >
                          {code.code}
                        </Text>
                      </Box>

                      {/* Course Info */}
                      <Box mb={4}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            الصف:
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600">
                            {code.grade_name || 'غير محدد'}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            الاستخدامات:
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color="purple.600">
                            {code.uses} / {code.max_uses}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            تاريخ الانتهاء:
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color="orange.600">
                            {code.expires_at ? new Date(code.expires_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                          </Text>
                        </HStack>
                      </Box>

                      {/* Status Badge */}
                      <Box textAlign="center">
                        {code.is_expired ? (
                          <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="full">
                            منتهي الصلاحية
                          </Badge>
                        ) : code.is_fully_used ? (
                          <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                            مستخدم بالكامل
                          </Badge>
                        ) : (
                          <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                            فعال
                          </Badge>
                        )}
                      </Box>

                      {/* Contact Info */}
                      <Box mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                        <Text fontSize="xs" color="gray.500" textAlign="center" fontWeight="600">
                          01210726096 | 01288781012 | 01111272393
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
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
                          margin: '3px',
                          padding: '3mm',
                          width: '100%',
                          height: '100%',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '40mm',
                          direction: 'rtl'
                        }}
                      >
                        {/* Header with Logo and Grade */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px', padding: '2px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                               <div style={{ marginBottom: '3px' }}>
                           <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3182ce', margin: '0', textAlign: 'center' }}>
                             {user.name || 'عمرو علي'}
                           </h2>
                         </div>
                            </div>
                            <div style={{ fontSize: '9px', color: '#3182ce', fontWeight: 'bold' }}>{code.grade_name || 'الصف الثاني الثانوي'}</div>
                          </div>

                        {/* Student Name */}
                   

                        {/* Registration Steps */}
                      
                        {/* QR Code and Activation Code */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          {/* Activation Code Section - Left */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '8px', color: '#c53030', fontWeight: 'bold', marginBottom: '2px' }}>كود التفعيل</div>
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#c53030', 
                              fontWeight: 'bold', 
                              fontFamily: 'monospace', 
                              background: '#fef2f2', 
                              padding: '3px 4px', 
                              borderRadius: '3px', 
                              border: '1px solid #fecaca',
                              display: 'inline-block'
                            }}>
                              {code.code}
                            </div>
                          </div>
                          
                          {/* Empty Middle Space */}
                          <div style={{ flex: '1' }}></div>
                          
                          {/* QR Code Section - Right */}
                          <div style={{ textAlign: 'center' }}>
                            {code.qr_code ? (
                              <img 
                                src={code.qr_code} 
                                alt="QR Code" 
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  border: '1px solid #ddd', 
                                  borderRadius: '4px', 
                                  background: 'white', 
                                  padding: '2px',
                                  display: 'block',
                                  margin: '0 auto'
                                }} 
                              />
                            ) : (
                              <div style={{ 
                                width: '50px', 
                                height: '50px', 
                                border: '1px dashed #ccc', 
                                borderRadius: '4px', 
                                background: '#f9f9f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                fontSize: '8px',
                                color: '#999'
                              }}>
                                QR
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Contact Numbers */}
                        <div style={{ marginTop: 'auto', paddingTop: '3px', borderTop: '1px solid #e2e8f0' }}>
                          <p style={{ fontSize: '7px', fontWeight: '600', color: '#3182ce', textAlign: 'center', margin: '0' }}>
                            01111272393 | 01288781012 | 01210726096
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
       className="lecture_container"
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
              {!enrollmentsLoading && (
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="full" ml={2}>
                  {enrollments.length} طالب
                </Badge>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* حقل البحث في الطلاب */}
            {enrollments.length > 0 && (
              <Box mb={4} p={4} borderWidth={1} borderRadius="md" bg="blue.500">
                <Text fontWeight="bold" mb={3} color="white">البحث في الطلاب:</Text>
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