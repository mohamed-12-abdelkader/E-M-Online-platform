import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Avatar,
  Badge,
  HStack,
  VStack,
  SimpleGrid,
  Spinner,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import {
  FaEdit,
  FaTrash,
  FaUserTie,
  FaBook,
  FaUsers,
  FaGraduationCap,
  FaCalendar,
  FaEnvelope,
  FaPhone,
  FaSave,
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const AdminMange = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [grades, setGrades] = useState([]);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  const cancelRef = React.useRef();
  const toast = useToast();

  // ألوان الثيم
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // جلب المدرسين
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("/api/users/teachers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Teachers data:", response.data.teachers);
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات المدرسين",
        status: "error",
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
      const response = await baseUrl.get("/api/users/grades");
      setGrades(response.data.grades || []);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الصفوف الدراسية",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchGrades();
  }, []);

  // حذف مدرس
  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/users/teachers/${selectedTeacher.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "نجح",
        description: "تم حذف المدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // إزالة المدرس من القائمة
      setTeachers(prev => prev.filter(teacher => teacher.id !== selectedTeacher.id));
      onClose();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف المدرس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // فتح حوار الحذف
  const openDeleteDialog = (teacher) => {
    setSelectedTeacher(teacher);
    onOpen();
  };

  // فتح modal التعديل
  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    // تحويل الصفوف المحددة إلى array من IDs كـ strings
    const selectedGradeIds = teacher.grades && Array.isArray(teacher.grades) 
      ? teacher.grades.map(g => g.id.toString()) 
      : [];
    
    setEditFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      description: teacher.description || "",
      subject: teacher.subject,
      grade_ids: selectedGradeIds,
      avatar: teacher.avatar || "",
      avatarPreview: teacher.avatar ? (teacher.avatar.startsWith('http') ? teacher.avatar : `http://localhost:8000/${teacher.avatar}`) : "",
      facebook_url: teacher.facebook_url || "",
      youtube_url: teacher.youtube_url || "",
      tiktok_url: teacher.tiktok_url || "",
      whatsapp_number: teacher.whatsapp_number || "",
    });
    onEditOpen();
  };

  // معالجة تغيير بيانات التعديل
  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // حفظ التعديلات
  const handleSaveEdit = async () => {
    if (!selectedTeacher) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem("token");

      // التأكد من أن grade_ids هو array وتحويله من strings إلى numbers
      const gradeIds = Array.isArray(editFormData.grade_ids) 
        ? editFormData.grade_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : [];

      let updateData;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (editFormData.avatarFile) {
        // رفع صورة جديدة - FormData
        updateData = new FormData();
        updateData.append("name", editFormData.name);
        updateData.append("email", editFormData.email);
        updateData.append("phone", editFormData.phone || "");
        updateData.append("description", editFormData.description || "");
        updateData.append("subject", editFormData.subject);
        // إرسال grade_ids كـ JSON string في FormData (لأن FormData لا يدعم arrays مباشرة)
        if (gradeIds.length > 0) {
          updateData.append("grade_ids", JSON.stringify(gradeIds));
        }
        updateData.append("facebook_url", editFormData.facebook_url || "");
        updateData.append("youtube_url", editFormData.youtube_url || "");
        updateData.append("tiktok_url", editFormData.tiktok_url || "");
        updateData.append("whatsapp_number", editFormData.whatsapp_number || "");
        updateData.append("avatar", editFormData.avatarFile);
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // بدون صورة جديدة - JSON
        updateData = {
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone || "",
          description: editFormData.description || "",
          subject: editFormData.subject,
          grade_ids: gradeIds, // إرسال كـ array من numbers
          facebook_url: editFormData.facebook_url || "",
          youtube_url: editFormData.youtube_url || "",
          tiktok_url: editFormData.tiktok_url || "",
          whatsapp_number: editFormData.whatsapp_number || "",
        };
        headers["Content-Type"] = "application/json";
      }

      await baseUrl.put(`/api/users/teachers/${selectedTeacher.id}`, updateData, {
        headers,
      });

      toast({
        title: "نجح",
        description: "تم تحديث بيانات المدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // تحديث البيانات في القائمة
      const updatedGradeIds = Array.isArray(editFormData.grade_ids) 
        ? editFormData.grade_ids 
        : [];
      const updatedGrades = updatedGradeIds
        .map((id) => grades.find((g) => g.id.toString() === id))
        .filter(Boolean);

      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === selectedTeacher.id
            ? {
                ...teacher,
                name: editFormData.name,
                email: editFormData.email,
                phone: editFormData.phone,
                description: editFormData.description,
                subject: editFormData.subject,
                avatar: editFormData.avatarPreview
                  ? editFormData.avatarPreview
                  : teacher.avatar,
                facebook_url: editFormData.facebook_url,
                youtube_url: editFormData.youtube_url,
                tiktok_url: editFormData.tiktok_url,
                whatsapp_number: editFormData.whatsapp_number,
                grades: updatedGrades,
              }
            : teacher
        )
      );

      onEditClose();
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث بيانات المدرس",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // تحميل البطاقات
  const TeacherCardSkeleton = () => (
    <Card bg={cardBg} shadow="md" borderRadius="xl">
      <CardBody p={6}>
        <Skeleton height="120px" mb={4} />
        <SkeletonText mt="4" noOfLines={4} spacing="4" />
      </CardBody>
    </Card>
  );
 
  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={8} align="stretch">
        {/* العنوان */}
        <Box textAlign="center">
          <Heading size="lg" color={textColor} mb={2}>
            <HStack justify="center" spacing={3}>
              <FaUserTie color="#3182CE" />
              <Text>إدارة المدرسين</Text>
            </HStack>
          </Heading>
          <Text color="gray.500" fontSize="lg">
            عرض وإدارة جميع المدرسين في المنصة
          </Text>
        </Box>

        {/* إحصائيات سريعة */}
        {!loading && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">إجمالي المدرسين</StatLabel>
                  <StatNumber color="blue.500" fontSize="3xl">
                    {teachers.length}
                  </StatNumber>
                  <StatHelpText>مدرس نشط</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">إجمالي الكورسات</StatLabel>
                  <StatNumber color="green.500" fontSize="3xl">
                    {teachers.reduce((sum, teacher) => sum + teacher.courses_count, 0)}
                  </StatNumber>
                  <StatHelpText>كورس متاح</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">إجمالي الطلاب</StatLabel>
                  <StatNumber color="purple.500" fontSize="3xl">
                    {teachers.reduce((sum, teacher) => sum + teacher.students_count, 0)}
                  </StatNumber>
                  <StatHelpText>طالب مسجل</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* قائمة المدرسين */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, index) => (
              <TeacherCardSkeleton key={index} />
            ))}
          </SimpleGrid>
        ) : teachers.length === 0 ? (
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody textAlign="center" py={12}>
              <FaUserTie size={64} color="#CBD5E0" />
              <Text fontSize="lg" color="gray.500" mt={4}>
                لا يوجد مدرسين حالياً
              </Text>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {teachers.map((teacher) => (
              <Card
                key={teacher.id}
                bg={cardBg}
                shadow="md"
                borderRadius="xl"
                _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                transition="all 0.3s"
              >
                <CardBody p={6}>
                  {/* صورة المدرس */}
                  <Box textAlign="center" mb={4}>
                    <Avatar
                      size="2xl"
                      src={teacher.avatar ? 
                        (teacher.avatar.startsWith('http') ? 
                          teacher.avatar : 
                          teacher.avatar.startsWith('/') ? 
                            `http://localhost:8000${teacher.avatar}` : 
                            `http://localhost:8000/${teacher.avatar}`
                        ) : undefined
                      }
                      name={teacher.name}
                      bg="blue.500"
                      border="4px solid"
                      borderColor="blue.200"
                      shadow="xl"
                      mb={3}
                      onError={(e) => {
                        console.log("Avatar error for teacher:", teacher.name, "avatar:", teacher.avatar);
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>

                  {/* معلومات المدرس */}
                  <VStack align="stretch" spacing={3}>
                    <Box textAlign="center">
                      <Heading size="md" color={textColor} mb={1}>
                        {teacher.name}
                      </Heading>
                      <Badge colorScheme="blue" variant="subtle" fontSize="sm">
                        {teacher.subject}
                      </Badge>
                    </Box>

                    <Divider />

                    {/* معلومات الاتصال */}
                    <VStack align="stretch" spacing={2}>
                      <HStack spacing={2}>
                        <FaEnvelope color="#3182CE" size={14} />
                        <Text fontSize="sm" color="gray.600">
                          {teacher.email}
                        </Text>
                      </HStack>
                      {teacher.phone && (
                        <HStack spacing={2}>
                          <FaPhone color="#38A169" size={14} />
                          <Text fontSize="sm" color="gray.600">
                            {teacher.phone}
                          </Text>
                        </HStack>
                      )}
                      {teacher.whatsapp_number && (
                        <HStack spacing={2}>
                          <FaPhone color="#25D366" size={14} />
                          <Text fontSize="sm" color="gray.600">
                            واتساب: {teacher.whatsapp_number}
                          </Text>
                        </HStack>
                      )}
                    </VStack>

                    {/* الروابط الاجتماعية */}
                    {(teacher.facebook_url || teacher.youtube_url || teacher.tiktok_url) && (
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" color="gray.500" fontWeight="bold">
                          الروابط الاجتماعية:
                        </Text>
                        <HStack spacing={3} justify="center" flexWrap="wrap">
                          {teacher.facebook_url && (
                            <Tooltip label="فيسبوك" hasArrow>
                              <IconButton
                                as="a"
                                href={teacher.facebook_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<Text fontSize="xs">📘</Text>}
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                aria-label="فيسبوك"
                              />
                            </Tooltip>
                          )}
                          {teacher.youtube_url && (
                            <Tooltip label="يوتيوب" hasArrow>
                              <IconButton
                                as="a"
                                href={teacher.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<Text fontSize="xs">📺</Text>}
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                aria-label="يوتيوب"
                              />
                            </Tooltip>
                          )}
                          {teacher.tiktok_url && (
                            <Tooltip label="تيك توك" hasArrow>
                              <IconButton
                                as="a"
                                href={teacher.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<Text fontSize="xs">🎵</Text>}
                                size="xs"
                                colorScheme="purple"
                                variant="outline"
                                aria-label="تيك توك"
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </VStack>
                    )}

                    {/* الوصف */}
                    {teacher.description && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {teacher.description}
                      </Text>
                    )}

                    <Divider />

                    {/* الإحصائيات */}
                    <SimpleGrid columns={2} spacing={4}>
                      <VStack spacing={1}>
                        <HStack spacing={1}>
                          <FaBook color="#38A169" size={12} />
                          <Text fontSize="xs" color="gray.500">
                            الكورسات
                          </Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold" color="green.500">
                          {teacher.courses_count}
                        </Text>
                      </VStack>

                      <VStack spacing={1}>
                        <HStack spacing={1}>
                          <FaUsers color="#805AD5" size={12} />
                          <Text fontSize="xs" color="gray.500">
                            الطلاب
                          </Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold" color="purple.500">
                          {teacher.students_count}
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {/* تاريخ الإنشاء */}
                    <HStack spacing={2} pt={2} justify="center">
                      <FaCalendar color="#E53E3E" size={12} />
                      <Text fontSize="xs" color="gray.500">
                        انضم في {formatDate(teacher.created_at)}
                      </Text>
                    </HStack>

                    {/* أزرار الإجراءات */}
                    <HStack spacing={2} justify="center" pt={2}>
                      <Tooltip label="تعديل المدرس" hasArrow>
                        <IconButton
                          icon={<FaEdit />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          aria-label="تعديل"
                          onClick={() => openEditModal(teacher)}
                        />
                      </Tooltip>
                      <Tooltip label="حذف المدرس" hasArrow>
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          aria-label="حذف"
                          onClick={() => openDeleteDialog(teacher)}
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* حوار تأكيد الحذف */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف المدرس
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف المدرس{" "}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedTeacher?.name}
              </Text>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteTeacher}
                ml={3}
                isLoading={deleteLoading}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal التعديل */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <FaEdit color="#3182CE" />
              <Text>تعديل بيانات المدرس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/* حقل صورة المدرس */}
              <FormControl>
                <FormLabel fontWeight="bold">صورة المدرس</FormLabel>
                <VStack spacing={2} align="start">
                  {editFormData.avatarPreview || editFormData.avatar ? (
                    <Box position="relative">
                      <Avatar
                        size="xl"
                        src={
                          editFormData.avatarPreview
                            ? editFormData.avatarPreview
                            : editFormData.avatar?.startsWith("http")
                              ? editFormData.avatar
                              : editFormData.avatar
                              ? `http://localhost:8000/${editFormData.avatar.replace(/^\/+/, "")}`
                              : undefined
                        }
                        name={editFormData.name}
                        mb={2}
                      />
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() =>
                          setEditFormData((prev) => ({
                            ...prev,
                            avatar: "",
                            avatarPreview: "",
                            avatarFile: null,
                          }))
                        }
                        mt={1}
                      >
                        حذف الصورة
                      </Button>
                    </Box>
                  ) : null}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditFormData((prev) => ({
                            ...prev,
                            avatar: "",
                            avatarPreview: reader.result,
                            avatarFile: file,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    size="sm"
                    p={1}
                  />
                  <Text fontSize="xs" color="gray.500">
                    يمكنك رفع صورة جديدة (PNG, JPG, JPEG)
                  </Text>
                </VStack>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">اسم المدرس</FormLabel>
                  <Input
                    value={editFormData.name || ""}
                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                    placeholder="أدخل اسم المدرس"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">البريد الإلكتروني</FormLabel>
                  <Input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => handleEditInputChange("email", e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontWeight="bold">رقم الهاتف</FormLabel>
                  <Input
                    value={editFormData.phone || ""}
                    onChange={(e) => handleEditInputChange("phone", e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">المادة الدراسية</FormLabel>
                  <Select
                    value={editFormData.subject || ""}
                    onChange={(e) => handleEditInputChange("subject", e.target.value)}
                    placeholder="اختر المادة الدراسية"
                  >
                    <option value="رياضيات">رياضيات</option>
                    <option value="فيزياء">فيزياء</option>
                    <option value="كيمياء">كيمياء</option>
                    <option value="أحياء">أحياء</option>
                    <option value="تاريخ">تاريخ</option>
                    <option value="جغرافيا">جغرافيا</option>
                    <option value="لغة عربية">لغة عربية</option>
                    <option value="لغة إنجليزية">لغة إنجليزية</option>
                    <option value="فلسفة">فلسفة</option>
                    <option value="اقتصاد">اقتصاد</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="bold">الوصف</FormLabel>
                <Textarea
                  value={editFormData.description || ""}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  placeholder="أدخل وصفاً مختصراً عن المدرس"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">الصفوف الدراسية</FormLabel>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  اختر الصفوف الدراسية التي يدرسها المدرس
                </Text>
                <CheckboxGroup
                  value={Array.isArray(editFormData.grade_ids) ? editFormData.grade_ids : []}
                  onChange={(values) => handleEditInputChange("grade_ids", values)}
                >
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    {grades.length > 0 ? (
                      grades.map((grade) => (
                        <Checkbox
                          key={grade.id}
                          value={grade.id.toString()}
                          colorScheme="blue"
                        >
                          {grade.name}
                        </Checkbox>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        جاري تحميل الصفوف...
                      </Text>
                    )}
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>

              {/* الروابط الاجتماعية */}
              <Box w="full">
                <Heading size="md" color={textColor} mb={4}>
                  الروابط الاجتماعية
                </Heading>
                <VStack spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontWeight="bold">رابط الفيسبوك</FormLabel>
                      <Input
                        value={editFormData.facebook_url || ""}
                        onChange={(e) => handleEditInputChange("facebook_url", e.target.value)}
                        placeholder="https://facebook.com/teacher"
                        type="url"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="bold">رابط اليوتيوب</FormLabel>
                      <Input
                        value={editFormData.youtube_url || ""}
                        onChange={(e) => handleEditInputChange("youtube_url", e.target.value)}
                        placeholder="https://youtube.com/teacher"
                        type="url"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontWeight="bold">رابط التيك توك</FormLabel>
                      <Input
                        value={editFormData.tiktok_url || ""}
                        onChange={(e) => handleEditInputChange("tiktok_url", e.target.value)}
                        placeholder="https://tiktok.com/@teacher"
                        type="url"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="bold">رقم الواتساب</FormLabel>
                      <Input
                        value={editFormData.whatsapp_number || ""}
                        onChange={(e) => handleEditInputChange("whatsapp_number", e.target.value)}
                        placeholder="01234567890"
                        type="tel"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              إلغاء
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FaSave />}
              onClick={handleSaveEdit}
              isLoading={editLoading}
              loadingText="جاري الحفظ..."
            >
              حفظ التغييرات
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminMange;
