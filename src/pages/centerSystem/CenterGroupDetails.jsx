import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Center,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  Skeleton,
  Card,
  CardBody,
  Grid,
  GridItem,
  Flex,
  Container,
  SimpleGrid,
  Avatar,
  Progress,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  Image,
  Icon,
  useBreakpointValue,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { BiSearch } from 'react-icons/bi';
import { MdAdd, MdDelete, MdSchedule, MdPeople, MdLocationOn, MdSchool, MdAttachMoney, MdEmail, MdPhone, MdCheckCircle, MdCancel, MdLock } from 'react-icons/md';
import { FaGraduationCap, FaClock, FaCalendarAlt, FaUsers, FaFileAlt, FaStar } from 'react-icons/fa';
import { useGroupStudents } from '../../Hooks/centerSystem/useGroupStudents';
import AddStudentDualModal from '../../components/centerSystem/AddStudentDualModal';
import EditStudentModal from '../../components/centerSystem/EditStudentModal';
import AddExamModal from '../../components/centerSystem/AddExamModal';
import ExamGradesModal from '../../components/centerSystem/ExamGradesModal';
import baseUrl from '../../api/baseUrl';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import AttendanceHistoryModal from '../../components/centerSystem/AttendanceHistoryModal';
import 'react-day-picker/dist/style.css';
import { Html5Qrcode } from 'html5-qrcode';

const CenterGroupDetails = () => {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isExamGradesModalOpen, setIsExamGradesModalOpen] = useState(false);
  const [isAttendanceHistoryOpen, setIsAttendanceHistoryOpen] = useState(false);
  const { isOpen: isCalendarOpen, onToggle: onToggleCalendar } = useDisclosure({ defaultIsOpen: false });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState({}); // { studentId: { 'yyyy-MM-dd': 'present' | 'absent' } }
  const [savingAttendance, setSavingAttendance] = useState(false);

  // ---------- QR scanner state + helpers (ADDED) ----------
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const qrScannerRef = useRef(null);
  const [qrProcessing, setQrProcessing] = useState(false);

  const startQrScanner = async () => {
    setIsQrScannerOpen(true);
    setQrProcessing(false);

    requestAnimationFrame(async () => {
      try {
        const elementId = 'qr-scanner';

        if (qrScannerRef.current) {
          try { await qrScannerRef.current.stop(); } catch (e) {}
          try { qrScannerRef.current.clear(); } catch (e) {}
          qrScannerRef.current = null;
        }

        const html5Qr = new Html5Qrcode(elementId, { verbose: false });
        qrScannerRef.current = html5Qr;

        const devices = await Html5Qrcode.getCameras();
        
        // تحديد الكاميرا المناسبة
        let cameraId = null;
        
        if (devices && devices.length > 0) {
          // البحث عن الكاميرا الخلفية أولاً
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment') ||
            device.label.toLowerCase().includes('facing back')
          );
          
          if (backCamera) {
            cameraId = backCamera.id;
            console.log('Using back camera:', backCamera.label);
          } else {
            // إذا لم توجد كاميرا خلفية، استخدم الكاميرا الأولى
            cameraId = devices[0].id;
            console.log('Using first available camera:', devices[0].label);
          }
        }

        if (!cameraId) {
          throw new Error('لم يتم العثور على كاميرا متاحة');
        }

        await html5Qr.start(
          cameraId,
          { 
            fps: 10, 
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
            videoConstraints: {
              facingMode: { ideal: "environment" } // يفضل الكاميرا الخلفية
            }
          },
          async (decodedText) => {
            if (qrProcessing) return;
            setQrProcessing(true);
            try {
              await registerAttendanceByQr(decodedText, 'present');
            } catch (err) {
              // handled in registerAttendanceByQr
            } finally {
              try { await html5Qr.stop(); } catch (e) {}
              try { html5Qr.clear(); } catch (e) {}
              qrScannerRef.current = null;
              setIsQrScannerOpen(false);
              setQrProcessing(false);
            }
          },
          (errorMessage) => {
            // scan failure callback (optional logging)
          }
        );
      } catch (err) {
        console.error('QR scanner start error:', err);
        toast({ 
          title: 'فشل في فتح الكاميرا', 
          description: err.message || 'تأكد من صلاحية الكاميرا والسماح بالوصول إليها', 
          status: 'error', 
          duration: 4000, 
          isClosable: true 
        });
        setIsQrScannerOpen(false);
        setQrProcessing(false);
      }
    });
  };

  const stopQrScanner = async () => {
    try {
      if (qrScannerRef.current) {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      }
    } catch (err) {
      // ignore
    } finally {
      setIsQrScannerOpen(false);
      setQrProcessing(false);
    }
  };
  // ---------- end QR scanner state + helpers ----------
  
  // new states for "عرض الطلاب" modal
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [modalStudents, setModalStudents] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const { students, loading, error: studentsError, fetchStudents, addStudent, deleteStudent, updateStudent } = useGroupStudents(id);

  useEffect(() => {
    const fetchGroupData = async () => {
      setLoadingGroup(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await baseUrl.get(`/api/study-groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroupData(response.data);
      } catch (err) {
        // If backend returns access:false (e.g. 403 with message), show the blocked UI
        if (err.response && err.response.data && err.response.data.access === false) {
          setGroupData(err.response.data);
        } else {
          setError('فشل في جلب بيانات المجموعة');
          toast({ title: 'فشل في جلب بيانات المجموعة', status: 'error' });
        }
      } finally {
        setLoadingGroup(false);
      }
    };
    fetchGroupData();
    // عند تغيير التاريخ المختار، جلب الطلاب مع التاريخ
    const dateKey = selectedDate.toISOString().split('T')[0];
    fetchStudents(dateKey);
    // eslint-disable-next-line
  }, [id, selectedDate]);

  // دالة لتحميل بيانات الحضور المحفوظة
  const loadAttendanceData = async (dateKey) => {
    try {
      const token = localStorage.getItem('token');
      const response = await baseUrl.get(
        `/api/study-groups/${id}/attendance?date=${dateKey}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // تحويل بيانات الحضور إلى الشكل المطلوب
      const attendanceData = {};
      if (response.data && response.data.attendance) {
        response.data.attendance.forEach(item => {
          attendanceData[item.student_id] = {
            [dateKey]: item.status
          };
        });
      }
      setAttendance(attendanceData);
    } catch (err) {
      console.log('No attendance data found for this date or error loading:', err);
      // إذا لم توجد بيانات، نبدأ بحالة فارغة
      setAttendance({});
    }
  };

  // تحميل بيانات الحضور عند تغيير التاريخ
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    loadAttendanceData(dateKey);
  }, [selectedDate, id]);

  // إضافة طالب عبر رقم الطالب student_id
  const handleAddStudentByCode = async (studentId) => {
    try {
      await addStudent({ student_id: studentId });
      const dateKey = selectedDate.toISOString().split('T')[0];
      await fetchStudents(dateKey);
      toast({
        title: 'نجح',
        description: 'تم إضافة الطالب بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAddModalOpen(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || error.message || 'حدث خطأ في إضافة الطالب',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // إضافة طالب عبر الاسم
  const handleAddStudentByName = async (payload) => {
    try {
      // POST to /api/study-groups/:id/students with name/phone/parent_phone
      const token = localStorage.getItem('token');
      await baseUrl.post(
        `/api/study-groups/${id}/students`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const dateKey = selectedDate.toISOString().split('T')[0];
      await fetchStudents(dateKey);
      toast({ title: 'نجح', description: 'تم إضافة الطالب بنجاح', status: 'success', duration: 3000, isClosable: true });
      // لا نغلق المودال هنا لإتاحة إضافة أكثر من طالب بالاسم بسرعة
    } catch (error) {
      toast({ title: 'خطأ', description: error.response?.data?.message || error.message || 'حدث خطأ في إضافة الطالب', status: 'error', duration: 5000, isClosable: true });
    }
  };

  // تعديل طالب
  const handleEditStudent = async (studentData) => {
    try {
      await updateStudent(selectedStudent.id, studentData);
      toast({
        title: "نجح",
        description: "تم تحديث بيانات الطالب بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في تحديث بيانات الطالب",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // حذف طالب
  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteStudent(studentId);
      toast({
        title: "نجح",
        description: "تم حذف الطالب بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في حذف الطالب",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // فتح المودال وجلب الطلاب من الـ API (يستخدم selectedDate)
  const openStudentsModal = async () => {
    setIsStudentsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem('token');
      const dateKey = selectedDate.toISOString().split('T')[0];
      const resp = await baseUrl.get(`/api/study-groups/${id}/students?date=${dateKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // API قد يرجع { students: [...] } أو مباشرة مصفوفة
      const list = resp.data?.students ?? resp.data ?? [];
      setModalStudents(list);
    } catch (err) {
      console.error('Error loading students for modal:', err);
      setModalError('فشل في جلب بيانات الطلاب');
      setModalStudents([]);
    } finally {
      setModalLoading(false);
    }
  };

  // تصفية الطلاب
  const filteredStudents = (students || []).filter((student) =>
    (student.student_name && student.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.phone && student.phone.includes(searchTerm))
  );

  // دالة لتسجيل الحضور
  const handleAttendance = (studentId, status) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [dateKey]: status
      }
    }));
  };

  const handleSaveAttendance = async () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    // إنشاء مصفوفة الحضور بالشكل المطلوب للـ API
    const attendanceArr = students.map((s) => ({
      student_id: s.id,
      status: attendance[s.id]?.[dateKey] || 'absent'
    }));

    setSavingAttendance(true);
    try {
      const token = localStorage.getItem('token');
      const response = await baseUrl.post(
        `/api/study-groups/${id}/attendance`,
        {
          date: dateKey,
          attendance: attendanceArr
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Attendance saved successfully:', response.data);
      toast({ 
        title: 'تم حفظ الحضور بنجاح', 
        description: `تم تسجيل الحضور لـ ${dateKey}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // تحديث بيانات الطلاب بعد حفظ الحضور
      fetchStudents(dateKey);
      
    } catch (err) {
      console.error('Error saving attendance:', err);
      toast({ 
        title: 'فشل في حفظ الحضور', 
        description: err.response?.data?.message || 'حدث خطأ أثناء حفظ الحضور',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  // إضافة دالة معالج لحدث إضافة امتحان (تُمرّر للـ AddExamModal)
  const handleExamAdded = async (exam) => {
    // بسيطة: إظهار رسالة وتجديد القائمة (لو تحتاج منطق أوسع عدِّل هنا)
    try {
      toast({
        title: 'تم إنشاء الامتحان',
        description: 'تم إضافة الامتحان بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      const dateKey = selectedDate.toISOString().split('T')[0];
      await fetchStudents(dateKey);
    } catch (err) {
      console.error('Error in handleExamAdded:', err);
    }
  };
  
  // ---------- جديد: تسجيل الحضور عبر QR ----------
  const registerAttendanceByQr = async (scannedText, status = 'present') => {
    if (!scannedText) {
      toast({ title: 'نص QR فارغ', status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    const dateKey = selectedDate.toISOString().split('T')[0];
    try {
      const token = localStorage.getItem('token');
      const resp = await baseUrl.post(
        `/api/study-groups/${id}/scan-qr`,
        {
          date: dateKey,
          qr_data: scannedText,
          status
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      // نجاح
      toast({ title: 'تم تسجيل الحضور', description: resp.data?.message || 'تمت العملية بنجاح', status: 'success', duration: 3000, isClosable: true });
      // تحديث البيانات محلياً
      await fetchStudents(dateKey);
      await loadAttendanceData(dateKey);
      return resp.data;
    } catch (err) {
      console.error('QR register error:', err);
      toast({
        title: 'فشل تسجيل الحضور',
        description: err.response?.data?.message || err.message || 'حدث خطأ',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      throw err;
    }
  };

  // ألوان الثيم
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('purple.500', 'purple.300');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatDays = (daysString) => {
    if (!daysString) return '';
    return daysString.split(',').join('، ');
  };

  // تمت إزالة حالة الدفع من الجدول والبطاقات

  // دالة لتحديد لون الحضور
  const getAttendanceColor = (status) => {
    if (status === 'present') return 'green';
    if (status === 'absent') return 'red';
    if (status === 'not_set') return 'gray';
    return 'gray';
  };

  // دالة مساعدة لإرجاع مصفوفة من الأيام (خمسة أيام متتالية)
  function getFiveDays(selectedDate) {
    const days = [];
    // نبدأ من يومين قبل اليوم المختار
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - 2);
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  // دالة لإرجاع جميع أيام الشهر
  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // إضافة أيام فارغة في بداية الشهر
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // إضافة أيام الشهر
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }

  // دالة لتغيير الشهر
  const changeMonth = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (loadingGroup) {
    return (
      <Box p={6} className="mt-[80px]" bg={bgColor} minH="100vh">
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Skeleton height="200px" borderRadius="2xl" />
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Skeleton height="150px" borderRadius="xl" />
              <Skeleton height="150px" borderRadius="xl" />
              <Skeleton height="150px" borderRadius="xl" />
              <Skeleton height="150px" borderRadius="xl" />
            </SimpleGrid>
            <Skeleton height="600px" borderRadius="2xl" />
          </VStack>
        </Container>
      </Box>
    );
  }
if (groupData && groupData.access === false) {
    return (
      <Box p={6} className="mt-[80px]" bg={bgColor} minH="100vh">
        <Container maxW="container.md">
          <Card
            bgGradient="linear(135deg, gray.50 0%, white 100%)"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            shadow="xl"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="center">
              <Box
                p={4}
                bg={useColorModeValue('red.50', 'red.900')}
                borderRadius="full"
                boxShadow="md"
              >
                <Icon as={MdLock} boxSize={10} color={useColorModeValue('red.500', 'red.300')} />
              </Box>
              <Heading size="md" textAlign="center" color={textColor}>
                تم حجب المحتوى
              </Heading>
              <Text textAlign="center" color="gray.600">
                {groupData.message || 'تم حجب المحتوي لحين تجديد الاشتراك'}
              </Text>
              <HStack spacing={4} pt={2}>
                <Button colorScheme="blue" onClick={() => window.location.reload()} borderRadius="xl">
                  إعادة المحاولة
                </Button>
                <Button variant="outline" onClick={() => window.history.back()} borderRadius="xl">
                  العودة
                </Button>
              </HStack>
            </VStack>
          </Card>
        </Container>
      </Box>
    );
  }
  if (error || !groupData) {
    return (
      <Box p={6} className="mt-[80px]" bg={bgColor} minH="100vh">
        <Container maxW="container.xl">
          <Alert status="error" borderRadius="2xl" shadow="lg">
            <AlertIcon />
            <Text fontWeight="semibold">{error || 'حدث خطأ في تحميل بيانات المجموعة'}</Text>
          </Alert>
        </Container>
      </Box>
    );
  }

  // عرض رسالة أن المحتوى محجوب إذا جاءت الاستجابة بهذا الشكل
  

  return (
    <Box  className="my-[80px] px-auto" bg={bgColor} minH="100vh">
      <Container maxW="container.xl"  className='px-auto'>
        <VStack spacing={{ base: 3, sm: 4, md: 8 }} align="stretch">
          {/* Date Selector (Top, Collapsible) */}
          <Card 
          className='mx-auto md:mx-2 link-div'
            bg={cardBg} 
            shadow="xl" 
            borderRadius={{ base: "lg", md: "2xl" }} 
            p={{ base: 2, sm: 3, md: 4 }} 
            border="1px" 
            borderColor={borderColor}
          >
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <Text 
                fontWeight="bold" 
                color={textColor}
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
              >
                اختر تاريخ الحضور
              </Text>
              <Button 
                variant="outline" 
                size={{ base: "xs", sm: "sm" }}
                onClick={onToggleCalendar}
                borderRadius="lg"
                px={{ base: 2, sm: 3, md: 4 }}
                fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
              >
                {isCalendarOpen ? 'إخفاء' : 'إظهار'}
              </Button>
            </HStack>
            <Collapse in={isCalendarOpen} animateOpacity>
              <Box w="full" display="flex" justifyContent="center" alignItems="center" mt={{ base: 2, md: 3 }}>
                <VStack w={{ base: '100%', sm: '90%', md: '70%', lg: '50%' }} spacing={{ base: 2, md: 3 }}>
                  <Box w="full" textAlign="center">
                    <Text color="gray.500" fontSize={{ base: 'xs', sm: 'sm' }}>
                      يمكنك اختيار أي يوم من الشهر
                    </Text>
                  </Box>
                  <Box
                    w="full"
                    bg={cardBg}
                    borderRadius={{ base: "xl", md: "2xl" }}
                    boxShadow="md"
                    p={{ base: 2, sm: 3, md: 4 }}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {/* رأس التقويم مع أزرار تغيير الشهر */}
                    <HStack justify="space-between" w="full" mb={{ base: 2, md: 3 }} spacing={{ base: 1, md: 2 }}>
                      <IconButton 
                        icon={<IoChevronBack />} 
                        aria-label="الشهر السابق" 
                        size={{ base: "xs", sm: "sm" }} 
                        variant="ghost" 
                        onClick={() => changeMonth(-1)} 
                        color={primaryColor}
                        borderRadius="full"
                      />
                      <Text 
                        fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} 
                        fontWeight="bold" 
                        color={primaryColor} 
                        bgGradient="linear(135deg, blue.100 0%, purple.100 100%)" 
                        px={{ base: 2, sm: 3, md: 4 }} 
                        py={{ base: 1, sm: 2 }} 
                        borderRadius="xl" 
                        boxShadow="sm"
                        textAlign="center"
                        minW="0"
                        flex="1"
                        mx={2}
                      >
                        {selectedDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                      </Text>
                      <IconButton 
                        icon={<IoChevronForward />} 
                        aria-label="الشهر التالي" 
                        size={{ base: "xs", sm: "sm" }} 
                        variant="ghost" 
                        onClick={() => changeMonth(1)} 
                        color={primaryColor}
                        borderRadius="full"
                      />
                    </HStack>
                    {/* أيام الأسبوع */}
                    <SimpleGrid columns={7} spacing={{ base: 0.5, sm: 1 }} w="full" mb={{ base: 1, md: 2 }}>
                      {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day) => (
                        <Box 
                          key={day} 
                          textAlign="center" 
                          py={{ base: 0.5, sm: 1 }} 
                          fontSize={{ base: "2xs", sm: "xs" }} 
                          fontWeight="bold" 
                          color="gray.600"
                        >
                          {day}
                        </Box>
                      ))}
                    </SimpleGrid>
                    {/* أيام الشهر */}
                    <SimpleGrid columns={7} spacing={{ base: 0.5, sm: 1 }} w="full">
                      {getMonthDays(selectedDate).map((day, idx) => {
                        if (!day) {
                          return <Box key={idx} h={{ base: "24px", sm: "28px", md: "32px" }} />;
                        }
                        const isSelected = day.toDateString() === selectedDate.toDateString();
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                          <Button
                            key={idx}
                            size={{ base: "xs", sm: "sm" }}
                            borderRadius="full"
                            px={0}
                            py={0}
                            minW={{ base: "24px", sm: "28px", md: "32px" }}
                            h={{ base: "24px", sm: "28px", md: "32px" }}
                            fontWeight="bold"
                            fontSize={{ base: "2xs", sm: "xs" }}
                            color={isSelected ? 'white' : isToday ? 'white' : 'gray.700'}
                            bg={isSelected ? primaryColor : isToday ? 'orange.500' : 'gray.100'}
                            _hover={{ 
                              bg: isSelected ? primaryColor : isToday ? 'orange.600' : 'blue.50', 
                              transform: 'scale(1.05)' 
                            }}
                            boxShadow={isSelected ? 'md' : 'none'}
                            onClick={() => setSelectedDate(new Date(day))}
                            transition="all 0.2s"
                            border={isToday && !isSelected ? '2px solid orange.400' : 'none'}
                          >
                            {day.getDate()}
                          </Button>
                        );
                      })}
                    </SimpleGrid>
                    {/* التاريخ المختار */}
                    <Box mt={{ base: 2, md: 3 }}>
                      <Text 
                        fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} 
                        fontWeight="bold" 
                        color={primaryColor} 
                        bgGradient="linear(135deg, blue.100 0%, purple.100 100%)" 
                        px={{ base: 2, sm: 3, md: 4 }} 
                        py={{ base: 1, sm: 1, md: 1 }} 
                        borderRadius="xl" 
                        boxShadow="sm" 
                        display="inline-block"
                        textAlign="center"
                      >
                        {selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                    </Box>
                  </Box>
            </VStack>
          </Box>
            </Collapse>
          </Card>

          {/* Hero Section */}
          <Card 
           className='mx-auto md:mx-2 link-div'
            bgGradient="linear(135deg, blue.500 0%, purple.600 50%, teal.500 100%)"
            shadow="2xl" 
            borderRadius={{ base: "xl", md: "3xl" }} 
            p={{ base: 6, md: 8 }}
            border="none"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none'
            }}
          >
            <VStack spacing={{ base: 4, md: 6 }} align="center" position="relative" zIndex={1}>
              <HStack spacing={4} align="center" flexWrap="wrap" justify="center">
                <Box
                  p={4}
                  bg="whiteAlpha.200"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.2)"
                >
                  <FaGraduationCap size={32} color="white" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading 
                    size={{ base: "lg", md: "2xl" }} 
                    color="white" 
                    textAlign="center"
                    fontWeight="bold"
                    textShadow="0 2px 4px rgba(0,0,0,0.3)"
                  >
                    {groupData?.name || 'مجموعة الدراسة'}
                  </Heading>
                  <Text 
                    color="whiteAlpha.900" 
                    fontSize={{ base: "sm", md: "lg" }}
                    textAlign="center"
                    fontWeight="medium"
                  >
                    إدارة شاملة للطلاب والحضور
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={{ base: 4, md: 8 }} flexWrap="wrap" justify="center">
                <VStack spacing={1}>
                  <Text color="whiteAlpha.800" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    وقت المحاضرة
                  </Text>
                  <Text color="white" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    {formatTime(groupData.start_time)} - {formatTime(groupData.end_time)}
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Text color="whiteAlpha.800" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    أيام المحاضرة
                  </Text>
                  <Text color="white" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    {formatDays(groupData.days)}
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Text color="whiteAlpha.800" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    عدد الطلاب
                  </Text>
                  <Text color="white" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    {students?.length || 0} طالب
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid  columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 6 }}>
            <Card 
             className='mx-auto link-div'
              bgGradient="linear(135deg, blue.50 0%, blue.100 100%)"
              shadow="xl" 
              borderRadius={{ base: "xl", md: "2xl" }} 
              p={{ base: 4, md: 6 }}
              border="1px"
              borderColor="blue.200"
              _hover={{ 
                transform: 'translateY(-6px) scale(1.02)', 
                shadow: '2xl',
                bgGradient: "linear(135deg, blue.100 0%, blue.200 100%)"
              }}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
                borderRadius: '0 0 0 100px',
                pointerEvents: 'none'
              }}
            >
              <Stat position="relative" zIndex={1}>
                <StatLabel color="blue.700" fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" mb={3}>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box 
                      p={{ base: 2, md: 3 }} 
                      bgGradient="linear(135deg, blue.400 0%, blue.600 100%)"
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      <FaClock color="white" size={40} />
                    </Box>
                    <Text  fontWeight="bold" className='text-xl text-bold'>وقت المحاضرة</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="blue.800" fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
                  {formatTime(groupData.start_time)}
                </StatNumber>
                <StatHelpText color="blue.600" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                  حتى {formatTime(groupData.end_time)}
                </StatHelpText>

                <Button
                  mt={4}
                  size={{ base: "sm", md: "md" }}
                  colorScheme="blue"
                  onClick={openStudentsModal}
                  borderRadius="xl"
                  w="full"
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  bgGradient="linear(135deg, blue.500 0%, blue.600 100%)"
                  _hover={{
                    bgGradient: "linear(135deg, blue.600 0%, blue.700 100%)",
                    transform: 'translateY(-2px)',
                    shadow: 'lg'
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  عرض الطلاب
                </Button>
              </Stat>
            </Card>

            <Card 
             className='mx-auto'
              bgGradient="linear(135deg, purple.50 0%, purple.100 100%)"
              shadow="xl" 
              borderRadius={{ base: "xl", md: "2xl" }} 
              p={{ base: 4, md: 6 }}
              border="1px"
              borderColor="purple.200"
              _hover={{ 
                transform: 'translateY(-6px) scale(1.02)', 
                shadow: '2xl',
                bgGradient: "linear(135deg, purple.100 0%, purple.200 100%)"
              }}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, transparent 100%)',
                borderRadius: '0 0 0 100px',
                pointerEvents: 'none'
              }}
            >
              <Stat position="relative" zIndex={1}>
                <StatLabel color="purple.700" fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" mb={3}>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box 
                      p={{ base: 2, md: 3 }} 
                      bgGradient="linear(135deg, purple.400 0%, purple.600 100%)"
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      <FaCalendarAlt color="white" size={40} />
                    </Box>
                    <Text className='text-xl text-bold' fontWeight="bold">أيام المحاضرة</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="purple.800" fontSize={{ base: "lg", md: "xl" }} fontWeight="black">
                  {formatDays(groupData.days)}
                </StatNumber>
                <StatHelpText color="purple.600" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                  أسبوعياً
                </StatHelpText>
              </Stat>
            </Card>

            <Card 
             className='mx-auto'
              bgGradient="linear(135deg, teal.50 0%, teal.100 100%)"
              shadow="xl" 
              borderRadius={{ base: "xl", md: "2xl" }} 
              p={{ base: 4, md: 6 }}
              border="1px"
              borderColor="teal.200"
              _hover={{ 
                transform: 'translateY(-6px) scale(1.02)', 
                shadow: '2xl',
                bgGradient: "linear(135deg, teal.100 0%, teal.200 100%)"
              }}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, rgba(20, 184, 166, 0.1) 0%, transparent 100%)',
                borderRadius: '0 0 0 100px',
                pointerEvents: 'none'
              }}
            >
              <Stat position="relative" zIndex={1}>
                <StatLabel color="teal.700" fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" mb={3}>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box 
                      p={{ base: 2, md: 3 }} 
                      bgGradient="linear(135deg, teal.400 0%, teal.600 100%)"
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      <FaUsers color="white" size={40} />
                    </Box>
                    <Text className='text-xl text-bold' fontWeight="bold">عدد الطلاب</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="teal.800" fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
                  {students?.length || 0}
                </StatNumber>
                <StatHelpText color="teal.600" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                  <StatArrow type="increase" />
                  طالب مسجل
                </StatHelpText>
              </Stat>
            </Card>

            <Card 
             className='mx-auto'
              bgGradient="linear(135deg, green.50 0%, green.100 100%)"
              shadow="xl" 
              borderRadius={{ base: "xl", md: "2xl" }} 
              p={{ base: 4, md: 6 }}
              border="1px"
              borderColor="green.200"
              _hover={{ 
                transform: 'translateY(-6px) scale(1.02)', 
                shadow: '2xl',
                bgGradient: "linear(135deg, green.100 0%, green.200 100%)"
              }}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%)',
                borderRadius: '0 0 0 100px',
                pointerEvents: 'none'
              }}
            >
              <Stat position="relative" zIndex={1}>
                <StatLabel color="green.700" fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" mb={3}>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Box 
                      p={{ base: 2, md: 3 }} 
                      bgGradient="linear(135deg, green.400 0%, green.600 100%)"
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      <MdAttachMoney color="white" size={40} />
                    </Box>
                    <Text className='text-xl text-bold' fontWeight="bold">إجمالي المدفوع</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="green.800" fontSize={{ base: "xl", md: "2xl" }} fontWeight="black">
                  {students?.filter(s => s.payment_status === 'paid').length || 0}
                </StatNumber>
                <StatHelpText color="green.600" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                  من {students?.length || 0} طالب
                </StatHelpText>
              </Stat>
            </Card>
          </SimpleGrid>

          {/* Search and Add Section */}
          <Card 
           className='mx-auto link-div'
            bgGradient="linear(135deg, gray.50 0%, white 100%)"
            shadow="2xl" 
            borderRadius={{ base: "xl", md: "3xl" }} 
            p={{ base: 4, md: 8 }}
            border="1px"
            borderColor="gray.200"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, blue.400 0%, purple.500 50%, teal.400 100%)',
              pointerEvents: 'none'
            }}
          >
            <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} gap={{ base: 4, md: 6 }}>
              <Box flex={1} maxW={{ base: "100%", lg: "600px" }} position="relative" zIndex={1}>
                <VStack align="start" spacing={3}>
                  <HStack spacing={3} align="center">
                    <Box
                      p={2}
                      bgGradient="linear(135deg, blue.400 0%, purple.500 100%)"
                      borderRadius="lg"
                      boxShadow="md"
                    >
                      <BiSearch color="white" size={20} />
                    </Box>
                    <Text 
                      fontWeight="bold" 
                      color={textColor} 
                      fontSize={{ base: "lg", md: "xl" }}
                      bgGradient="linear(135deg, blue.600 0%, purple.600 100%)"
                      bgClip="text"
                    >
                  البحث في الطلاب
                </Text>
                  </HStack>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <Input
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      bg="white"
                    border="2px"
                    borderColor="gray.200"
                      borderRadius="2xl"
                    _focus={{ 
                        borderColor: 'blue.400', 
                      bg: 'white',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        transform: 'translateY(-2px)'
                      }}
                      _hover={{ 
                        borderColor: 'blue.300',
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg'
                      }}
                    fontSize={{ base: "sm", md: "md" }}
                      transition="all 0.3s ease"
                  />
                  <InputRightElement>
                      <BiSearch color="blue.400" size={{ base: 18, md: 22 }} />
                  </InputRightElement>
                </InputGroup>
                </VStack>
              </Box>
              
              <VStack spacing={{ base: 4, md: 6 }} w={{ base: "100%", lg: "auto" }} position="relative" zIndex={1}>
                <Text 
                  fontWeight="bold" 
                  color={textColor} 
                  fontSize={{ base: "md", md: "lg" }}
                  textAlign="center"
                  w="full"
                >
                  الإجراءات السريعة
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} w="full">
                  <Button
                        colorScheme="orange"
                    size={{ base: 'sm', md: 'md' }}
                        onClick={startQrScanner}
                        px={{ base: 4, md: 6 }}
                    py={{ base: 3, md: 4 }}
                    borderRadius="xl"
                    shadow="lg"
                        bgGradient="linear(135deg, orange.400 0%, yellow.400 100%)"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                    fontWeight="bold"
                    fontSize={{ base: "xs", md: "sm" }}
                        flex={{ base: 1, sm: "none" }}
                        minW={{ base: "140px", sm: "auto" }}
                        leftIcon={<BiSearch />}
                  >
                        QR Scanner
                  </Button>
                  <Button
                    leftIcon={<MdAdd />}
                    colorScheme="blue"
                    size={{ base: 'md', md: 'lg' }}
                    onClick={() => setIsAddModalOpen(true)}
                    isLoading={loading}
                    px={{ base: 4, md: 6 }}
                    py={{ base: 3, md: 4 }}
                    borderRadius="2xl"
                    shadow="xl"
                    bgGradient="linear(135deg, blue.500 0%, blue.600 100%)"
                    _hover={{ 
                      transform: 'translateY(-4px) scale(1.05)', 
                      shadow: '2xl',
                      bgGradient: "linear(135deg, blue.600 0%, blue.700 100%)",
                      _before: {
                        left: '100%'
                      }
                    }}
                    _active={{ transform: 'translateY(-2px) scale(1.02)' }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "md" }}
                    w="full"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s'
                    }}
                  >
                    إضافة طالب
                  </Button>
                  
           

                  <Button
                    leftIcon={<FaStar />}
                    colorScheme="purple"
                    size={{ base: 'md', md: 'lg' }}
                    onClick={() => setIsExamGradesModalOpen(true)}
                    px={{ base: 4, md: 6 }}
                    py={{ base: 3, md: 4 }}
                    borderRadius="2xl"
                    shadow="xl"
                    bgGradient="linear(135deg, purple.500 0%, purple.600 100%)"
                    _hover={{ 
                      transform: 'translateY(-4px) scale(1.05)', 
                      shadow: '2xl',
                      bgGradient: "linear(135deg, purple.600 0%, purple.700 100%)",
                      _before: {
                        left: '100%'
                      }
                    }}
                    _active={{ transform: 'translateY(-2px) scale(1.02)' }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "md" }}
                    w="full"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s'
                    }}
                  >
                    إدارة الدرجات
                  </Button>

                  <Button
                    colorScheme="orange"
                    size={{ base: 'md', md: 'lg' }}
                    onClick={() => setIsAttendanceHistoryOpen(true)}
                    px={{ base: 4, md: 6 }}
                    py={{ base: 3, md: 4 }}
                    borderRadius="2xl"
                    shadow="xl"
                    bgGradient="linear(135deg, orange.500 0%, orange.600 100%)"
                    _hover={{ 
                      transform: 'translateY(-4px) scale(1.05)', 
                      shadow: '2xl',
                      bgGradient: "linear(135deg, orange.600 0%, orange.700 100%)",
                      _before: {
                        left: '100%'
                      }
                    }}
                    _active={{ transform: 'translateY(-2px) scale(1.02)' }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    fontWeight="bold"
                    fontSize={{ base: "sm", md: "md" }}
                    w="full"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s'
                    }}
                  >
                    عرض سجل الحضور
                  </Button>
                </SimpleGrid>
              </VStack>
            </Flex>
          </Card>

          {/* تقويم الشهر الكامل (نُقل للأعلى داخل Collapse) */}

          {/* Students Table Section */}
          {isMobile ? (
            <VStack w="100%" spacing={{ base: 3, md: 4 }}>
              {filteredStudents.map((s) => {
                const dateKey = selectedDate.toISOString().split('T')[0];
                const currentStatus = attendance[s.id]?.[dateKey] || 'not_set';
                return (
                  <Card 
                    key={s.id} 
                    w="100%" 
                    bg={cardBg} 
                    borderRadius={{ base: "lg", md: "xl" }} 
                    shadow="md" 
                    border="1px" 
                    borderColor={borderColor} 
                    p={{ base: 3, md: 4 }}
                    _hover={{ shadow: "lg" }}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" spacing={{ base: 3, md: 4 }} w="100%">
                      <Stack direction={{ base: 'column', sm: 'row' }} align="center" spacing={{ base: 2, sm: 3 }} w="100%" justify="space-between">
                        <Link to={`/group/${id}/student/${s.id}`} style={{ textDecoration: 'none' }}>
                          <HStack spacing={{ base: 2, sm: 3 }} cursor="pointer" _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                            <Avatar 
                              size={{ base: "sm", sm: "md" }} 
                              name={s.student_name} 
                              bgGradient="linear(135deg, blue.400 0%, purple.400 100%)" 
                              color="white" 
                              fontWeight="bold" 
                              shadow="xl" 
                              border="3px" 
                              borderColor="white" 
                            />
                            <VStack align="start" spacing={1}>
                              <Text 
                                fontWeight="bold" 
                                color={textColor} 
                                fontSize={{ base: "sm", sm: "md" }}
                                noOfLines={1}
                              >
                                {s.student_name}
                              </Text>
                              <Badge 
                                colorScheme="blue" 
                                variant="subtle" 
                                px={2} 
                                py={0.5} 
                                borderRadius="full" 
                                fontSize="2xs" 
                                fontWeight="medium"
                              >
                                ID: {s.id}
                              </Badge>
                            </VStack>
                          </HStack>
                        </Link>
                        <HStack spacing={2} w={{ base: '100%', sm: 'auto' }} justify={{ base: 'space-between', sm: 'flex-end' }}>
                          <Button
                            leftIcon={<MdCheckCircle />}
                            colorScheme="green"
                            variant={currentStatus === 'present' ? 'solid' : 'outline'}
                            onClick={() => handleAttendance(s.id, 'present')}
                            size={{ base: 'sm', sm: 'md' }}
                            borderRadius="full"
                            flex={{ base: 1, sm: 'none' }}
                            fontSize={{ base: "xs", sm: "sm" }}
                            px={{ base: 2, sm: 3 }}
                          >
                            حاضر
                          </Button>
                          <Button
                            leftIcon={<MdCancel />}
                            colorScheme="red"
                            variant={currentStatus === 'absent' ? 'solid' : 'outline'}
                            onClick={() => handleAttendance(s.id, 'absent')}
                            size={{ base: 'sm', sm: 'md' }}
                            borderRadius="full"
                            flex={{ base: 1, sm: 'none' }}
                            fontSize={{ base: "xs", sm: "sm" }}
                            px={{ base: 2, sm: 3 }}
                          >
                            غائب
                          </Button>
                        </HStack>
                      </Stack>
                      <HStack spacing={2} justify="center" pt={2} borderTop="1px" borderColor="gray.200">
                        <Tooltip label="عرض التفاصيل" placement="top" hasArrow>
                          <IconButton
                            as={Link}
                            to={`/group/${id}/student/${s.id}`}
                            icon={<BiSearch size={14} />}
                            colorScheme="teal"
                            variant="ghost"
                            aria-label="عرض التفاصيل"
                            size="sm"
                            borderRadius="full"
                          />
                        </Tooltip>
                        <Tooltip label="حذف الطالب" placement="top" hasArrow>
                          <IconButton 
                            icon={<MdDelete size={14} />} 
                            size="sm" 
                            colorScheme="red" 
                            variant="ghost" 
                            onClick={() => handleDeleteStudent(s.id)} 
                            aria-label="حذف" 
                            borderRadius="full" 
                          />
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </Card>
                );
              })}
              
              {/* Mobile Attendance Action Buttons */}
              {filteredStudents.length > 0 && (
                <Card 
                className='mb-[50px]'
                  w="100%" 
                  bg={cardBg} 
                  borderRadius={{ base: "lg", md: "xl" }} 
                  shadow="lg" 
                  border="1px" 
                  borderColor={borderColor} 
                  p={{ base: 4, md: 6 }}
                  mt={4}
                >
                  <VStack  spacing={{ base: 3, md: 4 }} w="100%">
                    <Text 
                      fontWeight="bold" 
                      color={textColor} 
                      fontSize={{ base: "md", md: "lg" }}
                      textAlign="center"
                    >
                      تسجيل الحضور
                    </Text>
                    <HStack spacing={{ base: 2, md: 4 }} w="full" justify="center" flexWrap="wrap">
                      <Button
                        colorScheme="orange"
                        size={{ base: 'sm', md: 'md' }}
                        onClick={startQrScanner}
                        px={{ base: 4, md: 6 }}
                        py={{ base: 3, md: 4 }}
                        borderRadius="xl"
                        shadow="lg"
                        bgGradient="linear(135deg, orange.400 0%, yellow.400 100%)"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                        fontWeight="bold"
                        fontSize={{ base: "xs", md: "sm" }}
                        flex={{ base: 1, sm: "none" }}
                        minW={{ base: "140px", sm: "auto" }}
                        leftIcon={<BiSearch />}
                      >
                        QR Scanner
                      </Button>

                      <Button
                        colorScheme="purple"
                        size={{ base: 'sm', md: 'md' }}
                        onClick={handleSaveAttendance}
                        isLoading={savingAttendance}
                        loadingText="جاري الحفظ..."
                        px={{ base: 4, md: 6 }}
                        py={{ base: 3, md: 4 }}
                        w={{ base: '100%', sm: 'auto' }}
                        borderRadius="xl"
                        shadow="lg"
                        bgGradient="linear(135deg, purple.500 0%, pink.500 100%)"
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'xl',
                          bgGradient: "linear(135deg, purple.600 0%, pink.600 100%)"
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.2s"
                        fontWeight="bold"
                        fontSize={{ base: "xs", md: "sm" }}
                        flex={{ base: 1, sm: "none" }}
                        minW={{ base: "140px", sm: "auto" }}
                        leftIcon={<MdCheckCircle />}
                      >
                        حفظ الحضور
                      </Button>
                    </HStack>
                  </VStack>
                </Card>
              )}
            </VStack>
          ) : (
          <Card 
          className='link-div'
            bg={cardBg} 
            shadow="xl" 
            borderRadius={{ base: "lg", md: "2xl" }} 
            overflow="hidden"
            border="1px"
            borderColor={borderColor}
            w="100%"
          >
              <Box p={{ base: 3, md: 6 }} borderBottom="1px" borderColor={borderColor}>
                <VStack align="start" spacing={2}>
                  <Heading size={{ base: "sm", md: "md" }} color={textColor}>
                    قائمة الطلاب
                  </Heading>
                  <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>
                    {filteredStudents.length} من {students?.length || 0} طالب
                  </Text>
                  {loading && (
                    <HStack>
                      <Spinner size="sm" color={primaryColor} />
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">جاري التحديث...</Text>
                    </HStack>
                  )}
                </VStack>
            </Box>

            <CardBody p={0}>
              {loading && !students?.length ? (
                <VStack spacing={6} py={16}>
                  <Spinner size="xl" color={primaryColor} thickness="4px" />
                    <Text fontSize={{ base: "md", md: "lg" }} color={textColor} fontWeight="medium">
                    جاري تحميل بيانات الطلاب...
                  </Text>
                  <Progress size="sm" isIndeterminate colorScheme="blue" width="200px" borderRadius="full" />
                </VStack>
              ) : studentsError ? (
                <Alert status="error" borderRadius="xl" m={6}>
                  <AlertIcon />
                  <Text fontWeight="medium">{studentsError}</Text>
                </Alert>
              ) : filteredStudents.length === 0 ? (
                <Center py={20}>
                  <VStack spacing={8}>
                    <Box
                        w={{ base: "100px", md: "140px" }}
                        h={{ base: "100px", md: "140px" }}
                      borderRadius="full"
                      bg="gray.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="4px"
                      borderColor="gray.200"
                    >
                        <FaUsers size={{ base: 50, md: 70 }} color="gray.400" />
                    </Box>
                    <VStack spacing={3}>
                        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textColor} textAlign="center">
                        {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب في هذه المجموعة'}
                      </Text>
                        <Text color="gray.500" textAlign="center" fontSize={{ base: "sm", md: "lg" }}>
                        {searchTerm ? 'جرب البحث بكلمات مختلفة أو تحقق من الإملاء' : 'ابدأ بإضافة أول طالب إلى المجموعة لبناء مجتمع تعليمي نشط'}
                      </Text>
                    </VStack>
                    {!searchTerm && (
                      <Button
                        colorScheme="blue"
                          size={{ base: "md", md: "lg" }}
                        onClick={() => setIsAddModalOpen(true)}
                        leftIcon={<MdAdd />}
                        borderRadius="xl"
                          px={{ base: 6, md: 8 }}
                          py={{ base: 4, md: 6 }}
                        bgGradient="linear(135deg, blue.500 0%, purple.500 100%)"
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'xl',
                          bgGradient: "linear(135deg, blue.600 0%, purple.600 100%)"
                        }}
                          _active={{ transform: 'translateY(0)' }}
                          transition="all 0.2s"
                        fontWeight="bold"
                      >
                          إضافة طالب جديد
                      </Button>
                    )}
                  </VStack>
                </Center>
              ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" colorScheme="gray" size={{ base: "sm", md: "md" }}>
                      <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                        <Tr>
                          <Th color="gray.600" fontSize={{ base: "xs", md: "sm" }} py={{ base: 2, md: 3 }}>الاسم</Th>
                          <Th color="gray.600" fontSize={{ base: "xs", md: "sm" }} py={{ base: 2, md: 3 }} textAlign="center">الحضور</Th>
                          <Th color="gray.600" fontSize={{ base: "xs", md: "sm" }} py={{ base: 2, md: 3 }} textAlign="center">الإجراءات</Th>
                        </Tr>
                      </Thead>
                    <Tbody>
                        {filteredStudents.map((s) => {
                          const dateKey = selectedDate.toISOString().split('T')[0];
                          const currentStatus = attendance[s.id]?.[dateKey] || 'not_set';
                          return (
                            <Tr key={s.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                              <Td py={{ base: 2, md: 3 }}>
                                <Link to={`/group/${id}/student/${s.id}`} style={{ textDecoration: 'none' }}>
                                  <HStack spacing={{ base: 2, md: 3 }} cursor="pointer" _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                                    <Avatar size={{ base: "xs", md: "sm" }} name={s.student_name} bg="blue.400" color="white" />
                                    <VStack align="start" spacing={0}>
                                      <Text 
                                        fontWeight="semibold" 
                                        color={textColor}
                                        fontSize={{ base: "xs", md: "sm" }}
                                        noOfLines={1}
                                      >
                                        {s.student_name}
                                      </Text>
                                      <Badge 
                                        colorScheme="blue" 
                                        variant="subtle" 
                                        px={2} 
                                        py={0.5} 
                                        borderRadius="full" 
                                        fontSize="2xs" 
                                        fontWeight="medium"
                                      >
                                        ID: {s.id}
                                      </Badge>
                                    </VStack>
                                  </HStack>
                                </Link>
                              </Td>
                              <Td textAlign="center" py={{ base: 2, md: 3 }}>
                                <HStack justify="center" spacing={{ base: 1, md: 3 }}>
                                  <Button
                                    leftIcon={<MdCheckCircle />}
                                    colorScheme="green"
                                    variant={currentStatus === 'present' ? 'solid' : 'outline'}
                                    onClick={() => handleAttendance(s.id, 'present')}
                                    size={{ base: "xs", md: "sm" }}
                                    borderRadius="full"
                                    fontSize={{ base: "2xs", md: "xs" }}
                                    px={{ base: 2, md: 3 }}
                                  >
                                    حاضر
                                  </Button>
                                  <Button
                                    leftIcon={<MdCancel />}
                                    colorScheme="red"
                                    variant={currentStatus === 'absent' ? 'solid' : 'outline'}
                                    onClick={() => handleAttendance(s.id, 'absent')}
                                    size={{ base: "xs", md: "sm" }}
                                    borderRadius="full"
                                    fontSize={{ base: "2xs", md: "xs" }}
                                    px={{ base: 2, md: 3 }}
                                  >
                                    غائب
                                  </Button>
                                </HStack>
                              </Td>
                              <Td textAlign="center" py={{ base: 2, md: 3 }}>
                                <HStack spacing={{ base: 1, md: 2 }} justify="center">
                                  <Tooltip label="عرض التفاصيل" placement="top" hasArrow>
                                    <IconButton
                                      as={Link}
                                      to={`/group/${id}/student/${s.id}`}
                                      icon={<BiSearch size={{ base: 14, md: 16 }} />}
                                      colorScheme="teal"
                                      variant="ghost"
                                      aria-label="عرض التفاصيل"
                                      size={{ base: "sm", md: "md" }}
                                      borderRadius="full"
                                    />
                                  </Tooltip>
                                  <Tooltip label="حذف الطالب" placement="top" hasArrow>
                                    <IconButton
                                      icon={<MdDelete size={{ base: 14, md: 16 }} />}
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => handleDeleteStudent(s.id)}
                                      aria-label="حذف"
                                      size={{ base: "sm", md: "md" }}
                                      borderRadius="full"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>

              {filteredStudents.length > 0 && (
                <Flex justify="center" mt={4} p={{ base: 3, md: 4 }} borderTop="1px" borderColor={borderColor}>
                  <VStack spacing={{ base: 3, md: 4 }} w="full">
                    <HStack spacing={{ base: 2, md: 4 }} w="full" justify="center" flexWrap="wrap">
                      <Button
                        colorScheme="orange"
                        size={{ base: 'sm', md: 'md' }}
                        onClick={startQrScanner}
                        px={{ base: 3, md: 6 }}
                        py={{ base: 2, md: 4 }}
                        borderRadius="lg"
                        shadow="lg"
                        bgGradient="linear(135deg, orange.400 0%, yellow.400 100%)"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                        fontWeight="bold"
                        fontSize={{ base: "2xs", md: "sm" }}
                        flex={{ base: 1, sm: "none" }}
                        minW={{ base: "120px", sm: "auto" }}
                        leftIcon={<BiSearch />}
                      >
                        QR Scanner
                      </Button>

                      <Button
                        colorScheme="purple"
                        size={{ base: 'sm', md: 'md' }}
                        onClick={handleSaveAttendance}
                        isLoading={savingAttendance}
                        loadingText="جاري الحفظ..."
                        px={{ base: 3, md: 6 }}
                        py={{ base: 2, md: 4 }}
                        w={{ base: '100%', sm: 'auto' }}
                        borderRadius="lg"
                        shadow="lg"
                        bgGradient="linear(135deg, purple.500 0%, pink.500 100%)"
                        _hover={{ 
                          transform: 'translateY(-2px)', 
                          shadow: 'xl',
                          bgGradient: "linear(135deg, purple.600 0%, pink.600 100%)"
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.2s"
                        fontWeight="bold"
                        fontSize={{ base: "2xs", md: "sm" }}
                        flex={{ base: 1, sm: "none" }}
                        minW={{ base: "120px", sm: "auto" }}
                        leftIcon={<MdCheckCircle />}
                      >
                        حفظ الحضور
                      </Button>
                    </HStack>
                  </VStack>
                </Flex>
              )}
          </Card>
          )}
        </VStack>
      </Container>

      <AddStudentDualModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddByCode={handleAddStudentByCode}
        onAddByName={handleAddStudentByName}
        loading={loading}
      />
      
      <AddExamModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        groupId={id}
        groupName={groupData?.name || 'المجموعة'}
        onExamAdded={handleExamAdded}
        loading={loading}
      />
      
      <ExamGradesModal
        isOpen={isExamGradesModalOpen}
        onClose={() => setIsExamGradesModalOpen(false)}
        groupId={id}
        groupName={groupData?.name || 'المجموعة'}
        students={students || []}
      />
      
      {selectedStudent && (
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
          onEditStudent={handleEditStudent}
      />
      )}

      <AttendanceHistoryModal
        isOpen={isAttendanceHistoryOpen}
        onClose={() => setIsAttendanceHistoryOpen(false)}
        groupId={id}
      />

      <Modal 
        isOpen={isStudentsModalOpen} 
        onClose={() => setIsStudentsModalOpen(false)} 
        size={{ base: "full", sm: "xl", md: "4xl", lg: "6xl" }} 
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent 
          borderRadius={{ base: "none", md: "xl" }}
          m={{ base: 0, md: 4 }}
          maxH={{ base: "100vh", md: "90vh" }}
        >
          <ModalHeader 
            fontSize={{ base: "md", md: "lg" }}
            p={{ base: 3, md: 6 }}
          >
            طلاب المجموعة - {groupData?.name || `#${id}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: 3, md: 6 }}>
            {modalLoading ? (
              <Center py={12}>
                <VStack>
                  <Spinner size="xl" color={primaryColor} />
                  <Text fontSize={{ base: "sm", md: "md" }}>جاري جلب الطلاب...</Text>
                </VStack>
              </Center>
            ) : modalError ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text fontSize={{ base: "sm", md: "md" }}>{modalError}</Text>
              </Alert>
            ) : modalStudents.length === 0 ? (
              <Center py={12}>
                <Text fontSize={{ base: "sm", md: "md" }}>لا يوجد طلاب لعرضهم لهذا التاريخ.</Text>
              </Center>
            ) : (
              <SimpleGrid 
                columns={{ base: 1, sm: 1, md: 2 }} 
                spacing={{ base: 4, md: 6 }} 
                p={{ base: 0, md: 4 }} 
                justifyItems="center"
              >
                {modalStudents.map((s) => (
                  <Card
                    key={s.id}
                    w={{ base: "full", sm: "full", md: "480px" }}
                    maxW="480px"
                    borderRadius={{ base: "md", md: "lg" }}
                    shadow="lg"
                    overflow="hidden"
                    transition="transform 0.18s ease"
                    _hover={{ transform: "translateY(-6px)", shadow: "2xl" }}
                  >
                    <CardBody p={{ base: 3, md: 4 }}>
                      <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                        <HStack align="start" spacing={{ base: 3, md: 4 }}>
                          <Avatar 
                            size={{ base: "sm", md: "md" }} 
                            name={s.student_name} 
                            bg="blue.400" 
                            color="white" 
                          />
                          <VStack align="start" spacing={1} flex="1">
                            <Text 
                              fontWeight="bold" 
                              fontSize={{ base: "md", md: "lg" }}
                              noOfLines={1}
                            >
                              {s.student_name}
                            </Text>
                            <Badge 
                              colorScheme="blue" 
                              variant="subtle" 
                              px={2} 
                              py={0.5} 
                              borderRadius="full" 
                              fontSize="2xs"
                            >
                              ID: {s.id}
                            </Badge>
                          </VStack>
                        </HStack>

                        <VStack align="start" spacing={1} fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                          <Text>الهاتف: {s.phone}</Text>
                          {s.parent_phone && <Text>هاتف ولي الأمر: {s.parent_phone}</Text>}
                        </VStack>

                        <Box
                          w="full"
                          h={{ base: "100px", md: "130px" }}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="gray.50"
                          borderRadius="md"
                          p={2}
                        >
                          {s.qr_code ? (
                            <Image
                              src={s.qr_code}
                              alt={`QR ${s.student_name}`}
                              maxW={{ base: "90px", md: "120px" }}
                              maxH={{ base: "90px", md: "120px" }}
                              objectFit="contain"
                            />
                          ) : (
                            <Center w="full" h="full">
                              <Text color="gray.500" fontSize="xs">لا يوجد QR</Text>
                            </Center>
                          )}
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal 
        isOpen={isQrScannerOpen} 
        onClose={stopQrScanner} 
        size={{ base: "full", sm: "xl" }} 
        isCentered
      >
        <ModalOverlay />
        <ModalContent 
          borderRadius={{ base: "none", sm: "xl" }}
          m={{ base: 0, sm: 4 }}
          maxH={{ base: "100vh", sm: "90vh" }}
        >
          <ModalHeader 
            fontSize={{ base: "md", sm: "lg" }}
            p={{ base: 3, sm: 6 }}
          >
            مسح QR لتسجيل الحضور
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: 3, sm: 6 }}>
            <Center flexDirection="column" py={{ base: 2, sm: 4 }}>
              <Box 
                id="qr-scanner" 
                w="full" 
                minH={{ base: "280px", sm: "320px" }} 
                borderRadius="md" 
                overflow="hidden" 
                bg="black" 
              />
              <Text 
                mt={3} 
                color="gray.500" 
                fontSize={{ base: "xs", sm: "sm" }} 
                textAlign="center"
                px={2}
              >
                ضع QR داخل المربع. سيتم استخدام الكاميرا الخلفية تلقائياً.
              </Text>
              {qrProcessing && (
                <Text 
                  mt={2} 
                  color="green.500" 
                  fontWeight="semibold"
                  fontSize={{ base: "xs", sm: "sm" }}
                >
                  جاري معالجة الكود...
                </Text>
              )}
              <HStack mt={4} spacing={2}>
                <Button 
                  onClick={stopQrScanner} 
                  colorScheme="red" 
                  variant="ghost" 
                  size={{ base: "sm", sm: "md" }}
                  fontSize={{ base: "xs", sm: "sm" }}
                >
                  إيقاف
                </Button>
              </HStack>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CenterGroupDetails;