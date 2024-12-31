import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // استخدام useNavigate من react-router-dom
import SectionOne from "../../components/home/SectionOne";
import AllTeacher from "../../components/teacher/AllTeacher";
import UserType from "../../Hooks/auth/userType";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import HomeLogin from "../homeLogin/HomeLogin";

import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import Subject from "../../components/home/Subject";
import Footer from "../../components/home/Footer";

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
          <Subject />
        </div>
      )}
      <AllTeacher />
      <Footer />
      <ScrollToTop />
    </div>
  );
};
export default Home;
