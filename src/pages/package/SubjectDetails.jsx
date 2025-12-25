import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Card,
  CardBody,
  Image,
  Badge,
  Spinner,
  Center,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Divider,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Avatar,
  Input,
  Textarea,
  Checkbox,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  Collapse,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiBookOpen,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiImage,
  FiEdit,
  FiVideo,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
} from 'react-icons/fi';
import baseUrl from '../../api/baseUrl';
import ScrollToTop from '../../components/scollToTop/ScrollToTop';
import UserType from '../../Hooks/auth/userType';

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [subjectData, setSubjectData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [addingPermission, setAddingPermission] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState(null);
  
  // Lessons states
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
  });
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  
  // Videos states
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    video_url: '',
    duration_minutes: 0,
    order_index: 0,
  });
  const [addingVideo, setAddingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);
  
  // Assignments states
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentFormData, setAssignmentFormData] = useState({
    name: '',
    questions_count: 0,
    duration_minutes: 0,
  });
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [togglingAssignmentVisibility, setTogglingAssignmentVisibility] = useState(false);
  
  // Questions states
  const [assignmentQuestions, setAssignmentQuestions] = useState({}); // { assignmentId: [questions] }
  const [loadingQuestions, setLoadingQuestions] = useState({}); // { assignmentId: boolean }
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
    order_index: 0,
  });
  const [addingQuestion, setAddingQuestion] = useState(false);
  
  // Image Question states
  const [imageQuestionFormData, setImageQuestionFormData] = useState({
    order_index: 0,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [addingImageQuestion, setAddingImageQuestion] = useState(false);
  
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  // Lessons modals
  const { isOpen: isLessonModalOpen, onOpen: onLessonModalOpen, onClose: onLessonModalClose } = useDisclosure();
  const { isOpen: isEditLessonModalOpen, onOpen: onEditLessonModalOpen, onClose: onEditLessonModalClose } = useDisclosure();
  const { isOpen: isDeleteLessonOpen, onOpen: onDeleteLessonOpen, onClose: onDeleteLessonClose } = useDisclosure();
  
  // Videos modals
  const { isOpen: isVideoModalOpen, onOpen: onVideoModalOpen, onClose: onVideoModalClose } = useDisclosure();
  const { isOpen: isEditVideoModalOpen, onOpen: onEditVideoModalOpen, onClose: onEditVideoModalClose } = useDisclosure();
  const { isOpen: isDeleteVideoOpen, onOpen: onDeleteVideoOpen, onClose: onDeleteVideoClose } = useDisclosure();
  
  // Assignments modals
  const { isOpen: isAssignmentModalOpen, onOpen: onAssignmentModalOpen, onClose: onAssignmentModalClose } = useDisclosure();
  const { isOpen: isEditAssignmentModalOpen, onOpen: onEditAssignmentModalOpen, onClose: onEditAssignmentModalClose } = useDisclosure();
  const { isOpen: isDeleteAssignmentOpen, onOpen: onDeleteAssignmentOpen, onClose: onDeleteAssignmentClose } = useDisclosure();
  
  // Questions modals
  const { isOpen: isQuestionModalOpen, onOpen: onQuestionModalOpen, onClose: onQuestionModalClose } = useDisclosure();
  const { isOpen: isImageQuestionModalOpen, onOpen: onImageQuestionModalOpen, onClose: onImageQuestionModalClose } = useDisclosure();
  
  const cancelRef = React.useRef();
  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryColor = "blue.500";
  const blueGradient = "linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)";
  const blueLight = useColorModeValue("blue.50", "blue.900");

  // جلب تفاصيل المادة
  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/packages/subjects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.subject) {
        setSubjectData(response.data.subject);
        
        // إذا كان admin، جلب الصلاحيات
        if (isAdmin && response.data.permissions) {
          setPermissions(response.data.permissions);
        }
      } else {
        toast({
          title: 'خطأ',
          description: 'المادة غير موجودة',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/packages-management');
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.error || error.response?.data?.message || 'فشل في جلب بيانات المادة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/packages-management');
    } finally {
      setLoading(false);
    }
  };

  // جلب قائمة المدرسين المصرح لهم (للمسؤول فقط)
  const fetchPermissions = async () => {
    if (!isAdmin) return;
    
    try {
      setPermissionsLoading(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/packages/subjects/${id}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.permissions) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.error || 'فشل في جلب قائمة الصلاحيات',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  // جلب قائمة جميع المدرسين
  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get('/api/users/teachers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.teachers) {
        // استبعاد المدرسين المصرح لهم بالفعل
        const permittedTeacherIds = permissions.map(p => p.teacher_id);
        const availableTeachers = response.data.teachers.filter(
          teacher => !permittedTeacherIds.includes(teacher.id)
        );
        setTeachers(availableTeachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب قائمة المدرسين',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTeachersLoading(false);
    }
  };

  // إضافة صلاحية لمدرس
  const handleAddPermission = async () => {
    if (!selectedTeacherId) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى اختيار مدرس',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      setAddingPermission(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.post(
        `/api/packages/subjects/${id}/permissions`,
        { teacher_id: parseInt(selectedTeacherId) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.permission) {
        // جلب الصلاحيات المحدثة
        await fetchPermissions();
        // تحديث قائمة المدرسين المتاحة
        await fetchTeachers();
        
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: 'تم منح الصلاحية للمدرس بنجاح',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        onClose();
        setSelectedTeacherId('');
      }
    } catch (error) {
      console.error('Error adding permission:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة الصلاحية',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setAddingPermission(false);
    }
  };

  // حذف صلاحية
  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      setDeletingPermission(true);
      const token = localStorage.getItem('token');

      await baseUrl.delete(
        `/api/packages/subjects/${id}/permissions/${selectedPermission.teacher_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast({
        title: 'تم الحذف بنجاح! ✅',
        description: 'تم إزالة الصلاحية بنجاح',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // تحديث القوائم
      await fetchPermissions();
      await fetchTeachers();
      
      onDeleteClose();
      setSelectedPermission(null);
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف الصلاحية',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setDeletingPermission(false);
    }
  };

  // فتح حوار الحذف
  const openDeleteDialog = (permission) => {
    setSelectedPermission(permission);
    onDeleteOpen();
  };

  // جلب الدروس
  const fetchLessons = async () => {
    try {
      setLessonsLoading(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/subjects/${id}/lessons`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success && response.data?.lessons) {
        setLessons(response.data.lessons);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.error || error.response?.data?.message || 'فشل في جلب قائمة الدروس',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLessonsLoading(false);
    }
  };

  // ========== Lessons Functions ==========
  const handleAddLesson = async () => {
    if (!lessonFormData.title.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال عنوان الدرس',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setAddingLesson(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.post(
        `/api/subjects/${id}/lessons`,
        lessonFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: `تم إنشاء الدرس "${lessonFormData.title}" بنجاح`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onLessonModalClose();
        setLessonFormData({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة الدرس',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingLesson(false);
    }
  };

  const openEditLessonModal = (lesson) => {
    setSelectedLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
    });
    onEditLessonModalOpen();
  };

  const handleEditLesson = async () => {
    if (!lessonFormData.title.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال عنوان الدرس',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setEditingLesson(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.put(
        `/api/lessons/${selectedLesson.id}`,
        lessonFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: `تم تحديث الدرس "${lessonFormData.title}" بنجاح`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEditLessonModalClose();
        setSelectedLesson(null);
        setLessonFormData({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error editing lesson:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث الدرس',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditingLesson(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      setDeletingLesson(true);
      const token = localStorage.getItem('token');

      await baseUrl.delete(`/api/lessons/${selectedLesson.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'تم الحذف بنجاح! ✅',
        description: 'تم حذف الدرس بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchLessons();
      onDeleteLessonClose();
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف الدرس',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingLesson(false);
    }
  };

  // Toggle lesson visibility
  const handleToggleVisibility = async (lesson) => {
    try {
      setTogglingVisibility(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.patch(
        `/api/lessons/${lesson.id}/visibility`,
        { is_visible: !lesson.is_visible },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: lesson.is_visible 
            ? 'تم إخفاء الدرس بنجاح' 
            : 'تم إظهار الدرس بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تغيير حالة الظهور',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTogglingVisibility(false);
    }
  };

  // ========== Videos Functions ==========
  const openAddVideoModal = (lesson) => {
    setSelectedLesson(lesson);
    setVideoFormData({ title: '', video_url: '', duration_minutes: 0, order_index: 0 });
    onVideoModalOpen();
  };

  const handleAddVideo = async () => {
    if (!videoFormData.title.trim() || !videoFormData.video_url.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال عنوان الفيديو ورابط الفيديو',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setAddingVideo(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.post(
        `/api/lessons/${selectedLesson.id}/videos`,
        videoFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: 'تم إضافة الفيديو بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onVideoModalClose();
        setVideoFormData({ title: '', video_url: '', duration_minutes: 0, order_index: 0 });
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة الفيديو',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingVideo(false);
    }
  };

  const openEditVideoModal = (video, lesson) => {
    setSelectedVideo(video);
    setSelectedLesson(lesson);
    setVideoFormData({
      title: video.title,
      video_url: video.video_url,
      duration_minutes: video.duration_minutes || 0,
      order_index: video.order_index || 0,
    });
    onEditVideoModalOpen();
  };

  const handleEditVideo = async () => {
    if (!videoFormData.title.trim() || !videoFormData.video_url.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال عنوان الفيديو ورابط الفيديو',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setEditingVideo(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.put(
        `/api/videos/${selectedVideo.id}`,
        videoFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: 'تم تحديث الفيديو بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEditVideoModalClose();
        setSelectedVideo(null);
        setVideoFormData({ title: '', video_url: '', duration_minutes: 0, order_index: 0 });
      }
    } catch (error) {
      console.error('Error editing video:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث الفيديو',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditingVideo(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    try {
      setDeletingVideo(true);
      const token = localStorage.getItem('token');

      await baseUrl.delete(`/api/videos/${selectedVideo.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'تم الحذف بنجاح! ✅',
        description: 'تم حذف الفيديو بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchLessons();
      onDeleteVideoClose();
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف الفيديو',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingVideo(false);
    }
  };

  // ========== Assignments Functions ==========
  const openAddAssignmentModal = (lesson) => {
    setSelectedLesson(lesson);
    setAssignmentFormData({ name: '', questions_count: 0, duration_minutes: 0 });
    onAssignmentModalOpen();
  };

  const handleAddAssignment = async () => {
    if (!assignmentFormData.name.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال اسم الواجب',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setAddingAssignment(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.post(
        `/api/lessons/${selectedLesson.id}/assignments`,
        assignmentFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: 'تم إضافة الواجب بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onAssignmentModalClose();
        setAssignmentFormData({ name: '', questions_count: 0, duration_minutes: 0 });
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة الواجب',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingAssignment(false);
    }
  };

  const openEditAssignmentModal = (assignment, lesson) => {
    setSelectedAssignment(assignment);
    setSelectedLesson(lesson);
    setAssignmentFormData({
      name: assignment.name,
      questions_count: assignment.questions_count || 0,
      duration_minutes: assignment.duration_minutes || 0,
    });
    onEditAssignmentModalOpen();
  };

  const handleEditAssignment = async () => {
    if (!assignmentFormData.name.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال اسم الواجب',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setEditingAssignment(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.put(
        `/api/assignments/${selectedAssignment.id}`,
        assignmentFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchLessons();
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: 'تم تحديث الواجب بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEditAssignmentModalClose();
        setSelectedAssignment(null);
        setAssignmentFormData({ name: '', questions_count: 0, duration_minutes: 0 });
      }
    } catch (error) {
      console.error('Error editing assignment:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث الواجب',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditingAssignment(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      setDeletingAssignment(true);
      const token = localStorage.getItem('token');

      await baseUrl.delete(`/api/assignments/${selectedAssignment.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'تم الحذف بنجاح! ✅',
        description: 'تم حذف الواجب بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchLessons();
      onDeleteAssignmentClose();
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف الواجب',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingAssignment(false);
    }
  };

  // ========== Questions Functions ==========
  // جلب أسئلة الواجب
  const fetchAssignmentQuestions = async (assignmentId) => {
    if (!assignmentId) return;
    
    try {
      setLoadingQuestions(prev => ({ ...prev, [assignmentId]: true }));
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/assignments/${assignmentId}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success && response.data?.questions) {
        setAssignmentQuestions(prev => ({
          ...prev,
          [assignmentId]: response.data.questions
        }));
      } else {
        setAssignmentQuestions(prev => ({
          ...prev,
          [assignmentId]: []
        }));
      }
    } catch (error) {
      console.error('Error fetching assignment questions:', error);
      // إذا كان الخطأ 404، يعني لا توجد أسئلة بعد
      if (error.response?.status !== 404) {
        toast({
          title: 'خطأ',
          description: error.response?.data?.error || error.response?.data?.message || 'فشل في جلب أسئلة الواجب',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      setAssignmentQuestions(prev => ({
        ...prev,
        [assignmentId]: []
      }));
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [assignmentId]: false }));
    }
  };


  // فتح modal إضافة سؤال
  const openAddQuestionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setQuestionFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
      order_index: assignmentQuestions[assignment.id]?.length || 0,
    });
    onQuestionModalOpen();
  };

  // إضافة سؤال نصي
  const handleAddQuestion = async () => {
    if (!questionFormData.question_text.trim() || 
        !questionFormData.option_a.trim() || 
        !questionFormData.option_b.trim() || 
        !questionFormData.option_c.trim() || 
        !questionFormData.option_d.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال جميع الحقول المطلوبة',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedAssignment) return;

    try {
      setAddingQuestion(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.post(
        `/api/assignments/${selectedAssignment.id}/questions/text`,
        questionFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        // تحديث قائمة الأسئلة
        await fetchAssignmentQuestions(selectedAssignment.id);
        // تحديث قائمة الدروس (لتحديث عدد الأسئلة)
        await fetchLessons();
        
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: 'تم إضافة السؤال بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onQuestionModalClose();
        setQuestionFormData({
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'a',
          order_index: 0,
        });
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة السؤال',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingQuestion(false);
    }
  };

  // فتح modal إضافة سؤال بصورة
  const openAddImageQuestionModal = (assignment) => {
    setSelectedAssignment(assignment);
    setImageQuestionFormData({
      order_index: assignmentQuestions[assignment.id]?.length || 0,
    });
    setSelectedImages([]);
    setImagePreviews([]);
    onImageQuestionModalOpen();
  };

  // معالجة اختيار الصور
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // التحقق من عدد الصور (حد أقصى 10)
    if (selectedImages.length + files.length > 10) {
      toast({
        title: 'حد أقصى للصور! ⚠️',
        description: 'يمكنك رفع 10 صور كحد أقصى',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // التحقق من حجم كل صورة (5MB)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: 'حجم الصورة كبير! ⚠️',
        description: 'الحد الأقصى لحجم كل صورة هو 5MB',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: 'نوع ملف غير مدعوم! ⚠️',
        description: 'الأنواع المدعومة: JPEG, JPG, PNG, GIF, WebP',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // إنشاء معاينات للصور
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // حذف صورة من القائمة
  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // إضافة سؤال بصورة
  const handleAddImageQuestion = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى رفع صورة واحدة على الأقل',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedAssignment) return;

    try {
      setAddingImageQuestion(true);
      const token = localStorage.getItem('token');

      // إنشاء FormData
      const formData = new FormData();
      
      // إضافة الصور
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      // إضافة ترتيب السؤال فقط
      formData.append('order_index', imageQuestionFormData.order_index);

      const response = await baseUrl.post(
        `/api/assignments/${selectedAssignment.id}/questions/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.success) {
        // تحديث قائمة الأسئلة
        await fetchAssignmentQuestions(selectedAssignment.id);
        // تحديث قائمة الدروس (لتحديث عدد الأسئلة)
        await fetchLessons();
        
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: 'تم إضافة السؤال بالصورة بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onImageQuestionModalClose();
        setImageQuestionFormData({
          order_index: 0,
        });
        setSelectedImages([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error('Error adding image question:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة السؤال',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingImageQuestion(false);
    }
  };

  // Toggle assignment visibility
  const handleToggleAssignmentVisibility = async (assignment) => {
    if (!assignment || !assignment.id) {
      toast({
        title: 'خطأ',
        description: 'بيانات الواجب غير صحيحة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setTogglingAssignmentVisibility(true);
      const token = localStorage.getItem('token');
      
      const currentVisibility = assignment.is_visible ?? false;
      const newVisibility = !currentVisibility;

      console.log('Toggling assignment visibility:', {
        assignmentId: assignment.id,
        currentVisibility,
        newVisibility
      });

      const response = await baseUrl.patch(
        `/api/assignments/${assignment.id}/visibility`,
        { is_visible: newVisibility },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response.data);

      if (response.data?.success || response.data) {
        await fetchLessons();
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: currentVisibility 
            ? 'تم إخفاء الواجب بنجاح' 
            : 'تم إظهار الواجب بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling assignment visibility:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تغيير حالة الظهور',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTogglingAssignmentVisibility(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubjectDetails();
    }
  }, [id, isAdmin]);

  useEffect(() => {
    if (isAdmin && subjectData) {
      fetchPermissions();
    }
  }, [isAdmin, subjectData]);

  useEffect(() => {
    if (isAdmin && isOpen) {
      fetchTeachers();
    }
  }, [isAdmin, isOpen, permissions]);

  useEffect(() => {
    if (subjectData) {
      fetchLessons();
    }
  }, [subjectData, id]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg={bgGradient}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={6}>
          <Spinner
            size="xl"
            thickness="4px"
            speed="0.65s"
            color={primaryColor}
            emptyColor="gray.200"
          />
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              جاري تحميل بيانات المادة...
            </Text>
            <Text fontSize="sm" color={subTextColor}>
              يرجى الانتظار قليلاً
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  if (!subjectData) {
    return null;
  }

  return (
    <Box minH="100vh" bg={bgGradient} pt={{ base: "100px", md: "80px" }} pb={{ base: 6, md: 12 }} px={{ base: 2, sm: 4 }}>
      <Container maxW="6xl" px={{ base: 2, sm: 4 }}>
        {/* Back Button */}
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          colorScheme="blue"
          mb={{ base: 4, md: 6 }}
          size={{ base: "sm", md: "md" }}
          fontSize={{ base: "sm", md: "md" }}
          onClick={() => navigate(`/package/${subjectData.package_id}`)}
          _hover={{ bg: blueLight }}
        >
          العودة للباقة
        </Button>

        {/* Header Section */}
        <Card bg={cardBg} shadow="xl" borderRadius={{ base: "xl", md: "2xl" }} mb={{ base: 6, md: 8 }} overflow="hidden">
          <Box
            bg={blueGradient}
            p={{ base: 4, md: 8 }}
            color="white"
            position="relative"
            overflow="hidden"
          >
            <HStack spacing={{ base: 2, md: 4 }} mb={{ base: 2, md: 4 }} flexWrap="wrap">
              <Box
                bg="whiteAlpha.200"
                borderRadius="full"
                p={{ base: 2, md: 3 }}
                backdropFilter="blur(10px)"
              >
                <Icon as={FiBookOpen} boxSize={{ base: 6, md: 8 }} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size={{ base: "lg", md: "2xl" }} fontWeight="bold">
                  {subjectData.name}
                </Heading>
                <Text fontSize={{ base: "sm", md: "lg" }} color="whiteAlpha.900">
                  تفاصيل المادة الدراسية
                </Text>
              </VStack>
            </HStack>
          </Box>

          <CardBody p={{ base: 4, md: 8 }}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 8 }}>
              {/* Subject Image */}
              <Box>
                <Image
                  src={subjectData.image || 'https://via.placeholder.com/500x300?text=صورة+المادة'}
                  alt={subjectData.name}
                  borderRadius={{ base: "lg", md: "xl" }}
                  objectFit="cover"
                  w="100%"
                  h={{ base: "200px", md: "300px" }}
                  fallbackSrc="https://via.placeholder.com/500x300?text=صورة+المادة"
                  boxShadow="lg"
                />
              </Box>

              {/* Subject Info */}
              <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
                {/* Package Info */}
                <Card bg={blueLight} border="2px solid" borderColor={primaryColor} borderRadius={{ base: "lg", md: "xl" }}>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <HStack spacing={{ base: 2, md: 3 }} mb={{ base: 2, md: 4 }}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={{ base: 2, md: 3 }}
                        color="white"
                      >
                        <Icon as={FiPackage} boxSize={{ base: 5, md: 6 }} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                          الباقة
                        </Text>
                        <Heading size={{ base: "md", md: "lg" }} color={primaryColor}>
                          {subjectData.package_name}
                        </Heading>
                      </VStack>
                    </HStack>
                    <HStack spacing={{ base: 2, md: 4 }}>
                      <Badge colorScheme="blue" fontSize={{ base: "xs", md: "md" }} px={{ base: 2, md: 3 }} py={1}>
                        السعر: {subjectData.package_price} جنيه
                      </Badge>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Grade */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius={{ base: "lg", md: "xl" }}>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <HStack spacing={{ base: 2, md: 3 }}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={{ base: 2, md: 3 }}
                        color="white"
                      >
                        <Icon as={FiBookOpen} boxSize={{ base: 5, md: 6 }} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                          الصف الدراسي
                        </Text>
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                          {subjectData.grade_name}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Created Date */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius={{ base: "lg", md: "xl" }}>
                  <CardBody p={{ base: 4, md: 6 }}>
                    <HStack spacing={{ base: 2, md: 3 }}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={{ base: 2, md: 3 }}
                        color="white"
                      >
                        <Icon as={FiCalendar} boxSize={{ base: 5, md: 6 }} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                          تاريخ الإنشاء
                        </Text>
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                          {new Date(subjectData.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Admin Section - Permissions Management */}
        {isAdmin && (
          <Card bg={cardBg} shadow="xl" borderRadius={{ base: "xl", md: "2xl" }} mb={{ base: 6, md: 8 }}>
            <Box
              bg={blueGradient}
              p={{ base: 4, md: 6 }}
              color="white"
              borderTopRadius={{ base: "xl", md: "2xl" }}
            >
              <HStack spacing={{ base: 2, md: 3 }} justify="space-between" flexWrap="wrap">
                <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap">
                  <Icon as={FiUser} boxSize={{ base: 5, md: 6 }} />
                  <Heading size={{ base: "md", md: "lg" }} fontWeight="bold">
                    إدارة الصلاحيات
                  </Heading>
                  <Badge bg="whiteAlpha.200" color="white" px={{ base: 2, md: 3 }} py={1} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>
                    {permissions.length} مدرس
                  </Badge>
                </HStack>
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  onClick={onOpen}
                  size={{ base: "sm", md: "md" }}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  إضافة مدرس
                </Button>
              </HStack>
            </Box>

            <CardBody p={{ base: 4, md: 8 }}>
              {permissionsLoading ? (
                <Center py={8}>
                  <Spinner size="lg" color={primaryColor} />
                </Center>
              ) : permissions.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                  {permissions.map((permission) => (
                    <Card
                      key={permission.id}
                      bg={blueLight}
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius={{ base: "lg", md: "xl" }}
                      _hover={{
                        transform: 'translateY(-4px)',
                        shadow: 'lg',
                      }}
                      transition="all 0.3s ease"
                    >
                      <CardBody p={{ base: 4, md: 6 }}>
                        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                          {/* Teacher Avatar & Name */}
                          <HStack spacing={{ base: 2, md: 4 }}>
                            <Avatar
                              size={{ base: "md", md: "lg" }}
                              src={
                                permission.teacher_avatar
                                  ? (permission.teacher_avatar.startsWith('http')
                                      ? permission.teacher_avatar
                                      : `http://localhost:8000/${permission.teacher_avatar}`)
                                  : undefined
                              }
                              name={permission.teacher_name}
                              bg={primaryColor}
                            />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="bold" color={textColor} fontSize={{ base: "sm", md: "md" }}>
                                {permission.teacher_name}
                              </Text>
                              <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                                {permission.teacher_email}
                              </Text>
                            </VStack>
                          </HStack>

                          <Divider />

                          {/* Permission Info */}
                          <VStack spacing={2} align="stretch" fontSize={{ base: "xs", md: "sm" }}>
                            <HStack justify="space-between" flexWrap="wrap">
                              <Text color={subTextColor}>منح بواسطة:</Text>
                              <Text fontWeight="bold" color={textColor} fontSize={{ base: "xs", md: "sm" }}>
                                {permission.granted_by_name || 'Admin'}
                              </Text>
                            </HStack>
                            <HStack justify="space-between" flexWrap="wrap">
                              <Text color={subTextColor}>تاريخ المنح:</Text>
                              <Text fontWeight="bold" color={textColor} fontSize={{ base: "xs", md: "xs" }}>
                                {new Date(permission.granted_at).toLocaleDateString('ar-EG')}
                              </Text>
                            </HStack>
                          </VStack>

                          {/* Delete Button */}
                          <Button
                            leftIcon={<Icon as={FiTrash2} />}
                            colorScheme="red"
                            size={{ base: "xs", md: "sm" }}
                            fontSize={{ base: "xs", md: "sm" }}
                            onClick={() => openDeleteDialog(permission)}
                            variant="outline"
                          >
                            إزالة الصلاحية
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Center py={8}>
                  <VStack spacing={4}>
                    <Icon as={FiUser} boxSize={12} color={subTextColor} />
                    <Text color={subTextColor} fontSize="lg">
                      لا يوجد مدرسين مصرح لهم
                    </Text>
                    <Text color={subTextColor} fontSize="sm">
                      قم بإضافة مدرسين للوصول إلى هذه المادة
                    </Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>
        )}

        {/* Lessons Section */}
        <Card bg={cardBg} shadow="xl" borderRadius={{ base: "xl", md: "2xl" }} mb={{ base: 6, md: 8 }}>
          <Box
            bg={blueGradient}
            p={{ base: 4, md: 6 }}
            color="white"
            borderTopRadius={{ base: "xl", md: "2xl" }}
          >
            <HStack spacing={{ base: 2, md: 3 }} justify="space-between" flexWrap="wrap">
              <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap">
                <Icon as={FiBookOpen} boxSize={{ base: 5, md: 6 }} />
                <Heading size={{ base: "md", md: "lg" }} fontWeight="bold">
                  إدارة المحتوى
                </Heading>
                <Badge bg="whiteAlpha.200" color="white" px={{ base: 2, md: 3 }} py={1} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>
                  {lessons.length} درس
                </Badge>
              </HStack>
              {(isAdmin || isTeacher) && (
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  onClick={onLessonModalOpen}
                  size={{ base: "sm", md: "md" }}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  إضافة درس
                </Button>
              )}
            </HStack>
          </Box>

          <CardBody p={{ base: 4, md: 8 }}>
            {lessonsLoading ? (
              <Center py={8}>
                <Spinner size="lg" color={primaryColor} />
              </Center>
            ) : lessons.length > 0 ? (
              <Accordion allowMultiple defaultIndex={[]}>
                {lessons.map((lesson, index) => (
                  <AccordionItem key={lesson.id} mb={{ base: 3, md: 4 }} border="none">
                    <Card bg={blueLight} border="2px solid" borderColor={primaryColor} borderRadius={{ base: "lg", md: "xl" }}>
                      <AccordionButton
                        p={0}
                        _hover={{ bg: 'transparent' }}
                        _focus={{ boxShadow: 'none' }}
                      >
                        <CardBody p={{ base: 4, md: 6 }} w="full">
                          <HStack justify="space-between" w="full" flexWrap={{ base: "wrap", md: "nowrap" }}>
                            <HStack spacing={{ base: 2, md: 4 }} flex={1} flexWrap="wrap">
                              <Box
                                bg={primaryColor}
                                color="white"
                                borderRadius="full"
                                p={{ base: 2, md: 3 }}
                                minW={{ base: "40px", md: "50px" }}
                                textAlign="center"
                                fontWeight="bold"
                                fontSize={{ base: "sm", md: "md" }}
                              >
                                {index + 1}
                              </Box>
                              <VStack align="start" spacing={1} flex={1} minW={0}>
                                <Heading size={{ base: "sm", md: "md" }} color={textColor} noOfLines={{ base: 2, md: 1 }}>
                                  {lesson.title}
                                </Heading>
                                {lesson.description && (
                                  <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor} noOfLines={1}>
                                    {lesson.description}
                                  </Text>
                                )}
                                <HStack spacing={{ base: 2, md: 4 }} fontSize={{ base: "2xs", md: "xs" }} color={subTextColor} flexWrap="wrap">
                                  <HStack spacing={1}>
                                    <Icon as={FiVideo} />
                                    <Text>{lesson.videos?.length || 0} فيديو</Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Icon as={FiFileText} />
                                    <Text>{lesson.assignments?.length || 0} واجب</Text>
                                  </HStack>
                                </HStack>
                              </VStack>
                            </HStack>
                            <HStack spacing={2}>
                              {/* Visibility Badge */}
                              <Badge
                                colorScheme={lesson.is_visible ? "green" : "gray"}
                                fontSize={{ base: "2xs", md: "xs" }}
                                px={2}
                                py={1}
                                borderRadius="full"
                              >
                                <HStack spacing={1}>
                                  {lesson.is_visible ? (
                                    <>
                                      <Icon as={FiCheckCircle} boxSize={3} />
                                      <Text display={{ base: "none", sm: "inline" }}>ظاهر</Text>
                                    </>
                                  ) : (
                                    <>
                                      <Icon as={FiXCircle} boxSize={3} />
                                      <Text display={{ base: "none", sm: "inline" }}>مخفي</Text>
                                    </>
                                  )}
                                </HStack>
                              </Badge>
                              {(isAdmin || isTeacher) && (
                                <>
                                  <Tooltip label={lesson.is_visible ? "إخفاء الدرس" : "إظهار الدرس"} hasArrow>
                                    <IconButton
                                      icon={<Icon as={lesson.is_visible ? FiXCircle : FiCheckCircle} />}
                                      size={{ base: "xs", md: "sm" }}
                                      colorScheme={lesson.is_visible ? "orange" : "green"}
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleVisibility(lesson);
                                      }}
                                      aria-label={lesson.is_visible ? "إخفاء" : "إظهار"}
                                      isLoading={togglingVisibility}
                                    />
                                  </Tooltip>
                                  <IconButton
                                    icon={<Icon as={FiEdit} />}
                                    size={{ base: "xs", md: "sm" }}
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditLessonModal(lesson);
                                    }}
                                    aria-label="تعديل"
                                  />
                                  <IconButton
                                    icon={<Icon as={FiTrash2} />}
                                    size={{ base: "xs", md: "sm" }}
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLesson(lesson);
                                      onDeleteLessonOpen();
                                    }}
                                    aria-label="حذف"
                                  />
                                </>
                              )}
                              <AccordionIcon color={textColor} boxSize={{ base: 5, md: 6 }} />
                            </HStack>
                          </HStack>
                        </CardBody>
                      </AccordionButton>

                      <AccordionPanel pb={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
                        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                          {/* Videos Section */}
                          <Box>
                            <HStack justify="space-between" mb={3} flexWrap="wrap">
                              <HStack spacing={2}>
                                <Icon as={FiVideo} color={primaryColor} boxSize={{ base: 4, md: 5 }} />
                                <Text fontWeight="bold" color={textColor} fontSize={{ base: "sm", md: "md" }}>
                                  الفيديوهات ({lesson.videos?.length || 0})
                                </Text>
                              </HStack>
                              {(isAdmin || isTeacher) && (
                                <Button
                                  size={{ base: "2xs", md: "xs" }}
                                  leftIcon={<Icon as={FiPlus} />}
                                  colorScheme="blue"
                                  onClick={() => openAddVideoModal(lesson)}
                                  fontSize={{ base: "2xs", md: "xs" }}
                                >
                                  إضافة فيديو
                                </Button>
                              )}
                            </HStack>
                            {lesson.videos && lesson.videos.length > 0 ? (
                              <VStack spacing={2} align="stretch">
                                {lesson.videos.map((video) => (
                                  <Card key={video.id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                                    <CardBody p={{ base: 3, md: 4 }}>
                                      <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
                                        <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
                                          <Icon as={FiVideo} color="red.500" boxSize={{ base: 4, md: 5 }} />
                                          <VStack align="start" spacing={0} flex={1} minW={0}>
                                            <Text fontWeight="medium" color={textColor} fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                              {video.title}
                                            </Text>
                                            {video.duration_minutes && (
                                              <Text fontSize={{ base: "2xs", md: "xs" }} color={subTextColor}>
                                                {video.duration_minutes} دقيقة
                                              </Text>
                                            )}
                                          </VStack>
                                        </HStack>
                                        {(isAdmin || isTeacher) && (
                                          <HStack spacing={1}>
                                            <IconButton
                                              icon={<Icon as={FiEdit} />}
                                              size={{ base: "2xs", md: "xs" }}
                                              colorScheme="blue"
                                              variant="ghost"
                                              onClick={() => openEditVideoModal(video, lesson)}
                                              aria-label="تعديل"
                                            />
                                            <IconButton
                                              icon={<Icon as={FiTrash2} />}
                                              size={{ base: "2xs", md: "xs" }}
                                              colorScheme="red"
                                              variant="ghost"
                                              onClick={() => {
                                                setSelectedVideo(video);
                                                onDeleteVideoOpen();
                                              }}
                                              aria-label="حذف"
                                            />
                                          </HStack>
                                        )}
                                      </HStack>
                                    </CardBody>
                                  </Card>
                                ))}
                              </VStack>
                            ) : (
                              <Alert status="info" borderRadius="md" fontSize={{ base: "xs", md: "sm" }}>
                                <AlertIcon />
                                <Text fontSize={{ base: "xs", md: "sm" }}>لا توجد فيديوهات</Text>
                              </Alert>
                            )}
                          </Box>

                          <Divider />

                          {/* Assignments Section */}
                          <Box>
                            <HStack justify="space-between" mb={3} flexWrap="wrap">
                              <HStack spacing={2}>
                                <Icon as={FiFileText} color={primaryColor} boxSize={{ base: 4, md: 5 }} />
                                <Text fontWeight="bold" color={textColor} fontSize={{ base: "sm", md: "md" }}>
                                  الواجبات ({lesson.assignments?.length || 0})
                                </Text>
                              </HStack>
                              {(isAdmin || isTeacher) && (
                                <Button
                                  size={{ base: "2xs", md: "xs" }}
                                  leftIcon={<Icon as={FiPlus} />}
                                  colorScheme="green"
                                  onClick={() => openAddAssignmentModal(lesson)}
                                  fontSize={{ base: "2xs", md: "xs" }}
                                >
                                  إضافة واجب
                                </Button>
                              )}
                            </HStack>
                            {lesson.assignments && lesson.assignments.length > 0 ? (
                              <VStack spacing={2} align="stretch">
                                {lesson.assignments.map((assignment) => (
                                  <Card key={assignment.id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                                    <CardBody p={{ base: 3, md: 4 }}>
                                      <VStack spacing={3} align="stretch">
                                        <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
                                          <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
                                            <Icon as={FiFileText} color="green.500" boxSize={{ base: 4, md: 5 }} />
                                            <VStack align="start" spacing={0} flex={1} minW={0}>
                                              <HStack spacing={2} flexWrap="wrap">
                                                <Text fontWeight="medium" color={textColor} fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                                  {assignment.name}
                                                </Text>
                                                {/* Visibility Badge */}
                                                <Badge
                                                  colorScheme={assignment.is_visible ? "green" : "gray"}
                                                  fontSize={{ base: "2xs", md: "xs" }}
                                                  px={2}
                                                  py={0.5}
                                                  borderRadius="full"
                                                >
                                                  <HStack spacing={1}>
                                                    {assignment.is_visible ? (
                                                      <>
                                                        <Icon as={FiCheckCircle} boxSize={2.5} />
                                                        <Text display={{ base: "none", sm: "inline" }}>ظاهر</Text>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Icon as={FiXCircle} boxSize={2.5} />
                                                        <Text display={{ base: "none", sm: "inline" }}>مخفي</Text>
                                                      </>
                                                    )}
                                                  </HStack>
                                                </Badge>
                                              </HStack>
                                              <HStack spacing={{ base: 2, md: 3 }} fontSize={{ base: "2xs", md: "xs" }} color={subTextColor} flexWrap="wrap">
                                                <Text>{assignment.questions_count || 0} سؤال</Text>
                                                {assignment.duration_minutes && (
                                                  <Text>{assignment.duration_minutes} دقيقة</Text>
                                                )}
                                              </HStack>
                                            </VStack>
                                          </HStack>
                                          <HStack spacing={1} flexWrap="wrap">
                                            {(isAdmin || isTeacher) && (
                                              <>
                                                <Tooltip label={(assignment.is_visible ?? false) ? "إخفاء الواجب" : "إظهار الواجب"} hasArrow>
                                                  <IconButton
                                                    icon={<Icon as={(assignment.is_visible ?? false) ? FiXCircle : FiCheckCircle} />}
                                                    size={{ base: "2xs", md: "xs" }}
                                                    colorScheme={(assignment.is_visible ?? false) ? "orange" : "green"}
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                      handleToggleAssignmentVisibility(assignment);
                                                    }}
                                                    aria-label={(assignment.is_visible ?? false) ? "إخفاء" : "إظهار"}
                                                    isLoading={togglingAssignmentVisibility}
                                                  />
                                                </Tooltip>
                                                <IconButton
                                                  icon={<Icon as={FiEdit} />}
                                                  size={{ base: "2xs", md: "xs" }}
                                                  colorScheme="green"
                                                  variant="ghost"
                                                  onClick={() => openEditAssignmentModal(assignment, lesson)}
                                                  aria-label="تعديل"
                                                />
                                                <IconButton
                                                  icon={<Icon as={FiTrash2} />}
                                                  size={{ base: "2xs", md: "xs" }}
                                                  colorScheme="red"
                                                  variant="ghost"
                                                  onClick={() => {
                                                    setSelectedAssignment(assignment);
                                                    onDeleteAssignmentOpen();
                                                  }}
                                                  aria-label="حذف"
                                                />
                                              </>
                                            )}
                                            <Button
                                              size={{ base: "2xs", md: "xs" }}
                                              leftIcon={<Icon as={FiBookOpen} />}
                                              colorScheme="blue"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                navigate(`/assignment/${assignment.id}/questions`, {
                                                  state: {
                                                    assignmentName: assignment.name,
                                                    assignmentDuration: assignment.duration_minutes,
                                                  }
                                                });
                                              }}
                                              fontSize={{ base: "2xs", md: "xs" }}
                                            >
                                              دخول للواجب
                                            </Button>
                                          </HStack>
                                        </HStack>

                                        {/* Questions Section */}
                                        {(isAdmin || isTeacher) && (
                                          <Box>
                                            <HStack justify="space-between" mb={2} flexWrap="wrap">
                                              <HStack spacing={2}>
                                                <Icon as={FiHelpCircle} color="purple.500" boxSize={{ base: 3, md: 4 }} />
                                                <Text fontWeight="semibold" color={textColor} fontSize={{ base: "2xs", md: "xs" }}>
                                                  الأسئلة ({assignmentQuestions[assignment.id]?.length || 0})
                                                </Text>
                                              </HStack>
                                              <HStack spacing={1}>
                                                <Button
                                                  size={{ base: "2xs", md: "xs" }}
                                                  leftIcon={<Icon as={FiFileText} />}
                                                  colorScheme="purple"
                                                  variant="outline"
                                                  onClick={() => {
                                                    openAddQuestionModal(assignment);
                                                    if (!assignmentQuestions[assignment.id]) {
                                                      fetchAssignmentQuestions(assignment.id);
                                                    }
                                                  }}
                                                  fontSize={{ base: "2xs", md: "xs" }}
                                                >
                                                  نصي
                                                </Button>
                                                <Button
                                                  size={{ base: "2xs", md: "xs" }}
                                                  leftIcon={<Icon as={FiImage} />}
                                                  colorScheme="purple"
                                                  variant="outline"
                                                  onClick={() => {
                                                    openAddImageQuestionModal(assignment);
                                                    if (!assignmentQuestions[assignment.id]) {
                                                      fetchAssignmentQuestions(assignment.id);
                                                    }
                                                  }}
                                                  fontSize={{ base: "2xs", md: "xs" }}
                                                >
                                                  صورة
                                                </Button>
                                              </HStack>
                                            </HStack>
                                            
                                            {loadingQuestions[assignment.id] ? (
                                              <Center py={2}>
                                                <Spinner size="sm" color="purple.500" />
                                              </Center>
                                            ) : assignmentQuestions[assignment.id] && assignmentQuestions[assignment.id].length > 0 ? (
                                              <VStack spacing={1} align="stretch" maxH="200px" overflowY="auto">
                                                {assignmentQuestions[assignment.id].map((question, qIndex) => (
                                                  <Card key={question.id} bg={blueLight} border="1px solid" borderColor={borderColor} size="sm">
                                                    <CardBody p={2}>
                                                      <VStack align="start" spacing={2}>
                                                        <HStack spacing={2} w="full" justify="space-between">
                                                          <HStack spacing={2}>
                                                            <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="medium" color={textColor}>
                                                              {qIndex + 1}.
                                                            </Text>
                                                            {question.question_type === 'image' && question.images && question.images.length > 0 ? (
                                                              <HStack spacing={1} flexWrap="wrap">
                                                                {question.images.slice(0, 3).map((img, imgIdx) => (
                                                                  <Image
                                                                    key={imgIdx}
                                                                    src={img.image_url}
                                                                    alt={`صورة ${imgIdx + 1}`}
                                                                    boxSize="30px"
                                                                    objectFit="cover"
                                                                    borderRadius="sm"
                                                                    border="1px solid"
                                                                    borderColor={borderColor}
                                                                  />
                                                                ))}
                                                                {question.images.length > 3 && (
                                                                  <Badge colorScheme="purple" fontSize="2xs">
                                                                    +{question.images.length - 3}
                                                                  </Badge>
                                                                )}
                                                              </HStack>
                                                            ) : (
                                                              <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="medium" color={textColor} noOfLines={2}>
                                                                {question.question_text}
                                                              </Text>
                                                            )}
                                                          </HStack>
                                                          <Badge colorScheme="purple" fontSize={{ base: "2xs", md: "xs" }} px={1} py={0}>
                                                            {question.correct_answer?.toUpperCase()}
                                                          </Badge>
                                                        </HStack>
                                                        <HStack spacing={2} fontSize={{ base: "2xs", md: "xs" }} color={subTextColor} flexWrap="wrap">
                                                          <Text>أ: {question.option_a}</Text>
                                                          <Text>ب: {question.option_b}</Text>
                                                          <Text>ج: {question.option_c}</Text>
                                                          <Text>د: {question.option_d}</Text>
                                                        </HStack>
                                                      </VStack>
                                                    </CardBody>
                                                  </Card>
                                                ))}
                                              </VStack>
                                            ) : (
                                              <Alert status="info" borderRadius="md" fontSize={{ base: "2xs", md: "xs" }} py={1}>
                                                <AlertIcon boxSize={3} />
                                                <Text fontSize={{ base: "2xs", md: "xs" }}>لا توجد أسئلة</Text>
                                              </Alert>
                                            )}
                                          </Box>
                                        )}
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                ))}
                              </VStack>
                            ) : (
                              <Alert status="info" borderRadius="md" fontSize={{ base: "xs", md: "sm" }}>
                                <AlertIcon />
                                <Text fontSize={{ base: "xs", md: "sm" }}>لا توجد واجبات</Text>
                              </Alert>
                            )}
                          </Box>
                        </VStack>
                      </AccordionPanel>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FiBookOpen} boxSize={12} color={subTextColor} />
                  <Text color={subTextColor} fontSize="lg">
                    لا توجد دروس متاحة
                  </Text>
                  {(isAdmin || isTeacher) && (
                    <Text color={subTextColor} fontSize="sm">
                      قم بإضافة دروس جديدة للمادة
                    </Text>
                  )}
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Flex justify="center" gap={4} flexWrap="wrap">
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            variant="outline"
            colorScheme="blue"
            size={{ base: "md", md: "lg" }}
            px={{ base: 6, md: 8 }}
            onClick={() => navigate(`/package/${subjectData.package_id}`)}
            borderRadius="xl"
            fontSize={{ base: "sm", md: "md" }}
          >
            العودة للباقة
          </Button>
        </Flex>
      </Container>

      {/* Add Permission Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg={blueGradient} p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiPlus} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  إضافة صلاحية لمدرس
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  اختر المدرس
                </FormLabel>
                {teachersLoading ? (
                  <Center py={4}>
                    <Spinner size="md" color={primaryColor} />
                  </Center>
                ) : teachers.length > 0 ? (
                  <Select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    placeholder="اختر مدرس من القائمة"
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                    _hover={{ borderColor: primaryColor }}
                    transition="all 0.2s"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.email}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Box
                    p={4}
                    bg={blueLight}
                    borderRadius="lg"
                    border="2px dashed"
                    borderColor={primaryColor}
                    textAlign="center"
                  >
                    <Text color={subTextColor}>
                      جميع المدرسين لديهم صلاحية بالفعل
                    </Text>
                  </Box>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleAddPermission}
                isLoading={addingPermission}
                loadingText="جاري الإضافة..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                isDisabled={!selectedTeacherId || teachers.length === 0}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                  bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)"
                }}
                transition="all 0.3s ease"
              >
                إضافة الصلاحية
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Permission Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              إزالة الصلاحية
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من إزالة الصلاحية من المدرس{' '}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedPermission?.teacher_name}
              </Text>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeletePermission}
                ml={3}
                isLoading={deletingPermission}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ========== Lessons Modals ========== */}
      {/* Add Lesson Modal */}
      <Modal isOpen={isLessonModalOpen} onClose={onLessonModalClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg={blueGradient} p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiPlus} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  إضافة درس جديد
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عنوان الدرس
                </FormLabel>
                <Input
                  value={lessonFormData.title}
                  onChange={(e) =>
                    setLessonFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="أدخل عنوان الدرس"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                  _hover={{ borderColor: primaryColor }}
                  transition="all 0.2s"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  وصف الدرس
                </FormLabel>
                <Textarea
                  value={lessonFormData.description}
                  onChange={(e) =>
                    setLessonFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="أدخل وصفاً للدرس"
                  borderColor={borderColor}
                  borderRadius="lg"
                  rows={4}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                  _hover={{ borderColor: primaryColor }}
                  transition="all 0.2s"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onLessonModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleAddLesson}
                isLoading={addingLesson}
                loadingText="جاري الإضافة..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                  bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)"
                }}
                transition="all 0.3s ease"
              >
                إضافة الدرس
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal isOpen={isEditLessonModalOpen} onClose={onEditLessonModalClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg={blueGradient} p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiEdit} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  تعديل الدرس
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عنوان الدرس
                </FormLabel>
                <Input
                  value={lessonFormData.title}
                  onChange={(e) =>
                    setLessonFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="أدخل عنوان الدرس"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                  _hover={{ borderColor: primaryColor }}
                  transition="all 0.2s"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  وصف الدرس
                </FormLabel>
                <Textarea
                  value={lessonFormData.description}
                  onChange={(e) =>
                    setLessonFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="أدخل وصفاً للدرس"
                  borderColor={borderColor}
                  borderRadius="lg"
                  rows={4}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                  _hover={{ borderColor: primaryColor }}
                  transition="all 0.2s"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onEditLessonModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleEditLesson}
                isLoading={editingLesson}
                loadingText="جاري التحديث..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiEdit} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                  bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)"
                }}
                transition="all 0.3s ease"
              >
                حفظ التغييرات
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Lesson Dialog */}
      <AlertDialog
        isOpen={isDeleteLessonOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteLessonClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف الدرس
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف الدرس{' '}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedLesson?.title}
              </Text>
              ؟ سيتم حذف جميع الفيديوهات والواجبات المرتبطة به أيضاً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteLessonClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteLesson}
                ml={3}
                isLoading={deletingLesson}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ========== Videos Modals ========== */}
      {/* Add Video Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={onVideoModalClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg="linear-gradient(135deg, #E53E3E 0%, #C53030 100%)" p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiVideo} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  إضافة فيديو جديد
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عنوان الفيديو
                </FormLabel>
                <Input
                  value={videoFormData.title}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="أدخل عنوان الفيديو"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  رابط الفيديو
                </FormLabel>
                <Input
                  value={videoFormData.video_url}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, video_url: e.target.value }))
                  }
                  placeholder="https://example.com/video.mp4"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  مدة الفيديو (بالدقائق)
                </FormLabel>
                <NumberInput
                  value={videoFormData.duration_minutes}
                  onChange={(valueString) =>
                    setVideoFormData((prev) => ({ ...prev, duration_minutes: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  ترتيب الفيديو
                </FormLabel>
                <NumberInput
                  value={videoFormData.order_index}
                  onChange={(valueString) =>
                    setVideoFormData((prev) => ({ ...prev, order_index: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onVideoModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg="linear-gradient(135deg, #E53E3E 0%, #C53030 100%)"
                color="white"
                onClick={handleAddVideo}
                isLoading={addingVideo}
                loadingText="جاري الإضافة..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                إضافة الفيديو
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Video Modal */}
      <Modal isOpen={isEditVideoModalOpen} onClose={onEditVideoModalClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg="linear-gradient(135deg, #E53E3E 0%, #C53030 100%)" p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiEdit} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  تعديل الفيديو
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عنوان الفيديو
                </FormLabel>
                <Input
                  value={videoFormData.title}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="أدخل عنوان الفيديو"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  رابط الفيديو
                </FormLabel>
                <Input
                  value={videoFormData.video_url}
                  onChange={(e) =>
                    setVideoFormData((prev) => ({ ...prev, video_url: e.target.value }))
                  }
                  placeholder="https://example.com/video.mp4"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  مدة الفيديو (بالدقائق)
                </FormLabel>
                <NumberInput
                  value={videoFormData.duration_minutes}
                  onChange={(valueString) =>
                    setVideoFormData((prev) => ({ ...prev, duration_minutes: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  ترتيب الفيديو
                </FormLabel>
                <NumberInput
                  value={videoFormData.order_index}
                  onChange={(valueString) =>
                    setVideoFormData((prev) => ({ ...prev, order_index: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onEditVideoModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg="linear-gradient(135deg, #E53E3E 0%, #C53030 100%)"
                color="white"
                onClick={handleEditVideo}
                isLoading={editingVideo}
                loadingText="جاري التحديث..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiEdit} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                حفظ التغييرات
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Video Dialog */}
      <AlertDialog
        isOpen={isDeleteVideoOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteVideoClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف الفيديو
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف الفيديو{' '}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedVideo?.title}
              </Text>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteVideoClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteVideo}
                ml={3}
                isLoading={deletingVideo}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ========== Assignments Modals ========== */}
      {/* Add Assignment Modal */}
      <Modal isOpen={isAssignmentModalOpen} onClose={onAssignmentModalClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)" p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiFileText} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  إضافة واجب جديد
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  اسم الواجب
                </FormLabel>
                <Input
                  value={assignmentFormData.name}
                  onChange={(e) =>
                    setAssignmentFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="أدخل اسم الواجب"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عدد الأسئلة
                </FormLabel>
                <NumberInput
                  value={assignmentFormData.questions_count}
                  onChange={(valueString) =>
                    setAssignmentFormData((prev) => ({ ...prev, questions_count: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  مدة الواجب (بالدقائق)
                </FormLabel>
                <NumberInput
                  value={assignmentFormData.duration_minutes}
                  onChange={(valueString) =>
                    setAssignmentFormData((prev) => ({ ...prev, duration_minutes: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onAssignmentModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)"
                color="white"
                onClick={handleAddAssignment}
                isLoading={addingAssignment}
                loadingText="جاري الإضافة..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                إضافة الواجب
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal isOpen={isEditAssignmentModalOpen} onClose={onEditAssignmentModalClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)" p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiEdit} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  تعديل الواجب
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  اسم الواجب
                </FormLabel>
                <Input
                  value={assignmentFormData.name}
                  onChange={(e) =>
                    setAssignmentFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="أدخل اسم الواجب"
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عدد الأسئلة
                </FormLabel>
                <NumberInput
                  value={assignmentFormData.questions_count}
                  onChange={(valueString) =>
                    setAssignmentFormData((prev) => ({ ...prev, questions_count: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  مدة الواجب (بالدقائق)
                </FormLabel>
                <NumberInput
                  value={assignmentFormData.duration_minutes}
                  onChange={(valueString) =>
                    setAssignmentFormData((prev) => ({ ...prev, duration_minutes: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onEditAssignmentModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)"
                color="white"
                onClick={handleEditAssignment}
                isLoading={editingAssignment}
                loadingText="جاري التحديث..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiEdit} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                حفظ التغييرات
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Assignment Dialog */}
      <AlertDialog
        isOpen={isDeleteAssignmentOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAssignmentClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف الواجب
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف الواجب{' '}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedAssignment?.name}
              </Text>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAssignmentClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteAssignment}
                ml={3}
                isLoading={deletingAssignment}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* ========== Questions Modals ========== */}
      {/* Add Question Modal */}
      <Modal isOpen={isQuestionModalOpen} onClose={onQuestionModalClose} size={{ base: "full", sm: "md", md: "lg", lg: "xl" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg="linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)" p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiHelpCircle} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  إضافة سؤال جديد
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg} maxH="80vh" overflowY="auto">
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  نص السؤال
                </FormLabel>
                <Textarea
                  value={questionFormData.question_text}
                  onChange={(e) =>
                    setQuestionFormData((prev) => ({ ...prev, question_text: e.target.value }))
                  }
                  placeholder="أدخل نص السؤال"
                  borderColor={borderColor}
                  borderRadius="lg"
                  rows={3}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    الخيار أ
                  </FormLabel>
                  <Input
                    value={questionFormData.option_a}
                    onChange={(e) =>
                      setQuestionFormData((prev) => ({ ...prev, option_a: e.target.value }))
                    }
                    placeholder="أدخل الخيار أ"
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    الخيار ب
                  </FormLabel>
                  <Input
                    value={questionFormData.option_b}
                    onChange={(e) =>
                      setQuestionFormData((prev) => ({ ...prev, option_b: e.target.value }))
                    }
                    placeholder="أدخل الخيار ب"
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    الخيار ج
                  </FormLabel>
                  <Input
                    value={questionFormData.option_c}
                    onChange={(e) =>
                      setQuestionFormData((prev) => ({ ...prev, option_c: e.target.value }))
                    }
                    placeholder="أدخل الخيار ج"
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    الخيار د
                  </FormLabel>
                  <Input
                    value={questionFormData.option_d}
                    onChange={(e) =>
                      setQuestionFormData((prev) => ({ ...prev, option_d: e.target.value }))
                    }
                    placeholder="أدخل الخيار د"
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  الإجابة الصحيحة
                </FormLabel>
                <Select
                  value={questionFormData.correct_answer}
                  onChange={(e) =>
                    setQuestionFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                  }
                  borderColor={borderColor}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                >
                  <option value="a">أ - {questionFormData.option_a || 'الخيار أ'}</option>
                  <option value="b">ب - {questionFormData.option_b || 'الخيار ب'}</option>
                  <option value="c">ج - {questionFormData.option_c || 'الخيار ج'}</option>
                  <option value="d">د - {questionFormData.option_d || 'الخيار د'}</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  ترتيب السؤال
                </FormLabel>
                <NumberInput
                  value={questionFormData.order_index}
                  onChange={(valueString) =>
                    setQuestionFormData((prev) => ({ ...prev, order_index: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onQuestionModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg="linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)"
                color="white"
                onClick={handleAddQuestion}
                isLoading={addingQuestion}
                loadingText="جاري الإضافة..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                fontSize={{ base: "sm", md: "md" }}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                إضافة السؤال
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Image Question Modal */}
      <Modal isOpen={isImageQuestionModalOpen} onClose={onImageQuestionModalClose} size={{ base: "full", sm: "md", md: "lg", lg: "xl" }} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
          <Box bg="linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)" p={{ base: 4, md: 6 }} color="white">
            <ModalHeader p={0}>
              <HStack spacing={{ base: 2, md: 3 }}>
                <Icon as={FiImage} boxSize={{ base: 5, md: 6 }} />
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                  إضافة سؤال بصورة
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
          </Box>

          <ModalBody p={{ base: 4, md: 6 }} bg={cardBg} maxH="80vh" overflowY="auto">
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  رفع الصور (حتى 10 صور)
                </FormLabel>
                <Box
                  border="2px dashed"
                  borderColor={borderColor}
                  borderRadius="lg"
                  p={4}
                  textAlign="center"
                  _hover={{ borderColor: primaryColor }}
                  transition="all 0.2s"
                >
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    display="none"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <VStack spacing={2} cursor="pointer">
                      <Icon as={FiImage} boxSize={8} color={primaryColor} />
                      <Text color={textColor} fontSize="sm">
                        اضغط لاختيار الصور
                      </Text>
                      <Text color={subTextColor} fontSize="xs">
                        الحد الأقصى: 10 صور، حجم كل صورة: 5MB
                      </Text>
                      <Text color={subTextColor} fontSize="xs">
                        الأنواع المدعومة: JPEG, JPG, PNG, GIF, WebP
                      </Text>
                    </VStack>
                  </label>
                </Box>
                
                {selectedImages.length > 0 && (
                  <Box mt={3}>
                    <Text fontSize="sm" color={textColor} mb={2} fontWeight="medium">
                      الصور المختارة ({selectedImages.length}/10):
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                      {imagePreviews.map((preview, index) => (
                        <Box key={index} position="relative">
                          <Image
                            src={preview.preview}
                            alt={`Preview ${index + 1}`}
                            borderRadius="md"
                            boxSize="100px"
                            objectFit="cover"
                            border="2px solid"
                            borderColor={borderColor}
                          />
                          <IconButton
                            icon={<Icon as={FiXCircle} />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={-2}
                            right={-2}
                            borderRadius="full"
                            onClick={() => handleRemoveImage(index)}
                            aria-label="حذف الصورة"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </FormControl>

              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">ملاحظة:</Text>
                  <Text fontSize="xs">
                    الخيارات ثابتة: أ، ب، ج، د
                  </Text>
                  <Text fontSize="xs">
                    الإجابة الصحيحة سيتم تعيينها افتراضياً كـ "أ" ويمكن تحديثها لاحقاً
                  </Text>
                </VStack>
              </Alert>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  ترتيب السؤال
                </FormLabel>
                <NumberInput
                  value={imageQuestionFormData.order_index}
                  onChange={(valueString) =>
                    setImageQuestionFormData((prev) => ({ ...prev, order_index: parseInt(valueString) || 0 }))
                  }
                  min={0}
                >
                  <NumberInputField
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onImageQuestionModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                إلغاء
              </Button>
              <Button
                bg="linear-gradient(135deg, #ED64A6 0%, #D53F8C 100%)"
                color="white"
                onClick={handleAddImageQuestion}
                isLoading={addingImageQuestion}
                loadingText="جاري الإضافة..."
                size={{ base: "md", md: "lg" }}
                px={{ base: 6, md: 8 }}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                fontSize={{ base: "sm", md: "md" }}
                isDisabled={selectedImages.length === 0}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                إضافة السؤال
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modals moved to AssignmentQuestions page */}

      <ScrollToTop />
    </Box>
  );
};

export default SubjectDetails;

