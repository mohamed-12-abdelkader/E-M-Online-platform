import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // استخدام useNavigate من react-router-dom
import SectionOne from "../../components/home/SectionOne";
import SectionTwo from "../../components/home/SectionTwo";
import SectionThree from "../../components/home/SectionThree";
import SectionFour from "../../components/home/SectionFour";
import AllTeacher from "../../components/teacher/AllTeacher";
import UserType from "../../Hooks/auth/userType";
import LoginHome from "../../components/home/LoginHome";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

import HomeLogin from "../homeLogin/HomeLogin";

const Home = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  const navigate = useNavigate(); // استخدام useNavigate للتوجيه

  useEffect(() => {
    if (userData) {
      navigate("/home"); // التوجيه إلى صفحة /home
    }
  }, [userData, navigate]); // التأكد من تنفيذ useEffect عند تغيير userData

  return (
    <div>
      {userData ? (
        <div>
          <HomeLogin />
        </div>
      ) : (
        <div>
          <SectionOne />
          <SectionTwo />
          <SectionFour />
          <AllTeacher />
        </div>
      )}
      <ScrollToTop />
    </div>
  );
};

export default Home;
