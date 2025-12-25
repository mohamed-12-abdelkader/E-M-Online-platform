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
  Tooltip,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  AspectRatio,
  Stack,
} from '@chakra-ui/react';
import {
  FiArrowRight,
  FiPackage,
  FiDollarSign,
  FiBookOpen,
  FiCalendar,
  FiArrowLeft,
  FiCheckCircle,
  FiKey,
  FiDownload,
  FiCopy,
  FiPlus,
  FiImage,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiClock,
} from 'react-icons/fi';
import baseUrl from '../../api/baseUrl';
import ScrollToTop from '../../components/scollToTop/ScrollToTop';
import UserType from '../../Hooks/auth/userType';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, isAdmin] = UserType();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activationCodes, setActivationCodes] = useState([]);
  const [creatingCodes, setCreatingCodes] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSubjectModalOpen, onOpen: onSubjectModalOpen, onClose: onSubjectModalClose } = useDisclosure();
  const { isOpen: isEditSubjectModalOpen, onOpen: onEditSubjectModalOpen, onClose: onEditSubjectModalClose } = useDisclosure();
  const { isOpen: isDeleteSubjectOpen, onOpen: onDeleteSubjectOpen, onClose: onDeleteSubjectClose } = useDisclosure();
  const [formData, setFormData] = useState({
    count: 1,
    expires_at: '',
  });
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    image: null,
  });
  const [subjectImagePreview, setSubjectImagePreview] = useState(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activatingStudent, setActivatingStudent] = useState(null); // Store student ID being activated
  const { isOpen: isStudentsModalOpen, onOpen: onStudentsModalOpen, onClose: onStudentsModalClose } = useDisclosure();
  const toast = useToast();

  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryGradient = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  );
  const blueGradient = useColorModeValue(
    'linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)',
    'linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)'
  );
  const purpleGradient = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  );
  const greenGradient = useColorModeValue(
    'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
  );
  const cardHoverBg = useColorModeValue('gray.50', 'gray.750');

  // جلب بيانات الباقة
  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.package) {
        setPackageData(response.data.package);
      } else {
        toast({
          title: 'خطأ',
          description: 'الباقة غير موجودة',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/packages-management');
      }
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في جلب بيانات الباقة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/packages-management');
    } finally {
      setLoading(false);
    }
  };

  // إنشاء أكواد التفعيل
  const handleCreateActivationCodes = async () => {
    if (!formData.count || formData.count < 1 || formData.count > 100) {
      toast({
        title: 'خطأ',
        description: 'عدد الأكواد يجب أن يكون بين 1 و 100',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setCreatingCodes(true);
      const token = localStorage.getItem('token');

      const payload = {
        count: parseInt(formData.count),
      };

      if (formData.expires_at) {
        payload.expires_at = formData.expires_at;
      }

      const response = await baseUrl.post(
        `/api/packages/${id}/activation-codes`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.activation_codes) {
        setActivationCodes(response.data.activation_codes);
        toast({
          title: 'تم الإنشاء بنجاح! 🎉',
          description: `تم إنشاء ${response.data.total_created} كود تفعيل بنجاح`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        onClose();
        setFormData({ count: 1, expires_at: '' });
      }
    } catch (error) {
      console.error('Error creating activation codes:', error);
      toast({
        title: 'فشل الإنشاء! ❌',
        description: error.response?.data?.message || 'حدث خطأ أثناء إنشاء أكواد التفعيل',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setCreatingCodes(false);
    }
  };

  // نسخ الكود
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'تم النسخ! ✅',
      description: 'تم نسخ الكود بنجاح',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  // تحميل QR Code
  const handleDownloadQR = (qrCode, code) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // معالجة تغيير صورة المادة
  const handleSubjectImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubjectFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setSubjectImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // فتح Modal التعديل
  const handleEditSubjectOpen = (subject) => {
    setSelectedSubject(subject);
    setSubjectFormData({
      name: subject.name || '',
      image: null,
    });
    setSubjectImagePreview(subject.image || null);
    onEditSubjectModalOpen();
  };

  // تعديل مادة
  const handleEditSubject = async () => {
    if (!selectedSubject || !subjectFormData.name.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال اسم المادة',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      setEditingSubject(true);
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('name', subjectFormData.name);
      if (subjectFormData.image) {
        formDataToSend.append('image', subjectFormData.image);
      }

      const response = await baseUrl.put(
        `/api/package-subjects/${selectedSubject.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.success) {
        setPackageData((prev) => ({
          ...prev,
          subjects: prev.subjects.map((sub) =>
            sub.id === selectedSubject.id ? response.data.item : sub
          ),
        }));

        toast({
          title: 'تم التحديث بنجاح! 🎉',
          description: `تم تحديث المادة "${subjectFormData.name}" بنجاح`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        onEditSubjectModalClose();
        setSelectedSubject(null);
        setSubjectFormData({ name: '', image: null });
        setSubjectImagePreview(null);
      }
    } catch (error) {
      console.error('Error editing subject:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث المادة',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setEditingSubject(false);
    }
  };

  // حذف مادة
  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;

    try {
      setDeletingSubject(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.delete(`/api/package-subjects/${deleteSubjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setPackageData((prev) => ({
          ...prev,
          subjects: prev.subjects.filter((sub) => sub.id !== deleteSubjectId),
        }));

        toast({
          title: 'تم الحذف بنجاح! 🎉',
          description: response.data.message || 'تم حذف المادة بنجاح',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        onDeleteSubjectClose();
        setDeleteSubjectId(null);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف المادة',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setDeletingSubject(false);
    }
  };

  // جلب الطلاب المشتركين في الباقة
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.get(`/api/packages/${id}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.students) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في جلب قائمة الطلاب',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // فتح مودال الطلاب
  const handleOpenStudentsModal = () => {
    onStudentsModalOpen();
    fetchStudents();
  };

  // تفعيل باقة لطالب
  const handleActivateStudent = async (studentId, studentName) => {
    try {
      setActivatingStudent(studentId);
      const token = localStorage.getItem('token');

      const response = await baseUrl.post(
        `/api/packages/${id}/activate-student`,
        { student_id: studentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.message) {
        toast({
          title: 'تم التفعيل بنجاح! ✅',
          description: response.data.message || `تم تفعيل الباقة للطالب ${studentName} بنجاح`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        // تحديث قائمة الطلاب
        await fetchStudents();
      }
    } catch (error) {
      console.error('Error activating student:', error);
      toast({
        title: 'فشل التفعيل! ❌',
        description: error.response?.data?.message || `حدث خطأ أثناء تفعيل الباقة للطالب ${studentName}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setActivatingStudent(null);
    }
  };

  // إضافة مادة جديدة للباقة
  const handleAddSubject = async () => {
    if (!subjectFormData.name.trim()) {
      toast({
        title: 'حقول مطلوبة! ⚠️',
        description: 'يرجى إدخال اسم المادة',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      setAddingSubject(true);
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('name', subjectFormData.name);
      if (subjectFormData.image) {
        formDataToSend.append('image', subjectFormData.image);
      }

      const response = await baseUrl.post(
        `/api/packages/${id}/subjects`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.subject) {
        setPackageData((prev) => ({
          ...prev,
          subjects: [...(prev.subjects || []), response.data.subject],
        }));

        toast({
          title: 'تم الإضافة بنجاح! 🎉',
          description: `تم إضافة المادة "${subjectFormData.name}" للباقة بنجاح`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        onSubjectModalClose();
        setSubjectFormData({ name: '', image: null });
        setSubjectImagePreview(null);
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: 'فشل الإضافة! ❌',
        description: error.response?.data?.message || 'حدث خطأ أثناء إضافة المادة',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setAddingSubject(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color={primaryColor} emptyColor="gray.200" />
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              جاري تحميل بيانات الباقة...
            </Text>
            <Text fontSize="sm" color={subTextColor}>
              يرجى الانتظار قليلاً
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  if (!packageData) {
    return null;
  }

  return (
    <Box minH="100vh" bg={bg} pt="80px" pb={12}>
      <Container maxW="7xl">
        {/* Hero Section */}
        <Box
          position="relative"
          mb={10}
          borderRadius="3xl"
          overflow="hidden"
            bg={blueGradient}
          boxShadow="2xl"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgImage={packageData.image ? `url(${packageData.image})` : 'none'}
            bgSize="cover"
            bgPosition="center"
            opacity={0.15}
            filter="blur(20px)"
          />
          <Box position="relative" p={{ base: 6, md: 12 }} color="white">
            <HStack spacing={4} mb={6} flexWrap="wrap">
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/packages-management')}
                size="md"
              >
                العودة
              </Button>
              <Button
                leftIcon={<Icon as={FiUsers} />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={handleOpenStudentsModal}
                size="md"
              >
                الطلاب المشتركين
              </Button>
            </HStack>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="center">
              <VStack align="start" spacing={6}>
                <Box>
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="sm"
                    mb={4}
                  >
                    {packageData.grade_name}
                  </Badge>
                  <Heading size="2xl" fontWeight="bold" mb={4} lineHeight="1.2">
                    {packageData.name}
                  </Heading>
                  <Text fontSize="lg" color="whiteAlpha.900" maxW="md">
                    باقة تعليمية شاملة تحتوي على جميع المواد الدراسية
                  </Text>
                </Box>
                <HStack spacing={6} flexWrap="wrap">
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Icon as={FiDollarSign} boxSize={5} />
                      <Text fontSize="sm" color="whiteAlpha.800">
                        السعر
                      </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {packageData.price} ج.م
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Icon as={FiBookOpen} boxSize={5} />
                      <Text fontSize="sm" color="whiteAlpha.800">
                        المواد
                      </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {packageData.subjects?.length || 0}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} boxSize={5} />
                      <Text fontSize="sm" color="whiteAlpha.800">
                        تاريخ الإنشاء
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      {new Date(packageData.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
              {packageData.image && (
                <Box>
                  <AspectRatio ratio={16 / 9}>
                    <Box
                      borderRadius="2xl"
                      overflow="hidden"
                      boxShadow="xl"
                      border="4px solid"
                      borderColor="whiteAlpha.300"
                    >
                      <Image
                        src={packageData.image}
                        alt={packageData.name}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />
                    </Box>
                  </AspectRatio>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        </Box>

        {/* Subjects Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" mb={8} overflow="hidden">
          <Box bg={blueGradient} p={6} color="white">
            <HStack justify="space-between" flexWrap="wrap" spacing={4}>
              <HStack spacing={4}>
                <Box
                  bg="whiteAlpha.200"
                  borderRadius="full"
                  p={3}
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiBookOpen} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" fontWeight="bold">
                    المواد المدرجة
                  </Heading>
                  <Text fontSize="sm" color="whiteAlpha.900">
                    {packageData.subjects?.length || 0} مادة متاحة
                  </Text>
                </VStack>
              </HStack>
              {isAdmin && (
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-2px)' }}
                  onClick={onSubjectModalOpen}
                  borderRadius="xl"
                  size="lg"
                >
                  إضافة مادة
                </Button>
              )}
            </HStack>
          </Box>

          <CardBody p={8}>
            {packageData.subjects && packageData.subjects.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                {packageData.subjects.map((subject, index) => (
                  <Card
                    key={subject.id}
                    bg={cardBg}
                    border="2px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    position="relative"
                    overflow="hidden"
                    _hover={{
                      transform: 'translateY(-8px)',
                      shadow: '2xl',
                      borderColor: primaryColor,
                    }}
                    transition="all 0.3s ease"
                    cursor="pointer"
                  >
                    {isAdmin && (
                      <Box position="absolute" top={3} right={3} zIndex={10}>
                        <HStack spacing={2}>
                          <Tooltip label="تعديل" hasArrow>
                            <IconButton
                              icon={<Icon as={FiEdit} />}
                              size="sm"
                              colorScheme="blue"
                              bg="white"
                              boxShadow="md"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditSubjectOpen(subject);
                              }}
                              aria-label="تعديل"
                              _hover={{ transform: 'scale(1.1)' }}
                            />
                          </Tooltip>
                          <Tooltip label="حذف" hasArrow>
                            <IconButton
                              icon={<Icon as={FiTrash2} />}
                              size="sm"
                              colorScheme="red"
                              bg="white"
                              boxShadow="md"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteSubjectId(subject.id);
                                onDeleteSubjectOpen();
                              }}
                              aria-label="حذف"
                              _hover={{ transform: 'scale(1.1)' }}
                            />
                          </Tooltip>
                        </HStack>
                      </Box>
                    )}
                    <Link to={`/subject/${subject.id}`} style={{ textDecoration: 'none' }}>
                      <CardBody p={0}>
                        <VStack spacing={0} align="stretch">
                          {subject.image ? (
                            <Box position="relative" h="180px" overflow="hidden">
                              <Image
                                src={subject.image}
                                alt={subject.name}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                transition="transform 0.3s"
                                _groupHover={{ transform: 'scale(1.1)' }}
                              />
                              <Box
                                position="absolute"
                                top={2}
                                left={2}
                                bg="blackAlpha.600"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                                backdropFilter="blur(10px)"
                              >
                                #{index + 1}
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              h="180px"
                              bg={purpleGradient}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position="relative"
                            >
                              <Icon as={FiBookOpen} boxSize={12} color="white" opacity={0.5} />
                              <Box
                                position="absolute"
                                top={2}
                                left={2}
                                bg="blackAlpha.600"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                                backdropFilter="blur(10px)"
                              >
                                #{index + 1}
                              </Box>
                            </Box>
                          )}
                          <Box p={5} bg={cardBg}>
                            <HStack justify="space-between" mb={2}>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={textColor}
                                noOfLines={1}
                                flex={1}
                              >
                                {subject.name}
                              </Text>
                              <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                            </HStack>
                            {subject.description && (
                              <Text fontSize="sm" color={subTextColor} noOfLines={2} mb={3}>
                                {subject.description}
                              </Text>
                            )}
                            <Button
                              size="sm"
                              bg={blueGradient}
                              color="white"
                              w="full"
                              borderRadius="xl"
                              _hover={{
                                transform: 'translateY(-2px)',
                                shadow: 'lg',
                              }}
                              transition="all 0.2s"
                            >
                              عرض التفاصيل
                            </Button>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Link>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Center py={16}>
                <VStack spacing={4}>
                  <Box
                    bg={blueGradient}
                    borderRadius="full"
                    p={6}
                    color="white"
                  >
                    <Icon as={FiBookOpen} boxSize={12} />
                  </Box>
                  <Text color={subTextColor} fontSize="lg" fontWeight="medium">
                    لا توجد مواد مدرجة في الباقة
                  </Text>
                  {isAdmin && (
                    <Button
                      leftIcon={<Icon as={FiPlus} />}
                      bg={blueGradient}
                      color="white"
                      onClick={onSubjectModalOpen}
                      borderRadius="xl"
                    >
                      إضافة مادة جديدة
                    </Button>
                  )}
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Admin Section - Activation Codes */}
        {isAdmin && (
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" mb={8} overflow="hidden">
            <Box bg={greenGradient} p={6} color="white">
              <HStack justify="space-between" flexWrap="wrap" spacing={4}>
                <HStack spacing={4}>
                  <Box
                    bg="whiteAlpha.200"
                    borderRadius="full"
                    p={3}
                    backdropFilter="blur(10px)"
                  >
                    <Icon as={FiKey} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" fontWeight="bold">
                      أكواد التفعيل
                    </Heading>
                    <Text fontSize="sm" color="whiteAlpha.900">
                      إدارة أكواد تفعيل الباقة
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-2px)' }}
                  onClick={onOpen}
                  borderRadius="xl"
                  size="lg"
                >
                  إنشاء أكواد جديدة
                </Button>
              </HStack>
            </Box>

            <CardBody p={8}>
              {activationCodes.length > 0 ? (
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                      الأكواد المنشأة
                    </Text>
                    <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="full">
                      {activationCodes.length} كود
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {activationCodes.map((codeData) => (
                      <Card
                        key={codeData.id}
                        bg={cardBg}
                        border="2px solid"
                        borderColor={codeData.uses >= codeData.max_uses ? 'red.300' : 'green.300'}
                        borderRadius="2xl"
                        overflow="hidden"
                        _hover={{
                          transform: 'translateY(-4px)',
                          shadow: 'xl',
                        }}
                        transition="all 0.3s ease"
                      >
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            {codeData.qr_code && (
                              <Box
                                bg="white"
                                p={4}
                                borderRadius="xl"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                border="2px solid"
                                borderColor={borderColor}
                              >
                                <Image
                                  src={codeData.qr_code}
                                  alt={`QR Code for ${codeData.code}`}
                                  maxH="180px"
                                  maxW="180px"
                                />
                              </Box>
                            )}
                            <Box
                              bg={codeData.uses >= codeData.max_uses ? 'red.50' : 'green.50'}
                              p={4}
                              borderRadius="xl"
                              border="2px solid"
                              borderColor={codeData.uses >= codeData.max_uses ? 'red.200' : 'green.200'}
                            >
                              <VStack spacing={2} align="stretch">
                                <Text fontSize="xs" color={subTextColor} fontWeight="medium">
                                  كود التفعيل
                                </Text>
                                <HStack spacing={2}>
                                  <Box
                                    bg="white"
                                    px={4}
                                    py={3}
                                    borderRadius="lg"
                                    flex={1}
                                    border="2px solid"
                                    borderColor={primaryColor}
                                  >
                                    <Text
                                      fontSize="lg"
                                      fontWeight="bold"
                                      color={primaryColor}
                                      fontFamily="mono"
                                      textAlign="center"
                                      letterSpacing="2px"
                                    >
                                      {codeData.code}
                                    </Text>
                                  </Box>
                                  <IconButton
                                    icon={<Icon as={FiCopy} />}
                                    colorScheme="blue"
                                    onClick={() => handleCopyCode(codeData.code)}
                                    aria-label="نسخ الكود"
                                    borderRadius="lg"
                                  />
                                </HStack>
                              </VStack>
                            </Box>
                            <VStack spacing={2} align="stretch" fontSize="sm">
                              <HStack justify="space-between" p={2} bg={cardHoverBg} borderRadius="md">
                                <Text color={subTextColor}>الحالة:</Text>
                                <Badge
                                  colorScheme={codeData.uses >= codeData.max_uses ? 'red' : 'green'}
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                >
                                  {codeData.uses >= codeData.max_uses ? 'مستخدم' : 'متاح'}
                                </Badge>
                              </HStack>
                              <HStack justify="space-between" p={2} bg={cardHoverBg} borderRadius="md">
                                <Text color={subTextColor}>الاستخدام:</Text>
                                <Text fontWeight="bold" color={textColor}>
                                  {codeData.uses} / {codeData.max_uses}
                                </Text>
                              </HStack>
                              {codeData.expires_at && (
                                <HStack justify="space-between" p={2} bg={cardHoverBg} borderRadius="md">
                                  <Text color={subTextColor}>انتهاء الصلاحية:</Text>
                                  <Text fontWeight="bold" color={textColor} fontSize="xs">
                                    {new Date(codeData.expires_at).toLocaleDateString('ar-EG')}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                            {codeData.qr_code && (
                              <Button
                                leftIcon={<Icon as={FiDownload} />}
                                bg={blueGradient}
                                color="white"
                                size="md"
                                onClick={() => handleDownloadQR(codeData.qr_code, codeData.code)}
                                borderRadius="xl"
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  shadow: 'lg',
                                }}
                                transition="all 0.2s"
                              >
                                تحميل QR Code
                              </Button>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              ) : (
                <Center py={16}>
                  <VStack spacing={4}>
                    <Box
                      bg={greenGradient}
                      borderRadius="full"
                      p={6}
                      color="white"
                    >
                      <Icon as={FiKey} boxSize={12} />
                    </Box>
                    <Text color={subTextColor} fontSize="lg" fontWeight="medium">
                      لا توجد أكواد تفعيل منشأة
                    </Text>
                    <Button
                      leftIcon={<Icon as={FiPlus} />}
                      bg={greenGradient}
                      color="white"
                      onClick={onOpen}
                      borderRadius="xl"
                    >
                      إنشاء أكواد جديدة
                    </Button>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <Flex justify="center" gap={4} flexWrap="wrap">
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            variant="outline"
            colorScheme="blue"
            size="lg"
            px={8}
            onClick={() => navigate('/packages-management')}
            borderRadius="xl"
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            العودة للباقات
          </Button>
          {!isAdmin && (
            <Button
              rightIcon={<Icon as={FiArrowRight} />}
              bg={purpleGradient}
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              fontWeight="bold"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'xl',
              }}
              transition="all 0.3s ease"
            >
              الاشتراك في الباقة
            </Button>
          )}
        </Flex>
      </Container>

      {/* Create Activation Codes Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box bg={greenGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiKey} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  إنشاء أكواد التفعيل
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  عدد الأكواد
                </FormLabel>
                <Input
                  type="number"
                  value={formData.count}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, count: e.target.value }))
                  }
                  placeholder="من 1 إلى 100"
                  borderColor={borderColor}
                  borderRadius="xl"
                  size="lg"
                  min={1}
                  max={100}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  تاريخ انتهاء الصلاحية (اختياري)
                </FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
                  }
                  borderColor={borderColor}
                  borderRadius="xl"
                  size="lg"
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 3px ${primaryColor}33`,
                    borderWidth: '2px',
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onClose} variant="outline" size="lg" borderRadius="xl" px={6}>
                إلغاء
              </Button>
              <Button
                bg={greenGradient}
                color="white"
                onClick={handleCreateActivationCodes}
                isLoading={creatingCodes}
                loadingText="جاري الإنشاء..."
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiKey} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                إنشاء الأكواد
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={onSubjectModalClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box bg={blueGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiBookOpen} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  إضافة مادة جديدة
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  اسم المادة
                </FormLabel>
                <Input
                  value={subjectFormData.name}
                  onChange={(e) =>
                    setSubjectFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="أدخل اسم المادة"
                  borderColor={borderColor}
                  borderRadius="xl"
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
                  صورة المادة (اختياري)
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  <Box
                    border="2px dashed"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={8}
                    textAlign="center"
                    bg={useColorModeValue("blue.50", "blue.900")}
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
                      onChange={handleSubjectImageChange}
                      border="none"
                      position="absolute"
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                      zIndex={1}
                    />
                    <VStack spacing={2}>
                      <Icon as={FiImage} boxSize={10} color={primaryColor} />
                      <Text color={textColor} fontWeight="medium">
                        اضغط لاختيار صورة المادة
                      </Text>
                      <Text fontSize="xs" color={subTextColor}>
                        JPG, PNG, GIF, WEBP حتى 10MB
                      </Text>
                    </VStack>
                  </Box>

                  {subjectImagePreview && (
                    <Box
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius="xl"
                      p={4}
                      textAlign="center"
                      bg={useColorModeValue("blue.50", "blue.900")}
                    >
                      <Image
                        src={subjectImagePreview}
                        alt="معاينة صورة المادة"
                        maxH="200px"
                        mx="auto"
                        borderRadius="lg"
                        boxShadow="md"
                      />
                    </Box>
                  )}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onSubjectModalClose} variant="outline" size="lg" borderRadius="xl" px={6}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleAddSubject}
                isLoading={addingSubject}
                loadingText="جاري الإضافة..."
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiPlus} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                إضافة المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditSubjectModalOpen} onClose={onEditSubjectModalClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box bg={blueGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiEdit} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  تعديل المادة
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                  اسم المادة
                </FormLabel>
                <Input
                  value={subjectFormData.name}
                  onChange={(e) =>
                    setSubjectFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="أدخل اسم المادة"
                  borderColor={borderColor}
                  borderRadius="xl"
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
                  صورة المادة (اختياري)
                </FormLabel>
                <VStack spacing={4} align="stretch">
                  <Box
                    border="2px dashed"
                    borderColor={borderColor}
                    borderRadius="xl"
                    p={8}
                    textAlign="center"
                    bg={useColorModeValue("blue.50", "blue.900")}
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
                      onChange={handleSubjectImageChange}
                      border="none"
                      position="absolute"
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                      zIndex={1}
                    />
                    <VStack spacing={2}>
                      <Icon as={FiImage} boxSize={10} color={primaryColor} />
                      <Text color={textColor} fontWeight="medium">
                        اضغط لاختيار صورة جديدة
                      </Text>
                      <Text fontSize="xs" color={subTextColor}>
                        JPG, PNG, GIF, WEBP حتى 10MB
                      </Text>
                    </VStack>
                  </Box>

                  {subjectImagePreview && (
                    <Box
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius="xl"
                      p={4}
                      textAlign="center"
                      bg={useColorModeValue("blue.50", "blue.900")}
                    >
                      <Image
                        src={subjectImagePreview}
                        alt="معاينة صورة المادة"
                        maxH="200px"
                        mx="auto"
                        borderRadius="lg"
                        boxShadow="md"
                      />
                    </Box>
                  )}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onEditSubjectModalClose} variant="outline" size="lg" borderRadius="xl" px={6}>
                إلغاء
              </Button>
              <Button
                bg={blueGradient}
                color="white"
                onClick={handleEditSubject}
                isLoading={editingSubject}
                loadingText="جاري التحديث..."
                size="lg"
                px={8}
                borderRadius="xl"
                fontWeight="bold"
                leftIcon={<Icon as={FiEdit} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                تحديث المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Students Modal */}
      <Modal isOpen={isStudentsModalOpen} onClose={onStudentsModalClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" maxH="90vh">
          <Box bg={purpleGradient} p={6} color="white">
            <ModalHeader p={0}>
              <HStack spacing={3}>
                <Icon as={FiUsers} boxSize={6} />
                <Text fontSize="xl" fontWeight="bold">
                  الطلاب المشتركين في الباقة
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg" />
          </Box>

          <ModalBody p={6} bg={cardBg} overflowY="auto">
            {loadingStudents ? (
              <Center py={12}>
                <VStack spacing={4}>
                  <Spinner size="xl" color={primaryColor} thickness="4px" />
                  <Text color={subTextColor}>جاري تحميل قائمة الطلاب...</Text>
                </VStack>
              </Center>
            ) : students.length > 0 ? (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    إجمالي الطلاب: {students.length}
                  </Text>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {students.map((student) => (
                    <Card
                      key={student.id}
                      bg={cardBg}
                      border="2px solid"
                      borderColor={student.is_active ? 'green.300' : 'gray.300'}
                      borderRadius="xl"
                      _hover={{
                        transform: 'translateY(-4px)',
                        shadow: 'xl',
                        borderColor: student.is_active ? 'green.400' : 'gray.400',
                      }}
                      transition="all 0.3s ease"
                    >
                      <CardBody p={5}>
                        <HStack spacing={4} align="start">
                          {student.avatar ? (
                            <Image
                              src={student.avatar}
                              alt={student.name}
                              boxSize="60px"
                              borderRadius="full"
                              objectFit="cover"
                              border="3px solid"
                              borderColor={student.is_active ? 'green.400' : 'gray.400'}
                            />
                          ) : (
                            <Box
                              boxSize="60px"
                              borderRadius="full"
                              bg={purpleGradient}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontWeight="bold"
                              fontSize="xl"
                            >
                              {student.name?.charAt(0) || '?'}
                            </Box>
                          )}
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={1}>
                                {student.name}
                              </Text>
                              <Badge
                                colorScheme={student.is_active ? 'green' : 'gray'}
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                              >
                                {student.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </HStack>
                            <VStack align="start" spacing={1} fontSize="sm" w="full">
                              <HStack spacing={2}>
                                <Icon as={FiUsers} boxSize={4} color={subTextColor} />
                                <Text color={subTextColor} noOfLines={1}>
                                  {student.email}
                                </Text>
                              </HStack>
                              {student.phone && (
                                <HStack spacing={2}>
                                  <Icon as={FiClock} boxSize={4} color={subTextColor} />
                                  <Text color={subTextColor}>{student.phone}</Text>
                                </HStack>
                              )}
                              {student.activated_at && (
                                <HStack spacing={2}>
                                  <Icon as={FiCalendar} boxSize={4} color={subTextColor} />
                                  <Text color={subTextColor} fontSize="xs">
                                    تم التفعيل: {new Date(student.activated_at).toLocaleDateString('ar-EG', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                            {isAdmin && !student.is_active && (
                              <Button
                                size="sm"
                                bg={greenGradient}
                                color="white"
                                leftIcon={<Icon as={FiCheckCircle} />}
                                onClick={() => handleActivateStudent(student.id, student.name)}
                                isLoading={activatingStudent === student.id}
                                loadingText="جاري التفعيل..."
                                w="full"
                                borderRadius="xl"
                                fontWeight="bold"
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  shadow: 'lg',
                                }}
                                transition="all 0.2s"
                              >
                                تفعيل الباقة للطالب
                              </Button>
                            )}
                            {isAdmin && student.is_active && (
                              <Badge
                                colorScheme="green"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                w="full"
                                textAlign="center"
                              >
                                ✓ الباقة مفعلة
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            ) : (
              <Center py={12}>
                <VStack spacing={4}>
                  <Box
                    bg={purpleGradient}
                    borderRadius="full"
                    p={6}
                    color="white"
                  >
                    <Icon as={FiUsers} boxSize={12} />
                  </Box>
                  <Text color={subTextColor} fontSize="lg" fontWeight="medium">
                    لا يوجد طلاب مشتركين في هذه الباقة
                  </Text>
                </VStack>
              </Center>
            )}
          </ModalBody>

          <ModalFooter p={6} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
            <Button onClick={onStudentsModalClose} variant="outline" size="lg" borderRadius="xl" px={6}>
              إغلاق
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Subject Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteSubjectOpen} onClose={onDeleteSubjectClose} isCentered>
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="xl" boxShadow="2xl">
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            bgGradient="linear(to-r, red.500, red.600)"
            color="white"
            borderRadius="xl xl 0 0"
            py={4}
          >
            <HStack spacing={2}>
              <Icon as={FiTrash2} />
              <Text>تأكيد الحذف</Text>
            </HStack>
          </AlertDialogHeader>
          <AlertDialogBody py={6}>
            <VStack spacing={3} align="start">
              <Alert status="warning" borderRadius="md" w="full">
                <AlertIcon />
                <Text fontSize="sm">
                  هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع عن هذه العملية.
                </Text>
              </Alert>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter bg="gray.50" borderRadius="0 0 xl xl" py={4}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button onClick={onDeleteSubjectClose} variant="outline" size="md" borderRadius="md">
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteSubject}
                isLoading={deletingSubject}
                loadingText="جاري..."
                leftIcon={<Icon as={FiTrash2} />}
                size="md"
                borderRadius="md"
                fontWeight="bold"
              >
                حذف
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScrollToTop />
    </Box>
  );
};

export default PackageDetails;
