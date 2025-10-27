import {
  Select,
  Input,
  Button,
  Spinner,
  RadioGroup,
  Stack,
  Radio,
  Box,
  Flex,
  FormControl,
  FormLabel,
  useToast,
  Text,
  VStack,
  HStack,
  Divider,
  Progress,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiUser, FiPhone, FiLock, FiBookOpen, FiCheck, FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import baseUrl from "../../api/baseUrl";

const SignUp = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);
  const [isUniversityStudent, setIsUniversityStudent] = useState("no");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState([]); // الصفوف من API
  const [selectedCategory, setSelectedCategory] = useState(""); // الفئة الدراسية

  // Steps configuration
  const steps = [
    {
      title: "المعلومات الشخصية",
      icon: FiUser,
      description: "أدخل اسمك الكامل"
    },
    {
      title: "معلومات الاتصال",
      icon: FiPhone,
      description: "أدخل أرقام الهواتف"
    },
    {
      title: "كلمة المرور",
      icon: FiLock,
      description: "أنشئ كلمة مرور قوية"
    },
    {
      title: "الفئة الدراسية",
      icon: FiBookOpen,
      description: "اختر فئتك الدراسية"
    },
    {
      title: "الصف الدراسي",
      icon: FiBookOpen,
      description: "اختر صفك الدراسي"
    }
  ];

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await baseUrl.get("/api/users/grades");
        setGrades(res.data.grades || []);
      } catch (err) {
        setGrades([]);
      }
    };
    fetchGrades();
  }, []);

  // تصفية الصفوف حسب الفئة المختارة
  const getFilteredGradesByCategory = (category) => {
    switch (category) {
      case "ابتدائي":
        return [
          { id: 19, name: "الصف الأول الابتدائي" },
          { id: 20, name: "الصف الثاني الابتدائي" },
          { id: 21, name: "الصف الثالث الابتدائي" },
          { id: 11, name: "الصف الرابع الابتدائي" },
          { id: 12, name: "الصف الخامس الابتدائي" },
          { id: 15, name: "الصف السادس الابتدائي" }
        ];
      case "إعدادي":
        return [
          { id: 1, name: "الصف الأول الإعدادي" },
          { id: 2, name: "الصف الثاني الإعدادي" },
          { id: 3, name: "الصف الثالث الإعدادي" }
        ];
      case "ثانوي":
        return [
          { id: 4, name: "الصف الأول الثانوي" },
          { id: 5, name: "الصف الثاني الثانوي" },
          { id: 6, name: "الصف الثالث الثانوي" }
        ];
      case "جامعة":
        return [
          { id: 7, name: "الفرقة الأولى" },
          { id: 8, name: "الفرقة الثانية" },
          { id: 9, name: "الفرقة الثالثة" },
          { id: 10, name: "الفرقة الرابعة" }
        ];
      default:
        return [];
    }
  };

  // تصفية الصفوف حسب هل هو جامعي أم لا - تم إزالتها لأننا نستخدم الفئات الجديدة
  // let filteredGrades = grades;
  // if (grades.length > 0) {
  //   if (isUniversityStudent === "yes") {
  //     filteredGrades = grades.slice(-4); // آخر 4 صفوف فقط
  //   } else {
  //     filteredGrades = grades.slice(0, grades.length - 4); // الكل ما عدا آخر 4
  //   }
  // }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return name.trim().length > 0;
      case 1:
        // Allow any phone number format for navigation, validation will be done on final submit
        return phone.trim().length > 0 && parentPhone.trim().length > 0;
      case 2:
        return password.length >= 6 && password === passwordConfirm;
      case 3:
        return selectedCategory !== "";
      case 4:
        return gradeId !== "";
      default:
        return false;
    }
  };

  const handleLSignUp = async () => {
    // Final validation
    if (!name || !phone || !parentPhone || !password || !passwordConfirm || !gradeId || !selectedCategory) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
  
    if (password !== passwordConfirm) {
      toast.error("كلمتا السر غير متطابقتين");
      return;
    }
  
    // Basic phone number validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanParentPhone = parentPhone.replace(/[^0-9]/g, '');
    
    if (cleanPhone.length < 8) {
      toast.error("رقم هاتفك قصير جداً، يرجى إدخال رقم صحيح");
      return;
    }
  
    if (cleanParentPhone.length < 8) {
      toast.error("رقم هاتف الوالد قصير جداً، يرجى إدخال رقم صحيح");
      return;
    }
  
    if (cleanPhone === cleanParentPhone) {
      toast.error("رقم هاتفك ورقم هاتف الوالد يجب أن يكونا مختلفين");
      return;
    }
  
    // إرسال الأرقام كما أدخلها المستخدم دون إضافة +20
    setLoading(true);
    try {
      const res = await baseUrl.post("/api/users/register", {
        phone: cleanPhone, // إرسال الرقم كما هو
        password,
        name,
        parent_phone: cleanParentPhone, // إرسال الرقم كما هو
        grade_id: parseInt(gradeId),
        category: selectedCategory, // إضافة الفئة الدراسية
      });
  
      const { token, user } = res.data;
  
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
  
      toast.success("تم إنشاء الحساب بنجاح!");
      window.location = "/";
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message === "Phone number already registered") {
        onOpen(); // فتح المودال
      } else {
        toast.error(err.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
  return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={6}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <FiUser className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">أدخل اسمك الكامل</h2>
              <p className="text-gray-600">سنحتاج إلى معرفة اسمك للبدء</p>
      </Box>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
              الاسم بالكامل
            </FormLabel>
            <Input
                placeholder="مثال: أحمد محمد علي"
              size="lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
                className="text-gray-800 transition-all duration-300"
              focusBorderColor="blue.500"
              _placeholder={{ color: "gray.400" }}
                borderColor="gray.200"
                borderRadius="xl"
                px={6}
                py={4}
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "blue.500", 
                  boxShadow: "0 0 0 1px #3B82F6",
                  transform: "translateY(-1px)"
                }}
            />
          </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={6}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-4">
                <FiPhone className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">معلومات الاتصال</h2>
              <p className="text-gray-600">أدخل رقم هاتفك ورقم هاتف ولي الأمر</p>
            </Box>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
              رقم الهاتف
            </FormLabel>
            <Input
              type="tel"
                placeholder="01227145090"
              size="lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
                className="text-gray-800 transition-all duration-300"
              focusBorderColor="blue.500"
              _placeholder={{ color: "gray.400" }}
                borderColor="gray.200"
                borderRadius="xl"
                px={6}
                py={4}
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "blue.500", 
                  boxShadow: "0 0 0 1px #3B82F6",
                  transform: "translateY(-1px)"
                }}
            />
          </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
                رقم هاتف الوالد
              </FormLabel>
              <Input
                type="tel"
                placeholder="01227145091"
                size="lg"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="text-gray-800 transition-all duration-300"
                focusBorderColor="blue.500"
                _placeholder={{ color: "gray.400" }}
                borderColor="gray.200"
                borderRadius="xl"
                px={6}
                py={4}
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "blue.500", 
                  boxShadow: "0 0 0 1px #3B82F6",
                  transform: "translateY(-1px)"
                }}
              />
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={6}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
                <FiLock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">كلمة المرور</h2>
              <p className="text-gray-600">أنشئ كلمة مرور قوية لحماية حسابك</p>
            </Box>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
                كلمة المرور
            </FormLabel>
            <Input
              type="password"
                placeholder="أدخل كلمة مرور قوية"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                className="text-gray-800 transition-all duration-300"
              focusBorderColor="blue.500"
              _placeholder={{ color: "gray.400" }}
                borderColor="gray.200"
                borderRadius="xl"
                px={6}
                py={4}
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "blue.500", 
                  boxShadow: "0 0 0 1px #3B82F6",
                  transform: "translateY(-1px)"
                }}
              />
              {password.length > 0 && (
                <Text fontSize="sm" color={password.length >= 6 ? "green.500" : "red.500"} mt={2}>
                  {password.length >= 6 ? "✓ كلمة المرور قوية" : "كلمة المرور يجب أن تكون 6 أحرف على الأقل"}
                </Text>
              )}
          </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
                تأكيد كلمة المرور
            </FormLabel>
            <Input
              type="password"
                placeholder="أعد إدخال كلمة المرور"
              size="lg"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
                className="text-gray-800 transition-all duration-300"
              focusBorderColor="blue.500"
              _placeholder={{ color: "gray.400" }}
                borderColor="gray.200"
                borderRadius="xl"
                px={6}
                py={4}
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "blue.500", 
                  boxShadow: "0 0 0 1px #3B82F6",
                  transform: "translateY(-1px)"
                }}
              />
              {passwordConfirm.length > 0 && (
                <Text fontSize="sm" color={password === passwordConfirm ? "green.500" : "red.500"} mt={2}>
                  {password === passwordConfirm ? "✓ كلمات المرور متطابقة" : "كلمات المرور غير متطابقة"}
                </Text>
              )}
          </FormControl>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={6}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
                <FiBookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر فئتك الدراسية</h2>
              <p className="text-gray-600">حدد المرحلة الدراسية التي تنتمي إليها</p>
            </Box>
            
            <div className="grid grid-cols-2 gap-4">
              {/* الفئة الابتدائية */}
              <div
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === "ابتدائي"
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedCategory("ابتدائي");
                  setGradeId("");
                }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    selectedCategory === "ابتدائي"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="text-2xl font-bold">١</span>
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${
                    selectedCategory === "ابتدائي" ? "text-blue-700" : "text-gray-700"
                  }`}>
                    ابتدائي
                  </h3>
                  <p className="text-sm text-gray-500">6 صفوف دراسية</p>
                </div>
              </div>

              {/* الفئة الإعدادية */}
              <div
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === "إعدادي"
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedCategory("إعدادي");
                  setGradeId("");
                }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    selectedCategory === "إعدادي"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="text-2xl font-bold">٢</span>
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${
                    selectedCategory === "إعدادي" ? "text-green-700" : "text-gray-700"
                  }`}>
                    إعدادي
                  </h3>
                  <p className="text-sm text-gray-500">3 صفوف دراسية</p>
                </div>
              </div>

              {/* الفئة الثانوية */}
              <div
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === "ثانوي"
                    ? "border-purple-500 bg-purple-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedCategory("ثانوي");
                  setGradeId("");
                }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    selectedCategory === "ثانوي"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="text-2xl font-bold">٣</span>
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${
                    selectedCategory === "ثانوي" ? "text-purple-700" : "text-gray-700"
                  }`}>
                    ثانوي
                  </h3>
                  <p className="text-sm text-gray-500">3 صفوف دراسية</p>
                </div>
              </div>

              {/* الفئة الجامعية */}
              <div
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === "جامعة"
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedCategory("جامعة");
                  setGradeId("");
                }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    selectedCategory === "جامعة"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="text-2xl font-bold">٤</span>
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${
                    selectedCategory === "جامعة" ? "text-orange-700" : "text-gray-700"
                  }`}>
                    جامعة
                  </h3>
                  <p className="text-sm text-gray-500">4 فرق دراسية</p>
                </div>
              </div>
            </div>

            {/* رسالة تأكيد */}
            {selectedCategory && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="font-medium">
                    تم اختيار: {selectedCategory}
                  </span>
                </div>
              </div>
            )}
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={6}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mb-4">
                <FiBookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر صفك الدراسي</h2>
              <p className="text-gray-600">حدد الصف الدراسي المحدد</p>
            </Box>

            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
            الصف الدراسي
          </FormLabel>
          <Select
            dir="ltr"
                placeholder={selectedCategory ? "اختر الصف الدراسي" : "اختر الفئة الدراسية أولاً"}
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
            size="lg"
            focusBorderColor="blue.500"
            _placeholder={{ color: "gray.400" }}
                borderColor="gray.200"
                borderRadius="xl"
                py={4}
                px={6}
                className="text-gray-800 transition-all duration-300"
            bg="white"
                isDisabled={!selectedCategory}
                _hover={{ borderColor: selectedCategory ? "gray.300" : "gray.200" }}
                _focus={{ 
                  borderColor: selectedCategory ? "blue.500" : "gray.200", 
                  boxShadow: selectedCategory ? "0 0 0 1px #3B82F6" : "none",
                  transform: selectedCategory ? "translateY(-1px)" : "none"
                }}
              >
                {getFilteredGradesByCategory(selectedCategory).map((grade) => (
              <option key={grade.id} value={grade.id}>{grade.name}</option>
            ))}
          </Select>
              {!selectedCategory && (
                <Text fontSize="sm" color="orange.500" mt={2}>
                  ⚠️ يجب اختيار الفئة الدراسية أولاً
                </Text>
              )}
        </FormControl>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen mt-[80px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12" style={{ direction: "rtl" }}>
          {/* Progress Bar */}
          <Box mb={8}>
            <Progress 
              value={(currentStep / (steps.length - 1)) * 100} 
              colorScheme="blue" 
              borderRadius="full" 
              height="8px"
              bg="gray.100"
            />
            <Text fontSize="sm" color="gray.600" mt={2} textAlign="center">
              الخطوة {currentStep + 1} من {steps.length}
            </Text>
          </Box>

          {/* Step Indicators */}
          <HStack spacing={4} mb={8} justify="center">
            {steps.map((step, index) => (
              <Box
                key={index}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <Icon as={step.icon} className="w-5 h-5" />
                )}
              </Box>
            ))}
          </HStack>

          {/* Step Content */}
          <Box className="transition-all duration-500 ease-in-out">
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <HStack spacing={4} mt={8}>
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                variant="outline"
                size="lg"
                flex={1}
                borderRadius="xl"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                transition="all 0.3s"
              >
                السابق
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                colorScheme="blue"
                size="lg"
                flex={1}
                borderRadius="xl"
                isDisabled={!validateCurrentStep()}
                bg="linear-gradient(135deg, #667eea 0%, #667eea 100%)"
                _hover={{ 
                  bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)"
                }}
                _disabled={{
                  bg: "gray.300",
                  cursor: "not-allowed",
                  transform: "none",
                  boxShadow: "none"
                }}
                transition="all 0.3s ease"
              >
                التالي
              </Button>
            ) : (
          <Button
            onClick={handleLSignUp}
                colorScheme="blue"
            size="lg"
                flex={1}
                borderRadius="xl"
                isDisabled={!validateCurrentStep() || loading}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                _hover={{ 
                  bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)"
                }}
                _active={{ 
                  bg: "linear-gradient(135deg, #4f5fc7 0%, #5f387f 100%)",
                  transform: "translateY(0px)"
                }}
                _disabled={{
                  bg: "gray.300",
                  cursor: "not-allowed",
                  transform: "none",
                  boxShadow: "none"
                }}
                leftIcon={loading ? <Spinner size="sm" color="white" /> : undefined}
                transition="all 0.3s ease"
              >
                إنشاء الحساب
          </Button>
            )}
          </HStack>

        {/* Login link */}
          <Box mt={6} textAlign="center">
            <Text color="gray.600" fontSize="md">
          هل لديك حساب بالفعل؟{" "}
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2"
              >
            تسجيل الدخول
          </a>
            </Text>
          </Box>
        </div>

        {/* Right side - Image */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-400 to-indigo-700 flex items-center justify-center p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-1/4 right-0 w-24 h-24 bg-white rounded-full translate-x-12"></div>
            <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-white rounded-full translate-y-10"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="mb-8">
              <img
                src="/fc65e2d7-5777-4a66-bc27-7fea10bc89a7-removebg-preview.png"
                alt="Signup Illustration"
                className="max-w-full h-auto max-h-80 mx-auto drop-shadow-2xl animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>
            <h2 className="text-white text-3xl font-bold mb-4 drop-shadow-lg">
              {steps[currentStep]?.title}
            </h2>
            <p className="text-blue-100 text-xl leading-relaxed max-w-md mx-auto">
              {steps[currentStep]?.description}
            </p>
            
            {/* Features */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                <span>دروس تفاعلية</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                <span>معلمون خبراء</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                <span>متابعة مستمرة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
      <ToastContainer position="top-center" />

      {/* Modal for existing account */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="blue.50" py={6}>
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiLogIn} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                لديك حساب بالفعل!
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="gray.600">
                رقم الهاتف <strong>{phone}</strong> مسجل مسبقاً في منصتنا
              </Text>
              <Text fontSize="md" color="gray.500">
                يبدو أنك قمت بإنشاء حساب من قبل. قم بتسجيل الدخول باستخدام رقم الهاتف وكلمة المرور
              </Text>
              
              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="blue.200"
                w="full"
              >
                <Text fontSize="sm" color="blue.700" fontWeight="medium">
                  💡 تذكر كلمة المرور الخاصة بك؟ اضغط على "تسجيل الدخول" للمتابعة
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <HStack spacing={4} w="full" maxW="300px">
              <Button
                variant="outline"
                onClick={onClose}
                flex={1}
                borderRadius="xl"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400", bg: "gray.50" }}
              >
                إلغاء
              </Button>
              <Button
                bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
                color="white"
                _hover={{
                  bgGradient: "linear(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
                }}
                flex={1}
                borderRadius="xl"
                leftIcon={<Icon as={FiLogIn} />}
                onClick={() => {
                  onClose();
                  navigate('/beautiful-login');
                }}
                boxShadow="0 8px 20px rgba(16, 185, 129, 0.3)"
              >
                تسجيل الدخول
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SignUp;