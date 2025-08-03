import React, { useState } from "react";
import { VStack, Heading, Center, Spinner, Text, Icon, SimpleGrid, Box, HStack, Image, Button, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, NumberInput, NumberInputField, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, IconButton, Tooltip, Flex, useColorModeValue, Badge, InputGroup, InputRightElement } from "@chakra-ui/react";
import { FaGraduationCap, FaLightbulb, FaBookOpen, FaClock, FaStar, FaEdit, FaTrash, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import baseUrl from "../../../api/baseUrl";
import { Link } from "react-router-dom";


const CourseExamsTab = ({
  courseExams,
  courseExamsLoading,
  courseExamsError,
  headingColor,
  sectionBg,
  dividerColor,
  formatDate,
  isTeacher,
  token,
  refreshExams, // دالة لإعادة تحميل الامتحانات بعد التعديل/الحذف
  onAddBulkQuestions, // دالة فتح مودال إضافة الأسئلة بالجملة
  courseId
}) => {
  console.log('CourseExamsTab props - onAddBulkQuestions:', typeof onAddBulkQuestions, 'isTeacher:', isTeacher);
  const toast = useToast();
  const [editModal, setEditModal] = useState({ isOpen: false, exam: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, exam: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    questions_count: '',
    duration: '',
    total_grade: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // تعديل الامتحان
  const handleEditExam = async (examId, formData) => {
    try {
      setActionLoading(true);
      
      // تحديد نوع البيانات المرسلة
      const isFormData = formData instanceof FormData;
      
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          // لا نضيف Content-Type إذا كان FormData (سيتم تعيينه تلقائياً)
          ...(isFormData ? {} : { 'Content-Type': 'application/json' })
        },
      };
      
      await baseUrl.patch(`/api/course/course-exam/${examId}`, formData, config);
      toast({ title: 'تم تعديل الامتحان بنجاح', status: 'success', duration: 3000, isClosable: true });
      setEditModal({ isOpen: false, exam: null });
      refreshExams && refreshExams();
    } catch (error) {
      toast({ title: 'خطأ في تعديل الامتحان', description: error.response?.data?.message || 'حدث خطأ غير متوقع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };
  // حذف الامتحان
  const handleDeleteExam = async (examId) => {
    try {
      setActionLoading(true);
      await baseUrl.delete(`/api/course/course-exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'تم حذف الامتحان بنجاح', status: 'success', duration: 3000, isClosable: true });
      setDeleteDialog({ isOpen: false, exam: null });
      refreshExams && refreshExams();
    } catch (error) {
      toast({ title: 'خطأ في حذف الامتحان', description: error.response?.data?.message || 'حدث خطأ غير متوقع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      let requestData;
      let config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      // إنشاء FormData إذا كان هناك ملف محدد
      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('questions_count', Number(form.questions_count));
        formData.append('duration', Number(form.duration));
        formData.append('total_grade', Number(form.total_grade));
        formData.append('image', selectedFile);
        
        requestData = formData;
        // لا نضيف Content-Type إذا كان FormData (سيتم تعيينه تلقائياً)
      } else {
        requestData = {
          title: form.title,
          questions_count: Number(form.questions_count),
          duration: Number(form.duration),
          total_grade: Number(form.total_grade)
        };
        config.headers['Content-Type'] = 'application/json';
      }
      
      await baseUrl.post(`/api/course/${courseId}/course-exam`, requestData, config);
      toast({ title: 'تم إنشاء الامتحان بنجاح', status: 'success' });
      setCreateModalOpen(false);
      setForm({ title: '', questions_count: '', duration: '', total_grade: '' });
      setSelectedFile(null);
      setImagePreview('');
      if (refreshExams) refreshExams();
    } catch (err) {
      toast({ title: err.message || 'حدث خطأ', status: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  // مودال التعديل
  const EditExamModal = ({ isOpen, onClose, exam, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
      title: exam?.title || '',
      image: exam?.image || '',
      questions_count: exam?.questions_count || 0,
      duration: exam?.duration || 0,
      total_grade: exam?.total_grade || 0,
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(exam?.image || '');

    React.useEffect(() => {
      if (exam) {
        setFormData({
          title: exam.title || '',
          image: exam.image || '',
          questions_count: exam.questions_count || 0,
          duration: exam.duration || 0,
          total_grade: exam.total_grade || 0,
        });
        setImagePreview(exam.image || '');
        setSelectedFile(null);
      }
    }, [exam]);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        // إنشاء معاينة للصورة
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // إنشاء FormData إذا كان هناك ملف محدد
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('questions_count', formData.questions_count);
        formDataToSend.append('duration', formData.duration);
        formDataToSend.append('total_grade', formData.total_grade);
        formDataToSend.append('image', selectedFile);
        
        onSubmit(exam.id, formDataToSend);
      } else {
        // إرسال البيانات كـ JSON إذا لم يكن هناك ملف
        onSubmit(exam.id, formData);
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'sm', md: 'md', lg: 'lg' }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 2, md: 0 }}>
          <ModalHeader fontSize={{ base: 'md', md: 'lg' }}>تعديل الامتحان الشامل</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={{ base: 3, md: 4 }}>
                <FormControl isRequired>
                  <FormLabel>عنوان الامتحان</FormLabel>
                  <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>صورة الامتحان</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {/* معاينة الصورة الحالية */}
                    {imagePreview && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>الصورة الحالية:</Text>
                        <Image 
                          src={imagePreview} 
                          alt="معاينة الصورة" 
                          borderRadius="md" 
                          maxH="200px" 
                          objectFit="cover"
                          border="1px solid"
                          borderColor="gray.200"
                        />
                      </Box>
                    )}
                    
                    {/* رفع ملف جديد */}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      p={1}
                      border="2px dashed"
                      borderColor="blue.200"
                      borderRadius="md"
                      _hover={{ borderColor: "blue.300" }}
                    />
                    
                    {/* رابط الصورة (اختياري) */}
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">أو رابط الصورة (اختياري)</FormLabel>
                      <Input 
                        value={formData.image} 
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </FormControl>
                  </VStack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>عدد الأسئلة</FormLabel>
                  <NumberInput min={1} value={formData.questions_count} onChange={val => setFormData({ ...formData, questions_count: parseInt(val) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>المدة (دقيقة)</FormLabel>
                  <NumberInput min={1} value={formData.duration} onChange={val => setFormData({ ...formData, duration: parseInt(val) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>الدرجة الكلية</FormLabel>
                  <NumberInput min={1} value={formData.total_grade} onChange={val => setFormData({ ...formData, total_grade: parseInt(val) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={onClose}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
                px={{ base: 3, sm: 4 }}
                py={{ base: 2, sm: 3 }}
                minW={{ base: '80px', sm: '100px' }}
              >
                إلغاء
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={loading}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
                px={{ base: 3, sm: 4 }}
                py={{ base: 2, sm: 3 }}
                minW={{ base: '100px', sm: '120px' }}
              >
                تعديل
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };

  // Dialog الحذف
  const DeleteExamDialog = ({ isOpen, onClose, onConfirm, exam, loading }) => (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">تأكيد حذف الامتحان</AlertDialogHeader>
        <AlertDialogBody>هل أنت متأكد من حذف "{exam?.title}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogBody>
        <AlertDialogFooter>
          <Button 
            onClick={onClose}
            size={{ base: 'sm', sm: 'md' }}
            fontSize={{ base: 'sm', sm: 'md' }}
            px={{ base: 3, sm: 4 }}
            py={{ base: 2, sm: 3 }}
            minW={{ base: '80px', sm: '100px' }}
          >
            إلغاء
          </Button>
          <Button 
            colorScheme="red" 
            onClick={() => onConfirm(exam.id)} 
            ml={3} 
            isLoading={loading}
            size={{ base: 'sm', sm: 'md' }}
            fontSize={{ base: 'sm', sm: 'md' }}
            px={{ base: 3, sm: 4 }}
            py={{ base: 2, sm: 3 }}
            minW={{ base: '100px', sm: '120px' }}
          >
            حذف
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const handleToggleVisibility = async (examId, currentVisibility) => {
    try {
      setActionLoading(true);
      await baseUrl.patch(`/api/course/course-exam/${examId}/visibility`, { is_visible: !currentVisibility }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: !currentVisibility ? 'تم إظهار الامتحان' : 'تم إخفاء الامتحان', status: 'success', duration: 3000, isClosable: true });
      refreshExams && refreshExams();
    } catch (error) {
      toast({ title: 'خطأ في تغيير حالة الظهور', description: error.response?.data?.message || 'حدث خطأ غير متوقع', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
      <Flex
        justify="space-between" 
        align="center" 
        mb={{ base: 2, md: 4 }}
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: 2, sm: 0 }}
      >
        <Heading size={{ base: 'sm', md: 'md' }} color={headingColor}>
          الامتحانات الشاملة
        </Heading>
        {isTeacher && (
          <Button 
            colorScheme="blue" 
            mb={{ base: 0, sm: 0 }} 
            onClick={() => setCreateModalOpen(true)}
            size={{ base: 'sm', sm: 'md', md: 'lg' }}
            w={{ base: '100%', sm: 'auto' }}
            fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
            px={{ base: 4, sm: 6, md: 8 }}
            py={{ base: 2, sm: 3, md: 4 }}
            minW={{ base: '160px', sm: '180px', md: '200px' }}
            h={{ base: '40px', sm: '44px', md: '48px' }}
            borderRadius="full"
          >
            إنشاء امتحان شامل
          </Button>
        )}
      </Flex>
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} isCentered size={{ base: 'sm', md: 'md', lg: 'lg' }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 2, md: 0 }}>
          <ModalHeader fontSize={{ base: 'md', md: 'lg' }}>إنشاء امتحان شامل جديد</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateExam}>
            <ModalBody>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <FormControl isRequired>
                  <FormLabel>عنوان الامتحان</FormLabel>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>صورة الامتحان</FormLabel>
                  <VStack spacing={3} align="stretch">
                    {/* معاينة الصورة */}
                    {imagePreview && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>معاينة الصورة:</Text>
                        <Image 
                          src={imagePreview} 
                          alt="معاينة الصورة" 
                          borderRadius="md" 
                          maxH="200px" 
                          objectFit="cover"
                          border="1px solid"
                          borderColor="gray.200"
                        />
                      </Box>
                    )}
                    
                    {/* رفع ملف جديد */}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      p={1}
                      border="2px dashed"
                      borderColor="blue.200"
                      borderRadius="md"
                      _hover={{ borderColor: "blue.300" }}
                    />
                  </VStack>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>عدد الأسئلة</FormLabel>
                  <Input type="number" value={form.questions_count} onChange={e => setForm(f => ({ ...f, questions_count: e.target.value }))} min={1} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>مدة الامتحان (دقائق)</FormLabel>
                  <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} min={1} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>الدرجة الكلية</FormLabel>
                  <Input type="number" value={form.total_grade} onChange={e => setForm(f => ({ ...f, total_grade: e.target.value }))} min={1} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={() => setCreateModalOpen(false)}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
                px={{ base: 3, sm: 4 }}
                py={{ base: 2, sm: 3 }}
                minW={{ base: '80px', sm: '100px' }}
              >
                إلغاء
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={createLoading}
                size={{ base: 'sm', sm: 'md' }}
                fontSize={{ base: 'sm', sm: 'md' }}
                px={{ base: 3, sm: 4 }}
                py={{ base: 2, sm: 3 }}
                minW={{ base: '100px', sm: '120px' }}
              >
                إنشاء
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      {courseExamsLoading ? (
        <Center py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>جاري تحميل الامتحانات الشاملة...</Text>
          </VStack>
        </Center>
      ) : courseExamsError ? (
        <Center py={10}>
          <VStack spacing={4}>
            <Icon as={FaLightbulb} boxSize={12} color="red.400" />
            <Text color="red.500">{courseExamsError}</Text>
          </VStack>
        </Center>
      ) : courseExams.length === 0 ? (
        <Center py={10}>
          <VStack spacing={4}>
            <Icon as={FaGraduationCap} boxSize={12} color="gray.400" />
            <Text color="gray.500">لا يوجد امتحانات شاملة متاحة لهذا الكورس</Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }} gap={{ base: 3, md: 6 }}>
          {courseExams.map((exam) => (
            <Box 
              key={exam.id} 
              bg={useColorModeValue("white", "gray.800")} 
              borderRadius={{ base: 'xl', md: '2xl' }} 
              boxShadow="lg" 
              p={{ base: 4, md: 5 }} 
              borderWidth="2px" 
              borderColor={useColorModeValue("gray.200", "gray.700")} 
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
              _hover={{ 
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', 
                borderColor: 'blue.400', 
                transform: 'translateY(-4px)' 
              }}
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: { base: 'xl', md: '2xl' },
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.03) 100%)",
                zIndex: -1
              }}
            >
              <VStack align="start" spacing={{ base: 2, md: 3 }}>
                                  <Box 
                    w="full" 
                    h={{ base: '120px', sm: '140px', md: '160px' }} 
                    borderRadius={{ base: 'xl', md: '2xl' }} 
                    overflow="hidden" 
                    bg="gray.100" 
                    mb={3}
                    boxShadow="0 8px 16px rgba(0, 0, 0, 0.1)"
                    border="2px solid"
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    position="relative"
                    _before={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: { base: 'xl', md: '2xl' },
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)",
                      zIndex: 1
                    }}
                  >
                    <img 
                      src={exam.image} 
                      alt={exam.title} 
                      w="full" 
                      h="full" 
                      style={{
                        objectFit:'cover', 
                        width:'100%', 
                        height:'100%',
                        position: 'relative',
                        zIndex: 2
                      }} 
                    />
                  </Box>
                <HStack spacing={2}>
                  <Icon as={FaGraduationCap} color="green.500" />
                  <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'lg' }} color={headingColor} noOfLines={2}>{exam.title}</Text>
                </HStack>
                <VStack spacing={{ base: 1, md: 2 }} fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" align="start" w="full">
                  <HStack spacing={1}><Icon as={FaBookOpen} /> <Text>{exam.questions_count} سؤال</Text></HStack>
                  <HStack spacing={1}><Icon as={FaClock} /> <Text>{exam.duration} دقيقة</Text></HStack>
                  <HStack spacing={1}><Icon as={FaStar} /> <Text>الدرجة: {exam.total_grade}</Text></HStack>
                  <HStack spacing={1}>
                    <Icon as={exam.is_visible ? FaEye : FaEyeSlash} />
                    <Text>الحالة: {exam.is_visible ? "ظاهر" : "مخفي"}</Text>
                    <Badge 
                      colorScheme={exam.is_visible ? "green" : "yellow"} 
                      fontSize="xs" 
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {exam.is_visible ? "ظاهر" : "مخفي"}
                    </Badge>
                  </HStack>
                </VStack>
                <Text fontSize={{ base: 'xs', md: 'xs' }} color="gray.400">تاريخ الإنشاء: {formatDate(exam.created_at)}</Text>
                <VStack spacing={{ base: 1, md: 2 }} w="full">
                  <Link to={`/exam/${exam.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                    <Button 
                      colorScheme="blue" 
                      size={{ base: 'xs', sm: 'sm', md: 'md' }} 
                      leftIcon={<Icon as={FaGraduationCap} boxSize={{ base: 3, sm: 4, md: 4 }} />} 
                      w="full"
                      variant="solid"
                      borderRadius="full"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                        bg: 'blue.600'
                      }}
                      transition="all 0.2s"
                      fontWeight="bold"
                      fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                      py={{ base: 2, sm: 2, md: 3 }}
                      px={{ base: 2, sm: 3, md: 4 }}
                      h={{ base: '36px', sm: '40px', md: '48px' }}
                      minW={{ base: '140px', sm: '160px', md: '180px' }}
                    >
                      {isTeacher ? "عرض الامتحان" : "ابدأ الامتحان"}
                    </Button>
                  </Link>
                  {isTeacher && (
                    <HStack spacing={{ base: 1, md: 2 }} w="full" flexWrap="wrap" gap={1}>
                      <Tooltip label={exam.is_visible ? "إخفاء الامتحان" : "إظهار الامتحان"} placement="top">
                        <IconButton
                          colorScheme={exam.is_visible ? "blue" : "gray"}
                          size={{ base: 'xs', md: 'sm' }}
                          icon={<Icon as={exam.is_visible ? FaEye : FaEyeSlash} />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleVisibility(exam.id, exam.is_visible);
                          }}
                          aria-label={exam.is_visible ? "إخفاء الامتحان" : "إظهار الامتحان"}
                          isLoading={actionLoading}
                          type="button"
                          as="button"
                        />
                      </Tooltip>
                      <Tooltip label="إضافة أسئلة للامتحان" placement="top">
                        <IconButton
                          colorScheme="green"
                          size={{ base: 'xs', md: 'sm' }}
                          icon={<Icon as={FaPlus} />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            console.log('Opening bulk questions modal for exam:', exam.id, exam.title);
                            if (onAddBulkQuestions) {
                              onAddBulkQuestions(exam.id, exam.title, 'comprehensive');
                            } else {
                              console.error('onAddBulkQuestions function is not provided');
                            }
                          }}
                          aria-label="إضافة أسئلة للامتحان"
                          type="button"
                          as="button"
                        />
                      </Tooltip>
                      <Button 
                        colorScheme="yellow" 
                        size={{ base: 'xs', sm: 'sm', md: 'md' }} 
                        leftIcon={<Icon as={FaEdit} boxSize={{ base: 3, sm: 4, md: 4 }} />} 
                        onClick={() => setEditModal({ isOpen: true, exam })} 
                        flex={1}
                        fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                        px={{ base: 2, sm: 3, md: 4 }}
                        py={{ base: 1, sm: 2, md: 2 }}
                        minW={{ base: '80px', sm: '100px', md: '120px' }}
                        h={{ base: '32px', sm: '36px', md: '40px' }}
                      >
                        تعديل
                      </Button>
                      <Button 
                        colorScheme="red" 
                        size={{ base: 'xs', sm: 'sm', md: 'md' }} 
                        leftIcon={<Icon as={FaTrash} boxSize={{ base: 3, sm: 4, md: 4 }} />} 
                        onClick={() => setDeleteDialog({ isOpen: true, exam })} 
                        flex={1}
                        fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                        px={{ base: 2, sm: 3, md: 4 }}
                        py={{ base: 1, sm: 2, md: 2 }}
                        minW={{ base: '80px', sm: '100px', md: '120px' }}
                        h={{ base: '32px', sm: '36px', md: '40px' }}
                      >
                        حذف
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
      {/* Modals */}
      <EditExamModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, exam: null })}
        exam={editModal.exam}
        onSubmit={handleEditExam}
        loading={actionLoading}
      />
      <DeleteExamDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, exam: null })}
        exam={deleteDialog.exam}
        onConfirm={handleDeleteExam}
        loading={actionLoading}
      />
    </VStack>
  );
};

export default CourseExamsTab;