import React, { useState, useEffect } from 'react';
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
  CardFooter,
  Image,
  Badge,
  Spinner,
  Center,
  useColorModeValue,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
  SimpleGrid,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiPackage, 
  FiDollarSign, 
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiImage
} from 'react-icons/fi';
import baseUrl from '../../api/baseUrl';
import ScrollToTop from '../scollToTop/ScrollToTop';

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    grade_id: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryColor = useColorModeValue("blue.600", "blue.300");

  // جلب الباقات
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await baseUrl.get('/api/packages', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.packages) {
        setPackages(response.data.packages);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الباقات',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب الصفوف الدراسية
  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await baseUrl.get('/api/grades', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setGrades(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  // فتح نافذة إنشاء/تعديل باقة
  const openPackageModal = (packageData = null) => {
    if (packageData) {
      // وضع التعديل
      setIsEditMode(true);
      setSelectedPackage(packageData);
      setFormData({
        name: packageData.name || '',
        price: packageData.price || '',
        grade_id: packageData.grade_id || '',
        description: packageData.description || ''
      });
      setImagePreview(packageData.image || null);
      setSelectedImage(null);
    } else {
      // وضع الإنشاء
      setIsEditMode(false);
      setSelectedPackage(null);
      setFormData({
        name: '',
        price: '',
        grade_id: '',
        description: ''
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    onOpen();
  };

  // معالجة تغيير الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // إنشاء باقة جديدة
  const handleCreatePackage = async () => {
    if (!formData.name || !formData.price || !formData.grade_id) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('grade_id', formData.grade_id);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await baseUrl.post('/api/packages', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        toast({
          title: 'تم الإنشاء',
          description: 'تم إنشاء الباقة بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchPackages();
      }
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في إنشاء الباقة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // تحديث باقة موجودة
  const handleUpdatePackage = async () => {
    if (!formData.name || !formData.price || !formData.grade_id) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('grade_id', formData.grade_id);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await baseUrl.put(`/api/packages/${selectedPackage.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الباقة بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchPackages();
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في تحديث الباقة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // حذف باقة
  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await baseUrl.delete(`/api/packages/${selectedPackage.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        toast({
          title: 'تم الحذف',
          description: 'تم حذف الباقة بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsDeleteDialogOpen(false);
        setSelectedPackage(null);
        fetchPackages();
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل في حذف الباقة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      grade_id: '',
      description: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    fetchPackages();
    fetchGrades();
  }, []);

  if (loading && packages.length === 0) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={primaryColor} />
          <Text fontSize="lg" color={subTextColor}>جاري تحميل الباقات...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} pt="80px" pb={8} px={4}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={4} mb={8} textAlign="center">
          <Heading size="2xl" color={textColor}>إدارة الباقات</Heading>
          <Text fontSize="lg" color={subTextColor}>إنشاء وإدارة باقات الدورات التعليمية</Text>
        </VStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color={subTextColor}>إجمالي الباقات</StatLabel>
                <StatNumber color={primaryColor}>{packages.length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {packages.length} باقة
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color={subTextColor}>الباقات النشطة</StatLabel>
                <StatNumber color="green.500">{packages.filter(p => p.is_active !== false).length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  نشطة
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color={subTextColor}>متوسط السعر</StatLabel>
                <StatNumber color="orange.500">
                  {packages.length > 0 
                    ? (packages.reduce((sum, p) => sum + parseFloat(p.price), 0) / packages.length).toFixed(2)
                    : '0'
                  }
                </StatNumber>
                <StatHelpText>جنيه مصري</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Stat>
                <StatLabel color={subTextColor}>الصفوف المغطاة</StatLabel>
                <StatNumber color="purple.500">
                  {new Set(packages.map(p => p.grade_id)).size}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  صف دراسي
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Action Buttons */}
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color={textColor}>الباقات المتاحة</Heading>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="blue"
            size="lg"
            onClick={() => openPackageModal()}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            إنشاء باقة جديدة
          </Button>
        </Flex>

        <Divider mb={6} />

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {packages.map((packageItem) => (
              <Card
                key={packageItem.id}
                bg={cardBg}
                shadow="lg"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
                overflow="hidden"
              >
                {/* Package Image */}
                <Box position="relative">
                  <Image
                    src={packageItem.image || 'https://via.placeholder.com/300x200?text=صورة+الباقة'}
                    alt={packageItem.name}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/300x200?text=صورة+الباقة"
                  />
                  
                  {/* Price Badge */}
                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    colorScheme="green"
                    variant="solid"
                    fontSize="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    <HStack spacing={1}>
                      <Icon as={FiDollarSign} />
                      <Text>{packageItem.price} جنيه</Text>
                    </HStack>
                  </Badge>
                </Box>

                <CardBody>
                  {/* Package Name */}
                  <Heading size="md" mb={3} color={textColor} noOfLines={2}>
                    {packageItem.name}
                  </Heading>
                  
                  {/* Grade */}
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiBookOpen} color="purple.500" />
                    <Badge colorScheme="purple" variant="subtle">
                      {packageItem.grade_name}
                    </Badge>
                  </HStack>

                  {/* Subjects */}
                  {packageItem.subjects && packageItem.subjects.length > 0 && (
                    <VStack spacing={2} align="start" mb={4}>
                      <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                        المواد المدرجة:
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {packageItem.subjects.slice(0, 3).map((subject) => (
                          <Badge key={subject.id} colorScheme="blue" variant="outline" size="sm">
                            {subject.name}
                          </Badge>
                        ))}
                        {packageItem.subjects.length > 3 && (
                          <Badge colorScheme="gray" variant="outline" size="sm">
                            +{packageItem.subjects.length - 3} أكثر
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  )}

                  {/* Created Date */}
                  <HStack spacing={2} fontSize="sm" color={subTextColor}>
                    <Icon as={FiCalendar} />
                    <Text>
                      {new Date(packageItem.created_at).toLocaleDateString('ar-EG')}
                    </Text>
                  </HStack>
                </CardBody>

                <CardFooter p={6} pt={0}>
                  <HStack spacing={2} w="full" justify="center">
                    <Tooltip label="تعديل الباقة">
                      <IconButton
                        icon={<Icon as={FiEdit2} />}
                        colorScheme="blue"
                        variant="outline"
                        size="md"
                        onClick={() => openPackageModal(packageItem)}
                        _hover={{ bg: "blue.50" }}
                      />
                    </Tooltip>
                    
                    <Tooltip label="حذف الباقة">
                      <IconButton
                        icon={<Icon as={FiTrash2} />}
                        colorScheme="red"
                        variant="outline"
                        size="md"
                        onClick={() => {
                          setSelectedPackage(packageItem);
                          setIsDeleteDialogOpen(true);
                        }}
                        _hover={{ bg: "red.50" }}
                      />
                    </Tooltip>
                  </HStack>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Center py={12}>
            <VStack spacing={4}>
              <Icon as={FiPackage} size="6xl" color="gray.400" />
              <Heading size="lg" color={textColor}>
                لا توجد باقات متاحة
              </Heading>
              <Text color={subTextColor}>
                قم بإنشاء باقة جديدة للبدء
              </Text>
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={FiPlus} />}
                onClick={() => openPackageModal()}
              >
                إنشاء أول باقة
              </Button>
            </VStack>
          </Center>
        )}

        {/* Create/Edit Package Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={FiPackage} color="blue.500" />
                <Text>
                  {isEditMode ? 'تعديل الباقة' : 'إنشاء باقة جديدة'}
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Package Name */}
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={textColor}>
                    اسم الباقة
                  </FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم الباقة"
                    borderColor={borderColor}
                    _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  />
                </FormControl>

                {/* Price and Grade */}
                <HStack spacing={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel fontWeight="bold" color={textColor}>
                      السعر (جنيه مصري)
                    </FormLabel>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      borderColor={borderColor}
                      _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                    />
                  </FormControl>

                  <FormControl isRequired flex={1}>
                    <FormLabel fontWeight="bold" color={textColor}>
                      الصف الدراسي
                    </FormLabel>
                    <Select
                      value={formData.grade_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade_id: e.target.value }))}
                      placeholder="اختر الصف الدراسي"
                      borderColor={borderColor}
                      _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                    >
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                {/* Description */}
                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor}>
                    وصف الباقة (اختياري)
                  </FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="أدخل وصفاً للباقة..."
                    rows={3}
                    borderColor={borderColor}
                    _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                  />
                </FormControl>

                {/* Image Upload */}
                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor}>
                    صورة الباقة (اختياري)
                  </FormLabel>
                  <VStack spacing={4} align="stretch">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      borderColor={borderColor}
                      _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                    />
                    
                    {imagePreview && (
                      <Box
                        border="2px dashed"
                        borderColor={borderColor}
                        borderRadius="lg"
                        p={4}
                        textAlign="center"
                      >
                        <Image
                          src={imagePreview}
                          alt="معاينة الصورة"
                          maxH="200px"
                          mx="auto"
                          borderRadius="md"
                        />
                      </Box>
                    )}
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button onClick={onClose} variant="outline">
                  إلغاء
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={isEditMode ? handleUpdatePackage : handleCreatePackage}
                  isLoading={actionLoading}
                  loadingText={isEditMode ? "جاري التحديث..." : "جاري الإنشاء..."}
                  leftIcon={<Icon as={isEditMode ? FiEdit2 : FiPlus} />}
                >
                  {isEditMode ? 'تحديث الباقة' : 'إنشاء الباقة'}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                حذف الباقة
              </AlertDialogHeader>
              <AlertDialogBody>
                هل أنت متأكد من حذف الباقة "{selectedPackage?.name}"؟ 
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button onClick={() => setIsDeleteDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleDeletePackage} 
                  ml={3}
                  isLoading={actionLoading}
                >
                  حذف
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
      <ScrollToTop/>
    </Box>
  );
};

export default PackagesManagement;
