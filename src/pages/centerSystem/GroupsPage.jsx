// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Flex, SimpleGrid, Text, Button, useDisclosure, VStack, HStack, Tag, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Progress, ChakraProvider, useToast, Spinner, Center, Alert, AlertIcon, Collapse, Input } from '@chakra-ui/react';
import { IoAddCircleOutline, IoPeopleOutline, IoCalendarOutline, IoClipboardOutline, IoBookOutline, IoSchoolOutline, IoAnalyticsOutline } from 'react-icons/io5';
import baseUrl from '../../api/baseUrl';

// Import your existing GroupCard and AddGroupModal (assuming they are in the correct path)
import GroupCard from '../../components/centerSystem/GroupCard';
import AddGroupModal from '../../components/centerSystem/AddGroupModal';
import EditGroupModal from '../../components/centerSystem/EditGroupModal';
import { useStudyGroups } from '../../Hooks/centerSystem/useStudyGroups';

// --- مكونات المحتوى مع بيانات وهمية ---

const GroupsContent = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const toast = useToast();
    
    const { 
        groups, 
        loading, 
        error, 
        createGroup, 
        updateGroup, 
        deleteGroup 
    } = useStudyGroups();

    const handleAddGroup = async (groupData) => {
        const result = await createGroup(groupData);
        if (result.success) {
            toast({ title: 'تم إنشاء المجموعة بنجاح', status: 'success' });
        onClose();
        } else {
            toast({ title: result.error, status: 'error' });
        }
    };

    const handleEditGroup = (group) => {
        setSelectedGroup(group);
        onEditOpen();
    };

    const handleUpdateGroup = async (groupId, groupData) => {
        const result = await updateGroup(groupId, groupData);
        if (result.success) {
            toast({ title: 'تم تحديث المجموعة بنجاح', status: 'success' });
            onEditClose();
            setSelectedGroup(null);
        } else {
            toast({ title: result.error, status: 'error' });
        }
    };

    const handleDeleteGroup = async (groupId) => {
        const result = await deleteGroup(groupId);
        if (result.success) {
            toast({ title: 'تم حذف المجموعة بنجاح', status: 'success' });
        } else {
            toast({ title: result.error, status: 'error' });
        }
    };

    if (loading && groups.length === 0) {
        return (
            <Center py={20}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="teal.500" />
                    <Text>جاري تحميل المجموعات...</Text>
                </VStack>
            </Center>
        );
    }

    if (error) {
        return (
            <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={6}>
                <VStack align="start" spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">المجموعات الدراسية</Text>
                    <Text fontSize="sm" color="gray.600">
                        إجمالي المجموعات: {groups.length}
                    </Text>
                </VStack>
                <Button 
                    leftIcon={<IoAddCircleOutline />} 
                    colorScheme="teal" 
                    onClick={onOpen}
                    size="lg"
                >
                    إنشاء مجموعة
                </Button>
            </Flex>

            {groups.length === 0 ? (
                <Center py={20}>
                    <VStack spacing={4}>
                        <Text fontSize="lg" color="gray.500">لا توجد مجموعات حالياً</Text>
                        <Button colorScheme="teal" onClick={onOpen}>
                            إنشاء أول مجموعة
                        </Button>
                    </VStack>
                </Center>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {groups.map((group) => (
                        <GroupCard 
                            key={group.id} 
                            group={group}
                            onEdit={handleEditGroup}
                            onDelete={handleDeleteGroup}
                            loading={loading}
                        />
                ))}
            </SimpleGrid>
            )}

            <AddGroupModal 
                isOpen={isOpen} 
                onClose={onClose} 
                onAdd={handleAddGroup}
                loading={loading}
            />
            
            <EditGroupModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                onUpdate={handleUpdateGroup}
                group={selectedGroup}
                loading={loading}
            />
        </Box>
    );
};

const AttendanceContent = ({ selectedDate }) => {
    const dummyAttendance = [
        { id: 1, studentName: 'أحمد علي', group: 'رياضيات - ثالثة ثانوي', date: '2025-06-25', status: 'حاضر' },
        { id: 2, studentName: 'فاطمة محمد', group: 'كيمياء - ثانية ثانوي', date: '2025-06-25', status: 'غائب' },
        { id: 3, studentName: 'يوسف السيد', group: 'فيزياء - أولى ثانوي', date: '2025-06-25', status: 'حاضر' },
        { id: 4, studentName: 'ليلى إبراهيم', group: 'رياضيات - ثالثة ثانوي', date: '2025-06-26', status: 'حاضر' },
        { id: 5, studentName: 'محمد خالد', group: 'كيمياء - ثانية ثانوي', date: '2025-06-26', status: 'غائب بعذر' },
    ];

    const filtered = selectedDate ? dummyAttendance.filter(r => r.date === selectedDate) : dummyAttendance;

    return (
        <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>الحضور والغياب</Text>
            <VStack spacing={4} align="stretch">
                {filtered.map((record) => (
                    <Box key={record.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                        <HStack justify="space-between">
                            <Text fontWeight="semibold">{record.studentName}</Text>
                            <Text fontSize="sm" color="gray.500">{record.group}</Text>
                        </HStack>
                        <Flex justify="space-between" align="center" mt={2}>
                            <Text fontSize="sm" color="gray.600">{record.date}</Text>
                            <Tag
                                size="md"
                                variant="solid"
                                colorScheme={
                                    record.status === 'حاضر' ? 'green' :
                                    record.status === 'غائب' ? 'red' : 'orange'
                                }
                            >
                                {record.status}
                            </Tag>
                        </Flex>
                    </Box>
                ))}
                {filtered.length === 0 && (
                    <Text textAlign="center" color="gray.500" mt={8}>لا توجد سجلات حضور لعرضها حالياً.</Text>
                )}
            </VStack>
            <Button mt={6} colorScheme="blue" leftIcon={<IoAddCircleOutline />}>تسجيل حضور جديد</Button>
        </Box>
    );
};

const AssignmentsContent = () => {
    const dummyAssignments = [
        { id: 1, title: 'واجب الوحدة الأولى - رياضيات', group: 'رياضيات - ثالثة ثانوي', dueDate: '2025-07-05', status: 'لم يتم التسليم', submissions: 15, totalStudents: 25 },
        { id: 2, title: 'مشروع الكيمياء العضوية', group: 'كيمياء - ثانية ثانوي', dueDate: '2025-07-10', status: 'قيد المراجعة', submissions: 10, totalStudents: 18 },
        { id: 3, title: 'أسئلة مراجعة الفصل الثاني - فيزياء', group: 'فيزياء - أولى ثانوي', dueDate: '2025-06-30', status: 'تم التسليم', submissions: 22, totalStudents: 22 },
    ];

    return (
        <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>الواجبات</Text>
            <VStack spacing={4} align="stretch">
                {dummyAssignments.map((assignment) => (
                    <Box key={assignment.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                        <Text fontWeight="bold" fontSize="lg">{assignment.title}</Text>
                        <Text fontSize="sm" color="gray.500" mb={2}>{assignment.group}</Text>
                        <HStack justify="space-between" mb={2}>
                            <Text>الموعد النهائي: <Text as="span" fontWeight="semibold">{assignment.dueDate}</Text></Text>
                            <Tag size="sm" colorScheme={assignment.status === 'تم التسليم' ? 'green' : assignment.status === 'قيد المراجعة' ? 'blue' : 'red'}>
                                {assignment.status}
                            </Tag>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            عدد التسليمات: {assignment.submissions} من {assignment.totalStudents} طالب
                        </Text>
                        <Progress value={(assignment.submissions / assignment.totalStudents) * 100} size="sm" colorScheme="teal" mt={1} borderRadius="md"/>
                    </Box>
                ))}
                {dummyAssignments.length === 0 && (
                    <Text textAlign="center" color="gray.500" mt={8}>لا توجد واجبات لعرضها حالياً.</Text>
                )}
            </VStack>
            <Button mt={6} colorScheme="blue" leftIcon={<IoAddCircleOutline />}>إنشاء واجب جديد</Button>
        </Box>
    );
};

const StudentsContent = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await baseUrl.get('/api/study-groups/teacher/my-students', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(res.data?.students || []);
            } catch (err) {
                const msg = err.response?.data?.message || 'فشل في جلب بيانات الطلاب';
                setError(msg);
                toast({ title: 'خطأ', description: msg, status: 'error', duration: 4000, isClosable: true });
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    return (
        <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>الطلاب</Text>
            {loading ? (
                <Center py={10}>
                    <VStack spacing={3}>
                        <Spinner size="lg" color="teal.500" />
                        <Text color="gray.600">جاري تحميل بيانات الطلاب...</Text>
                    </VStack>
                </Center>
            ) : error ? (
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            ) : (
                <VStack spacing={4} align="stretch">
                    {students.map((student) => (
                        <Box key={student.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                            <Text fontWeight="bold" fontSize="lg">{student.name}</Text>
                            {student.phone && (
                                <Text fontSize="sm" color="gray.600">الهاتف: {student.phone}</Text>
                            )}
                            {student.parent_phone && (
                                <Text fontSize="sm" color="gray.600">هاتف ولي الأمر: {student.parent_phone}</Text>
                            )}
                            <HStack mt={2} wrap="wrap">
                                {(student.grades || []).length > 0 ? (
                                    student.grades.map((g) => (
                                        <Tag key={g.id} size="sm" colorScheme="purple" mb={1}>{g.name}</Tag>
                                    ))
                                ) : (
                                    <Tag size="sm" colorScheme="gray" mb={1}>بدون مرحلة</Tag>
                                )}
                            </HStack>
                        </Box>
                    ))}
                    {students.length === 0 && (
                        <Text textAlign="center" color="gray.500" mt={8}>لا توجد بيانات طلاب لعرضها حالياً.</Text>
                    )}
                </VStack>
            )}
            <Button mt={6} colorScheme="blue" leftIcon={<IoAddCircleOutline />}>إضافة طالب جديد</Button>
        </Box>
    );
};

const TeachersContent = () => {
    const dummyTeachers = [
        { id: 201, name: 'أ. محمد عبد الله', subject: 'الرياضيات', email: 'm.abdullah@example.com', phone: '01001122334' },
        { id: 202, name: 'أ. سارة حسن', subject: 'الكيمياء', email: 's.hassan@example.com', phone: '01155667788' },
        { id: 203, name: 'أ. أحمد علي', subject: 'الفيزياء', email: 'a.ali@example.com', phone: '01288990011' },
    ];

    return (
        <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>المدرسون</Text>
            <VStack spacing={4} align="stretch">
                {dummyTeachers.map((teacher) => (
                    <Box key={teacher.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white">
                        <Text fontWeight="bold" fontSize="lg">{teacher.name}</Text>
                        <Text fontSize="md" color="teal.600">{teacher.subject}</Text>
                        <Text fontSize="sm" color="gray.600">البريد الإلكتروني: {teacher.email}</Text>
                        <Text fontSize="sm" color="gray.600">الهاتف: {teacher.phone}</Text>
                    </Box>
                ))}
                {dummyTeachers.length === 0 && (
                    <Text textAlign="center" color="gray.500" mt={8}>لا توجد بيانات مدرسين لعرضها حالياً.</Text>
                )}
            </VStack>
            <Button mt={6} colorScheme="blue" leftIcon={<IoAddCircleOutline />}>إضافة مدرس جديد</Button>
        </Box>
    );
};

const ReportsContent = () => {
    return (
        <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>التقارير والإحصائيات</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                    <StatLabel>إجمالي عدد الطلاب</StatLabel>
                    <StatNumber>125</StatNumber>
                    <StatHelpText>
                        <StatArrow type="increase" />
                        5% هذا الشهر
                    </StatHelpText>
                </Stat>
                <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                    <StatLabel>عدد المجموعات النشطة</StatLabel>
                    <StatNumber>15</StatNumber>
                    <StatHelpText>
                        <StatArrow type="increase" />
                        2 مجموعة جديدة
                    </StatHelpText>
                </Stat>
                <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                    <StatLabel>متوسط نسبة الحضور</StatLabel>
                    <StatNumber>85%</StatNumber>
                    <StatHelpText>
                        <StatArrow type="decrease" />
                        3% عن الأسبوع الماضي
                    </StatHelpText>
                </Stat>
                <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                    <StatLabel>الواجبات المتأخرة</StatLabel>
                    <StatNumber color="red.500">7</StatNumber>
                    <StatHelpText>
                        تحتاج للمتابعة
                    </StatHelpText>
                </Stat>
            </SimpleGrid>
            <Text mt={6} fontSize="lg" fontWeight="semibold">تقارير إضافية:</Text>
            <VStack align="flex-start" mt={2} spacing={2}>
                <Button variant="link" colorScheme="teal">تقرير تفصيلي للحضور</Button>
                <Button variant="link" colorScheme="teal">تقرير أداء الطلاب</Button>
                <Button variant="link" colorScheme="teal">تقرير مالي</Button>
            </VStack>
        </Box>
    );
};


const center_groups = () => {
    const [activeSection, setActiveSection] = useState('groups');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const { isOpen: isDayPickerOpen, onToggle: onToggleDayPicker } = useDisclosure({ defaultIsOpen: true });

    const sections = [
        { id: 'groups', name: 'المجموعات', icon: IoPeopleOutline, component: <GroupsContent /> },
        { id: 'attendance', name: 'الحضور والغياب', icon: IoCalendarOutline, component: <AttendanceContent /> },
        { id: 'assignments', name: 'الواجبات', icon: IoClipboardOutline, component: <AssignmentsContent /> },
        { id: 'students', name: 'الطلاب', icon: IoBookOutline, component: <StudentsContent /> },
        { id: 'teachers', name: 'المدرسون', icon: IoSchoolOutline, component: <TeachersContent /> },
        { id: 'reports', name: 'التقارير', icon: IoAnalyticsOutline, component: <ReportsContent /> },
    ];

    const renderActiveSection = () => {
        if (activeSection === 'groups') return <GroupsContent />;
        if (activeSection === 'attendance') return <AttendanceContent selectedDate={selectedDate} />;
        if (activeSection === 'assignments') return <AssignmentsContent />;
        if (activeSection === 'students') return <StudentsContent />;
        if (activeSection === 'teachers') return <TeachersContent />;
        if (activeSection === 'reports') return <ReportsContent />;
        return null;
    };

    return (
        <Box p={6} className='mt-[ 0px]'>
            {/* اختيار اليوم (أعلى الصفحة) */}
            <Box mb={4}>
                <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="lg" fontWeight="bold">اختيار اليوم</Text>
                    <Button variant="outline" size="sm" onClick={onToggleDayPicker}>
                        {isDayPickerOpen ? 'إخفاء' : 'إظهار'}
                    </Button>
                </Flex>
                <Collapse in={isDayPickerOpen} animateOpacity>
                    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
                        <HStack spacing={3} flexWrap="wrap">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                w={{ base: '100%', sm: 'auto' }}
                            />
                            <Button size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>اليوم</Button>
                            <Button size="sm" variant="ghost" onClick={() => setActiveSection('attendance')}>عرض الحضور لهذا اليوم</Button>
                        </HStack>
                    </Box>
                </Collapse>
            </Box>

            {/* شريط التنقل (الـ Slider) */}
            <Flex
                overflowX="auto"
                pb={4}
                mb={6}
                borderRadius="lg"
                boxShadow="md"
                p={4}
                bg="white"
                css={{
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {sections.map((section) => (
                    <Flex
                        key={section.id}
                        direction="column"
                        align="center"
                        justify="center"
                        minW="120px"
                        p={2}
                        cursor="pointer"
                        onClick={() => setActiveSection(section.id)}
                        bg={activeSection === section.id ? 'teal.50' : 'transparent'}
                        color={activeSection === section.id ? 'teal.600' : 'gray.600'}
                        fontWeight={activeSection === section.id ? 'bold' : 'normal'}
                        borderRadius="md"
                        transition="background-color 0.2s, color 0.2s"
                        _hover={{ bg: 'gray.100' }}
                    >
                        <Box as={section.icon} boxSize="28px" mb={1} />
                        <Text fontSize="sm" textAlign="center">{section.name}</Text>
                    </Flex>
                ))}
            </Flex>

            {/* منطقة المحتوى */}
            <Box>
                {renderActiveSection()}
            </Box>
        </Box>
    );
};

export default center_groups;
