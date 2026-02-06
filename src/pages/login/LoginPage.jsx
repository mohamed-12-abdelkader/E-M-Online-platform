import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Spinner, 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Icon,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FiLock, FiPhone, FiMail, FiCheckCircle } from "react-icons/fi";
import baseUrl from "../../api/baseUrl";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isSupportOpen, 
    onOpen: onSupportOpen, 
    onClose: onSupportClose 
  } = useDisclosure();
  const [identifier, setIdentifier] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pageBg = useColorModeValue("linear(to-br, blue.50, white)", "linear(to-br, gray.900, gray.800)");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const inputBorder = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const bottomTextColor = useColorModeValue("gray.500", "gray.500");
  
  function generateString() {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var string = "";
    for (var i = 0; i < 30; i++) {
      var randomIndex = Math.floor(Math.random() * chars.length);
      string += chars[randomIndex];
    }
    return string;
  }

  const identifierChange = (e) => {
    setIdentifier(e.target.value);
  };

  const passChange = (e) => {
    setPass(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!identifier || !pass) {
      toast.warn("يجب ادخال جميع البيانات");
      return;
    }

    try {
      setLoading(true);

      if (!localStorage.getItem("ip")) {
        var generatedString = generateString();
        localStorage.setItem("ip", generatedString);
      }

      // تحديد ما إذا كان المدخل بريدًا إلكترونيًا أو رقم هاتف
      const isEmail = identifier.includes('@');
      const requestData = isEmail 
        ? { email: identifier, password: pass }
        : { phone: identifier.replace(/[^0-9]/g, ''), password: pass };

      const response = await baseUrl.post(`api/login`, requestData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("employee_data", JSON.stringify(response.data.employee_data));

      // Show success modal
      setShowSuccessModal(true);
      
        const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect");
      const destination = redirectTarget && redirectTarget.startsWith("/") ? redirectTarget : "/";
      setTimeout(() => {
       window.location.reload()
        navigate('/home');
      }, 1000);
      
      // Redirect after 2 seconds
    
    } catch (error) {
      console.error('Login error:', error);
      // فتح مودال الخطأ تلقائياً
      onOpen();
      
      if (error.response) {
        if (error.response.data.msg === "You must login from the same device") {
          toast.error("لقد تجاوزت الحد المسموح لك من الاجهزة");
        } else {
          toast.error(error.response.data.msg || "حدث خطأ أثناء تسجيل الدخول");
        }
      } else {
        toast.error("حدث خطأ في الاتصال بالخادم");
      }
    } finally {
      setLoading(false);
        setTimeout(() => {
       
  
      }, 2000);
    }
  };

  return (
    <Box
      className="mt-[100px]"
      minH="100vh"
      bgGradient={pageBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      position="relative"
      overflow="hidden"
      dir="rtl"
      style={{ fontFamily: "'Changa', sans-serif" }}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity={useColorModeValue(0.04, 0.06)}
        bgImage="url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%234299E1%22 fill-opacity=%22.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      />

      <Box position="relative" zIndex="1" w="full" maxW="440px">
        <Box
          bg={cardBg}
          borderRadius="2xl"
          p={8}
          boxShadow={useColorModeValue("0 25px 50px rgba(0,0,0,0.08)", "0 25px 50px rgba(0,0,0,0.3)")}
          borderWidth="1px"
          borderColor={cardBorder}
          overflow="hidden"
        >
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Box
                w="16"
                h="16"
                bg="blue.500"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={4}
                boxShadow="0 10px 25px rgba(66, 153, 225, 0.35)"
              >
                <Icon as={FiLock} w="8" h="8" color="white" />
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color={headingColor} mb={2}>
                مرحباً بعودتك
              </Text>
              <Text color={subtextColor} fontSize="md">
                سجل دخولك للاستمرار في رحلة التعلم مع Next Edu
              </Text>
            </Box>

            <Box as="form" onSubmit={handleLogin}>
              <VStack spacing={5}>
                <FormControl>
                  <FormLabel fontWeight="semibold" color={labelColor} mb={2}>
                    رقم الهاتف أو البريد الإلكتروني
                  </FormLabel>
                  <Input
                    placeholder="ادخل رقم الهاتف أو البريد الإلكتروني"
                    size="lg"
                    value={identifier}
                    onChange={identifierChange}
                    borderRadius="xl"
                    borderColor={inputBorder}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.25)" }}
                    transition="all 0.2s"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="semibold" color={labelColor} mb={2}>
                    كلمة المرور
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    size="lg"
                    value={pass}
                    onChange={passChange}
                    borderRadius="xl"
                    borderColor={inputBorder}
                    bg={inputBg}
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.25)" }}
                    transition="all 0.2s"
                  />
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  bg="orange.500"
                  color="white"
                  _hover={{ bg: "orange.400", boxShadow: "0 10px 25px rgba(237, 137, 54, 0.35)" }}
                  _active={{ bg: "orange.600" }}
                  borderRadius="xl"
                  fontSize="lg"
                  fontWeight="bold"
                  boxShadow="0 8px 20px rgba(237, 137, 54, 0.3)"
                  transition="all 0.2s"
                  rightIcon={loading ? <Spinner size="sm" color="white" /> : undefined}
                  isDisabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </VStack>
            </Box>

            <HStack>
              <Divider borderColor={cardBorder} />
              <Text fontSize="sm" color={bottomTextColor} px={3}>
                أو
              </Text>
              <Divider borderColor={cardBorder} />
            </HStack>

            <Box textAlign="center">
              <Text color={subtextColor} fontSize="md" mb={3}>
                هل أنت جديد على منصتنا؟
              </Text>
              <Button
                variant="outline"
                borderColor="blue.400"
                color="blue.500"
                _hover={{ bg: "blue.50", borderColor: "blue.500" }}
                _dark={{ _hover: { bg: "blue.900", borderColor: "blue.400" } }}
                size="lg"
                w="full"
                borderRadius="xl"
                fontSize="md"
                fontWeight="semibold"
                transition="all 0.2s"
                onClick={() => navigate("/signup")}
              >
                إنشاء حساب جديد
              </Button>
            </Box>

            <Box textAlign="center">
              <Link
                to="/verify_code"
                color="blue.500"
                fontSize="sm"
                _hover={{ color: "blue.600", textDecoration: "underline" }}
              >
                هل نسيت كلمة المرور؟
              </Link>
            </Box>
          </VStack>
        </Box>

        <Box mt={6} textAlign="center">
          <Text fontSize="sm" color={bottomTextColor}>
            انضم إلى آلاف الطلاب في رحلة التعلم مع Next Edu
          </Text>
        </Box>
      </Box>
      <ScrollToTop />
      <ToastContainer position="top-center" />

      {/* Modal for login error */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="red.50" py={6}>
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, #ef4444 0%, #dc2626 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiLock} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="red.800">
                خطأ في تسجيل الدخول
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="gray.600">
                رقم الهاتف أو البريد الإلكتروني أو كلمة المرور غير صحيحة
              </Text>
              <Text fontSize="md" color="gray.500">
                يبدو أن البيانات المدخلة غير صحيحة. تأكد من صحة البيانات المدخلة
              </Text>
              
              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="blue.200"
                w="full"
              >
                <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={2}>
                  💡 لا تتذكر كلمة المرور أو رقم الهاتف؟
                </Text>
                <Text fontSize="sm" color="blue.600">
                  تواصل مع الدعم الفني وسنساعدك في استعادة حسابك
                </Text>
              </Box>

              <Box
                bg="green.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="green.200"
                w="full"
              >
                <Text fontSize="sm" color="green.700" fontWeight="medium" mb={3}>
                  📞 تواصل مع الدعم الفني:
                </Text>
                <VStack spacing={3}>
                  <Button
                    as="a"
                    href="https://wa.me/201111272393"
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="green.500"
                    color="white"
                    _hover={{
                      bg: "green.600",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                    }}
                    _active={{
                      bg: "green.700"
                    }}
                    leftIcon={<Icon as={FiPhone} />}
                    size="sm"
                    w="full"
                    borderRadius="lg"
                    transition="all 0.3s ease"
                  >
                    واتساب: 01111272393
                  </Button>
                  <Button
                    as="a"
                    href="https://wa.me/201288781012"
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="green.500"
                    color="white"
                    _hover={{
                      bg: "green.600",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                    }}
                    _active={{
                      bg: "green.700"
                    }}
                    leftIcon={<Icon as={FiPhone} />}
                    size="sm"
                    w="full"
                    borderRadius="lg"
                    transition="all 0.3s ease"
                  >
                    واتساب: 01288781012
                  </Button>
                  <Button
                    as="a"
                    href="https://wa.me/201210726096"
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="green.500"
                    color="white"
                    _hover={{
                      bg: "green.600",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                    }}
                    _active={{
                      bg: "green.700"
                    }}
                    leftIcon={<Icon as={FiPhone} />}
                    size="sm"
                    w="full"
                    borderRadius="lg"
                    transition="all 0.3s ease"
                  >
                    واتساب: 01210726096
                  </Button>
                  
               
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <VStack spacing={3} w="full">
              <HStack spacing={4} w="full" maxW="300px">
                <Button
                  variant="outline"
                  onClick={onClose}
                  flex={1}
                  borderRadius="xl"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                >
                  إعادة المحاولة
                </Button>
                <Button
                  bg="orange.500"
                  color="white"
                  _hover={{ bg: "orange.400", boxShadow: "0 10px 25px rgba(237, 137, 54, 0.35)" }}
                  flex={1}
                  borderRadius="xl"
                  onClick={() => {
                    onClose();
                    navigate("/signup");
                  }}
                  boxShadow="0 8px 20px rgba(237, 137, 54, 0.3)"
                >
                  إنشاء حساب جديد
                </Button>
              </HStack>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Support Modal */}
      <Modal isOpen={isSupportOpen} onClose={onSupportClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="red.50" py={6}>
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, #ef4444 0%, #dc2626 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiPhone} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="red.800">
                تواصل مع الدعم الفني
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="gray.600">
                لم نتمكن من تغيير كلمة المرور تلقائياً
              </Text>
              <Text fontSize="md" color="gray.500">
                يرجى التواصل مع الدعم الفني لمساعدتك في استعادة حسابك
              </Text>
              
              <Box
                bg="green.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="green.200"
                w="full"
              >
                <Text fontSize="sm" color="green.700" fontWeight="medium" mb={3}>
                  📞 تواصل مع الدعم الفني:
                </Text>
                <VStack spacing={3}>
                  <Button
                    as="a"
                    href="https://wa.me/201111272393"
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="green.500"
                    color="white"
                    _hover={{
                      bg: "green.600",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                    }}
                    _active={{
                      bg: "green.700"
                    }}
                    leftIcon={<Icon as={FiPhone} />}
                    size="md"
                    w="full"
                    borderRadius="lg"
                    transition="all 0.3s ease"
                  >
                    واتساب: 01111272393
                  </Button>
                  <Button
                    as="a"
                    href="https://wa.me/201288781012"
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="green.500"
                    color="white"
                    _hover={{
                      bg: "green.600",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                    }}
                    _active={{
                      bg: "green.700"
                    }}
                    leftIcon={<Icon as={FiPhone} />}
                    size="md"
                    w="full"
                    borderRadius="lg"
                    transition="all 0.3s ease"
                  >
                    واتساب: 01288781012
                  </Button>
                  <Button
                    as="a"
                    href="https://wa.me/201210726096"
                    target="_blank"
                    rel="noopener noreferrer"
                    bg="green.500"
                    color="white"
                    _hover={{
                      bg: "green.600",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                    }}
                    _active={{
                      bg: "green.700"
                    }}
                    leftIcon={<Icon as={FiPhone} />}
                    size="md"
                    w="full"
                    borderRadius="lg"
                    transition="all 0.3s ease"
                  >
                    واتساب: 01210726096
                  </Button>
                </VStack>
              </Box>

              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="blue.200"
                w="full"
              >
                <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={2}>
                  💡 معلومات مهمة:
                </Text>
                <Text fontSize="sm" color="blue.600" textAlign="right">
                  عند التواصل مع الدعم الفني، يرجى إخبارهم برقم هاتفك المسجل في المنصة
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <Button
              variant="outline"
              onClick={onSupportClose}
              borderRadius="xl"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400", bg: "gray.50" }}
              px={8}
            >
              إغلاق
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="green.50" py={6}>
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
                <Icon as={FiCheckCircle} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="green.800">
                تم تسجيل الدخول بنجاح!
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="gray.600">
                مرحباً بك في منصتنا التعليمية
              </Text>
              <Text fontSize="md" color="gray.500">
                سيتم تحويلك إلى الصفحة الرئيسية خلال ثوانٍ قليلة...
              </Text>
              
              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="blue.200"
                w="full"
              >
                <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={2}>
                  🎉 أهلاً وسهلاً بك!
                </Text>
                <Text fontSize="sm" color="blue.600">
                  يمكنك الآن الاستمتاع بجميع المميزات التعليمية المتاحة
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <Button
              bg="orange.500"
              color="white"
              _hover={{ bg: "orange.400", boxShadow: "0 10px 25px rgba(237, 137, 54, 0.35)" }}
              borderRadius="xl"
              onClick={() => setShowSuccessModal(false)}
              boxShadow="0 8px 20px rgba(237, 137, 54, 0.3)"
              px={8}
            >
              متابعة
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LoginPage;
