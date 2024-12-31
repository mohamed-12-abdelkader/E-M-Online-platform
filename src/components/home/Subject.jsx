import React from "react";
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
const Subject = () => {
  const subjects = [
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
      <div className='py-10 px-5 '>
        <h1 className='text-center text-2xl font-bold mb-8'>المواد الدراسية</h1>
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
  );
};

export default Subject;
