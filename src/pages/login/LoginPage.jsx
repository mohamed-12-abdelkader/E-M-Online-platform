import { Box, Button, FormControl, FormLabel, Input, Spinner, useToast } from "@chakra-ui/react";
import useLogin from "../../Hooks/auth/useLogin";
import { Link } from "react-router-dom";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import studentLogin from "../../Hooks/student/Login";

const LoginPage = () => {
  const toast = useToast();
  const [
    handleLogin,
    passChange,
    mailChange,
    mail,
    pass,
    userType,
    setUserType,
    loading,
  ] = studentLogin();

  // دالة محسنة لتسجيل الدخول مع رسائل النجاح والفشل
  const handleLoginWithFeedback = async () => {
    if (!mail || !pass) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-center",
      });
      return;
    }

    try {
      await handleLogin();
      // إذا وصلنا هنا، يعني نجح تسجيل الدخول
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في منصة التعليم",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-center",
      });
    } catch (error) {
      // معالجة الأخطاء
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
      
      if (error.response?.data?.msg) {
        switch (error.response.data.msg) {
          case "You must login from the same device":
            errorMessage = "لقد تجاوزت الحد المسموح لك من الأجهزة";
            break;
          case "Invalid username or password":
            errorMessage = "بيانات المستخدم غير صحيحة";
            break;
          default:
            errorMessage = error.response.data.msg;
        }
      }
      
      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-center",
      });
    }
  };
  return (
    <div
      className="w-full h-screen relative mt-[80px]" style={{ direction: "ltr" }}
    >

         
      <Box
               className="absolute left-0 top-0 h-full w-full  flex flex-col justify-center py-8 px-6 sm:px-10 md:px-12 lg:px-16"
        style={{ direction: "rtl", borderRadius: "0 50px 50px 0" }}

      >
        <div>
          <div >
            <h1 className="text-right font-extrabold text-3xl mb-4"> تسجيل الدخول </h1>
          </div>
          <div >
            <FormControl className="w-full mb-4">
              <FormLabel fontWeight="bold" color="gray.700" mb={2}>
                رقم الهاتف أو البريد الإلكتروني
              </FormLabel>
              <Input
                placeholder="ادخل رقم الهاتف أو البريد الإلكتروني"
                size="lg"
                className="text-gray-800 transition-all duration-300"
                focusBorderColor="teal.500"
                _placeholder={{ color: "gray.400" }}
                borderColor="gray.300"
                borderRadius="full"
                px={5}
                py={3}
                value={mail}
                onChange={mailChange}
                _hover={{ borderColor: "gray.400" }}
                _focus={{ 
                  borderColor: "teal.500", 
                  boxShadow: "0 0 0 1px #319795",
                  transform: "translateY(-1px)"
                }}
                isInvalid={mail && mail.trim().length === 0}
                errorBorderColor="red.300"
              />
            </FormControl>
            
            <FormControl className="w-full mb-4">
              <FormLabel fontWeight="bold" color="gray.700" mb={2}>
                كلمة السر
              </FormLabel>
              <Input
                type="password"
                placeholder="ادخل كلمة السر"
                size="lg"
                value={pass}
                onChange={passChange}
                className="text-gray-800 transition-all duration-300"
                focusBorderColor="teal.500"
                _placeholder={{ color: "gray.400" }}
                borderColor="gray.300"
                borderRadius="full"
                px={5}
                py={3}
                _hover={{ borderColor: "gray.400" }}
                _focus={{ 
                  borderColor: "teal.500", 
                  boxShadow: "0 0 0 1px #319795",
                  transform: "translateY(-1px)"
                }}
                isInvalid={pass && pass.length === 0}
                errorBorderColor="red.300"
              />
            </FormControl>

        
          </div>
        </div>
        <div className='my-5'>
          <Link to='/verify_code' className='text-blue-500'>
            هل نسيت كلمة السر ؟
          </Link>
        </div>

        <div className='text-center my-3'>
          <Button
            colorScheme="teal"
            size="lg"
            width="80%"
            maxWidth="300px"
            borderRadius="full"
            fontSize="xl"
            fontWeight="bold"
            _hover={{ 
              bg: "teal.600", 
              shadow: "lg",
              transform: "translateY(-2px)",
              transition: "all 0.3s ease"
            }}
            _active={{ 
              bg: "teal.700",
              transform: "translateY(0px)"
            }}
            _disabled={{
              bg: "gray.300",
              cursor: "not-allowed",
              transform: "none",
              shadow: "none"
            }}
            leftIcon={loading ? <Spinner size="sm" color="white" /> : undefined}
            onClick={handleLoginWithFeedback}
            isLoading={loading}
            loadingText="جاري تسجيل الدخول..."
            isDisabled={loading || !mail || !pass}
            transition="all 0.3s ease"
            className="relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Spinner size="sm" color="white" />
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>
        </div>
        <h1 className='my-5  font-bold text-black'>
          {" "}
          لا يوجد لديك حساب ؟{" "}
          <Link to='/signup' style={{ color: "red", textDecoration: "none" }}>
            {" "}
            انشئ حسابك الان!{" "}
          </Link>
        </h1>
      </Box>
      <ScrollToTop />
    </div>
  );
};

export default LoginPage;
