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
  useColorModeValue,
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
import BrandLoadingScreen from "../../components/loading/BrandLoadingScreen";
import dayjs from "dayjs";

const CourseStudentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, isAdmin, isTeacher] = UserType();
  const token = localStorage.getItem("token");

  const [courseData, setCourseData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchStudent, setSearchStudent] = useState("");

  const [blockingLoading, setBlockingLoading] = useState(false);
  const [sortBy, setSortBy] = useState("alphabetical");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStudentsForBlock, setSelectedStudentsForBlock] = useState([]);

  // Dialogs
  const {
    isOpen: isBlockAllOpen,
    onOpen: onBlockAllOpen,
    onClose: onBlockAllClose,
  } = useDisclosure();
  const {
    isOpen: isUnblockAllOpen,
    onOpen: onUnblockAllOpen,
    onClose: onUnblockAllClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
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
        return aName.localeCompare(bName, "ar", {
          sensitivity: "base",
          numeric: true,
        });
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
      const response = await baseUrl.post(
        `/api/courses/${id}/block-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "نجح",
        description:
          response.data.message || `تم حظر ${response.data.blocked_count} طالب`,
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
      const response = await baseUrl.post(
        `/api/courses/${id}/unblock-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "نجح",
        description:
          response.data.message ||
          `تم إلغاء حظر ${response.data.unblocked_count} طالب`,
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
      const response = await baseUrl.post(
        `/api/courses/${id}/block-student`,
        { student_id: studentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const response = await baseUrl.post(
        `/api/courses/${id}/unblock-student`,
        { student_id: studentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const response = await baseUrl.post(
        `/api/courses/${id}/block-students`,
        {
          student_ids: selectedStudentsForBlock,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "نجح",
        description:
          response.data.message || `تم حظر ${response.data.blocked_count} طالب`,
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
      const response = await baseUrl.post(
        `/api/courses/${id}/unblock-students`,
        {
          student_ids: selectedStudentsForBlock,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "نجح",
        description:
          response.data.message ||
          `تم إلغاء حظر ${response.data.unblocked_count} طالب`,
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
        description:
          error.response?.data?.message || "حدث خطأ أثناء حذف الطالب",
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
    return <BrandLoadingScreen />;
  }

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const sectionBg = useColorModeValue("white", "gray.800");
  const sectionBorder = useColorModeValue("gray.200", "gray.700");
  const theadBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Box minH="100vh" bg={bgColor} pb={12} dir="rtl" className="mb-[100px]">
      <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
        {/* Breadcrumb */}
        <Breadcrumb
          spacing="8px"
          separator={<FaChevronRight color={subTextColor} />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              as={RouterLink}
              to="/home"
              color="blue.500"
              _hover={{ color: "blue.600" }}
            >
              <HStack>
                <FaHome />
                <Text>الرئيسية</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              as={RouterLink}
              to={`/CourseDetailsPage/${id}`}
              color="blue.500"
              _hover={{ color: "blue.600" }}
            >
              {courseData?.course?.title || "تفاصيل الكورس"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color={headingColor}>
              الطلاب المشتركون
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* هيدر الصفحة - براند */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap={4}
          mb={8}
          p={6}
          borderRadius="2xl"
          bg={sectionBg}
          borderWidth="1px"
          borderColor={sectionBorder}
          boxShadow="sm"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="1"
            bg="blue.500"
          />
          <HStack spacing={4} flexWrap="wrap">
            <Flex
              w="14"
              h="14"
              borderRadius="xl"
              bg="blue.500"
              color="white"
              align="center"
              justify="center"
              boxShadow="md"
            >
              <Icon as={FaUserGraduate} boxSize={7} />
            </Flex>
            <VStack align="flex-start" spacing={0}>
              <Heading size="lg" color={headingColor} fontWeight="bold">
                قائمة الطلاب
              </Heading>
              <Text fontSize="sm" color={subTextColor}>
                {courseData?.course?.title}
              </Text>
            </VStack>
          </HStack>
          <HStack spacing={3} flexWrap="wrap">
            <Badge
              bg="blue.500"
              color="white"
              fontSize="md"
              px={3}
              py={1.5}
              borderRadius="xl"
            >
              الكل: {enrollments.length}
            </Badge>
            <Badge
              bg="green.500"
              color="white"
              fontSize="md"
              px={3}
              py={1.5}
              borderRadius="xl"
            >
              النشطين:{" "}
              {enrollments.filter((s) => !s.is_blocked_by_teacher).length}
            </Badge>
            <Badge
              bg="red.500"
              color="white"
              fontSize="md"
              px={3}
              py={1.5}
              borderRadius="xl"
            >
              المحظورين:{" "}
              {enrollments.filter((s) => s.is_blocked_by_teacher).length}
            </Badge>
          </HStack>
        </Flex>

        <Box
          bg={cardBg}
          p={6}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={cardBorder}
          boxShadow="md"
        >
          <Box h="1" w="full" bg="blue.500" mb={4} borderRadius="full" />
          {/* Search & Actions */}
          <Flex gap={4} mb={6} flexWrap="wrap">
            <InputGroup maxW={{ base: "full", md: "400px" }}>
              <InputLeftElement>
                <Icon as={FaSearch} color="blue.500" />
              </InputLeftElement>
              <Input
                placeholder="بحث بالاسم، الهاتف، كود التفعيل..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                bg={cardBg}
                borderColor={cardBorder}
                borderRadius="xl"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {searchStudent && (
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<Icon as={FaTimes} />}
                    onClick={() => setSearchStudent("")}
                    aria-label="مسح"
                  />
                </InputRightElement>
              )}
            </InputGroup>

            <Select
              w={{ base: "100%", sm: "200px" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg={cardBg}
              borderColor={cardBorder}
              borderRadius="xl"
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
                  borderRadius="xl"
                >
                  حظر الكل
                </Button>
                <Button
                  leftIcon={<Icon as={FaUnlock} />}
                  bg="green.500"
                  color="white"
                  _hover={{ bg: "green.600" }}
                  size="md"
                  onClick={onUnblockAllOpen}
                  isLoading={blockingLoading}
                  borderRadius="xl"
                >
                  إلغاء حظر الكل
                </Button>
                {selectedStudentsForBlock.length > 0 && (
                  <>
                    <Divider
                      orientation="vertical"
                      h="20px"
                      borderColor={cardBorder}
                    />
                    <Button
                      leftIcon={<Icon as={FaBan} />}
                      bg="red.500"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      size="md"
                      onClick={handleBlockSelectedStudents}
                      isLoading={blockingLoading}
                      borderRadius="xl"
                    >
                      حظر المحددين ({selectedStudentsForBlock.length})
                    </Button>
                    <Button
                      leftIcon={<Icon as={FaUnlock} />}
                      bg="green.500"
                      color="white"
                      _hover={{ bg: "green.600" }}
                      size="md"
                      onClick={handleUnblockSelectedStudents}
                      isLoading={blockingLoading}
                      borderRadius="xl"
                    >
                      إلغاء حظر المحددين
                    </Button>
                    <Button
                      size="md"
                      variant="ghost"
                      onClick={() => setSelectedStudentsForBlock([])}
                      borderRadius="xl"
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
                <Thead bg={theadBg}>
                  <Tr>
                    {(isTeacher || isAdmin) && (
                      <Th w="50px">
                        <Checkbox
                          isChecked={
                            selectedStudentsForBlock.length ===
                              filteredEnrollments.length &&
                            filteredEnrollments.length > 0
                          }
                          isIndeterminate={
                            selectedStudentsForBlock.length > 0 &&
                            selectedStudentsForBlock.length <
                              filteredEnrollments.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentsForBlock(
                                filteredEnrollments.map((s) => s.id)
                              );
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
                    const isSelected = selectedStudentsForBlock.includes(
                      student.id
                    );

                    return (
                      <Tr
                        key={student.id}
                        bg={
                          isBlocked
                            ? "red.50"
                            : isSelected
                            ? "blue.50"
                            : "transparent"
                        }
                        _hover={{
                          bg: isBlocked
                            ? "red.100"
                            : isSelected
                            ? "blue.100"
                            : "gray.50",
                        }}
                        transition="background-color 0.2s"
                      >
                        {(isTeacher || isAdmin) && (
                          <Td>
                            <Checkbox
                              isChecked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentsForBlock([
                                    ...selectedStudentsForBlock,
                                    student.id,
                                  ]);
                                } else {
                                  setSelectedStudentsForBlock(
                                    selectedStudentsForBlock.filter(
                                      (id) => id !== student.id
                                    )
                                  );
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
                              <Text fontWeight="bold" fontSize="md">
                                {student.name}
                              </Text>
                              {isBlocked && (
                                <Badge colorScheme="red" fontSize="xs">
                                  محظور من المعلم
                                </Badge>
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
                              <Icon
                                as={FaEnvelope}
                                color="gray.400"
                                w={3}
                                h={3}
                              />
                              <Text fontSize="sm">{student.email || "-"}</Text>
                            </HStack>
                          </VStack>
                        </Td>

                        {/* بيانات الاشتراك */}
                        <Td>
                          <VStack align="flex-start" spacing={1}>
                            <HStack>
                              <Icon
                                as={FaCalendar}
                                color="gray.400"
                                w={3}
                                h={3}
                              />
                              <Text fontSize="sm">
                                {formatDate(student.enrolled_at)}
                              </Text>
                            </HStack>
                            {student.activation_code && (
                              <HStack>
                                <Icon as={FaKey} color="blue.500" w={3} h={3} />
                                <Badge
                                  bg="blue.50"
                                  _dark={{ bg: "blue.900" }}
                                  color="blue.700"
                                  _dark={{ color: "blue.200" }}
                                  fontSize="xs"
                                  fontFamily="mono"
                                  borderRadius="md"
                                  px={2}
                                >
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
                                student.subscription_status === "active"
                                  ? "green"
                                  : student.subscription_status === "expired"
                                  ? "red"
                                  : student.subscription_status === "suspended"
                                  ? "orange"
                                  : "gray"
                              }
                            >
                              {student.subscription_status === "active"
                                ? "نشط"
                                : student.subscription_status === "expired"
                                ? "منتهي"
                                : student.subscription_status === "suspended"
                                ? "معلق"
                                : "غير معروف"}
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
                          <Badge
                            colorScheme={
                              student.is_content_blocked ? "red" : "green"
                            }
                            fontSize="xs"
                          >
                            {student.is_content_blocked
                              ? "محجوب عنه المحتوى"
                              : "له صلاحية على المحتوى"}
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
                                      onClick={() =>
                                        handleUnblockStudent(student.id)
                                      }
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
                                      onClick={() =>
                                        handleBlockStudent(student.id)
                                      }
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
                                onClick={() =>
                                  handleDeleteStudentConfirm(
                                    student.id,
                                    student.name
                                  )
                                }
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
              <Flex justify="center" mb={4}>
                <Flex
                  w="16"
                  h="16"
                  borderRadius="full"
                  bg="blue.100"
                  _dark={{ bg: "blue.900" }}
                  align="center"
                  justify="center"
                >
                  <Icon as={FaSearch} w={8} h={8} color="blue.500" />
                </Flex>
              </Flex>
              <Text color={subTextColor} fontSize="lg">
                لا توجد نتائج مطابقة
              </Text>
              {searchStudent && (
                <Button
                  mt={4}
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  size="sm"
                  borderRadius="xl"
                  onClick={() => setSearchStudent("")}
                >
                  مسح البحث
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Confirmation Dialogs */}
        <AlertDialog
          isOpen={isBlockAllOpen}
          leastDestructiveRef={cancelRef}
          onClose={onBlockAllClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="2xl">
              <AlertDialogHeader>تأكيد حظر الجميع</AlertDialogHeader>
              <AlertDialogBody>
                هل أنت متأكد من حظر جميع الطلاب في هذا الكورس؟
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onBlockAllClose}
                  borderRadius="xl"
                >
                  إلغاء
                </Button>
                <Button
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={handleBlockAllStudents}
                  ml={3}
                  borderRadius="xl"
                >
                  حظر الكل
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <AlertDialog
          isOpen={isUnblockAllOpen}
          leastDestructiveRef={cancelRef}
          onClose={onUnblockAllClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="2xl">
              <AlertDialogHeader>تأكيد إلغاء حظر الجميع</AlertDialogHeader>
              <AlertDialogBody>
                هل أنت متأكد من إلغاء حظر جميع الطلاب في هذا الكورس؟
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onUnblockAllClose}
                  borderRadius="xl"
                >
                  إلغاء
                </Button>
                <Button
                  bg="green.500"
                  color="white"
                  _hover={{ bg: "green.600" }}
                  onClick={handleUnblockAllStudents}
                  ml={3}
                  borderRadius="xl"
                >
                  إلغاء الحظر
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="2xl">
              <AlertDialogHeader>حذف الطالب</AlertDialogHeader>
              <AlertDialogBody>
                هل أنت متأكد من حذف الطالب <b>{deleteStudentName}</b> من الكورس؟
                <Text fontSize="sm" color="red.500" mt={2}>
                  لا يمكن التراجع عن هذا الإجراء.
                </Text>
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onDeleteClose}
                  borderRadius="xl"
                >
                  إلغاء
                </Button>
                <Button
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={handleDeleteStudent}
                  isLoading={actionLoading}
                  ml={3}
                  borderRadius="xl"
                >
                  حذف
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default CourseStudentsPage;
