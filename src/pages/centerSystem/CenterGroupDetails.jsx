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
import { MdAdd, MdDelete, MdSchedule, MdPeople, MdLocationOn, MdSchool, MdAttachMoney, MdEmail, MdPhone, MdCheckCircle, MdCancel } from 'react-icons/md';
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
        const cameraId = (devices && devices.length) ? devices[0].id : null;

        await html5Qr.start(
          cameraId,
          { fps: 10, qrbox: { width: 300, height: 300 } },
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
        toast({ title: 'فشل في فتح الكاميرا', description: err.message || 'تأكد من صلاحية الكاميرا', status: 'error', duration: 4000, isClosable: true });
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
        setError('فشل في جلب بيانات المجموعة');
        toast({ title: 'فشل في جلب بيانات المجموعة', status: 'error' });
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

  return (
    <Box p={6} className="mt-[80px]" bg={bgColor} minH="100vh">
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Date Selector (Top, Collapsible) */}
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" p={4} border="1px" borderColor={borderColor}>
            <HStack justify="space-between" align="center">
              <Text fontWeight="bold" color={textColor}>اختر تاريخ الحضور</Text>
              <Button variant="outline" size="sm" onClick={onToggleCalendar}>
                {isCalendarOpen ? 'إخفاء' : 'إظهار'}
              </Button>
            </HStack>
            <Collapse in={isCalendarOpen} animateOpacity>
              <Box w="full" display="flex" justifyContent="center" alignItems="center" mt={3}>
                <VStack w={{ base: '100%', md: '70%', lg: '50%' }} spacing={3}>
                  <Box w="full" textAlign="center">
                    <Text color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
                      يمكنك اختيار أي يوم من الشهر
                    </Text>
                  </Box>
                  <Box
                    w="full"
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="md"
                    p={4}
                display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {/* رأس التقويم مع أزرار تغيير الشهر */}
                    <HStack justify="space-between" w="full" mb={3}>
                      <IconButton icon={<IoChevronBack />} aria-label="الشهر السابق" size="sm" variant="ghost" onClick={() => changeMonth(-1)} color={primaryColor} />
                      <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color={primaryColor} bgGradient="linear(135deg, blue.100 0%, purple.100 100%)" px={4} py={2} borderRadius="xl" boxShadow="sm">
                        {selectedDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                      </Text>
                      <IconButton icon={<IoChevronForward />} aria-label="الشهر التالي" size="sm" variant="ghost" onClick={() => changeMonth(1)} color={primaryColor} />
                    </HStack>
                    {/* أيام الأسبوع */}
                    <SimpleGrid columns={7} spacing={1} w="full" mb={2}>
                      {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day) => (
                        <Box key={day} textAlign="center" py={1} fontSize="xs" fontWeight="bold" color="gray.600">
                          {day}
              </Box>
                      ))}
                    </SimpleGrid>
                    {/* أيام الشهر */}
                    <SimpleGrid columns={7} spacing={1} w="full">
                      {getMonthDays(selectedDate).map((day, idx) => {
                        if (!day) {
                          return <Box key={idx} h="32px" />;
                        }
                        const isSelected = day.toDateString() === selectedDate.toDateString();
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                          <Button
                            key={idx}
                            size="sm"
                            borderRadius="full"
                            px={0}
                            py={0}
                            minW="32px"
                            h="32px"
                            fontWeight="bold"
                            fontSize="xs"
                            color={isSelected ? 'white' : isToday ? 'white' : 'gray.700'}
                            bg={isSelected ? primaryColor : isToday ? 'orange.500' : 'gray.100'}
                            _hover={{ bg: isSelected ? primaryColor : isToday ? 'orange.600' : 'blue.50', transform: 'scale(1.1)' }}
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
                    <Box mt={3}>
                      <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color={primaryColor} bgGradient="linear(135deg, blue.100 0%, purple.100 100%)" px={4} py={1} borderRadius="xl" boxShadow="sm" display="inline-block">
                        {selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                    </Box>
                  </Box>
            </VStack>
          </Box>
            </Collapse>
          </Card>

          {/* Hero Section */}
        

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card 
              bg={cardBg} 
              shadow="xl" 
              borderRadius="2xl" 
              p={6}
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
              transition="all 0.3s ease"
            >
              <Stat>
                <StatLabel color={textColor} fontSize="sm" fontWeight="semibold" mb={2}>
                  <HStack>
                    <Box p={2} bg="blue.100" borderRadius="lg">
                      <FaClock color={primaryColor} size={16} />
                    </Box>
                    <Text>وقت المحاضرة</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color={primaryColor} fontSize="xl" fontWeight="bold">
                  {formatTime(groupData.start_time)}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="sm">
                  حتى {formatTime(groupData.end_time)}
                </StatHelpText>

                <Button
                mt={3}
                size="sm"
                colorScheme="blue"
                onClick={openStudentsModal}
                borderRadius="lg"
              >
                عرض الطلاب
              </Button>
              </Stat>
            </Card>

            <Card 
              bg={cardBg} 
              shadow="xl" 
              borderRadius="2xl" 
              p={6}
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
              transition="all 0.3s ease"
            >
              <Stat>
                <StatLabel color={textColor} fontSize="sm" fontWeight="semibold" mb={2}>
                  <HStack>
                    <Box p={2} bg="purple.100" borderRadius="lg">
                      <FaCalendarAlt color={secondaryColor} size={16} />
                    </Box>
                    <Text>أيام المحاضرة</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color={secondaryColor} fontSize="xl" fontWeight="bold">
                  {formatDays(groupData.days)}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="sm">
                  أسبوعياً
                </StatHelpText>
              </Stat>
            </Card>

            <Card 
              bg={cardBg} 
              shadow="xl" 
              borderRadius="2xl" 
              p={6}
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
              transition="all 0.3s ease"
            >
              <Stat>
                <StatLabel color={textColor} fontSize="sm" fontWeight="semibold" mb={2}>
                  <HStack>
                    <Box p={2} bg="teal.100" borderRadius="lg">
                      <FaUsers color={accentColor} size={16} />
                    </Box>
                    <Text>عدد الطلاب</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color={accentColor} fontSize="xl" fontWeight="bold">
                  {students?.length || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="sm">
                  <StatArrow type="increase" />
                  طالب مسجل
                </StatHelpText>
              </Stat>
            </Card>

            <Card 
              bg={cardBg} 
              shadow="xl" 
              borderRadius="2xl" 
              p={6}
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
              transition="all 0.3s ease"
            >
              <Stat>
                <StatLabel color={textColor} fontSize="sm" fontWeight="semibold" mb={2}>
                  <HStack>
                    <Box p={2} bg="green.100" borderRadius="lg">
                      <MdAttachMoney color="green.500" size={16} />
                    </Box>
                    <Text>إجمالي المدفوع</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="green.500" fontSize="xl" fontWeight="bold">
                  {students?.filter(s => s.payment_status === 'paid').length || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="sm">
                  من {students?.length || 0} طالب
                </StatHelpText>
              </Stat>
            </Card>
          </SimpleGrid>

          {/* Search and Add Section */}
          <Card 
            bg={cardBg} 
            shadow="xl" 
            borderRadius="2xl" 
            p={6}
            border="1px"
            borderColor={borderColor}
          >
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={6}>
              <Box flex={1} maxW="600px">
                <Text fontWeight="bold" color={textColor} mb={3} fontSize="lg">
                  البحث في الطلاب
                </Text>
                <InputGroup size="lg">
                  <Input
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.200"
                    borderRadius="xl"
                    _focus={{ 
                      borderColor: primaryColor, 
                      bg: 'white',
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="md"
                  />
                  <InputRightElement>
                    <BiSearch color="gray.400" size={20} />
                  </InputRightElement>
                </InputGroup>
              </Box>
              
              <HStack spacing={4} flexWrap="wrap" justify="center">
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="blue"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={() => setIsAddModalOpen(true)}
                  isLoading={loading}
                  px={{ base: 4, md: 6 }}
                  py={{ base: 4, md: 6 }}
                  borderRadius="xl"
                  shadow="lg"
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
                  إضافة طالب
                </Button>
                
                <Button
                  leftIcon={<FaFileAlt />}
                  colorScheme="green"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={() => setIsAddExamModalOpen(true)}
                  px={{ base: 4, md: 6 }}
                  py={{ base: 4, md: 6 }}
                  borderRadius="xl"
                  shadow="lg"
                  bgGradient="linear(135deg, green.500 0%, teal.500 100%)"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    shadow: 'xl',
                    bgGradient: "linear(135deg, green.600 0%, teal.600 100%)"
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                  fontWeight="bold"
                >
                  إنشاء امتحان
                </Button>

                <Button
                  leftIcon={<FaStar />}
                  colorScheme="purple"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={() => setIsExamGradesModalOpen(true)}
                  px={{ base: 4, md: 6 }}
                  py={{ base: 4, md: 6 }}
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
                >
                  إدارة الدرجات
                </Button>

            <Button
                  colorScheme="orange"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={() => setIsAttendanceHistoryOpen(true)}
                  px={{ base: 4, md: 6 }}
                  py={{ base: 4, md: 6 }}
                  borderRadius="xl"
                  shadow="lg"
                  bgGradient="linear(135deg, orange.400 0%, yellow.400 100%)"
              _hover={{ 
                    transform: 'translateY(-2px)', 
                    shadow: 'xl',
                    bgGradient: "linear(135deg, orange.500 0%, yellow.500 100%)"
              }}
                  _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
                  fontWeight="bold"
            >
                  عرض سجل الحضور
            </Button>
              </HStack>
            </Flex>
          </Card>

          {/* تقويم الشهر الكامل (نُقل للأعلى داخل Collapse) */}

          {/* Students Table Section */}
          {isMobile ? (
            <VStack w="100%" spacing={4}>
    {filteredStudents.map((s) => {
                const dateKey = selectedDate.toISOString().split('T')[0];
                const currentStatus = attendance[s.id]?.[dateKey] || 'not_set';
                return (
                  <Card key={s.id} w="100%" bg={cardBg} borderRadius="xl" shadow="md" border="1px" borderColor={borderColor} p={3}>
          <VStack align="stretch" spacing={3} w="100%">
            <Stack direction={{ base: 'column', sm: 'row' }} align="center" spacing={3} w="100%" justify="space-between">
                          <Link to={`/group/${id}/student/${s.id}`} style={{ textDecoration: 'none' }}>
              <HStack spacing={3} cursor="pointer" _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                <Avatar size="md" name={s.student_name} bgGradient="linear(135deg, blue.400 0%, purple.400 100%)" color="white" fontWeight="bold" shadow="xl" border="3px" borderColor="white" />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" color={textColor} fontSize="md">{s.student_name}</Text>
                  <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="2xs" fontWeight="medium">ID: {s.id}</Badge>
                </VStack>
              </HStack>
            </Link>
              <HStack spacing={2} w={{ base: '100%', sm: 'auto' }} justify={{ base: 'space-between', sm: 'flex-end' }}>
                <Button
                  leftIcon={<MdCheckCircle />}
                  colorScheme="green"
                  variant={currentStatus === 'present' ? 'solid' : 'outline'}
                  onClick={() => handleAttendance(s.id, 'present')}
                  size={{ base: 'md', md: 'sm' }}
                  borderRadius="full"
                  flex={{ base: 1, sm: 'none' }}
                >
                  حاضر
                </Button>
                <Button
                  leftIcon={<MdCancel />}
                  colorScheme="red"
                  variant={currentStatus === 'absent' ? 'solid' : 'outline'}
                  onClick={() => handleAttendance(s.id, 'absent')}
                  size={{ base: 'md', md: 'sm' }}
                  borderRadius="full"
                  flex={{ base: 1, sm: 'none' }}
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
                  icon={<BiSearch size={16} />}
                  colorScheme="teal"
                  variant="ghost"
                  aria-label="عرض التفاصيل"
                  size="sm"
                  borderRadius="full"
                />
                          </Tooltip>
                          <Tooltip label="حذف الطالب" placement="top" hasArrow>
                            <IconButton icon={<MdDelete size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteStudent(s.id)} aria-label="حذف" borderRadius="full" />
                          </Tooltip>
                        </HStack>
                      </VStack>
                  </Card>
                );
              })}
            </VStack>
          ) : (
          <Card 
            bg={cardBg} 
            shadow="xl" 
            borderRadius="2xl" 
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
                    <Table variant="simple" colorScheme="gray" size="md">
                      <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                        <Tr>
                          <Th color="gray.600" fontSize="sm" py={3}>الاسم</Th>
                          <Th color="gray.600" fontSize="sm" py={3} textAlign="center">الحضور</Th>
                          <Th color="gray.600" fontSize="sm" py={3} textAlign="center">الإجراءات</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                        {filteredStudents.map((s) => {
                                      const dateKey = selectedDate.toISOString().split('T')[0];
                                      const currentStatus = attendance[s.id]?.[dateKey] || 'not_set';
                                      return (
                            <Tr key={s.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                        <Td>
                        <Link to={`/group/${id}/student/${s.id}`} style={{ textDecoration: 'none' }}>
              <HStack spacing={3} cursor="pointer" _hover={{ opacity: 0.8 }} transition="opacity 0.2s">
                <Avatar size="sm" name={s.student_name} bg="blue.400" color="white" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold" color={textColor}>{s.student_name}</Text>
                  <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="2xs" fontWeight="medium">ID: {s.id}</Badge>
                </VStack>
              </HStack>
            </Link>
                          </Td>
                              <Td textAlign="center">
                                <HStack justify="center" spacing={3}>
                                  <Button
                                    leftIcon={<MdCheckCircle />}
                                          colorScheme="green"
                                          variant={currentStatus === 'present' ? 'solid' : 'outline'}
                                  onClick={() => handleAttendance(s.id, 'present')}
                                    size="sm"
                                          borderRadius="full"
                                  >
                                    حاضر
                                  </Button>
                                  <Button
                                    leftIcon={<MdCancel />}
                                          colorScheme="red"
                                          variant={currentStatus === 'absent' ? 'solid' : 'outline'}
                                  onClick={() => handleAttendance(s.id, 'absent')}
                                    size="sm"
                                          borderRadius="full"
                                  >
                                    غائب
                                  </Button>
                            </HStack>
                          </Td>
                              <Td textAlign="center">
                                <HStack spacing={2} justify="center">
                                                    <Tooltip label="عرض التفاصيل" placement="top" hasArrow>
                    <IconButton
                      as={Link}
                      to={`/group/${id}/student/${s.id}`}
                      icon={<BiSearch size={20} />}
                      colorScheme="teal"
                      variant="ghost"
                      aria-label="عرض التفاصيل"
                                      size="md"
                                      borderRadius="full"
                                />
                              </Tooltip>
                                  <Tooltip label="حذف الطالب" placement="top" hasArrow>
                                <IconButton
                                      icon={<MdDelete size={20} />}
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteStudent(s.id)}
                                  aria-label="حذف"
                                      size="md"
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
                <Flex justify="center" mt={4} p={4} borderTop="1px" borderColor={borderColor}>
            <HStack spacing={4}>
              <Button
                colorScheme="orange"
                size={{ base: 'md', md: 'lg' }}
                onClick={startQrScanner}
                 px={{ base: 6, md: 8 }}
                 py={{ base: 4, md: 6 }}
                 borderRadius="xl"
                 shadow="lg"
                 bgGradient="linear(135deg, orange.400 0%, yellow.400 100%)"
                 _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                 fontWeight="bold"
               >
                 تسجيل الحضور (QR)
               </Button>

              <Button
                colorScheme="purple"
                size={{ base: 'md', md: 'lg' }}
                onClick={handleSaveAttendance}
                isLoading={savingAttendance}
                loadingText="جاري الحفظ..."
                  px={{ base: 6, md: 10 }}
                  py={{ base: 4, md: 6 }}
                w={{ base: '100%', md: 'auto' }}
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
              >
                حفظ الحضور
              </Button>
            </HStack>
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

      <Modal isOpen={isStudentsModalOpen} onClose={() => setIsStudentsModalOpen(false)} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>طلاب المجموعة - {groupData?.name || `#${id}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalLoading ? (
              <Center py={12}>
                <VStack>
                  <Spinner size="xl" color={primaryColor} />
                  <Text>جاري جلب الطلاب...</Text>
                </VStack>
              </Center>
            ) : modalError ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text>{modalError}</Text>
              </Alert>
            ) : modalStudents.length === 0 ? (
              <Center py={12}>
                <Text>لا يوجد طلاب لعرضهم لهذا التاريخ.</Text>
              </Center>
            ) : (
              // ===================== تعديل: شبكة بعرض عمودين + تحسين شكل الكارت =====================
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} p={4} justifyItems="center">
                {modalStudents.map((s) => (
                  <Card
                    key={s.id}
                    w={{ base: "full", md: "480px" }}
                    maxW="480px"
                    borderRadius="lg"
                    shadow="lg"
                    overflow="hidden"
                    transition="transform 0.18s ease"
                    _hover={{ transform: "translateY(-6px)", shadow: "2xl" }}
                  >
                    <CardBody p={4}>
                      <HStack align="start" spacing={4}>
                        <VStack align="start" spacing={2} flex="1">
                          <HStack spacing={3}>
                            <Avatar size="md" name={s.student_name} bg="blue.400" color="white" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">{s.student_name}</Text>
                            
                            </VStack>
                          </HStack>

                          <VStack align="start" spacing={0} mt={2} fontSize="sm" color="gray.600">
                           
                            <Text>الهاتف: {s.phone}</Text>
                            {s.parent_phone && <Text>هاتف ولي الأمر: {s.parent_phone}</Text>}
                           
                          </VStack>

                          {/* زر "عرض الملف" أُزيل بناءً على طلبك */}
                        </VStack>

                        <Box
                          w="130px"
                          h="130px"
                          flexShrink={0}
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
                              maxW="120px"
                              maxH="120px"
                              objectFit="contain"
                            />
                          ) : (
                            <Center w="full" h="full">
                              <Text color="gray.500" fontSize="xs">لا يوجد QR</Text>
                            </Center>
                          )}
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
              // =======================================================================
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal isOpen={isQrScannerOpen} onClose={stopQrScanner} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>مسح QR لتسجيل الحضور</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center flexDirection="column" py={4}>
              <Box id="qr-scanner" w="full" minH="320px" borderRadius="md" overflow="hidden" bg="black" />
              <Text mt={3} color="gray.500" fontSize="sm" textAlign="center">
                ضع QR داخل المربع. سيتم إيقاف الكاميرا عند القراءة.
              </Text>
              {qrProcessing && (
                <Text mt={2} color="green.500" fontWeight="semibold">جاري معالجة الكود...</Text>
              )}
              <HStack mt={4}>
                <Button onClick={stopQrScanner} colorScheme="red" variant="ghost" size="sm">إيقاف</Button>
              </HStack>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CenterGroupDetails;