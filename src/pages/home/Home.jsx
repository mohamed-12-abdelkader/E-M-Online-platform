import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // استخدام useNavigate من react-router-dom
import SectionOne from "../../components/home/SectionOne";;
import UserType from "../../Hooks/auth/userType";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import HomeLogin from "../homeLogin/HomeLogin";
import Footer from "../../components/home/Footer";
import SectionTwo from "../../components/home/SectionTwo";
import SectionThree from "../../components/home/SectionThree";

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
          <SectionTwo/>
          <SectionThree/>
        </div>
      )}
   
      <Footer />
      <ScrollToTop />
    </div>
  );
};
export default Home;
