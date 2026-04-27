import {
  Select,
  Input,
  Button,
  Spinner,
  Box,
  FormControl,
  FormLabel,
  Text,
  VStack,
  HStack,
  Progress,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FiUser,
  FiPhone,
  FiLock,
  FiBookOpen,
  FiCheck,
  FiLogIn,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import baseUrl from "../../api/baseUrl";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect");
  const loginPath = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);
  const [isUniversityStudent, setIsUniversityStudent] = useState("no");

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const inputBorder = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const stepInactiveBg = useColorModeValue("gray.200", "gray.600");
  const stepInactiveColor = useColorModeValue("gray.500", "gray.400");
  const stepIconBg = useColorModeValue("blue.50", "blue.900");
  const categoryCardBg = useColorModeValue("white", "gray.700");
  const categoryCardBorder = useColorModeValue("gray.200", "gray.600");
  const categoryCardHover = useColorModeValue("gray.50", "gray.600");
  const inputHoverBorder = useColorModeValue("gray.300", "gray.500");
  const pageOverlayOpacity = useColorModeValue(0.4, 0.08);
  const cardShadow = useColorModeValue(
    "0 0 0 1px rgba(0,0,0,0.04), 0 12px 24px -8px rgba(0,0,0,0.12), 0 24px 48px -16px rgba(0,0,0,0.08)",
    "0 0 0 1px rgba(255,255,255,0.08), 0 0 40px rgba(255,255,255,0.2), 0 0 80px rgba(255,255,255,0.1), 0 24px 48px -16px rgba(0,0,0,0.45), 0 12px 24px -8px rgba(0,0,0,0.35)"
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState([]); // الصفوف من API
  const [selectedCategory, setSelectedCategory] = useState(""); // الفئة الدراسية

  // تنسيق موحد للحقول (وايت/دارك)
  const inputStyles = {
    size: "lg",
    borderRadius: "xl",
    px: 6,
    py: 4,
    borderColor: inputBorder,
    bg: inputBg,
    focusBorderColor: "blue.500",
    _placeholder: { color: subtextColor },
    _hover: { borderColor: inputHoverBorder },
    _focus: { borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.25)" },
  };

  // Steps configuration
  const steps = [
    {
      title: "المعلومات الشخصية",
      icon: FiUser,
      description: "أدخل اسمك الكامل",
    },
    {
      title: "معلومات الاتصال",
      icon: FiPhone,
      description: "أدخل أرقام الهواتف",
    },
    {
      title: "كلمة المرور",
      icon: FiLock,
      description: "أنشئ كلمة مرور قوية",
    },
    {
      title: "الفئة الدراسية",
      icon: FiBookOpen,
      description: "اختر فئتك الدراسية",
    },
    {
      title: "الصف الدراسي",
      icon: FiBookOpen,
      description: "اختر صفك الدراسي",
    },
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
          { id: 15, name: "الصف السادس الابتدائي" },
        ];
      case "إعدادي":
        return [
          { id: 1, name: "الصف الأول الإعدادي" },
          { id: 2, name: "الصف الثاني الإعدادي" },
          { id: 3, name: "الصف الثالث الإعدادي" },
        ];
      case "ثانوي":
        return [
          { id: 4, name: "الصف الأول الثانوي" },
          { id: 5, name: "الصف الثاني الثانوي" },
          { id: 6, name: "الصف الثالث الثانوي" },
        ];
      case "جامعة":
        return [
          { id: 7, name: "الفرقة الأولى" },
          { id: 8, name: "الفرقة الثانية" },
          { id: 9, name: "الفرقة الثالثة" },
          { id: 10, name: "الفرقة الرابعة" },
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
    if (
      !name ||
      !phone ||
      !parentPhone ||
      !password ||
      !passwordConfirm ||
      !gradeId ||
      !selectedCategory
    ) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("كلمتا السر غير متطابقتين");
      return;
    }

    // Basic phone number validation
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const cleanParentPhone = parentPhone.replace(/[^0-9]/g, "");

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
        toast.error(
          err.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب"
        );
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
            <Box textAlign="center" mb={2}>
              <Box
                w="16"
                h="16"
                mx="auto"
                mb={4}
                borderRadius="2xl"
                bg="blue.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(66, 153, 225, 0.35)"
              >
                <Icon as={FiUser} w="8" h="8" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={headingColor} mb={1}>
                أدخل اسمك الكامل
              </Text>
              <Text fontSize="sm" color={subtextColor}>سنحتاج إلى معرفة اسمك للبدء</Text>
            </Box>

            <FormControl>
              <FormLabel fontWeight="semibold" color={labelColor} mb={2} fontSize="md">
                الاسم بالكامل
              </FormLabel>
              <Input
                placeholder="مثال: أحمد محمد علي"
                value={name}
                onChange={(e) => setName(e.target.value)}
                {...inputStyles}
              />
            </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={2}>
              <Box
                w="16"
                h="16"
                mx="auto"
                mb={4}
                borderRadius="2xl"
                bg="green.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(34, 197, 94, 0.35)"
              >
                <Icon as={FiPhone} w="8" h="8" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={headingColor} mb={1}>
                معلومات الاتصال
              </Text>
              <Text fontSize="sm" color={subtextColor}>
                أدخل رقم هاتفك ورقم هاتف ولي الأمر
              </Text>
            </Box>

            <FormControl>
              <FormLabel fontWeight="semibold" color={labelColor} mb={2} fontSize="md">
                رقم الهاتف
              </FormLabel>
              <Input
                type="tel"
                placeholder="01227145090"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                {...inputStyles}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" color={labelColor} mb={2} fontSize="md">
                رقم هاتف الوالد
              </FormLabel>
              <Input
                type="tel"
                placeholder="01227145091"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                {...inputStyles}
              />
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={2}>
              <Box
                w="16"
                h="16"
                mx="auto"
                mb={4}
                borderRadius="2xl"
                bg="orange.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(237, 137, 54, 0.35)"
              >
                <Icon as={FiLock} w="8" h="8" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={headingColor} mb={1}>
                كلمة المرور
              </Text>
              <Text fontSize="sm" color={subtextColor}>أنشئ كلمة مرور قوية لحماية حسابك</Text>
            </Box>

            <FormControl>
              <FormLabel fontWeight="semibold" color={labelColor} mb={2} fontSize="md">
                كلمة المرور
              </FormLabel>
              <Input
                type="password"
                placeholder="أدخل كلمة مرور قوية (6 أحرف على الأقل)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...inputStyles}
              />
              {password.length > 0 && (
                <Text fontSize="sm" color={password.length >= 6 ? "green.500" : "orange.500"} mt={2}>
                  {password.length >= 6 ? "✓ كلمة المرور قوية" : "كلمة المرور يجب أن تكون 6 أحرف على الأقل"}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold" color={labelColor} mb={2} fontSize="md">
                تأكيد كلمة المرور
              </FormLabel>
              <Input
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                {...inputStyles}
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
            <Box textAlign="center" mb={2}>
              <Box
                w="16"
                h="16"
                mx="auto"
                mb={4}
                borderRadius="2xl"
                bg="purple.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(147, 51, 234, 0.35)"
              >
                <Icon as={FiBookOpen} w="8" h="8" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={headingColor} mb={1}>
                اختر فئتك الدراسية
              </Text>
              <Text fontSize="sm" color={subtextColor}>
                حدد المرحلة الدراسية التي تنتمي إليها
              </Text>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={4}>
              {[
                { id: "ابتدائي", label: "ابتدائي", sub: "6 صفوف دراسية", num: "١", color: "blue" },
                { id: "إعدادي", label: "إعدادي", sub: "3 صفوف دراسية", num: "٢", color: "green" },
                { id: "ثانوي", label: "ثانوي", sub: "3 صفوف دراسية", num: "٣", color: "purple" },
                { id: "جامعة", label: "جامعة", sub: "4 فرق دراسية", num: "٤", color: "orange" },
              ].map(({ id, label, sub, num, color }) => {
                const isSelected = selectedCategory === id;
                return (
                  <Box
                    key={id}
                    p={5}
                    borderRadius="2xl"
                    borderWidth="2px"
                    borderColor={isSelected ? `${color}.500` : categoryCardBorder}
                    bg={isSelected ? `${color}.50` : categoryCardBg}
                    _dark={{ bg: isSelected ? `${color}.900` : categoryCardBg }}
                    cursor="pointer"
                    transition="all 0.25s"
                    _hover={{
                      borderColor: isSelected ? `${color}.500` : `${color}.300`,
                      transform: "scale(1.02)",
                      shadow: "md",
                    }}
                    onClick={() => {
                      setSelectedCategory(id);
                      setGradeId("");
                    }}
                    textAlign="center"
                  >
                    <Box
                      w="12"
                      h="12"
                      mx="auto"
                      mb={3}
                      borderRadius="full"
                      bg={isSelected ? `${color}.500` : stepInactiveBg}
                      color={isSelected ? "white" : stepInactiveColor}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xl"
                      fontWeight="bold"
                    >
                      {num}
                    </Box>
                    <Text fontWeight="bold" fontSize="lg" color={headingColor} mb={1}>
                      {label}
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>{sub}</Text>
                  </Box>
                );
              })}
            </Box>

            {selectedCategory && (
              <HStack
                bg="green.50"
                _dark={{ bg: "green.900", borderColor: "green.700" }}
                borderWidth="1px"
                borderColor="green.200"
                borderRadius="xl"
                p={4}
                justify="center"
                spacing={2}
              >
                <Box w="5" h="5" bg="green.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                  <Text as="span" color="white" fontSize="xs">✓</Text>
                </Box>
                <Text fontWeight="medium" color="green.700" _dark={{ color: "green.200" }}>
                  تم اختيار: {selectedCategory}
                </Text>
              </HStack>
            )}
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={2}>
              <Box
                w="16"
                h="16"
                mx="auto"
                mb={4}
                borderRadius="2xl"
                bg="blue.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(37, 99, 235, 0.35)"
              >
                <Icon as={FiBookOpen} w="8" h="8" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={headingColor} mb={1}>
                اختر صفك الدراسي
              </Text>
              <Text fontSize="sm" color={subtextColor}>حدد الصف الدراسي المحدد</Text>
            </Box>

            <FormControl>
              <FormLabel fontWeight="semibold" color={labelColor} mb={2} fontSize="md">
                الصف الدراسي
              </FormLabel>
              <Select
                dir="ltr"
                placeholder={
                  selectedCategory ? "اختر الصف الدراسي" : "اختر الفئة الدراسية أولاً"
                }
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                isDisabled={!selectedCategory}
                {...inputStyles}
              >
                {getFilteredGradesByCategory(selectedCategory).map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
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
    <Box
      minH="100vh"
      className="mt-[80px]"
      bg={pageBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 4, md: 6 }}
      dir="rtl"
      style={{ fontFamily: "'Changa', sans-serif" }}
      position="relative"
      overflow="hidden"
    >
      {/* خلفية خفيفة */}
      <Box
        position="absolute"
        inset="0"
        opacity={pageOverlayOpacity}
        bgGradient="linear(to-br, blue.400, transparent)"
        pointerEvents="none"
      />
      <Box
        w="full"
        maxW="2xl"
        bg={cardBg}
        borderRadius="2xl"
        boxShadow={cardShadow}
        borderWidth="1px"
        borderColor={cardBorder}
        overflow="hidden"
        position="relative"
        zIndex="1"
      >
        <Box w="full" p={{ base: 6, sm: 8, lg: 10 }}>
          {/* التابات — مؤشر الخطوات المحسّن */}
          <Box
            mb={8}
            p={4}
            borderRadius="xl"
            bg={stepIconBg}
            borderWidth="1px"
            borderColor={cardBorder}
          >
            <HStack justify="space-between" mb={4}>
              <Text fontSize="md" fontWeight="bold" color={headingColor}>
                إنشاء حساب جديد
              </Text>
              <Box
                px={3}
                py={1}
                borderRadius="full"
                bg="blue.500"
                color="white"
                fontSize="sm"
                fontWeight="semibold"
              >
                {currentStep + 1} من {steps.length}
              </Box>
            </HStack>
            <Progress
              value={(currentStep / (steps.length - 1)) * 100}
              colorScheme="blue"
              borderRadius="full"
              height="2"
              bg={stepInactiveBg}
              transition="all 0.4s ease"
              mb={5}
            />
            <Box display="flex" justifyContent="space-between" position="relative" gap={0}>
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                return (
                  <Box
                    key={index}
                    flex="1"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    position="relative"
                    zIndex={1}
                  >
                    <Box
                      w={{ base: "10", sm: "12" }}
                      h={{ base: "10", sm: "12" }}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={isCompleted ? "green.500" : isActive ? "blue.500" : stepInactiveBg}
                      color={isCompleted || isActive ? "white" : stepInactiveColor}
                      borderWidth="2px"
                      borderColor={isActive ? "blue.400" : "transparent"}
                      boxShadow={isActive ? "0 0 0 3px rgba(66, 153, 225, 0.3)" : "none"}
                      transition="all 0.3s"
                      flexShrink={0}
                    >
                      {isCompleted ? (
                        <Icon as={FiCheck} w={{ base: "5", sm: "6" }} h={{ base: "5", sm: "6" }} />
                      ) : (
                        <Icon as={step.icon} w={{ base: "4", sm: "5" }} h={{ base: "4", sm: "5" }} />
                      )}
                    </Box>
                    <Text
                      fontSize={{ base: "xs", sm: "sm" }}
                      color={isActive ? "blue.600" : isCompleted ? headingColor : subtextColor}
                      _dark={{ color: isActive ? "blue.300" : isCompleted ? "white" : "gray.400" }}
                      fontWeight={isActive ? "bold" : "normal"}
                      mt={2}
                      textAlign="center"
                      noOfLines={2}
                      lineHeight="tight"
                    >
                      {step.title}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Step Content */}
          <Box className="transition-all duration-500 ease-in-out">
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <HStack spacing={4} mt={8} w="full">
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                variant="outline"
                size="lg"
                flex={1}
                borderRadius="xl"
                borderColor={inputBorder}
                color={headingColor}
                _hover={{ borderColor: inputHoverBorder, bg: categoryCardHover }}
                transition="all 0.2s"
              >
                السابق
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                size="lg"
                flex={1}
                borderRadius="xl"
                isDisabled={!validateCurrentStep()}
                bg="blue.500"
                color="white"
                _hover={{
                  bg: "blue.400",
                  boxShadow: "0 8px 24px rgba(66, 153, 225, 0.4)",
                }}
                _disabled={{
                  bg: "gray.300",
                  color: "gray.500",
                  cursor: "not-allowed",
                  _hover: {},
                }}
                transition="all 0.2s"
              >
                التالي
              </Button>
            ) : (
              <Button
                onClick={handleLSignUp}
                size="lg"
                flex={1}
                borderRadius="xl"
                isDisabled={!validateCurrentStep() || loading}
                bg="orange.500"
                color="white"
                _hover={{
                  bg: "orange.400",
                  boxShadow: "0 8px 24px rgba(237, 137, 54, 0.4)",
                }}
                _disabled={{
                  bg: "gray.300",
                  color: "gray.500",
                  cursor: "not-allowed",
                  _hover: {},
                }}
                leftIcon={loading ? <Spinner size="sm" color="white" /> : undefined}
                transition="all 0.2s"
              >
                إنشاء الحساب
              </Button>
            )}
          </HStack>

          <Box mt={6} textAlign="center" pt={4} borderTopWidth="1px" borderColor={cardBorder}>
            <Text color={subtextColor} fontSize="md">
              هل لديك حساب بالفعل؟{" "}
              <Box
                as="span"
                color="blue.500"
                fontWeight="semibold"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={() => navigate(loginPath)}
              >
                تسجيل الدخول
              </Box>
            </Text>
          </Box>
        </Box>
      </Box>

      <ScrollToTop />
      <ToastContainer position="top-center" />

      {/* Modal for existing account */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader
            textAlign="center"
            bg="blue.50"
            _dark={{ bg: "blue.900" }}
            py={6}
          >
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bg="blue.500"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiLogIn} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={headingColor}>
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
                يبدو أنك قمت بإنشاء حساب من قبل. قم بتسجيل الدخول باستخدام رقم
                الهاتف وكلمة المرور
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
                  💡 تذكر كلمة المرور الخاصة بك؟ اضغط على "تسجيل الدخول"
                  للمتابعة
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
                bg="orange.500"
                color="white"
                _hover={{
                  bg: "orange.400",
                  boxShadow: "0 10px 25px rgba(237, 137, 54, 0.35)",
                }}
                flex={1}
                borderRadius="xl"
                leftIcon={<Icon as={FiLogIn} />}
                onClick={() => {
                  onClose();
                  navigate(loginPath);
                }}
                boxShadow="0 8px 20px rgba(237, 137, 54, 0.3)"
              >
                تسجيل الدخول
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SignUp;
