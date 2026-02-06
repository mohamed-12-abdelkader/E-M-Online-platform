import React, { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    Badge,
    Icon,
    Button,
    SimpleGrid,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    IconButton,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Checkbox,
    Avatar,
    Tooltip,
    useToast,
    Spinner,
    Center,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Container,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Divider,
    Select,
} from "@chakra-ui/react";
import {
    FaUserGraduate,
    FaSearch,
    FaTimes,
    FaBan,
    FaUnlock,
    FaPhone,
    FaEnvelope,
    FaCalendar,
    FaKey,
    FaLock,
    FaTrash,
    FaChevronRight,
    FaHome,
} from "react-icons/fa";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import baseUrl from "../../api/baseUrl";
import UserType from "../../Hooks/auth/userType";
import dayjs from "dayjs";

const CourseStudentsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, isAdmin, isTeacher] = UserType();
    const token = localStorage.getItem("token");

    const [courseData, setCourseData] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchStudent, setSearchStudent] = useState('');

    const [blockingLoading, setBlockingLoading] = useState(false);
    const [sortBy, setSortBy] = useState("alphabetical");
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedStudentsForBlock, setSelectedStudentsForBlock] = useState([]);

    // Dialogs
    const { isOpen: isBlockAllOpen, onOpen: onBlockAllOpen, onClose: onBlockAllClose } = useDisclosure();
    const { isOpen: isUnblockAllOpen, onOpen: onUnblockAllOpen, onClose: onUnblockAllClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deleteStudentId, setDeleteStudentId] = useState(null);
    const [deleteStudentName, setDeleteStudentName] = useState("");

    const toast = useToast();
    const cancelRef = React.useRef();

    // Fetch Course Details and Enrollments
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch course details
                const courseRes = await baseUrl.get(`api/course/${id}/details`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCourseData(courseRes.data);

                // Fetch enrollments
                await fetchEnrollments();
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "خطأ",
                    description: "فشل في تحميل البيانات",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

    const fetchEnrollments = async () => {
        try {
            const response = await baseUrl.get(`api/course/${id}/enrollments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEnrollments(response.data.students || []);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
        }
    };

    // --- Search helpers (Arabic-friendly + phone normalization) ---
    const normalizeLatin = (value) => {
        if (value === null || value === undefined) return "";
        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove latin diacritics
            .toLowerCase()
            .trim();
    };

    const normalizeArabic = (value) => {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // tashkeel
            .replace(/\u0640/g, "") // tatweel
            .replace(/[إأآا]/g, "ا")
            .replace(/[يى]/g, "ي")
            .replace(/ة/g, "ه")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    };

    const normalizeDigits = (value) => {
        if (value === null || value === undefined) return "";
        return String(value).replace(/\D/g, "");
    };

    const normalizeQuery = (q) => {
        const raw = String(q || "").trim();
        return {
            raw,
            ar: normalizeArabic(raw),
            latin: normalizeLatin(raw),
            digits: normalizeDigits(raw),
        };
    };

    // Filter & Sort Logic using useMemo
    const filteredEnrollments = React.useMemo(() => {
        let result = [...enrollments];
        const q = normalizeQuery(searchStudent);

        // 1. Search Filter
        if (q.raw) {
            const tokens = q.ar.split(" ").filter(Boolean);
            const digitToken = q.digits;

            result = result.filter((student) => {
                const name = normalizeArabic(student?.name);
                const email = normalizeLatin(student?.email);
                const code = normalizeLatin(student?.activation_code);
                const phoneDigits = normalizeDigits(student?.phone);

                // If query is only digits, prioritize phone match
                if (digitToken && tokens.length === 0) {
                    return phoneDigits.includes(digitToken);
                }

                // Otherwise require every token to match something
                return tokens.every((t) => {
                    const tDigits = normalizeDigits(t);
                    if (tDigits) return phoneDigits.includes(tDigits);
                    return (
                        (name && name.includes(t)) ||
                        (email && email.includes(t)) ||
                        (code && code.includes(t))
                    );
                });
            });
        }

        // 2. Sorting
        result.sort((a, b) => {
            if (sortBy === "alphabetical") {
                const aName = normalizeArabic(a?.name);
                const bName = normalizeArabic(b?.name);
                return aName.localeCompare(bName, "ar", { sensitivity: "base", numeric: true });
            } else if (sortBy === "newest") {
                // Sort by enrolled_at desc, fallback to ID desc
                const dateA = new Date(a.enrolled_at || 0).getTime();
                const dateB = new Date(b.enrolled_at || 0).getTime();
                if (dateA !== dateB) return dateB - dateA;
                return (b.id || 0) - (a.id || 0);
            } else if (sortBy === "oldest") {
                // Sort by enrolled_at asc, fallback to ID asc
                const dateA = new Date(a.enrolled_at || 0).getTime();
                const dateB = new Date(b.enrolled_at || 0).getTime();
                if (dateA !== dateB) return dateA - dateB;
                return (a.id || 0) - (b.id || 0);
            }
            return 0;
        });

        return result;
    }, [enrollments, searchStudent, sortBy]);

    // Actions
    const handleBlockAllStudents = async () => {
        try {
            setBlockingLoading(true);
            const response = await baseUrl.post(`/api/courses/${id}/block-all`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "نجح",
                description: response.data.message || `تم حظر ${response.data.blocked_count} طالب`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await fetchEnrollments();
            onBlockAllClose();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في حظر الطلاب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setBlockingLoading(false);
        }
    };

    const handleUnblockAllStudents = async () => {
        try {
            setBlockingLoading(true);
            const response = await baseUrl.post(`/api/courses/${id}/unblock-all`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "نجح",
                description: response.data.message || `تم إلغاء حظر ${response.data.unblocked_count} طالب`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await fetchEnrollments();
            onUnblockAllClose();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في إلغاء حظر الطلاب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setBlockingLoading(false);
        }
    };

    const handleBlockStudent = async (studentId) => {
        try {
            setBlockingLoading(true);
            const response = await baseUrl.post(`/api/courses/${id}/block-student`, { student_id: studentId }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "نجح",
                description: response.data.message || "تم حظر الطالب بنجاح",
                status: "success",
                duration: 2000,
                isClosable: true,
            });

            await fetchEnrollments();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في حظر الطالب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setBlockingLoading(false);
        }
    };

    const handleUnblockStudent = async (studentId) => {
        try {
            setBlockingLoading(true);
            const response = await baseUrl.post(`/api/courses/${id}/unblock-student`, { student_id: studentId }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "نجح",
                description: response.data.message || "تم إلغاء حظر الطالب بنجاح",
                status: "success",
                duration: 2000,
                isClosable: true,
            });

            await fetchEnrollments();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في إلغاء حظر الطالب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setBlockingLoading(false);
        }
    };

    const handleBlockSelectedStudents = async () => {
        if (selectedStudentsForBlock.length === 0) return;

        try {
            setBlockingLoading(true);
            const response = await baseUrl.post(`/api/courses/${id}/block-students`, {
                student_ids: selectedStudentsForBlock,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "نجح",
                description: response.data.message || `تم حظر ${response.data.blocked_count} طالب`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setSelectedStudentsForBlock([]);
            await fetchEnrollments();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في حظر الطلاب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setBlockingLoading(false);
        }
    };

    const handleUnblockSelectedStudents = async () => {
        if (selectedStudentsForBlock.length === 0) return;

        try {
            setBlockingLoading(true);
            const response = await baseUrl.post(`/api/courses/${id}/unblock-students`, {
                student_ids: selectedStudentsForBlock,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "نجح",
                description: response.data.message || `تم إلغاء حظر ${response.data.unblocked_count} طالب`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setSelectedStudentsForBlock([]);
            await fetchEnrollments();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في إلغاء حظر الطلاب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setBlockingLoading(false);
        }
    };

    const handleDeleteStudentConfirm = (studentId, studentName) => {
        setDeleteStudentId(studentId);
        setDeleteStudentName(studentName);
        onDeleteOpen();
    };

    const handleDeleteStudent = async () => {
        try {
            setActionLoading(true);
            await baseUrl.delete(`api/courses/${id}/enrollments/${deleteStudentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast({
                title: "تم الحذف",
                description: "تم حذف الطالب بنجاح",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await fetchEnrollments();
            onDeleteClose();
        } catch (error) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ أثناء حذف الطالب",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "غير متوفر";
        return dayjs(dateString).format("DD/MM/YYYY");
    };

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            {/* Breadcrumb */}
            <Breadcrumb spacing="8px" separator={<FaChevronRight color="gray.500" />} mb={6}>
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/home">
                        <HStack>
                            <FaHome />
                            <Text>الرئيسية</Text>
                        </HStack>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to={`/CourseDetailsPage/${id}`}>
                        {courseData?.course?.title || "تفاصيل الكورس"}
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>الطلاب المشتركون</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Box bg="white" p={6} className="modern-card">
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                    <HStack spacing={4}>
                        <Icon as={FaUserGraduate} w={8} h={8} color="blue.500" />
                        <VStack align="flex-start" spacing={0}>
                            <Heading size="lg">قائمة الطلاب</Heading>
                            <Text color="gray.500">{courseData?.course?.title}</Text>
                        </VStack>
                    </HStack>

                    <HStack spacing={4}>
                        <Badge colorScheme="blue" fontSize="lg" p={2} borderRadius="md">
                            العدد الكلي: {enrollments.length}
                        </Badge>
                        <Badge colorScheme="green" fontSize="lg" p={2} borderRadius="md">
                            النشطين: {enrollments.filter(s => !s.is_blocked_by_teacher).length}
                        </Badge>
                        <Badge colorScheme="red" fontSize="lg" p={2} borderRadius="md">
                            المحظورين: {enrollments.filter(s => s.is_blocked_by_teacher).length}
                        </Badge>
                    </HStack>
                </Flex>

                {/* Search & Actions */}
                <Flex gap={4} mb={6} flexWrap="wrap">
                    <InputGroup maxW={{ base: "full", md: "400px" }}>
                        <InputLeftElement>
                            <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="بحث بالاسم، الهاتف، كود التفعيل..."
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                            bg="white"
                        />
                        {searchStudent && (
                            <InputRightElement>
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<Icon as={FaTimes} />}
                                    onClick={() => setSearchStudent('')}
                                />
                            </InputRightElement>
                        )}
                    </InputGroup>

                    <Select
                        w={{ base: '100%', sm: '200px' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        bg="white"
                    >
                        <option value="alphabetical">أبجدي (أ-ي)</option>
                        <option value="newest">الأحدث انضماماً</option>
                        <option value="oldest">الأقدم انضماماً</option>
                    </Select>

                    {(isTeacher || isAdmin) && (
                        <HStack spacing={2} flexWrap="wrap">
                            <Button
                                leftIcon={<Icon as={FaBan} />}
                                colorScheme="red"
                                variant="outline"
                                size="md"
                                onClick={onBlockAllOpen}
                                isLoading={blockingLoading}
                            >
                                حظر الكل
                            </Button>
                            <Button
                                leftIcon={<Icon as={FaUnlock} />}
                                colorScheme="green"
                                variant="outline"
                                size="md"
                                onClick={onUnblockAllOpen}
                                isLoading={blockingLoading}
                            >
                                إلغاء حظر الكل
                            </Button>

                            {selectedStudentsForBlock.length > 0 && (
                                <>
                                    <Divider orientation="vertical" h="20px" borderColor="gray.300" />
                                    <Button
                                        leftIcon={<Icon as={FaBan} />}
                                        colorScheme="red"
                                        size="md"
                                        onClick={handleBlockSelectedStudents}
                                        isLoading={blockingLoading}
                                    >
                                        حظر المحددين ({selectedStudentsForBlock.length})
                                    </Button>
                                    <Button
                                        leftIcon={<Icon as={FaUnlock} />}
                                        colorScheme="green"
                                        size="md"
                                        onClick={handleUnblockSelectedStudents}
                                        isLoading={blockingLoading}
                                    >
                                        إلغاء حظر المحددين
                                    </Button>
                                    <Button
                                        size="md"
                                        variant="ghost"
                                        onClick={() => setSelectedStudentsForBlock([])}
                                    >
                                        إلغاء التحديد
                                    </Button>
                                </>
                            )}
                        </HStack>
                    )}
                </Flex>

                {/* Table */}
                {filteredEnrollments.length > 0 ? (
                    <TableContainer>
                        <Table variant="simple" size="md">
                            <Thead bg="gray.50">
                                <Tr>
                                    {(isTeacher || isAdmin) && (
                                        <Th w="50px">
                                            <Checkbox
                                                isChecked={selectedStudentsForBlock.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                                                isIndeterminate={selectedStudentsForBlock.length > 0 && selectedStudentsForBlock.length < filteredEnrollments.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStudentsForBlock(filteredEnrollments.map(s => s.id));
                                                    } else {
                                                        setSelectedStudentsForBlock([]);
                                                    }
                                                }}
                                            />
                                        </Th>
                                    )}
                                    <Th>الطالب</Th>
                                    <Th>بيانات الاتصال</Th>
                                    <Th>بيانات الاشتراك</Th>
                                    <Th>الحالة</Th>
                                    <Th>حالة المحتوى</Th>
                                    <Th>الإجراءات</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredEnrollments.map((student) => {
                                    const isBlocked = student.is_blocked_by_teacher || false;
                                    const isSelected = selectedStudentsForBlock.includes(student.id);

                                    return (
                                        <Tr
                                            key={student.id}
                                            bg={isBlocked ? "red.50" : isSelected ? "blue.50" : "transparent"}
                                            _hover={{ bg: isBlocked ? "red.100" : isSelected ? "blue.100" : "gray.50" }}
                                            transition="background-color 0.2s"
                                        >
                                            {(isTeacher || isAdmin) && (
                                                <Td>
                                                    <Checkbox
                                                        isChecked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedStudentsForBlock([...selectedStudentsForBlock, student.id]);
                                                            } else {
                                                                setSelectedStudentsForBlock(selectedStudentsForBlock.filter(id => id !== student.id));
                                                            }
                                                        }}
                                                    />
                                                </Td>
                                            )}

                                            {/* الطالب */}
                                            <Td>
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="md"
                                                        name={student.name}
                                                        src={student.avatar}
                                                        bg={isBlocked ? "red.500" : "blue.500"}
                                                    />
                                                    <VStack align="flex-start" spacing={0}>
                                                        <Text fontWeight="bold" fontSize="md">{student.name}</Text>
                                                        {isBlocked && (
                                                            <Badge colorScheme="red" fontSize="xs">محظور من المعلم</Badge>
                                                        )}
                                                    </VStack>
                                                </HStack>
                                            </Td>

                                            {/* بيانات الاتصال */}
                                            <Td>
                                                <VStack align="flex-start" spacing={1}>
                                                    <HStack spacing={2}>
                                                        <Icon as={FaPhone} color="gray.400" w={3} h={3} />
                                                        <Text fontSize="sm">{student.phone || "-"}</Text>
                                                    </HStack>
                                                    <HStack spacing={2}>
                                                        <Icon as={FaEnvelope} color="gray.400" w={3} h={3} />
                                                        <Text fontSize="sm">{student.email || "-"}</Text>
                                                    </HStack>
                                                </VStack>
                                            </Td>

                                            {/* بيانات الاشتراك */}
                                            <Td>
                                                <VStack align="flex-start" spacing={1}>
                                                    <HStack>
                                                        <Icon as={FaCalendar} color="gray.400" w={3} h={3} />
                                                        <Text fontSize="sm">{formatDate(student.enrolled_at)}</Text>
                                                    </HStack>
                                                    {student.activation_code && (
                                                        <HStack>
                                                            <Icon as={FaKey} color="purple.400" w={3} h={3} />
                                                            <Badge variant="outline" colorScheme="purple" fontSize="xs" fontFamily="mono">
                                                                {student.activation_code}
                                                            </Badge>
                                                        </HStack>
                                                    )}
                                                </VStack>
                                            </Td>


                                            {/* الحالة */}
                                            <Td>
                                                <VStack align="flex-start" spacing={1}>
                                                    <Badge
                                                        colorScheme={
                                                            student.subscription_status === "active" ? "green" :
                                                                student.subscription_status === "expired" ? "red" :
                                                                    student.subscription_status === "suspended" ? "orange" : "gray"
                                                        }
                                                    >
                                                        {student.subscription_status === "active" ? "نشط" :
                                                            student.subscription_status === "expired" ? "منتهي" :
                                                                student.subscription_status === "suspended" ? "معلق" : "غير معروف"}
                                                    </Badge>
                                                    {student.blocked_at && (
                                                        <Text fontSize="xs" color="gray.500">
                                                            تاريخ الحظر: {formatDate(student.blocked_at)}
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </Td>

                                            {/* حالة المحتوى */}
                                            <Td>
                                                <Badge colorScheme={student.is_content_blocked ? "red" : "green"} fontSize="xs">
                                                    {student.is_content_blocked ? "محجوب عنه المحتوى" : "له صلاحية على المحتوى"}
                                                </Badge>
                                            </Td>

                                            {/* الإجراءات */}
                                            <Td>
                                                <HStack spacing={2}>
                                                    {(isTeacher || isAdmin) && (
                                                        <>
                                                            {isBlocked ? (
                                                                <Tooltip label="إلغاء حظر المحتوى">
                                                                    <IconButton
                                                                        size="sm"
                                                                        colorScheme="green"
                                                                        variant="solid"
                                                                        icon={<Icon as={FaUnlock} />}
                                                                        onClick={() => handleUnblockStudent(student.id)}
                                                                        isLoading={blockingLoading}
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip label="حظر المحتوى">
                                                                    <IconButton
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="outline"
                                                                        icon={<Icon as={FaLock} />}
                                                                        onClick={() => handleBlockStudent(student.id)}
                                                                        isLoading={blockingLoading}
                                                                        _hover={{ bg: "red.50" }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    )}

                                                    <Tooltip label="حذف من الكورس">
                                                        <IconButton
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            icon={<Icon as={FaTrash} />}
                                                            onClick={() => handleDeleteStudentConfirm(student.id, student.name)}
                                                            isLoading={actionLoading}
                                                        />
                                                    </Tooltip>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box textAlign="center" py={10}>
                        <Icon as={FaSearch} w={10} h={10} color="gray.300" mb={4} />
                        <Text color="gray.500" fontSize="lg">لا توجد نتائج مطابقة</Text>
                        {searchStudent && (
                            <Button
                                mt={4}
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchStudent('')}
                            >
                                مسح البحث
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {/* Confirmation Dialogs */}
            <AlertDialog isOpen={isBlockAllOpen} leastDestructiveRef={cancelRef} onClose={onBlockAllClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>تأكيد حظر الجميع</AlertDialogHeader>
                        <AlertDialogBody>هل أنت متأكد من حظر جميع الطلاب في هذا الكورس؟</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onBlockAllClose}>إلغاء</Button>
                            <Button colorScheme="red" onClick={handleBlockAllStudents} ml={3}>حظر الكل</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog isOpen={isUnblockAllOpen} leastDestructiveRef={cancelRef} onClose={onUnblockAllClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>تأكيد إلغاء حظر الجميع</AlertDialogHeader>
                        <AlertDialogBody>هل أنت متأكد من إلغاء حظر جميع الطلاب في هذا الكورس؟</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onUnblockAllClose}>إلغاء</Button>
                            <Button colorScheme="green" onClick={handleUnblockAllStudents} ml={3}>إلغاء الحظر</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>حذف الطالب</AlertDialogHeader>
                        <AlertDialogBody>
                            هل أنت متأكد من حذف الطالب <b>{deleteStudentName}</b> من الكورس؟
                            <Text fontSize="sm" color="red.500" mt={2}>لا يمكن التراجع عن هذا الإجراء.</Text>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>إلغاء</Button>
                            <Button colorScheme="red" onClick={handleDeleteStudent} isLoading={actionLoading} ml={3}>حذف</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
};

export default CourseStudentsPage;
