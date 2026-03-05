import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Icon,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Image,
  IconButton,
  Spinner,
  HStack,
  VStack,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Grid,
  GridItem
} from '@chakra-ui/react';
import {
  FiBook,
  FiBookOpen,
  FiSearch,
  FiArrowRight,
  FiGrid,
  FiPlus,
  FiEdit,
  FiTrash,
  FiUpload,
  FiX,
  FiFolder,
  FiFileText
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import baseUrl from '../../api/baseUrl';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const QuestionBank = () => {
  const { id } = useParams();
  const toast = useToast();

  // States
  const [questionBank, setQuestionBank] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Edit states
  const [editingSubject, setEditingSubject] = useState(null);
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
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Chapter states (إضافة / تعديل / حذف فصل)
  const [subjectForNewChapter, setSubjectForNewChapter] = useState(null);
  const [chapterFormData, setChapterFormData] = useState({ name: '', description: '' });
  const [chapterSelectedImage, setChapterSelectedImage] = useState(null);
  const [chapterImagePreview, setChapterImagePreview] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editChapterFormData, setEditChapterFormData] = useState({ name: '', description: '' });
  const [editChapterImagePreview, setEditChapterImagePreview] = useState(null);
  const [editChapterSelectedImage, setEditChapterSelectedImage] = useState(null);
  const [deletingChapter, setDeletingChapter] = useState(null);
  const { isOpen: isChapterAddOpen, onOpen: onChapterAddOpen, onClose: onChapterAddClose } = useDisclosure();
  const { isOpen: isChapterEditOpen, onOpen: onChapterEditOpen, onClose: onChapterEditClose } = useDisclosure();
  const { isOpen: isChapterDeleteOpen, onOpen: onChapterDeleteOpen, onClose: onChapterDeleteClose } = useDisclosure();
  const [chapterSubmitLoading, setChapterSubmitLoading] = useState(false);
  const [chapterEditLoading, setChapterEditLoading] = useState(false);
  const [chapterDeleteLoading, setChapterDeleteLoading] = useState(false);

  // Lesson states (إضافة / تعديل / حذف درس)
  const [chapterForNewLesson, setChapterForNewLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({ name: '', description: '' });
  const [lessonSelectedImage, setLessonSelectedImage] = useState(null);
  const [lessonImagePreview, setLessonImagePreview] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editLessonFormData, setEditLessonFormData] = useState({ name: '', description: '' });
  const [editLessonImagePreview, setEditLessonImagePreview] = useState(null);
  const [editLessonSelectedImage, setEditLessonSelectedImage] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const { isOpen: isLessonAddOpen, onOpen: onLessonAddOpen, onClose: onLessonAddClose } = useDisclosure();
  const { isOpen: isLessonEditOpen, onOpen: onLessonEditOpen, onClose: onLessonEditClose } = useDisclosure();
  const { isOpen: isLessonDeleteOpen, onOpen: onLessonDeleteOpen, onClose: onLessonDeleteClose } = useDisclosure();
  const [lessonSubmitLoading, setLessonSubmitLoading] = useState(false);
  const [lessonEditLoading, setLessonEditLoading] = useState(false);
  const [lessonDeleteLoading, setLessonDeleteLoading] = useState(false);

  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);

  useEffect(() => {
    if (subjects.length > 0 && !activeSubjectId) {
      const firstSubject = subjects[0];
      setActiveSubjectId(firstSubject.id);
      if (firstSubject.chapters?.length > 0) {
        setActiveChapterId(firstSubject.chapters[0].id);
      }
    }
  }, [subjects, activeSubjectId]);

  // ألوان بسيطة تتناسب مع البراند
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBackground = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "gray.200");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const buttonPrimary = useColorModeValue("blue.500", "blue.400");
  const buttonPrimaryHover = useColorModeValue("blue.600", "blue.500");
  const buttonSecondary = useColorModeValue("orange.500", "orange.400");
  const buttonSecondaryHover = useColorModeValue("orange.600", "orange.500");
  const iconBg = useColorModeValue("blue.50", "blue.900");
  const iconBorder = useColorModeValue("blue.200", "blue.800");
  const iconShadow = "sm";
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const searchIconColor = useColorModeValue("#4299e1", "#63b3ed");
  const accordionHoverBg = useColorModeValue("gray.50", "gray.700");
  const lessonCardBg = useColorModeValue("gray.50", "gray.700");
  const lessonCardHoverBg = useColorModeValue("blue.50", "gray.600");
  const badgeActiveBg = useColorModeValue("green.100", "green.900");
  const badgeActiveColor = useColorModeValue("green.700", "green.300");
  const cardShadow = "sm";
  const inputHoverBorder = useColorModeValue("blue.300", "blue.700");
  const inputFocusBorder = useColorModeValue("blue.500", "blue.400");
  const inputFocusBg = useColorModeValue("white", "gray.600");
  const focusRingShadow = useColorModeValue("0 0 0 3px rgba(66, 153, 225, 0.2)", "0 0 0 3px rgba(66, 153, 225, 0.3)");
  const modalBg = useColorModeValue("white", "gray.800");
  const modalBorder = useColorModeValue("gray.200", "gray.700");
  const modalHeaderBg = useColorModeValue("blue.500", "blue.600");
  const modalFooterBg = useColorModeValue("gray.50", "gray.700");

  // Fetch question bank data
  const fetchQuestionBankData = async () => {
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

      const response = await baseUrl.get(`/api/question-banks/${id}/with-subjects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Question Bank API Response:", response.data);

      if (response.data.success) {
        setQuestionBank(response.data.data.question_bank);
        setSubjects(response.data.data.subjects);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب بيانات بنك الأسئلة";
      setError(errorMsg);
      console.error("Error fetching question bank:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new subject
  const createSubject = async (formData) => {
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

      console.log("Creating subject with data:", formData);

      const response = await baseUrl.post(`/api/question-banks/${id}/subjects`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Create Subject API Response:", response.data);

      toast({
        title: "نجح",
        description: "تم إنشاء المادة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating subject:", error);

      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء المادة";
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

  // Update subject
  const updateSubject = async (formData) => {
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

      console.log("Updating subject:", editingSubject.id);

      const response = await baseUrl.put(`/api/subjects/${editingSubject.id}`, submitFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Update Subject API Response:", response.data);

      toast({
        title: "نجح",
        description: "تم تحديث المادة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating subject:", error);

      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث المادة";
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

  // Delete subject
  const deleteSubject = async () => {
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

      console.log("Deleting subject:", deletingSubject.id);

      const response = await baseUrl.delete(`/api/subjects/${deletingSubject.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Delete Subject API Response:", response.data);

      toast({
        title: "نجح",
        description: "تم حذف المادة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting subject:", error);

      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف المادة";
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

  // Create new chapter (للمادة المحددة)
  const createChapter = async (data) => {
    if (!subjectForNewChapter?.id) return { success: false };
    try {
      setChapterSubmitLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("description", data.description || "");
      if (chapterSelectedImage) fd.append("image", chapterSelectedImage);
      const response = await baseUrl.post(`/api/subjects/${subjectForNewChapter.id}/chapters`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (response.data) {
        toast({ title: "نجح", description: "تم إنشاء الفصل بنجاح", status: "success", duration: 3000, isClosable: true });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ في إنشاء الفصل";
      toast({ title: "خطأ", description: msg, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setChapterSubmitLoading(false);
    }
    return { success: false };
  };

  // Update chapter
  const updateChapter = async (data) => {
    if (!editingChapter?.id) return { success: false };
    try {
      setChapterEditLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("description", data.description || "");
      if (editChapterSelectedImage) fd.append("image", editChapterSelectedImage);
      const response = await baseUrl.put(`/api/chapters/${editingChapter.id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (response.data) {
        toast({ title: "نجح", description: "تم تحديث الفصل بنجاح", status: "success", duration: 3000, isClosable: true });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ في تحديث الفصل";
      toast({ title: "خطأ", description: msg, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setChapterEditLoading(false);
    }
    return { success: false };
  };

  // Delete chapter
  const deleteChapter = async () => {
    if (!deletingChapter?.id) return { success: false };
    try {
      setChapterDeleteLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      await baseUrl.delete(`/api/chapters/${deletingChapter.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم حذف الفصل بنجاح", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ في حذف الفصل";
      toast({ title: "خطأ", description: msg, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setChapterDeleteLoading(false);
    }
    return { success: false };
  };

  // Load data on component mount
  useEffect(() => {
    fetchQuestionBankData();
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
        description: "يجب ملء اسم المادة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await createSubject(formData);

    if (result.success) {
      onClose();
      resetForm();
      fetchQuestionBankData(); // Refresh data
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم المادة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const result = await updateSubject(editFormData);

    if (result.success) {
      onEditClose();
      resetEditForm();
      fetchQuestionBankData(); // Refresh data
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteSubject();

    if (result.success) {
      onDeleteClose();
      setDeletingSubject(null);
      fetchQuestionBankData(); // Refresh data
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
  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setEditFormData({
      name: subject.name,
      description: subject.description || ''
    });
    setImagePreview(subject.image_url);
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (subject) => {
    setDeletingSubject(subject);
    onDeleteOpen();
  };

  // Chapter form handlers
  const handleChapterInputChange = (e) => {
    const { name, value } = e.target;
    setChapterFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleChapterEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditChapterFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleChapterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChapterSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setChapterImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeChapterImage = () => {
    setChapterSelectedImage(null);
    setChapterImagePreview(null);
  };
  const handleChapterEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditChapterSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditChapterImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeChapterEditImage = () => {
    setEditChapterSelectedImage(null);
    setEditChapterImagePreview(editingChapter?.image_url || null);
  };
  const openAddChapter = (subject) => {
    setSubjectForNewChapter(subject);
    setChapterFormData({ name: '', description: '' });
    setChapterSelectedImage(null);
    setChapterImagePreview(null);
    onChapterAddOpen();
  };
  const handleChapterEditClick = (chapter) => {
    setEditingChapter(chapter);
    setEditChapterFormData({ name: chapter.name, description: chapter.description || '' });
    setEditChapterImagePreview(chapter.image_url || null);
    setEditChapterSelectedImage(null);
    onChapterEditOpen();
  };
  const handleChapterDeleteClick = (chapter) => {
    setDeletingChapter(chapter);
    onChapterDeleteOpen();
  };
  const resetChapterForm = () => {
    setChapterFormData({ name: '', description: '' });
    setChapterSelectedImage(null);
    setChapterImagePreview(null);
  };
  const resetChapterEditForm = () => {
    setEditChapterFormData({ name: '', description: '' });
    setEditChapterSelectedImage(null);
    setEditChapterImagePreview(editingChapter?.image_url || null);
  };
  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    if (!chapterFormData.name) {
      toast({ title: "خطأ", description: "يجب ملء اسم الفصل", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const result = await createChapter(chapterFormData);
    if (result.success) {
      onChapterAddClose();
      setSubjectForNewChapter(null);
      resetChapterForm();
      fetchQuestionBankData();
    }
  };
  const handleChapterEditSubmit = async (e) => {
    e.preventDefault();
    if (!editChapterFormData.name) {
      toast({ title: "خطأ", description: "يجب ملء اسم الفصل", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const result = await updateChapter(editChapterFormData);
    if (result.success) {
      onChapterEditClose();
      setEditingChapter(null);
      resetChapterEditForm();
      fetchQuestionBankData();
    }
  };
  const handleChapterDeleteConfirm = async () => {
    const result = await deleteChapter();
    if (result.success) {
      onChapterDeleteClose();
      setDeletingChapter(null);
      fetchQuestionBankData();
    }
  };

  // Create new lesson (للفصل المحدد)
  const createLesson = async (data) => {
    if (!chapterForNewLesson?.id) return { success: false };
    try {
      setLessonSubmitLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("description", data.description || "");
      if (lessonSelectedImage) fd.append("image", lessonSelectedImage);
      const response = await baseUrl.post(`/api/chapters/${chapterForNewLesson.id}/lessons`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (response.data) {
        toast({ title: "نجح", description: "تم إنشاء الدرس بنجاح", status: "success", duration: 3000, isClosable: true });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ في إنشاء الدرس";
      toast({ title: "خطأ", description: msg, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setLessonSubmitLoading(false);
    }
    return { success: false };
  };

  // Update lesson
  const updateLesson = async (data) => {
    if (!editingLesson?.id) return { success: false };
    try {
      setLessonEditLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("description", data.description || "");
      if (editLessonSelectedImage) fd.append("image", editLessonSelectedImage);
      const response = await baseUrl.put(`/api/lessons/${editingLesson.id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (response.data) {
        toast({ title: "نجح", description: "تم تحديث الدرس بنجاح", status: "success", duration: 3000, isClosable: true });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ في تحديث الدرس";
      toast({ title: "خطأ", description: msg, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setLessonEditLoading(false);
    }
    return { success: false };
  };

  // Delete lesson
  const deleteLesson = async () => {
    if (!deletingLesson?.id) return { success: false };
    try {
      setLessonDeleteLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", status: "error", duration: 3000, isClosable: true });
        return { success: false };
      }
      await baseUrl.delete(`/api/lessons/${deletingLesson.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "نجح", description: "تم حذف الدرس بنجاح", status: "success", duration: 3000, isClosable: true });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ في حذف الدرس";
      toast({ title: "خطأ", description: msg, status: "error", duration: 3000, isClosable: true });
      return { success: false };
    } finally {
      setLessonDeleteLoading(false);
    }
    return { success: false };
  };

  // Lesson form handlers
  const handleLessonInputChange = (e) => {
    const { name, value } = e.target;
    setLessonFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleLessonEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditLessonFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleLessonImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLessonSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setLessonImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeLessonImage = () => {
    setLessonSelectedImage(null);
    setLessonImagePreview(null);
  };
  const handleLessonEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditLessonSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditLessonImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeLessonEditImage = () => {
    setEditLessonSelectedImage(null);
    setEditLessonImagePreview(editingLesson?.image_url || null);
  };
  const openAddLesson = (chapter) => {
    setChapterForNewLesson(chapter);
    setLessonFormData({ name: '', description: '' });
    setLessonSelectedImage(null);
    setLessonImagePreview(null);
    onLessonAddOpen();
  };
  const handleLessonEditClick = (lesson) => {
    setEditingLesson(lesson);
    setEditLessonFormData({ name: lesson.name, description: lesson.description || '' });
    setEditLessonImagePreview(lesson.image_url || null);
    setEditLessonSelectedImage(null);
    onLessonEditOpen();
  };
  const handleLessonDeleteClick = (lesson) => {
    setDeletingLesson(lesson);
    onLessonDeleteOpen();
  };
  const resetLessonForm = () => {
    setLessonFormData({ name: '', description: '' });
    setLessonSelectedImage(null);
    setLessonImagePreview(null);
  };
  const resetLessonEditForm = () => {
    setEditLessonFormData({ name: '', description: '' });
    setEditLessonSelectedImage(null);
    setEditLessonImagePreview(editingLesson?.image_url || null);
  };
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!lessonFormData.name) {
      toast({ title: "خطأ", description: "يجب ملء اسم الدرس", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const result = await createLesson(lessonFormData);
    if (result.success) {
      onLessonAddClose();
      setChapterForNewLesson(null);
      resetLessonForm();
      fetchQuestionBankData();
    }
  };
  const handleLessonEditSubmit = async (e) => {
    e.preventDefault();
    if (!editLessonFormData.name) {
      toast({ title: "خطأ", description: "يجب ملء اسم الدرس", status: "error", duration: 3000, isClosable: true });
      return;
    }
    const result = await updateLesson(editLessonFormData);
    if (result.success) {
      onLessonEditClose();
      setEditingLesson(null);
      resetLessonEditForm();
      fetchQuestionBankData();
    }
  };
  const handleLessonDeleteConfirm = async () => {
    const result = await deleteLesson();
    if (result.success) {
      onLessonDeleteClose();
      setDeletingLesson(null);
      fetchQuestionBankData();
    }
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const activeSubject = filteredSubjects.find(s => s.id === activeSubjectId) || filteredSubjects[0];
  const activeChapter = activeSubject?.chapters?.find(c => c.id === activeChapterId) || activeSubject?.chapters?.[0];

  if (loading) {
    return (
      <Flex minH="100vh" bg={bgColor} justify="center" align="center">
        <VStack spacing={4} p={8} bg={cardBg} borderRadius="xl" shadow="sm">
          <Spinner size="xl" color="blue.500" thickness="3px" />
          <Text color="gray.700" fontWeight="600">جاري تحميل بنك الأسئلة...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" bg={bgColor} justify="center" align="center" p={4}>
        <Box textAlign="center" p={8} bg={cardBg} borderRadius="xl" shadow="sm" maxW="md">
          <Icon as={FiX} color="red.500" boxSize={16} mb={4} />
          <Heading size="md" color="gray.700" mb={2}>فشل تحميل البيانات</Heading>
          <Text color="gray.600">{error}</Text>
        </Box>
      </Flex>
    );
  }

  if (!questionBank) {
    return (
      <Flex minH="100vh" bg={pageBg} justify="center" align="center" p={4}>
        <Box textAlign="center" p={8} bg={cardBackground} borderRadius="2xl" boxShadow={cardShadow} borderWidth="2px" borderColor={cardBorder} maxW="md">
          <Box w="16" h="16" mx="auto" mb={4} borderRadius="full" bg={iconBg} display="flex" alignItems="center" justifyContent="center">
            <Icon as={FiBook} color={buttonPrimary} boxSize={8} />
          </Box>
          <Heading size="md" color={textPrimary} mb={2} fontFamily="'Cairo', 'Tajawal', sans-serif">بنك الأسئلة غير موجود</Heading>
          <Text color={textSecondary}>لم يتم العثور على بنك الأسئلة المطلوب.</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} w="full" overflowX="hidden">

      {/* Header */}
      <Box bgGradient="linear(to-r, blue.500, orange.500)" py={8} mb={6}>
        <Flex justify="space-between" align="center" maxW="1280px" mx="auto" px={{ base: 4, md: 8 }}>
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="white">
              {questionBank.name}
            </Heading>
            <Text color="whiteAlpha.900" fontSize="md">
              إدارة المواد والفصول والدروس
            </Text>
          </VStack>

          <Button
            leftIcon={<FiPlus />}
            bg="white"
            color="blue.500"
            onClick={onOpen}
            size="lg"
            _hover={{ bg: "whiteAlpha.900" }}
          >
            إضافة مادة
          </Button>
        </Flex>
      </Box>

      {/* Main Content */}
      <MotionBox
        flex={1}
        p={{ base: 4, md: 6, lg: 8 }}
        maxW="1280px"
        mx="auto"
        w="full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        position="relative"
        zIndex={1}
      >
        {/* Question Bank Info */}
        <MotionBox
          variants={itemVariants}
          bg={cardBackground}
          p={{ base: 5, md: 6, lg: 8 }}
          borderRadius="2xl"
          boxShadow={cardShadow}
          mb={6}
          borderWidth="1px"
          borderColor={cardBorder}
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top={-8} right={-8} w="32" h="32" bg={iconBg} borderRadius="full" opacity={0.6} />
          <Box position="absolute" bottom={-6} left={-6} w="24" h="24" bg={iconBg} borderRadius="full" opacity={0.5} />

          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} wrap="wrap" gap={6} position="relative" zIndex={1}>
            <Flex align="flex-start" gap={4} flex={1} minW={0}>
              <Box
                w="12"
                h="12"
                bg={buttonPrimary}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                boxShadow={iconShadow}
              >
                <Icon as={FiBookOpen} color="white" boxSize={6} />
              </Box>
              <Box minW={0}>
                <Heading size={{ base: "lg", md: "xl" }} mb={1} color={textPrimary} fontWeight="800" fontFamily="'Cairo', 'Tajawal', sans-serif" letterSpacing="-0.02em">
                  {questionBank.name}
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={textSecondary} lineHeight="1.6" fontWeight="500" fontFamily="'Cairo', 'Tajawal', sans-serif" noOfLines={2}>
                  {questionBank.description}
                </Text>
                <HStack spacing={3} mt={3} flexWrap="wrap" gap={2}>
                  <Badge bg={buttonPrimary} color="white" px={3} py={1.5} borderRadius="lg" fontWeight="bold" fontSize="xs" fontFamily="'Cairo', 'Tajawal', sans-serif">
                    {questionBank.grade_name}
                  </Badge>
                  <Badge
                    bg={questionBank.is_active ? badgeActiveBg : useColorModeValue("gray.200", "gray.600")}
                    color={questionBank.is_active ? badgeActiveColor : useColorModeValue("gray.600", "gray.400")}
                    px={3}
                    py={1.5}
                    borderRadius="lg"
                    fontWeight="bold"
                    fontSize="xs"
                  >
                    {questionBank.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                  <Badge bg={iconBg} color={textPrimary} px={3} py={1.5} borderRadius="lg" fontWeight="bold" fontSize="xs" borderWidth="1px" borderColor={iconBorder}>
                    {filteredSubjects.length} مادة
                  </Badge>
                </HStack>
              </Box>
            </Flex>

            {questionBank.image_url && (
              <Box position="relative" flexShrink={0}>
                <Image
                  src={questionBank.image_url}
                  alt={questionBank.name}
                  maxH="120px"
                  maxW="180px"
                  borderRadius="xl"
                  objectFit="cover"
                  boxShadow="lg"
                />
              </Box>
            )}
          </Flex>
        </MotionBox>

        {/* Search Bar */}
        <MotionBox variants={itemVariants} mb={6}>
          <InputGroup size="lg" maxW="md">
            <InputLeftElement pointerEvents="none" height="full" pl={5}>
              <Icon as={FiSearch} color={searchIconColor} boxSize={5} />
            </InputLeftElement>
            <Input
              placeholder="ابحث عن مادة بالاسم أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={inputBg}
              borderWidth="2px"
              borderColor={inputBorder}
              borderRadius="xl"
              py={6}
              pl={14}
              fontSize="md"
              fontWeight="500"
              color={textPrimary}
              _placeholder={{ color: textSecondary }}
              _hover={{ borderColor: inputHoverBorder, bg: cardBackground }}
              _focus={{ borderColor: inputFocusBorder, bg: cardBackground, boxShadow: focusRingShadow }}
              transition="all 0.2s"
            />
          </InputGroup>
        </MotionBox>

        {/* المواد الدراسية - Accordion */}
        <MotionBox variants={itemVariants}>
          <Flex align="center" gap={4} mb={5}>
            <Box w="12" h="12" bg={buttonPrimary} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" boxShadow={iconShadow}>
              <Icon as={FiBook} color="white" boxSize={6} />
            </Box>
            <Box>
              <Heading size="lg" color={textPrimary} fontWeight="800" fontFamily="'Cairo', 'Tajawal', sans-serif" letterSpacing="-0.02em" mb={0.5}>
                المواد الدراسية
              </Heading>
              <Text color={textSecondary} fontSize="sm" fontWeight="500" fontFamily="'Cairo', 'Tajawal', sans-serif">
                {filteredSubjects.length} مادة · فصول ودروس قابلة للطي
              </Text>
            </Box>
          </Flex>

          {filteredSubjects.length === 0 ? (
            <MotionBox
              textAlign="center"
              py={14}
              px={6}
              bg={cardBackground}
              borderRadius="2xl"
              boxShadow={cardShadow}
              borderWidth="1px"
              borderColor={cardBorder}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box w="24" h="24" bg={iconBg} borderRadius="full" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={5} borderWidth="2px" borderColor={iconBorder}>
                <Icon as={FiBook} color={searchIconColor} boxSize={10} />
              </Box>
              <Heading size="md" color={textPrimary} mb={2} fontWeight="700" fontFamily="'Cairo', 'Tajawal', sans-serif">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مواد دراسية بعد"}
              </Heading>
              <Text color={textSecondary} fontSize="md" mb={6} fontWeight="500" fontFamily="'Cairo', 'Tajawal', sans-serif">
                {searchTerm ? "جرب كلمات بحث أخرى" : "ابدأ بإضافة أول مادة"}
              </Text>
              {!searchTerm && (
                <MotionButton
                  bg={buttonPrimary}
                  color="white"
                  size="lg"
                  borderRadius="xl"
                  boxShadow={iconShadow}
                  onClick={onOpen}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  px={8}
                  py={6}
                  leftIcon={<FiPlus />}
                  fontWeight="bold"
                  fontFamily="'Cairo', 'Tajawal', sans-serif"
                  _hover={{ bg: buttonPrimaryHover, boxShadow: buttonHoverShadow }}
                >
                  إضافة أول مادة
                </MotionButton>
              )}
            </MotionBox>
          ) : (
            <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={{ base: 5, lg: 8 }} alignItems="start">
              {/* القائمة الجانبية للمواد */}
              <Box bg={cardBackground} p={{ base: 4, lg: 4 }} borderRadius="2xl" shadow={cardShadow} borderWidth="1px" borderColor={cardBorder} h={{ base: "auto", lg: "calc(100vh - 120px)" }} maxH={{ base: "400px", lg: "none" }} display="flex" flexDir="column" overflow="hidden" maxW="full">
                <Flex justify="space-between" align="center" px={2} mb={4} flexShrink={0}>
                  <Text fontWeight="800" color={textPrimary} fontSize="lg" fontFamily="'Cairo', 'Tajawal', sans-serif">
                    المواد الدراسية
                  </Text>
                  <Badge bg={iconBg} color={textPrimary} px={3} py={1} borderRadius="full" fontWeight="bold">
                    {filteredSubjects.length}
                  </Badge>
                </Flex>
                <VStack align="stretch" spacing={3} flex={1} overflowY="auto" pr={{ lg: 2 }} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: 'full' } }}>
                  {filteredSubjects.map(subject => {
                    const isActive = activeSubject?.id === subject.id;
                    return (
                      <Box
                        key={subject.id}
                        p={4}
                        bg={isActive ? useColorModeValue("blue.50", "blue.900/30") : "transparent"}
                        borderWidth="1px"
                        borderColor={isActive ? useColorModeValue("blue.200", "blue.700") : "transparent"}
                        borderRadius="xl"
                        cursor="pointer"
                        position="relative"
                        onClick={() => { setActiveSubjectId(subject.id); setActiveChapterId(subject.chapters?.[0]?.id || null); }}
                        transition="all 0.2s"
                        _hover={{
                          bg: isActive ? useColorModeValue("blue.50", "blue.900/30") : useColorModeValue("gray.50", "gray.700/50"),
                          transform: isActive ? "none" : "translateX(-4px)"
                        }}
                      >
                        {isActive && (
                          <Box position="absolute" right="-1px" top="20%" bottom="20%" width="4px" bg="blue.500" borderRadius="full" />
                        )}
                        <Flex gap={4} align="center">
                          <Avatar src={subject.image_url || undefined} name={subject.name} size="md" bg="blue.500" color="white" shadow="sm" />
                          <Box flex={1}>
                            <Text fontWeight="bold" fontSize="md" color={isActive ? "blue.600" : textPrimary} noOfLines={1} mb={0.5} fontFamily="'Cairo', 'Tajawal', sans-serif">
                              {subject.name}
                            </Text>
                            <HStack spacing={2} fontSize="xs" color={textSecondary}>
                              <Flex align="center" gap={1}><Icon as={FiFolder} /> <Text>{subject.chapters?.length || 0}</Text></Flex>
                              <Text>•</Text>
                              <Flex align="center" gap={1}><Icon as={FiFileText} /> <Text>{(subject.chapters || []).reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)}</Text></Flex>
                            </HStack>
                          </Box>
                          <HStack spacing={1}>
                            <IconButton aria-label="تعديل" icon={<FiEdit />} size="sm" variant="ghost" colorScheme="orange" onClick={(e) => { e.stopPropagation(); handleEditClick(subject); }} />
                            <IconButton aria-label="حذف" icon={<FiTrash />} size="sm" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); handleDeleteClick(subject); }} />
                          </HStack>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>

              {/* منطقة محتوى المادة (الفصول والدروس) */}
              {activeSubject && (
                <Box bg={cardBackground} p={{ base: 5, md: 8 }} borderRadius="2xl" borderWidth="1px" borderColor={cardBorder} shadow="sm" h={{ base: "auto", lg: "calc(100vh - 120px)" }} minH={{ base: "500px", lg: "auto" }} display="flex" flexDir="column" maxW="full" overflow="hidden">
                  {/* Header: Subject Details */}
                  <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={8} pb={6} borderBottomWidth="1px" borderColor={cardBorder} gap={4} flexShrink={0} maxW="full">
                    <HStack spacing={5}>
                      <Avatar src={activeSubject.image_url || undefined} name={activeSubject.name} size="xl" bg="blue.500" shadow="md" />
                      <VStack align="start" spacing={1}>
                        <Heading size="lg" color={textPrimary} fontFamily="'Cairo', 'Tajawal', sans-serif">{activeSubject.name}</Heading>
                        <Text fontSize="sm" color={textSecondary} maxW="2xl" lineHeight="1.6">{activeSubject.description || "لا يوجد وصف لهذه المادة حتى الآن."}</Text>
                      </VStack>
                    </HStack>
                    <Link to={`/supject/${activeSubject.id}`}>
                      <Button colorScheme="blue" variant="solid" rightIcon={<FiArrowRight />} size="md" borderRadius="xl" shadow="sm">
                        عرض المادة والتفاصيل
                      </Button>
                    </Link>
                  </Flex>

                  <Flex justify="space-between" align="center" mb={6} flexShrink={0}>
                    <Heading size="md" color={textPrimary} fontFamily="'Cairo', 'Tajawal', sans-serif">محتوى المادة الدراسي</Heading>
                    <Button size="sm" leftIcon={<FiPlus />} colorScheme="blue" variant="outline" borderRadius="lg" onClick={() => openAddChapter(activeSubject)}>
                      إضافة فصل جديد
                    </Button>
                  </Flex>

                  {activeSubject.chapters && activeSubject.chapters.length > 0 ? (
                    <Box flex={1} display="flex" flexDir="column" overflow="hidden">
                      {/* Wrapper for Chapters */}
                      <Box mb={6} position="relative" flexShrink={0} maxW="full">
                        <Flex gap={3} wrap="wrap" pb={2}>
                          {activeSubject.chapters.map(chapter => {
                            const isChActive = activeChapter?.id === chapter.id;
                            return (
                              <Button
                                key={chapter.id}
                                variant={isChActive ? "solid" : "ghost"}
                                colorScheme={isChActive ? "blue" : "gray"}
                                bg={isChActive ? "blue.500" : useColorModeValue("gray.50", "gray.700")}
                                color={isChActive ? "white" : textSecondary}
                                onClick={() => setActiveChapterId(chapter.id)}
                                flexShrink={0}
                                borderRadius="xl"
                                px={6}
                                py={5}
                                size="md"
                                fontWeight="bold"
                                fontFamily="'Cairo', 'Tajawal', sans-serif"
                                shadow={isChActive ? "md" : "none"}
                                _hover={{
                                  bg: isChActive ? "blue.600" : useColorModeValue("gray.200", "gray.600"),
                                  transform: "translateY(-2px)"
                                }}
                                transition="all 0.2s"
                              >
                                {chapter.name}
                              </Button>
                            );
                          })}
                        </Flex>
                      </Box>

                      {/* Active Chapter Details & Lessons */}
                      {activeChapter && (
                        <Box p={{ base: 5, md: 7 }} bg={useColorModeValue("gray.50", "gray.800/50")} borderRadius="2xl" borderWidth="1px" borderColor={cardBorder} flex={1} overflowY="auto" sx={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: 'full' } }}>
                          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} mb={6} gap={4}>
                            <Box>
                              <Text fontWeight="800" color={textPrimary} fontSize="xl" fontFamily="'Cairo', 'Tajawal', sans-serif" mb={1}>{activeChapter.name}</Text>
                              {activeChapter.description && <Text fontSize="sm" color={textSecondary}>{activeChapter.description}</Text>}
                            </Box>
                            <HStack spacing={2}>
                              <IconButton aria-label="تعديل" icon={<FiEdit />} size="sm" colorScheme="orange" variant="outline" bg={cardBackground} onClick={() => handleChapterEditClick(activeChapter)} />
                              <IconButton aria-label="حذف" icon={<FiTrash />} size="sm" colorScheme="red" variant="outline" bg={cardBackground} onClick={() => handleChapterDeleteClick(activeChapter)} />
                              <Button size="sm" colorScheme="blue" leftIcon={<FiPlus />} onClick={() => openAddLesson(activeChapter)} shadow="sm">إضافة درس</Button>
                            </HStack>
                          </Flex>

                          {/* Lessons Grid */}
                          {activeChapter.lessons && activeChapter.lessons.length > 0 ? (
                            <Grid templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }} gap={5}>
                              {activeChapter.lessons.map(lesson => (
                                <GridItem key={lesson.id}>
                                  <Flex
                                    p={5}
                                    bg={cardBackground}
                                    borderRadius="xl"
                                    borderWidth="1px"
                                    borderColor={cardBorder}
                                    align="center"
                                    gap={4}
                                    shadow="sm"
                                    position="relative"
                                    _hover={{ shadow: "md", borderColor: "blue.400", transform: "translateY(-3px)" }}
                                    transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                                  >
                                    <Box p={3} bg={useColorModeValue("orange.50", "orange.900/30")} color="orange.500" borderRadius="xl" borderWidth="1px" borderColor={useColorModeValue("orange.100", "orange.800")}>
                                      <Icon as={FiFileText} boxSize={5} />
                                    </Box>
                                    <Box flex={1} overflow="hidden">
                                      <Text fontWeight="bold" fontSize="md" color={textPrimary} noOfLines={1} mb={0.5} fontFamily="'Cairo', 'Tajawal', sans-serif">{lesson.name}</Text>
                                      {lesson.description && <Text fontSize="xs" color={textSecondary} noOfLines={1}>{lesson.description}</Text>}
                                    </Box>
                                    <HStack spacing={1}>
                                      <IconButton aria-label="تعديل" icon={<FiEdit />} size="sm" variant="ghost" colorScheme="orange" onClick={() => handleLessonEditClick(lesson)} />
                                      <IconButton aria-label="حذف" icon={<FiTrash />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleLessonDeleteClick(lesson)} />
                                      <Link to={`/lesson/${lesson.id}`}>
                                        <IconButton aria-label="تفاصيل" icon={<FiArrowRight />} size="sm" variant="ghost" bg={useColorModeValue("blue.50", "blue.900/30")} color="blue.500" _hover={{ bg: "blue.500", color: "white" }} />
                                      </Link>
                                    </HStack>
                                  </Flex>
                                </GridItem>
                              ))}
                            </Grid>
                          ) : (
                            <Flex direction="column" align="center" justify="center" p={10} bg={cardBackground} borderRadius="xl" borderStyle="dashed" borderWidth="2px" borderColor={cardBorder}>
                              <Box p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="full" mb={4}>
                                <Icon as={FiFileText} boxSize={8} color="gray.400" />
                              </Box>
                              <Text color="gray.500" fontSize="md" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">لا توجد دروس في هذا الفصل بعد</Text>
                              <Text color="gray.400" fontSize="sm" mt={2}>قم بإضافة أول درس للبدء في تعبئة المحتوى.</Text>
                            </Flex>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Flex direction="column" align="center" justify="center" py={16} bg={useColorModeValue("gray.50", "gray.700/30")} borderRadius="xl" borderStyle="dashed" borderWidth="2px" borderColor={cardBorder}>
                      <Box p={4} bg={useColorModeValue("gray.100", "gray.700")} borderRadius="full" mb={4}>
                        <Icon as={FiFolder} boxSize={10} color="gray.400" />
                      </Box>
                      <Text color="gray.500" fontWeight="bold" fontSize="lg" fontFamily="'Cairo', 'Tajawal', sans-serif">لم يتم العثور على أي فصول</Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>ابدأ بإضافة فصول لتقسيم محتوى المادة بشكل مناسب.</Text>
                    </Flex>
                  )}
                </Box>
              )}
            </Grid>
          )}
        </MotionBox>
      </MotionBox>
      {/* Add Subject Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderRadius="2xl" borderWidth="1px" borderColor={modalBorder} boxShadow={cardShadow}>
          <ModalHeader bg={modalHeaderBg} color="white" borderRadius="2xl 2xl 0 0" py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg="whiteAlpha.300" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <FiPlus color="white" size={20} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إضافة مادة جديدة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />

          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold">اسم المادة</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المادة"
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">وصف المادة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف المادة"
                    rows={4}
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">صورة المادة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        leftIcon={<FiUpload />}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        border="2px solid"
                        borderColor={inputHoverBorder}
                        color={useColorModeValue("blue.500", "blue.400")}
                        _hover={{ bg: iconBg, borderColor: inputFocusBorder }}
                        borderRadius="10px"
                        fontWeight="bold"
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
                          icon={<FiX />}
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

          <ModalFooter bg={modalFooterBg} borderRadius="0 0 2xl 2xl" py={5}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetForm} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إعادة تعيين
              </Button>
              <Button variant="ghost" onClick={onClose} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إلغاء
              </Button>
              <Button bg={buttonPrimary} color="white" onClick={handleSubmit} isLoading={submitLoading} loadingText="جاري الإنشاء..." leftIcon={<FiPlus />} _hover={{ bg: buttonPrimaryHover }} boxShadow={iconShadow} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إضافة المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderRadius="2xl" borderWidth="1px" borderColor={modalBorder} boxShadow={cardShadow}>
          <ModalHeader bg={buttonSecondary} color="white" borderRadius="2xl 2xl 0 0" py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg="whiteAlpha.300" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <FiEdit color="white" size={20} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">تعديل المادة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />

          <ModalBody>
            <form onSubmit={handleEditSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold">اسم المادة</FormLabel>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="أدخل اسم المادة"
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">وصف المادة (اختياري)</FormLabel>
                  <Textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="أدخل وصف المادة"
                    rows={4}
                    size="lg"
                    border="2px solid"
                    borderColor={inputBorder}
                    _hover={{ borderColor: inputHoverBorder }}
                    _focus={{ borderColor: inputFocusBorder, boxShadow: `0 0 0 1px ${useColorModeValue("#4299e1", "#63b3ed")}` }}
                    borderRadius="10px"
                    bg={useColorModeValue("white", "gray.700")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold">صورة المادة (اختياري)</FormLabel>
                  <VStack spacing={4} align="stretch">
                    {!imagePreview ? (
                      <Button
                        as="label"
                        htmlFor="edit-image-upload"
                        leftIcon={<FiUpload />}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        border="2px solid"
                        borderColor={inputHoverBorder}
                        color={useColorModeValue("blue.500", "blue.400")}
                        _hover={{ bg: iconBg, borderColor: inputFocusBorder }}
                        borderRadius="10px"
                        fontWeight="bold"
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
                          icon={<FiX />}
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

          <ModalFooter bg={modalFooterBg} borderRadius="0 0 2xl 2xl" py={5}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetEditForm} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إعادة تعيين
              </Button>
              <Button variant="ghost" onClick={onEditClose} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إلغاء
              </Button>
              <Button bg={buttonSecondary} color="white" onClick={handleEditSubmit} isLoading={editLoading} loadingText="جاري التحديث..." leftIcon={<FiEdit />} _hover={{ bg: buttonSecondaryHover }} boxShadow={iconShadow} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                تحديث المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBackground} borderRadius="2xl" borderWidth="1px" borderColor={cardBorder} boxShadow={cardShadow}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg={useColorModeValue("red.50", "red.900")} borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiTrash} color="red.500" boxSize={5} />
              </Box>
              <Text fontFamily="'Cairo', 'Tajawal', sans-serif" fontWeight="bold" color={textPrimary}>تأكيد الحذف</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch" textAlign="center">
              <Box w="16" h="16" mx="auto" borderRadius="full" bg={useColorModeValue("red.50", "red.900")} display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiBook} color="red.500" boxSize={8} />
              </Box>
              <Text fontSize="md" fontWeight="600" color={textPrimary} fontFamily="'Cairo', 'Tajawal', sans-serif">
                هل أنت متأكد من حذف المادة؟
              </Text>
              <Text fontSize="sm" color={textSecondary} fontFamily="'Cairo', 'Tajawal', sans-serif">
                "{deletingSubject?.name}"
              </Text>
              <Text fontSize="xs" color={textSecondary}>
                هذا الإجراء لا يمكن التراجع عنه
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onDeleteClose} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} isLoading={deleteLoading} loadingText="جاري الحذف..." leftIcon={<FiTrash />} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                حذف المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal isOpen={isChapterAddOpen} onClose={onChapterAddClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderRadius="2xl" borderWidth="1px" borderColor={modalBorder} boxShadow={cardShadow}>
          <ModalHeader bg={modalHeaderBg} color="white" borderRadius="2xl 2xl 0 0" py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg="whiteAlpha.300" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiFolder} color="white" boxSize={5} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إضافة فصل جديد {subjectForNewChapter && `(${subjectForNewChapter.name})`}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <form onSubmit={handleChapterSubmit} id="chapter-add-form">
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">اسم الفصل</FormLabel>
                  <Input name="name" value={chapterFormData.name} onChange={handleChapterInputChange} placeholder="أدخل اسم الفصل" size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">وصف الفصل (اختياري)</FormLabel>
                  <Textarea name="description" value={chapterFormData.description} onChange={handleChapterInputChange} placeholder="أدخل وصف الفصل" rows={3} size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">صورة الفصل (اختياري)</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {!chapterImagePreview ? (
                      <Button as="label" htmlFor="chapter-image-upload" leftIcon={<FiUpload />} variant="outline" size="md" cursor="pointer" borderWidth="2px" borderColor={inputHoverBorder} color={searchIconColor} _hover={{ bg: iconBg, borderColor: inputFocusBorder }} borderRadius="lg" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                        اختر صورة
                      </Button>
                    ) : (
                      <Box position="relative" display="inline-block">
                        <Image src={chapterImagePreview} alt="معاينة" maxH="160px" borderRadius="md" />
                        <IconButton icon={<FiX />} position="absolute" top={2} right={2} colorScheme="red" size="sm" onClick={removeChapterImage} aria-label="إزالة الصورة" />
                      </Box>
                    )}
                    <Input id="chapter-image-upload" type="file" accept="image/*" onChange={handleChapterImageChange} display="none" />
                  </VStack>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter bg={modalFooterBg} borderRadius="0 0 2xl 2xl" py={5}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetChapterForm} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إعادة تعيين</Button>
              <Button variant="ghost" onClick={onChapterAddClose} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إلغاء</Button>
              <Button type="submit" form="chapter-add-form" bg={buttonPrimary} color="white" onClick={handleChapterSubmit} isLoading={chapterSubmitLoading} loadingText="جاري الإنشاء..." leftIcon={<FiPlus />} _hover={{ bg: buttonPrimaryHover }} boxShadow={iconShadow} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إضافة الفصل
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal isOpen={isChapterEditOpen} onClose={onChapterEditClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderRadius="2xl" borderWidth="1px" borderColor={modalBorder} boxShadow={cardShadow}>
          <ModalHeader bg={buttonSecondary} color="white" borderRadius="2xl 2xl 0 0" py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg="whiteAlpha.300" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiEdit} color="white" boxSize={5} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">تعديل الفصل</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <form onSubmit={handleChapterEditSubmit} id="chapter-edit-form">
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">اسم الفصل</FormLabel>
                  <Input name="name" value={editChapterFormData.name} onChange={handleChapterEditInputChange} placeholder="أدخل اسم الفصل" size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">وصف الفصل (اختياري)</FormLabel>
                  <Textarea name="description" value={editChapterFormData.description} onChange={handleChapterEditInputChange} placeholder="أدخل وصف الفصل" rows={3} size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">صورة الفصل (اختياري)</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {!editChapterImagePreview ? (
                      <Button as="label" htmlFor="chapter-edit-image-upload" leftIcon={<FiUpload />} variant="outline" size="md" cursor="pointer" borderWidth="2px" borderColor={inputHoverBorder} color={searchIconColor} _hover={{ bg: iconBg, borderColor: inputFocusBorder }} borderRadius="lg" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                        اختر صورة
                      </Button>
                    ) : (
                      <Box position="relative" display="inline-block">
                        <Image src={editChapterImagePreview} alt="معاينة" maxH="160px" borderRadius="md" />
                        <IconButton icon={<FiX />} position="absolute" top={2} right={2} colorScheme="red" size="sm" onClick={removeChapterEditImage} aria-label="إزالة الصورة" />
                      </Box>
                    )}
                    <Input id="chapter-edit-image-upload" type="file" accept="image/*" onChange={handleChapterEditImageChange} display="none" />
                  </VStack>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter bg={modalFooterBg} borderRadius="0 0 2xl 2xl" py={5}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetChapterEditForm} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إعادة تعيين</Button>
              <Button variant="ghost" onClick={onChapterEditClose} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إلغاء</Button>
              <Button type="submit" form="chapter-edit-form" bg={buttonSecondary} color="white" onClick={handleChapterEditSubmit} isLoading={chapterEditLoading} loadingText="جاري التحديث..." leftIcon={<FiEdit />} _hover={{ bg: buttonSecondaryHover }} boxShadow={iconShadow} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                تحديث الفصل
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Chapter Modal */}
      <Modal isOpen={isChapterDeleteOpen} onClose={onChapterDeleteClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBackground} borderRadius="2xl" borderWidth="1px" borderColor={cardBorder} boxShadow={cardShadow}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg={useColorModeValue("red.50", "red.900")} borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiTrash} color="red.500" boxSize={5} />
              </Box>
              <Text fontFamily="'Cairo', 'Tajawal', sans-serif" fontWeight="bold" color={textPrimary}>تأكيد حذف الفصل</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch" textAlign="center">
              <Box w="16" h="16" mx="auto" borderRadius="full" bg={useColorModeValue("red.50", "red.900")} display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiFolder} color="red.500" boxSize={8} />
              </Box>
              <Text fontSize="md" fontWeight="600" color={textPrimary} fontFamily="'Cairo', 'Tajawal', sans-serif">
                هل أنت متأكد من حذف الفصل؟
              </Text>
              <Text fontSize="sm" color={textSecondary} fontFamily="'Cairo', 'Tajawal', sans-serif">"{deletingChapter?.name}"</Text>
              <Text fontSize="xs" color={textSecondary}>هذا الإجراء لا يمكن التراجع عنه</Text>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onChapterDeleteClose} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إلغاء</Button>
              <Button colorScheme="red" onClick={handleChapterDeleteConfirm} isLoading={chapterDeleteLoading} loadingText="جاري الحذف..." leftIcon={<FiTrash />} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                حذف الفصل
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={isLessonAddOpen} onClose={onLessonAddClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderRadius="2xl" borderWidth="1px" borderColor={modalBorder} boxShadow={cardShadow}>
          <ModalHeader bg={modalHeaderBg} color="white" borderRadius="2xl 2xl 0 0" py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg="whiteAlpha.300" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiFileText} color="white" boxSize={5} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إضافة درس جديد {chapterForNewLesson && `(${chapterForNewLesson.name})`}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <form onSubmit={handleLessonSubmit} id="lesson-add-form">
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">اسم الدرس</FormLabel>
                  <Input name="name" value={lessonFormData.name} onChange={handleLessonInputChange} placeholder="أدخل اسم الدرس" size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">وصف الدرس (اختياري)</FormLabel>
                  <Textarea name="description" value={lessonFormData.description} onChange={handleLessonInputChange} placeholder="أدخل وصف الدرس" rows={3} size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">صورة الدرس (اختياري)</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {!lessonImagePreview ? (
                      <Button as="label" htmlFor="lesson-image-upload" leftIcon={<FiUpload />} variant="outline" size="md" cursor="pointer" borderWidth="2px" borderColor={inputHoverBorder} color={searchIconColor} _hover={{ bg: iconBg, borderColor: inputFocusBorder }} borderRadius="lg" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                        اختر صورة
                      </Button>
                    ) : (
                      <Box position="relative" display="inline-block">
                        <Image src={lessonImagePreview} alt="معاينة" maxH="160px" borderRadius="md" />
                        <IconButton icon={<FiX />} position="absolute" top={2} right={2} colorScheme="red" size="sm" onClick={removeLessonImage} aria-label="إزالة الصورة" />
                      </Box>
                    )}
                    <Input id="lesson-image-upload" type="file" accept="image/*" onChange={handleLessonImageChange} display="none" />
                  </VStack>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter bg={modalFooterBg} borderRadius="0 0 2xl 2xl" py={5}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetLessonForm} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إعادة تعيين</Button>
              <Button variant="ghost" onClick={onLessonAddClose} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إلغاء</Button>
              <Button type="submit" form="lesson-add-form" bg={buttonPrimary} color="white" onClick={handleLessonSubmit} isLoading={lessonSubmitLoading} loadingText="جاري الإنشاء..." leftIcon={<FiPlus />} _hover={{ bg: buttonPrimaryHover }} boxShadow={iconShadow} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                إضافة الدرس
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal isOpen={isLessonEditOpen} onClose={onLessonEditClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderRadius="2xl" borderWidth="1px" borderColor={modalBorder} boxShadow={cardShadow}>
          <ModalHeader bg={buttonSecondary} color="white" borderRadius="2xl 2xl 0 0" py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg="whiteAlpha.300" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiEdit} color="white" boxSize={5} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">تعديل الدرس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: "whiteAlpha.200" }} />
          <ModalBody py={6}>
            <form onSubmit={handleLessonEditSubmit} id="lesson-edit-form">
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">اسم الدرس</FormLabel>
                  <Input name="name" value={editLessonFormData.name} onChange={handleLessonEditInputChange} placeholder="أدخل اسم الدرس" size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">وصف الدرس (اختياري)</FormLabel>
                  <Textarea name="description" value={editLessonFormData.description} onChange={handleLessonEditInputChange} placeholder="أدخل وصف الدرس" rows={3} size="lg" borderWidth="2px" borderColor={inputBorder} _hover={{ borderColor: inputHoverBorder }} _focus={{ borderColor: inputFocusBorder, boxShadow: focusRingShadow }} borderRadius="lg" bg={useColorModeValue("white", "gray.700")} fontFamily="'Cairo', 'Tajawal', sans-serif" />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">صورة الدرس (اختياري)</FormLabel>
                  <VStack align="stretch" spacing={3}>
                    {!editLessonImagePreview ? (
                      <Button as="label" htmlFor="lesson-edit-image-upload" leftIcon={<FiUpload />} variant="outline" size="md" cursor="pointer" borderWidth="2px" borderColor={inputHoverBorder} color={searchIconColor} _hover={{ bg: iconBg, borderColor: inputFocusBorder }} borderRadius="lg" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                        اختر صورة
                      </Button>
                    ) : (
                      <Box position="relative" display="inline-block">
                        <Image src={editLessonImagePreview} alt="معاينة" maxH="160px" borderRadius="md" />
                        <IconButton icon={<FiX />} position="absolute" top={2} right={2} colorScheme="red" size="sm" onClick={removeLessonEditImage} aria-label="إزالة الصورة" />
                      </Box>
                    )}
                    <Input id="lesson-edit-image-upload" type="file" accept="image/*" onChange={handleLessonEditImageChange} display="none" />
                  </VStack>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter bg={modalFooterBg} borderRadius="0 0 2xl 2xl" py={5}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={resetLessonEditForm} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إعادة تعيين</Button>
              <Button variant="ghost" onClick={onLessonEditClose} color={textPrimary} _hover={{ bg: iconBg }} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إلغاء</Button>
              <Button type="submit" form="lesson-edit-form" bg={buttonSecondary} color="white" onClick={handleLessonEditSubmit} isLoading={lessonEditLoading} loadingText="جاري التحديث..." leftIcon={<FiEdit />} _hover={{ bg: buttonSecondaryHover }} boxShadow={iconShadow} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                تحديث الدرس
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Lesson Modal */}
      <Modal isOpen={isLessonDeleteOpen} onClose={onLessonDeleteClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBackground} borderRadius="2xl" borderWidth="1px" borderColor={cardBorder} boxShadow={cardShadow}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} py={5}>
            <HStack spacing={3}>
              <Box w="10" h="10" bg={useColorModeValue("red.50", "red.900")} borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiTrash} color="red.500" boxSize={5} />
              </Box>
              <Text fontFamily="'Cairo', 'Tajawal', sans-serif" fontWeight="bold" color={textPrimary}>تأكيد حذف الدرس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch" textAlign="center">
              <Box w="16" h="16" mx="auto" borderRadius="full" bg={useColorModeValue("red.50", "red.900")} display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiFileText} color="red.500" boxSize={8} />
              </Box>
              <Text fontSize="md" fontWeight="600" color={textPrimary} fontFamily="'Cairo', 'Tajawal', sans-serif">
                هل أنت متأكد من حذف الدرس؟
              </Text>
              <Text fontSize="sm" color={textSecondary} fontFamily="'Cairo', 'Tajawal', sans-serif">"{deletingLesson?.name}"</Text>
              <Text fontSize="xs" color={textSecondary}>هذا الإجراء لا يمكن التراجع عنه</Text>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} py={4}>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onLessonDeleteClose} fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">إلغاء</Button>
              <Button colorScheme="red" onClick={handleLessonDeleteConfirm} isLoading={lessonDeleteLoading} loadingText="جاري الحذف..." leftIcon={<FiTrash />} borderRadius="xl" fontWeight="bold" fontFamily="'Cairo', 'Tajawal', sans-serif">
                حذف الدرس
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionBank;