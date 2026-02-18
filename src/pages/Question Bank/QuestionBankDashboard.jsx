import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
  Container,
  Image,
  IconButton,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Flex,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon
} from "@chakra-ui/react";
import {
  FaUpload,
  FaTimes,
  FaPlus,
  FaSearch,
  FaBook,
  FaGraduationCap,
  FaEye,
  FaEdit,
  FaTrash,
  FaDollarSign
} from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const QuestionBankDashboard = () => {
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grade_id: "",
    is_active: true,
    price: 0
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Data states
  const [grades, setGrades] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);

  // Loading states
  const [gradesLoading, setGradesLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Error states
  const [gradesError, setGradesError] = useState(null);
  const [banksError, setBanksError] = useState(null);

  // Filter state
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();

  // Edit and delete states
  const [editingBank, setEditingBank] = useState(null);
  const [deletingBank, setDeletingBank] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  // Fetch grades from API
  const fetchGrades = async () => {
    try {
      setGradesLoading(true);
      setGradesError(null);

      const response = await baseUrl.get("/api/users/grades");
      setGrades(response.data.grades);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب الصفوف";
      setGradesError(errorMsg);
      console.error("Error fetching grades:", err);
    } finally {
      setGradesLoading(false);
    }
  };

  // Fetch question banks from API
  const fetchQuestionBanks = async () => {
    try {
      setBanksLoading(true);
      setBanksError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await baseUrl.get("/api/question-banks", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const banks = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data?.question_banks || [];
      setQuestionBanks(banks);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب بنوك الأسئلة";
      setBanksError(errorMsg);
      console.error("Error fetching question banks:", err);
    } finally {
      setBanksLoading(false);
    }
  };

  // Create question bank
  const createQuestionBank = async (formData) => {
    try {
      setSubmitLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const response = await baseUrl.post("api/question-banks", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast({
        title: "نجح",
        description: "تم إنشاء بنك الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating question bank:", error);

      const errorMessage = error.response?.data?.message || "حدث خطأ في إنشاء بنك الأسئلة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter question banks
  useEffect(() => {
    if (!Array.isArray(questionBanks)) {
      setFilteredBanks([]);
      return;
    }

    let filtered = questionBanks;

    if (selectedGradeFilter) {
      filtered = filtered.filter(bank => bank.grade_id == selectedGradeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bank.description && bank.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredBanks(filtered);
  }, [questionBanks, selectedGradeFilter, searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchGrades();
    fetchQuestionBanks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم بنك الأسئلة والصف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("description", formData.description);
    submitFormData.append("grade_id", formData.grade_id);
    submitFormData.append("is_active", formData.is_active);
    submitFormData.append("price", formData.price ?? 0);

    if (selectedImage) {
      submitFormData.append("image", selectedImage);
    }

    const result = await createQuestionBank(submitFormData);

    if (result.success) {
      setFormData({
        name: "",
        description: "",
        grade_id: "",
        is_active: true,
        price: 0
      });
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
      fetchQuestionBanks();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      grade_id: "",
      is_active: true,
      price: 0
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle edit button click
  const handleEditClick = (bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      description: bank.description || "",
      grade_id: bank.grade_id,
      is_active: bank.is_active,
      price: bank.price ?? 0
    });
    setImagePreview(bank.image_url);
    onEditOpen();
  };

  // Handle delete button click
  const handleDeleteClick = (bank) => {
    setDeletingBank(bank);
    onDeleteOpen();
  };

  // Update question bank
  const updateQuestionBank = async (formData) => {
    try {
      setEditLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const response = await baseUrl.put(`api/question-banks/${editingBank.id}`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast({
        title: "نجح",
        description: "تم تحديث بنك الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating question bank:", error);

      const errorMessage = error.response?.data?.message || "حدث خطأ في تحديث بنك الأسئلة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setEditLoading(false);
    }
  };

  // Delete question bank
  const deleteQuestionBank = async () => {
    try {
      setDeleteLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return { success: false };
      }

      const response = await baseUrl.delete(`api/question-banks/${deletingBank.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      toast({
        title: "نجح",
        description: "تم حذف بنك الأسئلة بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting question bank:", error);

      const errorMessage = error.response?.data?.message || "حدث خطأ في حذف بنك الأسئلة";
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب ملء اسم بنك الأسئلة والصف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("description", formData.description);
    submitFormData.append("grade_id", formData.grade_id);
    submitFormData.append("is_active", formData.is_active);
    submitFormData.append("price", formData.price ?? 0);

    if (selectedImage) {
      submitFormData.append("image", selectedImage);
    }

    const result = await updateQuestionBank(submitFormData);

    if (result.success) {
      onEditClose();
      fetchQuestionBanks();
      resetForm();
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    const result = await deleteQuestionBank();

    if (result.success) {
      onDeleteClose();
      fetchQuestionBanks();
      setDeletingBank(null);
    }
  };

  if (gradesError || banksError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
          <Text color="red.600">
            {gradesError && `خطأ في تحميل الصفوف: ${gradesError}`}
            {banksError && `خطأ في تحميل بنوك الأسئلة: ${banksError}`}
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box
        bgGradient="linear(to-r, blue.500, orange.500)"
        py={12}
        mb={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={4}>
            <Icon as={FaBook} boxSize={16} color="white" />
            <Heading color="white" size="2xl" textAlign="center">
              بنوك الأسئلة
            </Heading>
            <Text color="whiteAlpha.900" fontSize="lg" textAlign="center">
              إدارة وإنشاء بنوك الأسئلة للمراحل الدراسية المختلفة
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" pb={12}>
        <VStack spacing={6} align="stretch">
          {/* Controls */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              align="center"
            >
              <Button
                leftIcon={<FaPlus />}
                bg="blue.500"
                color="white"
                size="lg"
                onClick={onOpen}
                _hover={{ bg: "blue.600" }}
              >
                إنشاء بنك أسئلة جديد
              </Button>

              <Spacer />

              <HStack spacing={4} w={{ base: "full", md: "auto" }}>
                <Select
                  placeholder="فلترة حسب الصف"
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  w={{ base: "full", md: "200px" }}
                  bg="white"
                  borderColor="gray.300"
                >
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>

                <InputGroup w={{ base: "full", md: "300px" }}>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="البحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                  />
                </InputGroup>
              </HStack>
            </Flex>
          </Box>

          {/* Question Banks Grid */}
          {banksLoading ? (
            <Box textAlign="center" py={20} bg="white" borderRadius="xl" shadow="sm">
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="gray.600" mt={4}>
                جاري تحميل بنوك الأسئلة...
              </Text>
            </Box>
          ) : !Array.isArray(filteredBanks) || filteredBanks.length === 0 ? (
            <Box textAlign="center" py={20} bg="white" borderRadius="xl" shadow="sm">
              <Icon as={FaBook} boxSize={20} color="gray.300" mb={4} />
              <Heading size="lg" color="gray.600" mb={2}>
                {questionBanks.length === 0
                  ? "لا توجد بنوك أسئلة بعد"
                  : "لا توجد نتائج للبحث"}
              </Heading>
              <Text color="gray.500" mb={6}>
                {questionBanks.length === 0
                  ? "ابدأ بإنشاء أول بنك أسئلة"
                  : "جرب البحث بكلمات مختلفة"}
              </Text>
              {questionBanks.length === 0 && (
                <Button
                  bg="orange.500"
                  color="white"
                  size="lg"
                  onClick={onOpen}
                  leftIcon={<FaPlus />}
                  _hover={{ bg: "orange.600" }}
                >
                  إنشاء أول بنك أسئلة
                </Button>
              )}
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredBanks.map((bank) => (
                <Card
                  key={bank.id}
                  bg="white"
                  borderRadius="xl"
                  overflow="hidden"
                  shadow="sm"
                  transition="all 0.3s"
                  _hover={{
                    shadow: "md",
                    transform: "translateY(-4px)"
                  }}
                >
                  <Link
                    to={`/question-bank/${bank.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <CardHeader>
                      {/* Image */}
                      {bank.image_url && (
                        <Image
                          src={bank.image_url}
                          alt={bank.name}
                          h="180px"
                          w="full"
                          objectFit="cover"
                          mb={4}
                          borderRadius="lg"
                        />
                      )}

                      {/* Title */}
                      <Flex align="start" gap={3} mb={3}>
                        <Box
                          w="50px"
                          h="50px"
                          bg="blue.500"
                          borderRadius="lg"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <Icon as={FaBook} color="white" boxSize={6} />
                        </Box>

                        <Box flex={1}>
                          <Heading size="md" color="gray.800" mb={2} noOfLines={2}>
                            {bank.name}
                          </Heading>
                          <Badge
                            colorScheme={bank.is_active ? "green" : "gray"}
                            fontSize="xs"
                          >
                            {bank.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </Box>
                      </Flex>
                    </CardHeader>

                    <CardBody pt={0}>
                      {/* Description */}
                      {bank.description && (
                        <Text color="gray.600" mb={4} noOfLines={2} fontSize="sm">
                          {bank.description}
                        </Text>
                      )}

                      {/* Grade */}
                      <HStack p={3} bg="gray.50" borderRadius="lg" mb={3}>
                        <Icon as={FaGraduationCap} color="orange.500" boxSize={5} />
                        <Text fontSize="sm" color="gray.700" fontWeight="medium">
                          {bank.grade_name || "غير محدد"}
                        </Text>
                      </HStack>

                      {/* Price */}
                      {bank.price > 0 && (
                        <HStack p={3} bg="blue.50" borderRadius="lg">
                          <Icon as={FaDollarSign} color="blue.500" boxSize={5} />
                          <Text fontSize="md" color="blue.600" fontWeight="bold">
                            {bank.price} جنيه
                          </Text>
                        </HStack>
                      )}
                    </CardBody>
                  </Link>

                  {/* Actions */}
                  <Box p={4} pt={0} borderTop="1px" borderColor="gray.100">
                    <HStack spacing={2}>
                      <Link to={`/question-bank/${bank.id}`} style={{ flex: 1 }}>
                        <Button
                          size="sm"
                          leftIcon={<FaEye />}
                          colorScheme="blue"
                          w="full"
                        >
                          عرض
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        leftIcon={<FaEdit />}
                        colorScheme="orange"
                        onClick={() => handleEditClick(bank)}
                      >
                        تعديل
                      </Button>
                      <IconButton
                        size="sm"
                        icon={<FaTrash />}
                        colorScheme="red"
                        onClick={() => handleDeleteClick(bank)}
                        aria-label="حذف"
                      />
                    </HStack>
                  </Box>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="blue.500" color="white">
            <HStack>
              <Icon as={FaPlus} />
              <Text>إنشاء بنك أسئلة جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>اسم بنك الأسئلة</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم بنك الأسئلة"
                />
              </FormControl>

              <FormControl>
                <FormLabel>الوصف</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="أدخل وصف بنك الأسئلة"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>الصف الدراسي</FormLabel>
                <Select
                  name="grade_id"
                  value={formData.grade_id}
                  onChange={handleInputChange}
                  placeholder="اختر الصف الدراسي"
                >
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>السعر</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaDollarSign} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    name="price"
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                  <InputRightElement pr={3}>
                    <Text fontSize="sm" color="gray.500">
                      جنيه
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>حالة النشاط</FormLabel>
                <Select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleInputChange}
                >
                  <option value={true}>نشط</option>
                  <option value={false}>غير نشط</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>صورة بنك الأسئلة</FormLabel>
                {!imagePreview ? (
                  <Button
                    as="label"
                    htmlFor="image-upload"
                    leftIcon={<FaUpload />}
                    variant="outline"
                    w="full"
                    cursor="pointer"
                  >
                    اختر صورة
                  </Button>
                ) : (
                  <Box position="relative">
                    <Image
                      src={imagePreview}
                      alt="معاينة"
                      maxH="200px"
                      w="full"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <IconButton
                      icon={<FaTimes />}
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="red"
                      size="sm"
                      onClick={removeImage}
                      aria-label="إزالة الصورة"
                    />
                  </Box>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  display="none"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button
                bg="blue.500"
                color="white"
                onClick={handleSubmit}
                isLoading={submitLoading}
                leftIcon={<FaPlus />}
                _hover={{ bg: "blue.600" }}
              >
                إنشاء
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="orange.500" color="white">
            <HStack>
              <Icon as={FaEdit} />
              <Text>تعديل بنك الأسئلة</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>اسم بنك الأسئلة</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>الوصف</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>الصف الدراسي</FormLabel>
                <Select
                  name="grade_id"
                  value={formData.grade_id}
                  onChange={handleInputChange}
                >
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>السعر</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaDollarSign} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    name="price"
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                  <InputRightElement pr={3}>
                    <Text fontSize="sm" color="gray.500">
                      جنيه
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>حالة النشاط</FormLabel>
                <Select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleInputChange}
                >
                  <option value={true}>نشط</option>
                  <option value={false}>غير نشط</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>صورة بنك الأسئلة</FormLabel>
                {!imagePreview ? (
                  <Button
                    as="label"
                    htmlFor="edit-image-upload"
                    leftIcon={<FaUpload />}
                    variant="outline"
                    w="full"
                    cursor="pointer"
                  >
                    اختر صورة
                  </Button>
                ) : (
                  <Box position="relative">
                    <Image
                      src={imagePreview}
                      alt="معاينة"
                      maxH="200px"
                      w="full"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <IconButton
                      icon={<FaTimes />}
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="red"
                      size="sm"
                      onClick={removeImage}
                      aria-label="إزالة الصورة"
                    />
                  </Box>
                )}
                <Input
                  id="edit-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  display="none"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onEditClose}>
                إلغاء
              </Button>
              <Button
                bg="orange.500"
                color="white"
                onClick={handleEditSubmit}
                isLoading={editLoading}
                leftIcon={<FaEdit />}
                _hover={{ bg: "orange.600" }}
              >
                تحديث
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد الحذف</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} textAlign="center">
              <Icon as={FaTrash} boxSize={16} color="red.500" />
              <Text fontSize="lg" fontWeight="bold">
                هل أنت متأكد من حذف بنك الأسئلة؟
              </Text>
              <Text color="gray.600">"{deletingBank?.name}"</Text>
              <Text color="red.500" fontSize="sm">
                هذا الإجراء لا يمكن التراجع عنه
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onDeleteClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                isLoading={deleteLoading}
                leftIcon={<FaTrash />}
              >
                حذف
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionBankDashboard;