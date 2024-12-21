import { Button, Input, Spinner } from "@chakra-ui/react";

import { Link } from "react-router-dom";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

import LoginTeacher from "../../Hooks/teacher/login";

const TeacherLogin = () => {
  const [
    handleLogin,
    passChange,
    mailChange,
    mail,
    pass,
    userType,
    setUserType,
    loading,
  ] = LoginTeacher();
  return (
    <div
      style={{ minHeight: "90vh" }}
      className='login_page flex justify-center items-center mt-[70px] '
    >
      <div
        className='login w-[90%]  shadow border bg-white p-5 md:w-[60%]'
        style={{ borderRadius: "20px" }}
      >
        <div className='text-black'>
          <div className='text-center'>
            <h1 className='font-bold text-xl text-black'> تسجيل الدخول </h1>
          </div>
          <div className='w-[100%] my-7'>
            <h1 className='font-bold my-2 text-black'>ادخل الايميل </h1>
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
      </div>
      <ScrollToTop />
    </div>
  );
};

export default TeacherLogin;
