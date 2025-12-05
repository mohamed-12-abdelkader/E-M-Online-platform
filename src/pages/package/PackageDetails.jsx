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
  Input,
  useDisclosure,
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
        // تحديث قائمة المواد في packageData
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
    <Box minH="100vh" bg={bgGradient} pt="80px" pb={12} px={4}>
      <Container maxW="6xl">
        {/* Back Button */}
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          colorScheme="blue"
          mb={6}
          onClick={() => navigate('/packages-management')}
          _hover={{ bg: blueLight }}
        >
          العودة للباقات
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
                <Icon as={FiPackage} boxSize={8} />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="2xl" fontWeight="bold">
                  {packageData.name}
                </Heading>
                <Text fontSize="lg" color="whiteAlpha.900">
                  تفاصيل الباقة التعليمية
                </Text>
              </VStack>
            </HStack>
          </Box>

          <CardBody p={8}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Package Image */}
              <Box>
                <Image
                  src={packageData.image || 'https://via.placeholder.com/500x300?text=صورة+الباقة'}
                  alt={packageData.name}
                  borderRadius="xl"
                  objectFit="cover"
                  w="100%"
                  h="300px"
                  fallbackSrc="https://via.placeholder.com/500x300?text=صورة+الباقة"
                  boxShadow="lg"
                />
              </Box>

              {/* Package Info */}
              <VStack align="stretch" spacing={6}>
                {/* Price */}
                <Card bg={blueLight} border="2px solid" borderColor={primaryColor} borderRadius="xl">
                  <CardBody p={6}>
                    <HStack spacing={3} mb={4}>
                      <Box
                        bg={primaryColor}
                        borderRadius="full"
                        p={3}
                        color="white"
                      >
                        <Icon as={FiDollarSign} boxSize={6} />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color={subTextColor}>
                          السعر
                        </Text>
                        <Heading size="xl" color={primaryColor}>
                          {packageData.price} جنيه مصري
                        </Heading>
                      </VStack>
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
                          {packageData.grade_name}
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
                          {new Date(packageData.created_at).toLocaleDateString('ar-EG', {
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

        {/* Subjects Section */}
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
                  المواد المدرجة في الباقة
                </Heading>
                <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full">
                  {packageData.subjects?.length || 0} مادة
                </Badge>
              </HStack>
              {isAdmin && (
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  onClick={onSubjectModalOpen}
                >
                  إضافة مادة
                </Button>
              )}
            </HStack>
          </Box>

          <CardBody p={8}>
            {packageData.subjects && packageData.subjects.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {packageData.subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    to={`/subject/${subject.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      bg={blueLight}
                      border="2px solid"
                      borderColor={primaryColor}
                      borderRadius="xl"
                      cursor="pointer"
                      _hover={{
                        transform: 'translateY(-4px)',
                        shadow: 'lg',
                        borderColor: 'blue.600',
                      }}
                      transition="all 0.3s ease"
                    >
                      <CardBody p={6}>
                        <VStack align="start" spacing={3}>
                          {/* Subject Image */}
                          {subject.image && (
                            <Box w="full" borderRadius="lg" overflow="hidden">
                              <Image
                                src={subject.image}
                                alt={subject.name}
                                w="100%"
                                h="120px"
                                objectFit="cover"
                              />
                            </Box>
                          )}
                          <HStack spacing={2} w="full" justify="space-between">
                            <Badge
                              bg={primaryColor}
                              color="white"
                              px={3}
                              py={1}
                              borderRadius="md"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {subject.name}
                            </Badge>
                            <Icon as={FiCheckCircle} color={primaryColor} boxSize={5} />
                          </HStack>
                          {subject.description && (
                            <Text fontSize="sm" color={subTextColor} noOfLines={2}>
                              {subject.description}
                            </Text>
                          )}
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            w="full"
                            mt={2}
                          >
                            عرض التفاصيل
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </SimpleGrid>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FiBookOpen} boxSize={12} color={subTextColor} />
                  <Text color={subTextColor} fontSize="lg">
                    لا توجد مواد مدرجة في الباقة
                  </Text>
                  {isAdmin && (
                    <Text color={subTextColor} fontSize="sm">
                      قم بإضافة مواد جديدة للباقة
                    </Text>
                  )}
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Admin Section - Activation Codes */}
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
                  <Icon as={FiKey} boxSize={6} />
                  <Heading size="lg" fontWeight="bold">
                    إدارة أكواد التفعيل
                  </Heading>
                </HStack>
                <Button
                  leftIcon={<Icon as={FiKey} />}
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  onClick={onOpen}
                >
                  إنشاء أكواد جديدة
                </Button>
              </HStack>
            </Box>

            <CardBody p={8}>
              {activationCodes.length > 0 ? (
                <VStack spacing={6} align="stretch">
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    الأكواد المنشأة ({activationCodes.length})
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {activationCodes.map((codeData) => (
                      <Card
                        key={codeData.id}
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
                            {/* QR Code */}
                            {codeData.qr_code && (
                              <Box
                                bg="white"
                                p={4}
                                borderRadius="lg"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Image
                                  src={codeData.qr_code}
                                  alt={`QR Code for ${codeData.code}`}
                                  maxH="200px"
                                  maxW="200px"
                                />
                              </Box>
                            )}

                            {/* Code */}
                            <VStack spacing={2} align="stretch">
                              <Text fontSize="xs" color={subTextColor} fontWeight="medium">
                                كود التفعيل
                              </Text>
                              <HStack spacing={2}>
                                <Box
                                  bg="white"
                                  px={4}
                                  py={2}
                                  borderRadius="md"
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
                                  >
                                    {codeData.code}
                                  </Text>
                                </Box>
                                <IconButton
                                  icon={<Icon as={FiCopy} />}
                                  colorScheme="blue"
                                  onClick={() => handleCopyCode(codeData.code)}
                                  aria-label="نسخ الكود"
                                />
                              </HStack>
                            </VStack>

                            {/* Info */}
                            <VStack spacing={2} align="stretch" fontSize="sm">
                              <HStack justify="space-between">
                                <Text color={subTextColor}>الحالة:</Text>
                                <Badge
                                  colorScheme={codeData.uses >= codeData.max_uses ? 'red' : 'green'}
                                >
                                  {codeData.uses >= codeData.max_uses
                                    ? 'مستخدم'
                                    : 'متاح'}
                                </Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text color={subTextColor}>الاستخدام:</Text>
                                <Text fontWeight="bold" color={textColor}>
                                  {codeData.uses} / {codeData.max_uses}
                                </Text>
                              </HStack>
                              {codeData.expires_at && (
                                <HStack justify="space-between">
                                  <Text color={subTextColor}>انتهاء الصلاحية:</Text>
                                  <Text fontWeight="bold" color={textColor} fontSize="xs">
                                    {new Date(codeData.expires_at).toLocaleDateString('ar-EG')}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>

                            {/* Download QR Button */}
                            {codeData.qr_code && (
                              <Button
                                leftIcon={<Icon as={FiDownload} />}
                                bg={primaryColor}
                                color="white"
                                size="sm"
                                onClick={() => handleDownloadQR(codeData.qr_code, codeData.code)}
                                _hover={{ bg: 'blue.600' }}
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
                <Center py={8}>
                  <VStack spacing={4}>
                    <Icon as={FiKey} boxSize={12} color={subTextColor} />
                    <Text color={subTextColor} fontSize="lg">
                      لا توجد أكواد تفعيل منشأة
                    </Text>
                    <Text color={subTextColor} fontSize="sm">
                      قم بإنشاء أكواد تفعيل جديدة للباقة
                    </Text>
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
          >
            العودة للباقات
          </Button>
          {!isAdmin && (
            <Button
              rightIcon={<Icon as={FiArrowRight} />}
              bg={blueGradient}
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              _hover={{
                bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)",
                transform: 'translateY(-2px)',
                shadow: 'xl'
              }}
              transition="all 0.3s ease"
              fontWeight="bold"
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
          <Box bg={blueGradient} p={6} color="white">
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
                  borderRadius="lg"
                  size="lg"
                  min={1}
                  max={100}
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
                  تاريخ انتهاء الصلاحية (اختياري)
                </FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
                  }
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
                  bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)"
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
                  إضافة مادة جديدة للباقة
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
                  صورة المادة (اختياري)
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
                      <Icon as={FiImage} boxSize={8} color={primaryColor} />
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
                      bg={blueLight}
                      position="relative"
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
              <Button
                onClick={onSubjectModalClose}
                variant="outline"
                size="lg"
                borderRadius="xl"
                px={6}
              >
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
                  bg: "linear-gradient(135deg, #2C5282 0%, #3182CE 100%)"
                }}
                transition="all 0.3s ease"
              >
                إضافة المادة
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ScrollToTop />
    </Box>
  );
};

export default PackageDetails;

