import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Spinner,
  useToast,
  Card,
  CardBody,
  Heading,
  Text,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Avatar,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FaUserTie, FaEnvelope, FaLock, FaBook, FaUpload, FaSave } from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    subject: "",
    avatar: null,
    grade_ids: [],
  });

  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const toast = useToast();

  // ألوان الثيم
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // جلب الصفوف الدراسية
  useEffect(() => {
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
    fetchGrades();
  }, [toast]);

  // معالجة تغيير الحقول
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // معالجة اختيار الملف
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.subject) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      
      // إضافة البيانات للنموذج
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("subject", formData.subject);
      
      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }
      
      // إضافة الصفوف الدراسية
      if (formData.grade_ids.length > 0) {
        formDataToSend.append("grade_ids", formData.grade_ids.join(","));
      }

      const response = await baseUrl.post("/api/teacher", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "نجح",
        description: "تم إضافة المدرس بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // إعادة تعيين النموذج
      setFormData({
        name: "",
        email: "",
        password: "",
        description: "",
        subject: "",
        avatar: null,
        grade_ids: [],
      });
      setSelectedFile(null);
      setPreviewUrl("");

    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة المدرس",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={8} maxW="800px" mx="auto">
        {/* العنوان */}
        <Card bg={cardBg} w="full" shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <HStack spacing={4} justify="center">
                <Icon as={FaUserTie} color="blue.500" boxSize={8} />
                <Heading size="lg" color={textColor} textAlign="center">
                  إضافة مدرس جديد
                </Heading>
              </HStack>
              
              <Text color="gray.500" textAlign="center" fontSize="md">
                قم بملء البيانات التالية لإضافة مدرس جديد للمنصة
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* نموذج إضافة المدرس */}
        <Card bg={cardBg} w="full" shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* الصف الأول - الاسم والبريد الإلكتروني */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" color={textColor}>
                      <HStack spacing={2}>
                        <Icon as={FaUserTie} color="blue.500" />
                        <Text>اسم المدرس</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="أدخل اسم المدرس"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" color={textColor}>
                      <HStack spacing={2}>
                        <Icon as={FaEnvelope} color="green.500" />
                        <Text>البريد الإلكتروني</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="أدخل البريد الإلكتروني"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                      borderColor={borderColor}
                      _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px green.500" }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* الصف الثاني - كلمة المرور والمادة */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" color={textColor}>
                      <HStack spacing={2}>
                        <Icon as={FaLock} color="red.500" />
                        <Text>كلمة المرور</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                      borderColor={borderColor}
                      _focus={{ borderColor: "red.500", boxShadow: "0 0 0 1px red.500" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" color={textColor}>
                      <HStack spacing={2}>
                        <Icon as={FaBook} color="purple.500" />
                        <Text>المادة الدراسية</Text>
                      </HStack>
                    </FormLabel>
                    <Select
                      placeholder="اختر المادة الدراسية"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                      borderColor={borderColor}
                      _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
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

                {/* الوصف */}
                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor}>
                    <HStack spacing={2}>
                      <Icon as={FaBook} color="orange.500" />
                      <Text>الوصف</Text>
                    </HStack>
                  </FormLabel>
                  <Textarea
                    placeholder="أدخل وصفاً مختصراً عن المدرس"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    borderColor={borderColor}
                    _focus={{ borderColor: "orange.500", boxShadow: "0 0 0 1px orange.500" }}
                    rows={4}
                  />
                </FormControl>

                {/* الصفوف الدراسية */}
                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor}>
                    <HStack spacing={2}>
                      <Icon as={FaBook} color="teal.500" />
                      <Text>الصفوف الدراسية</Text>
                    </HStack>
                  </FormLabel>
                  <CheckboxGroup
                    value={formData.grade_ids}
                    onChange={(values) => handleInputChange("grade_ids", values)}
                  >
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {grades.map((grade) => (
                        <Checkbox
                          key={grade.id}
                          value={grade.id.toString()}
                          colorScheme="blue"
                          size="lg"
                        >
                          {grade.name}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>

                {/* رفع الصورة */}
                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor}>
                    <HStack spacing={2}>
                      <Icon as={FaUpload} color="pink.500" />
                      <Text>صورة المدرس</Text>
                    </HStack>
                  </FormLabel>
                  
                  <VStack spacing={4} align="stretch">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      size="lg"
                      borderRadius="xl"
                      borderColor={borderColor}
                      _focus={{ borderColor: "pink.500", boxShadow: "0 0 0 1px pink.500" }}
                    />
                    
                    {previewUrl && (
                      <Box textAlign="center">
                        <Avatar
                          src={previewUrl}
                          size="2xl"
                          border="4px solid"
                          borderColor="blue.200"
                          shadow="xl"
                        />
                      </Box>
                    )}
                  </VStack>
                </FormControl>

                {/* زر الإرسال */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  borderRadius="xl"
                  height="60px"
                  fontSize="lg"
                  fontWeight="bold"
                  leftIcon={loading ? <Spinner size="sm" /> : <FaSave />}
                  isLoading={loading}
                  loadingText="جاري الإضافة..."
                  _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                >
                  {loading ? "جاري إضافة المدرس..." : "إضافة المدرس"}
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AddTeacher;
