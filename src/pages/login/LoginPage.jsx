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
  ModalCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Icon,
  Divider
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
  const [identifier, setIdentifier] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
      if (error.response) {
        if (error.response.data.msg === "You must login from the same device") {
          toast.error("لقد تجاوزت الحد المسموح لك من الاجهزة");
        } else if (error.response.data.msg === "Invalid username or password" || 
                   error.response.data.message?.includes("Invalid credentials") ||
                   error.response.data.message?.includes("User not found") ||
                   error.response.data.message?.includes("Wrong password")) {
          onOpen(); // فتح المودال عند خطأ في البيانات
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
    className="mt-[100px] "
      minH="100vh"
    
      bgGradient="linear(to-br, blue.50, indigo.100, purple.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.1"
        backgroundImage="url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      />

      <Box
       className="w-[90%] mx-auto"
        position="relative"
        zIndex="1"
      >
        {/* Main Login Card */}
        <Box
        
          bg="white"
          borderRadius="3xl"
          p={8}
          boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          backdropFilter="blur(10px)"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative Elements */}
          <Box
          
            position="absolute"
            top="-30px"
            right="-30px"
            w="60px"
            h="60px"
            bgGradient="linear(to-br, blue.400, purple.500)"
            borderRadius="full"
            opacity="0.1"
          />
          <Box
          
            position="absolute"
            bottom="-20px"
            left="-20px"
            w="40px"
            h="40px"
            bgGradient="linear(to-br, pink.400, red.500)"
            borderRadius="full"
            opacity="0.1"
          />

          <VStack spacing={8} align="stretch" >
            {/* Header */}
            <Box textAlign="center" >
              <Box
                w="80px"
                h="80px"
                bgGradient="linear(135deg, #667eea 0%, blue.500 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={4}
                boxShadow="0 15px 30px rgba(102, 126, 234, 0.3)"
              >
                <Icon as={FiLock} w="40px" h="40px" color="white" />
              </Box>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(135deg, #667eea 0%, blue.500 100%)"
                bgClip="text"
                mb={2}
              >
                مرحباً بعودتك
              </Text>
              <Text color="gray.600" fontSize="md">
                سجل دخولك للاستمرار في رحلة التعلم
              </Text>
            </Box>

            {/* Login Form */}
            <Box>
              <form onSubmit={handleLogin}>
                <VStack spacing={6}>
                  {/* Phone/Email Input */}
                  <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700" mb={3}>
                      رقم الهاتف أو البريد الإلكتروني
                    </FormLabel>
                    <Input
                      placeholder="ادخل رقم الهاتف أو البريد الإلكتروني"
                      size="lg"
                      value={identifier}
                      onChange={identifierChange}
                      borderRadius="xl"
                      borderColor="gray.200"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3B82F6"
                      }}
                      transition="all 0.3s"
                    />
                  </FormControl>

                  {/* Password Input */}
                  <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700" mb={3}>
                      كلمة المرور
                    </FormLabel>
                    <Input
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      size="lg"
                      value={pass}
                      onChange={passChange}
                      borderRadius="xl"
                      borderColor="gray.200"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3B82F6"
                      }}
                      transition="all 0.3s"
                    />
                  </FormControl>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    bgGradient="linear(135deg, #667eea 0%, blue.500 100%)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(135deg, #5a6fd8 0%, blue.500 100%)",
                      boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)"
                    }}
                    _active={{
                      bgGradient: "linear(135deg, #4f5fc7 0%, #5f387f 100%)"
                    }}
                    borderRadius="xl"
                    fontSize="lg"
                    fontWeight="semibold"
                    boxShadow="0 8px 20px rgba(102, 126, 234, 0.3)"
                    transition="all 0.3s ease"
                    rightIcon={loading ? <Spinner size="sm" color="white" /> : undefined}
                    isDisabled={loading}
                  >
                    {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                  </Button>
                </VStack>
              </form>
            </Box>

            {/* Divider */}
            <HStack>
              <Divider />
              <Text fontSize="sm" color="gray.500" px={4}>
                أو
              </Text>
              <Divider />
            </HStack>

            {/* Sign Up Link */}
            <Box textAlign="center">
              <Text color="gray.600" fontSize="md" mb={4}>
                هل أنت جديد على منصتنا؟
              </Text>
              <Button
                variant="outline"
                borderColor="blue.300"
                color="blue.600"
                _hover={{
                  bg: "blue.50",
                  borderColor: "blue.400",
                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.2)"
                }}
                _active={{
                  bg: "blue.100"
                }}
                size="lg"
                w="full"
                borderRadius="xl"
                fontSize="md"
                fontWeight="semibold"
                transition="all 0.3s ease"
                onClick={() => navigate('/signup')}
              >
                إنشاء حساب جديد
              </Button>
            </Box>

            {/* Forgot Password Link */}
            <Box textAlign="center">
              <Link 
                to='/verify_code' 
                color="blue.500"
                fontSize="sm"
                _hover={{ color: "blue.600", textDecoration: "underline" }}
                transition="all 0.3s"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </Box>
          </VStack>
        </Box>

        {/* Bottom Features */}
        <Box mt={6} textAlign="center">
          <Text fontSize="sm" color="gray.500">
            انضم إلى أكثر من 10,000 طالب وطالبة في رحلة التعلم
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
                bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
                color="white"
                _hover={{
                  bgGradient: "linear(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
                }}
                flex={1}
                borderRadius="xl"
                onClick={() => {
                  onClose();
                  navigate('/signup');
                }}
                boxShadow="0 8px 20px rgba(16, 185, 129, 0.3)"
              >
                إنشاء حساب جديد
              </Button>
            </HStack>
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
              bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
              color="white"
              _hover={{
                bgGradient: "linear(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
              }}
              borderRadius="xl"
              onClick={() => setShowSuccessModal(false)}
              boxShadow="0 8px 20px rgba(16, 185, 129, 0.3)"
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
