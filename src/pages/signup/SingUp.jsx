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
} from "@chakra-ui/react";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiUser, FiPhone, FiLock, FiBookOpen, FiCheck } from "react-icons/fi";

import "react-toastify/dist/ReactToastify.css";
import baseUrl from "../../api/baseUrl";

const SignUp = () => {
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
      title: "المعلومات الدراسية",
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

  // تصفية الصفوف حسب هل هو جامعي أم لا
  let filteredGrades = grades;
  if (grades.length > 0) {
    if (isUniversityStudent === "yes") {
      filteredGrades = grades.slice(-4); // آخر 4 صفوف فقط
    } else {
      filteredGrades = grades.slice(0, grades.length - 4); // الكل ما عدا آخر 4
    }
  }

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
        return gradeId !== "";
      default:
        return false;
    }
  };

  const handleLSignUp = async () => {
    // Final validation
    if (!name || !phone || !parentPhone || !password || !passwordConfirm || !gradeId) {
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
      });
  
      const { token, user } = res.data;
  
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
  
      toast.success("تم إنشاء الحساب بنجاح!");
      window.location = "/";
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إنشاء الحساب");
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">المعلومات الدراسية</h2>
              <p className="text-gray-600">اختر صفك الدراسي وحدد نوع الدراسة</p>
            </Box>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
                هل أنت طالب جامعي؟
              </FormLabel>
          <RadioGroup
            value={isUniversityStudent}
            onChange={setIsUniversityStudent}
            direction="row"
          >
                <HStack spacing={6}>
                  <Radio 
                    value="no" 
                    colorScheme="blue"
                    size="lg"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    لا
                  </Radio>
                  <Radio 
                    value="yes" 
                    colorScheme="blue"
                    size="lg"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    نعم
                  </Radio>
                </HStack>
          </RadioGroup>
        </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
            الصف الدراسي
          </FormLabel>
          <Select
            dir="ltr"
            placeholder={"اختر الصف الدراسي"}
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
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "blue.500", 
                  boxShadow: "0 0 0 1px #3B82F6",
                  transform: "translateY(-1px)"
                }}
          >
            {filteredGrades.map((grade) => (
              <option key={grade.id} value={grade.id}>{grade.name}</option>
            ))}
          </Select>
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
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-8 relative overflow-hidden">
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
    </div>
  );
};

export default SignUp;