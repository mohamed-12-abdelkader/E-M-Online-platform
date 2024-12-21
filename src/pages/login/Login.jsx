import { Button, Input, Spinner } from "@chakra-ui/react";
import useLogin from "../../Hooks/auth/useLogin";
import { Link } from "react-router-dom";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import studentLogin from "../../Hooks/student/Login";

const Login = () => {
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
      style={{ minHeight: "90vh" }}
      className=' flex justify-center items-center mt-[70px] '
    >
      <div
        className='login w-[90%]  shadow border bg-white p-5 md:w-[60%]'
        style={{ borderRadius: "20px" }}
      >
        <div>
          <div className='text-center'>
            <h1 className='font-bold text-xl text-black'> تسجيل الدخول </h1>
          </div>
          <div className='w-[100%] my-7'>
            <h1 className='font-bold my-2 text-black'>
              ادخل رقم الهاتف او (الايميل ){" "}
            </h1>
            <Input
              style={{ border: "solid 2px #ccc" }}
              className='text-black'
              placeholder='ادخل الايميل '
              size='lg'
              value={mail}
              onChange={mailChange}
            />
            <h1 className='font-bold mt-5 mb-2 text-black'>ادخل كلمة السر </h1>
            <Input
              style={{ border: "solid 2px #ccc" }}
              className='text-black'
              type='password'
              placeholder='ادخل كلمة السر  '
              size='lg'
              value={pass}
              onChange={passChange}
            />
          </div>
        </div>
        <div className='my-5'>
          <Link to='/verify_code' className='text-blue-500'>
            هل نسيت كلمة السر ؟
          </Link>
        </div>

        <div className='text-center my-3'>
          <Button
            colorScheme='blue'
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
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Login;
