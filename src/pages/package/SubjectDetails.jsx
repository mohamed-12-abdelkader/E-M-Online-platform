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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [addingPermission, setAddingPermission] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    price: '',
    is_visible: true,
    avatar: null,
  });
  const [courseImagePreview, setCourseImagePreview] = useState(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const {
    isOpen: isCourseModalOpen,
    onOpen: onCourseModalOpen,
    onClose: onCourseModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditCourseModalOpen,
    onOpen: onEditCourseModalOpen,
    onClose: onEditCourseModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteCourseOpen,
    onOpen: onDeleteCourseOpen,
    onClose: onDeleteCourseClose,
  } = useDisclosure();
  
  const cancelRef = React.useRef();
  const cancelCourseRef = React.useRef();
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

  // جلب الكورسات
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/packages/subjects/${id}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.error || 'فشل في جلب قائمة الكورسات',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  // إضافة كورس جديد
  const handleAddCourse = async () => {
    if (!courseFormData.title.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال عنوان الكورس',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      setAddingCourse(true);
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', courseFormData.title);
      if (courseFormData.description) {
        formDataToSend.append('description', courseFormData.description);
      }
      if (courseFormData.price) {
        formDataToSend.append('price', courseFormData.price);
      }
      if (courseFormData.avatar) {
        formDataToSend.append('avatar', courseFormData.avatar);
      }
      formDataToSend.append('is_visible', courseFormData.is_visible);

      const response = await baseUrl.post(
        `/api/packages/subjects/${id}/courses`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.course) {
        await fetchCourses();
        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: `تم إنشاء الكورس "${courseFormData.title}" بنجاح`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        onCourseModalClose();
        setCourseFormData({
          title: '',
          description: '',
          price: '',
          is_visible: true,
          avatar: null,
        });
        setCourseImagePreview(null);
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إضافة الكورس',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setAddingCourse(false);
    }
  };

  // فتح modal التعديل
  const openEditCourseModal = (course) => {
    setSelectedCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description || '',
      price: course.price || '',
      is_visible: course.is_visible !== undefined ? course.is_visible : true,
      avatar: null,
    });
    setCourseImagePreview(course.avatar || null);
    onEditCourseModalOpen();
  };

  // تعديل كورس
  const handleEditCourse = async () => {
    if (!courseFormData.title.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال عنوان الكورس',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      setEditingCourse(true);
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', courseFormData.title);
      if (courseFormData.description) {
        formDataToSend.append('description', courseFormData.description);
      }
      if (courseFormData.price) {
        formDataToSend.append('price', courseFormData.price);
      }
      if (courseFormData.avatar) {
        formDataToSend.append('avatar', courseFormData.avatar);
      }
      formDataToSend.append('is_visible', courseFormData.is_visible);

      const response = await baseUrl.put(
        `/api/packages/subjects/${id}/courses/${selectedCourse.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.course) {
        await fetchCourses();
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: `تم تحديث الكورس "${courseFormData.title}" بنجاح`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        onEditCourseModalClose();
        setSelectedCourse(null);
        setCourseFormData({
          title: '',
          description: '',
          price: '',
          is_visible: true,
          avatar: null,
        });
        setCourseImagePreview(null);
      }
    } catch (error) {
      console.error('Error editing course:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث الكورس',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setEditingCourse(false);
    }
  };

  // حذف كورس
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      setDeletingCourse(true);
      const token = localStorage.getItem('token');

      await baseUrl.delete(
        `/api/packages/subjects/${id}/courses/${selectedCourse.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast({
        title: 'تم الحذف بنجاح! ✅',
        description: 'تم حذف الكورس بنجاح',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      await fetchCourses();
      onDeleteCourseClose();
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف الكورس',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setDeletingCourse(false);
    }
  };

  // فتح حوار الحذف
  const openDeleteCourseDialog = (course) => {
    setSelectedCourse(course);
    onDeleteCourseOpen();
  };

  // معالجة تغيير صورة الكورس
  const handleCourseImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setCourseImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
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
      fetchCourses();
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
    <Box minH="100vh" bg={bgGradient} pt="80px" pb={12} px={4}>
      <Container maxW="6xl">
        {/* Back Button */}
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          colorScheme="blue"
          mb={6}
          onClick={() => navigate(`/package/${subjectData.package_id}`)}
          _hover={{ bg: blueLight }}
        >
          العودة للباقة
        </Button>

        {/* Header Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" mb={8} overflow="hidden">
          <Box
            bg={blueGradient}
            p={8}
            color="white"
            position="relative"
            overflow="hidden"
          >
            <HStack spacing={4} mb={4}>
              <Box
                bg="whiteAlpha.200"
                borderRadius="full"
                p={3}
                backdropFilter="blur(10px)"
              >
                <Icon as={FiBookOpen} boxSize={8} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="2xl" fontWeight="bold">
                  {subjectData.name}
                </Heading>
                <Text fontSize="lg" color="whiteAlpha.900">
                  تفاصيل المادة الدراسية
                </Text>
              </VStack>
            </HStack>
          </Box>

          <CardBody p={8}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Subject Image */}
              <Box>
                <Image
                  src={subjectData.image || 'https://via.placeholder.com/500x300?text=صورة+المادة'}
                  alt={subjectData.name}
                  borderRadius="xl"
                  objectFit="cover"
                  w="100%"
                  h="300px"
                  fallbackSrc="https://via.placeholder.com/500x300?text=صورة+المادة"
                  boxShadow="lg"
                />
              </Box>

              {/* Subject Info */}
              <VStack align="stretch" spacing={6}>
                {/* Package Info */}
                <Card bg={blueLight} border="2px solid" borderColor={primaryColor} borderRadius="xl">
                  <CardBody p={6}>
                    <HStack spacing={3} mb={4}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={3}
                        color="white"
                      >
                        <Icon as={FiPackage} boxSize={6} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color={subTextColor}>
                          الباقة
                        </Text>
                        <Heading size="lg" color={primaryColor}>
                          {subjectData.package_name}
                        </Heading>
                      </VStack>
                    </HStack>
                    <HStack spacing={4}>
                      <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                        السعر: {subjectData.package_price} جنيه
                      </Badge>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Grade */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
                  <CardBody p={6}>
                    <HStack spacing={3}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={3}
                        color="white"
                      >
                        <Icon as={FiBookOpen} boxSize={6} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color={subTextColor}>
                          الصف الدراسي
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>
                          {subjectData.grade_name}
                        </Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Created Date */}
                <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
                  <CardBody p={6}>
                    <HStack spacing={3}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={3}
                        color="white"
                      >
                        <Icon as={FiCalendar} boxSize={6} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color={subTextColor}>
                          تاريخ الإنشاء
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>
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
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" mb={8}>
            <Box
              bg={blueGradient}
              p={6}
              color="white"
              borderTopRadius="2xl"
            >
              <HStack spacing={3} justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiUser} boxSize={6} />
                  <Heading size="lg" fontWeight="bold">
                    إدارة الصلاحيات
                  </Heading>
                  <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full">
                    {permissions.length} مدرس
                  </Badge>
                </HStack>
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  onClick={onOpen}
                >
                  إضافة مدرس
                </Button>
              </HStack>
            </Box>

            <CardBody p={8}>
              {permissionsLoading ? (
                <Center py={8}>
                  <Spinner size="lg" color={primaryColor} />
                </Center>
              ) : permissions.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {permissions.map((permission) => (
                    <Card
                      key={permission.id}
                      bg={blueLight}
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius="xl"
                      _hover={{
                        transform: 'translateY(-4px)',
                        shadow: 'lg',
                      }}
                      transition="all 0.3s ease"
                    >
                      <CardBody p={6}>
                        <VStack spacing={4} align="stretch">
                          {/* Teacher Avatar & Name */}
                          <HStack spacing={4}>
                            <Avatar
                              size="lg"
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
                              <Text fontWeight="bold" color={textColor} fontSize="md">
                                {permission.teacher_name}
                              </Text>
                              <Text fontSize="sm" color={subTextColor}>
                                {permission.teacher_email}
                              </Text>
                            </VStack>
                          </HStack>

                          <Divider />

                          {/* Permission Info */}
                          <VStack spacing={2} align="stretch" fontSize="sm">
                            <HStack justify="space-between">
                              <Text color={subTextColor}>منح بواسطة:</Text>
                              <Text fontWeight="bold" color={textColor}>
                                {permission.granted_by_name || 'Admin'}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color={subTextColor}>تاريخ المنح:</Text>
                              <Text fontWeight="bold" color={textColor} fontSize="xs">
                                {new Date(permission.granted_at).toLocaleDateString('ar-EG')}
                              </Text>
                            </HStack>
                          </VStack>

                          {/* Delete Button */}
                          <Button
                            leftIcon={<Icon as={FiTrash2} />}
                            colorScheme="red"
                            size="sm"
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

        {/* Courses Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" mb={8}>
          <Box
            bg={blueGradient}
            p={6}
            color="white"
            borderTopRadius="2xl"
          >
            <HStack spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Icon as={FiBookOpen} boxSize={6} />
                <Heading size="lg" fontWeight="bold">
                  الكورسات
                </Heading>
                <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full">
                  {courses.length} كورس
                </Badge>
              </HStack>
              {(isAdmin || isTeacher) && (
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  onClick={onCourseModalOpen}
                >
                  إضافة كورس
                </Button>
              )}
            </HStack>
          </Box>

          <CardBody p={8}>
            {coursesLoading ? (
              <Center py={8}>
                <Spinner size="lg" color={primaryColor} />
              </Center>
            ) : courses.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    bg={blueLight}
                    border="2px solid"
                    borderColor={primaryColor}
                    borderRadius="xl"
                    _hover={{
                      transform: 'translateY(-4px)',
                      shadow: 'lg',
                    }}
                    transition="all 0.3s ease"
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="stretch">
                        {/* Course Image */}
                        {course.avatar && (
                          <Box w="full" borderRadius="lg" overflow="hidden">
                            <Image
                              src={course.avatar}
                              alt={course.title}
                              w="100%"
                              h="150px"
                              objectFit="cover"
                            />
                          </Box>
                        )}

                        {/* Course Title */}
                        <VStack align="start" spacing={2}>
                          <Heading size="md" color={textColor}>
                            {course.title}
                          </Heading>
                          {course.description && (
                            <Text fontSize="sm" color={subTextColor} noOfLines={2}>
                              {course.description}
                            </Text>
                          )}
                        </VStack>

                        <Divider />

                        {/* Course Info */}
                        <VStack spacing={2} align="stretch" fontSize="sm">
                          <HStack justify="space-between">
                            <Text color={subTextColor}>السعر:</Text>
                            <Text fontWeight="bold" color={primaryColor}>
                              {course.price || '0.00'} جنيه
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={subTextColor}>الحالة:</Text>
                            <Badge
                              colorScheme={course.is_visible ? 'green' : 'gray'}
                            >
                              {course.is_visible ? 'مرئي' : 'مخفي'}
                            </Badge>
                          </HStack>
                          {course.teacher_name && (
                            <HStack justify="space-between">
                              <Text color={subTextColor}>المدرس:</Text>
                              <Text fontWeight="bold" color={textColor} fontSize="xs">
                                {course.teacher_name}
                              </Text>
                            </HStack>
                          )}
                        </VStack>

                        {/* Action Buttons */}
                        {(isAdmin || isTeacher) && (
                          <HStack spacing={2} mt={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              flex={1}
                              onClick={() => openEditCourseModal(course)}
                            >
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              flex={1}
                              onClick={() => openDeleteCourseDialog(course)}
                            >
                              حذف
                            </Button>
                          </HStack>
                        )}

                        {/* View Course Button */}
                        <Button
                          as={Link}
                          to={`/CourseDetailsPage/${course.id}`}
                          size="sm"
                          colorScheme="blue"
                          w="full"
                          mt={2}
                        >
                          عرض الكورس
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FiBookOpen} boxSize={12} color={subTextColor} />
                  <Text color={subTextColor} fontSize="lg">
                    لا توجد كورسات متاحة
                  </Text>
                  {(isAdmin || isTeacher) && (
                    <Text color={subTextColor} fontSize="sm">
                      قم بإضافة كورسات جديدة للمادة
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
            size="lg"
            px={8}
            onClick={() => navigate(`/package/${subjectData.package_id}`)}
            borderRadius="xl"
          >
            العودة للباقة
          </Button>
        </Flex>
      </Container>

      {/* Add Permission Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box bg={blueGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiPlus} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  إضافة صلاحية لمدرس
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg}>
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

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onClose} variant="outline" size="lg" borderRadius="xl" px={6}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleAddPermission}
                isLoading={addingPermission}
                loadingText="جاري الإضافة..."
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                isDisabled={!selectedTeacherId || teachers.length === 0}
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

      {/* Add Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={onCourseModalClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box bg={blueGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiPlus} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  إضافة كورس جديد
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عنوان الكورس
                </FormLabel>
                <Input
                  value={courseFormData.title}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="أدخل عنوان الكورس"
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
                  وصف الكورس
                </FormLabel>
                <Textarea
                  value={courseFormData.description}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="أدخل وصفاً للكورس"
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

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  سعر الكورس
                </FormLabel>
                <Input
                  type="number"
                  value={courseFormData.price}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0.00"
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
                  صورة الكورس (اختياري)
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  <Box
                    border="2px dashed"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={6}
                    textAlign="center"
                    bg={blueLight}
                    _hover={{
                      borderColor: primaryColor,
                      bg: useColorModeValue("blue.100", "blue.800")
                    }}
                    transition="all 0.3s"
                    cursor="pointer"
                    position="relative"
                  >
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleCourseImageChange}
                      border="none"
                      position="absolute"
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                      zIndex={1}
                    />
                    <VStack spacing={2}>
                      <Icon as={FiImage} boxSize={8} color={primaryColor} />
                      <Text color={textColor} fontWeight="medium">
                        اضغط لاختيار صورة الكورس
                      </Text>
                      <Text fontSize="xs" color={subTextColor}>
                        JPG, PNG, GIF, WEBP حتى 10MB
                      </Text>
                    </VStack>
                  </Box>

                  {courseImagePreview && (
                    <Box
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius="xl"
                      p={4}
                      textAlign="center"
                      bg={blueLight}
                    >
                      <Image
                        src={courseImagePreview}
                        alt="معاينة صورة الكورس"
                        maxH="200px"
                        mx="auto"
                        borderRadius="lg"
                        boxShadow="md"
                      />
                    </Box>
                  )}
                </VStack>
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={courseFormData.is_visible}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, is_visible: e.target.checked }))
                  }
                  colorScheme="blue"
                >
                  <Text color={textColor} fontWeight="medium">
                    الكورس مرئي للطلاب
                  </Text>
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onCourseModalClose} variant="outline" size="lg" borderRadius="xl" px={6}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleAddCourse}
                isLoading={addingCourse}
                loadingText="جاري الإضافة..."
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                  bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)"
                }}
                transition="all 0.3s ease"
              >
                إضافة الكورس
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditCourseModalOpen} onClose={onEditCourseModalClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box bg={blueGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiEdit} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  تعديل الكورس
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عنوان الكورس
                </FormLabel>
                <Input
                  value={courseFormData.title}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="أدخل عنوان الكورس"
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
                  وصف الكورس
                </FormLabel>
                <Textarea
                  value={courseFormData.description}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="أدخل وصفاً للكورس"
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

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  سعر الكورس
                </FormLabel>
                <Input
                  type="number"
                  value={courseFormData.price}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0.00"
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
                  صورة الكورس (اختياري)
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  <Box
                    border="2px dashed"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={6}
                    textAlign="center"
                    bg={blueLight}
                    _hover={{
                      borderColor: primaryColor,
                      bg: useColorModeValue("blue.100", "blue.800")
                    }}
                    transition="all 0.3s"
                    cursor="pointer"
                    position="relative"
                  >
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleCourseImageChange}
                      border="none"
                      position="absolute"
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                      zIndex={1}
                    />
                    <VStack spacing={2}>
                      <Icon as={FiImage} boxSize={8} color={primaryColor} />
                      <Text color={textColor} fontWeight="medium">
                        اضغط لاختيار صورة جديدة
                      </Text>
                      <Text fontSize="xs" color={subTextColor}>
                        JPG, PNG, GIF, WEBP حتى 10MB
                      </Text>
                    </VStack>
                  </Box>

                  {courseImagePreview && (
                    <Box
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius="xl"
                      p={4}
                      textAlign="center"
                      bg={blueLight}
                    >
                      <Image
                        src={courseImagePreview}
                        alt="معاينة صورة الكورس"
                        maxH="200px"
                        mx="auto"
                        borderRadius="lg"
                        boxShadow="md"
                      />
                    </Box>
                  )}
                </VStack>
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={courseFormData.is_visible}
                  onChange={(e) =>
                    setCourseFormData((prev) => ({ ...prev, is_visible: e.target.checked }))
                  }
                  colorScheme="blue"
                >
                  <Text color={textColor} fontWeight="medium">
                    الكورس مرئي للطلاب
                  </Text>
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onEditCourseModalClose} variant="outline" size="lg" borderRadius="xl" px={6}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleEditCourse}
                isLoading={editingCourse}
                loadingText="جاري التحديث..."
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiEdit} />}
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

      {/* Delete Course Dialog */}
      <AlertDialog
        isOpen={isDeleteCourseOpen}
        leastDestructiveRef={cancelCourseRef}
        onClose={onDeleteCourseClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف الكورس
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف الكورس{' '}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedCourse?.title}
              </Text>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelCourseRef} onClick={onDeleteCourseClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteCourse}
                ml={3}
                isLoading={deletingCourse}
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

export default SubjectDetails;

