import { Box, Button, FormControl, FormLabel, Input, Spinner } from "@chakra-ui/react";
import useLogin from "../../Hooks/auth/useLogin";
import { Link } from "react-router-dom";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import studentLogin from "../../Hooks/student/Login";

const LoginPage = () => {
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
                className="text-gray-800"
                focusBorderColor="blue.500"
                _placeholder={{ color: "gray.400" }}
                borderColor="gray.300"
                borderRadius="full"
                px={5}
                py={3}
                value={mail}
                onChange={mailChange}
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
          className="text-gray-800"
          focusBorderColor="blue.500"
          _placeholder={{ color: "gray.400" }}
          borderColor="gray.300"
          borderRadius="full"
          px={5}
          py={3}
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
            _hover={{ bg: "teal.600", shadow: "md" }}
            _active={{ bg: "teal.700" }}
            leftIcon={loading ? <Spinner size="sm" /> : undefined}
            onClick={handleLogin}
            isDisabled={loading || !mail || !pass}
          >
            {" "}
            {loading ? <Spinner /> : "تسجيل الدخول "}{" "}
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
