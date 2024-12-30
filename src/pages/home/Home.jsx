import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // استخدام useNavigate من react-router-dom
import SectionOne from "../../components/home/SectionOne";
import SectionTwo from "../../components/home/SectionTwo";
import SectionFour from "../../components/home/SectionFour";
import AllTeacher from "../../components/teacher/AllTeacher";
import UserType from "../../Hooks/auth/userType";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import HomeLogin from "../homeLogin/HomeLogin";
import {
  FaCalculator,
  FaFlask,
  FaBook,
  FaLanguage,
  FaGlobe,
  FaAtom,
  FaLandmark,
  FaLightbulb,
  FaBrain,
  FaLeaf,
  FaChartBar,
} from "react-icons/fa";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";

const Home = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  const navigate = useNavigate(); // استخدام useNavigate للتوجيه

  useEffect(() => {
    if (userData) {
      navigate("/home"); // التوجيه إلى صفحة /home
    }
  }, [userData, navigate]); // التأكد من تنفيذ useEffect عند تغيير userData
  const subjects = [
    {
      name: "الرياضيات",
      icon: <FaCalculator className='text-4xl text-blue-500' />, // آلة حاسبة
    },
    {
      name: "الكيمياء",
      icon: <FaFlask className='text-4xl text-red-500' />, // أنبوب اختبار
    },
    {
      name: "الفيزياء",
      icon: <FaAtom className='text-4xl text-purple-500' />, // ذرة
    },
    {
      name: "اللغة العربية",
      icon: <FaBook className='text-4xl text-green-500' />, // كتاب
    },
    {
      name: "اللغة الإنجليزية",
      icon: <FaLanguage className='text-4xl text-yellow-500' />, // لغة
    },
    {
      name: "اللغة الفرنسية",
      icon: <FaLanguage className='text-4xl text-yellow-500' />, // لغة (نفس أيقونة الإنجليزية)
    },
    {
      name: "الجغرافيا",
      icon: <FaGlobe className='text-4xl text-orange-500' />, // كرة أرضية
    },
    {
      name: "التاريخ",
      icon: <FaLandmark className='text-4xl text-brown-500' />, // معلم أثري
    },
    {
      name: "الفلسفة",
      icon: <FaLightbulb className='text-4xl text-yellow-500' />, // مصباح أفكار
    },
    {
      name: "علم النفس",
      icon: <FaBrain className='text-4xl text-pink-500' />, // عقل
    },
    {
      name: "الأحياء",
      icon: <FaLeaf className='text-4xl text-green-500' />, // ورقة شجرة
    },
    {
      name: "الإحصاء",
      icon: <FaChartBar className='text-4xl text-blue-500' />, // رسم بياني
    },
  ];

  return (
    <div>
      {userData ? (
        <div>
          <HomeLogin />
        </div>
      ) : (
        <div>
          <SectionOne />

          <div className='py-10 px-5 '>
            <h1 className='text-center text-2xl font-bold mb-8'>
              المواد الدراسية
            </h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl m-auto'>
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  style={{ border: "2px white solid" }}
                  className='flex flex-col items-center justify-center p-5 shadow-lg rounded-lg  hover:shadow-2xl transition duration-300'
                >
                  <div className='mb-4'>{subject.icon}</div>
                  <h2 className='text-lg font-semibold'>{subject.name}</h2>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <AllTeacher />(
      <div className='h-[300px] w-[100%] bg-[#03a9f5] flex flex-col justify-center items-center text-white'>
        {/* الجملة التعليمية */}
        <h1 className='text-2xl font-bold mb-4'>
          مرحبًا بك في مجتمع <span className='text-[#ff5722]'>E-M Online</span>{" "}
          التعليمي، حيث يبدأ طريقك نحو النجاح!
        </h1>

        {/* روابط وسائل التواصل الاجتماعي */}
        <div className='flex   '>
          <a
            href='https://www.facebook.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-3xl hover:text-gray-200 mx-2'
          >
            <FaFacebook />
          </a>
          <a
            href='https://www.youtube.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-3xl hover:text-gray-200 mx-2'
          >
            <FaYoutube />
          </a>
          <a
            href='https://www.tiktok.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-3xl hover:text-gray-200'
          >
            <FaTiktok />
          </a>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};
export default Home;
