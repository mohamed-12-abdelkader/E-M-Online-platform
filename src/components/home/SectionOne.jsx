import React from "react";

import { motion } from "framer-motion";
import img from "../../img/طالب 2.png";
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaGraduationCap } from "react-icons/fa";
import { Link } from "react-router-dom";

const SectionOne = () => {
  return (
    <section dir="rtl" className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 relative overflow-hidden">
      {/* الصورة مع الإحصائيات */}
   
      {/* المحتوى النصي والأزرار */}
      <div className="max-w-lg text-right relative z-10">
        <h1 className="text-xl font-bold">ابدأ رحلتك التعليمية مع</h1>
        <div className="mt-3">
          <h1 className="text-blue-500 text-4xl mt-5 font-extrabold">EM Online 🚀</h1>
        </div>
        <div className="my-5">
          <p className="mt-4 font-medium">
            منصة <span className="font-bold text-blue-500">EM Online</span> هي الأولى في مصر والوطن العربي التي تعتمد على
            <span className="text-blue-500 font-bold"> الذكاء الاصطناعي </span>
            لتقديم تجربة تعليمية متطورة ومتميزة، مما يساعد الطلاب على التعلم بفعالية وكفاءة.
          </p>
        </div>

        {/* زر واتساب */}
        <div className="flex my-10 justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/login">
       
                <img src="/log in (1).png" alt="login" className="rounded-md w-[150px] h-[60px]" />
       
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/signup">
      
                <img src="/signup2.png" alt="signup"  className="rounded-md w-[150px] h-[60px]" />
 
            </Link>
          </motion.div>
        </div>
      </div>
      <div className="relative flex flex-col items-center text-center md:text-right">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] bg-blue-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <img
            src={img}
            alt="Hero Section"
            layout="intrinsic"
       
            className="rounded-full border-4 border-gray-300 shadow-xl h-[360px] w-[360px]"
          />
        </motion.div>
        
        {/* الإحصائيات */}
        <div className="absolute top-0 left-0 p-2">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
            <FaUsers className="text-orange-500 text-xl" />
            <div>
              <p className="text-gray-700 font-bold">+10000</p>
              <p className="text-sm text-gray-500">  طالب مشترك معنا </p>
            </div>
          </div>
        </div>

        <div className="absolute top-10 right-0 p-2">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
            <FaChalkboardTeacher className="text-orange-500 text-xl" />
            <div>
              <p className="text-gray-700 font-bold">+200</p>
              <p className="text-sm text-gray-500">محاضر محترف</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 p-2">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
            <FaBookOpen className="text-orange-500 text-xl" />
            <div>
              <p className="text-gray-700 font-bold">+20000</p>
              <p className="text-sm text-gray-500">درس في كل المواد</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 p-2">
          <div className="bg-white p-3 rounded-lg shadow-lg flex items-center gap-2">
            <FaGraduationCap className="text-orange-500 text-xl" />
            <div>
              <p className="text-gray-700 font-bold">+480</p>
              <p className="text-sm text-gray-500">كورس تدريبي</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default SectionOne;
