import React from "react";
import img from "../../img/طالب 2.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SectionOne = () => {
  return (
    <section dir="rtl" className="flex mb-8 flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 relative overflow-hidden">
      
      {/* خلفية النقاط المتحركة */}
     

      {/* المحتوى النصي */}
      <div dir="rtl" className="max-w-lg text-right relative z-10">
        <h1 className="text-5xl font-bold leading-tight">ابدأ رحلتك التعليمية مع</h1>
        <h1 className="text-blue-500 text-4xl mt-5 font-extrabold">EM Online 🚀</h1>
        <p className="mt-4 font-medium">
          منصة <span className="font-bold text-blue-500">EM Online</span> هي الأولى في مصر والوطن العربي التي تعتمد على
          <span className="text-blue-500 font-bold"> الذكاء الاصطناعي </span>
          لتقديم تجربة تعليمية متطورة ومتميزة، مما يساعد الطلاب على التعلم بفعالية وكفاءة.
        </p>

        <div className="flex mt-6 justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/login">
              <img src="log in (1).png" className="h-[60px] w-[150px] rounded-md" alt="login" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/signup">
              <img src="signup2.png" className="h-[60px] w-[150px]  rounded-md" alt="signup" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* الصورة الجانبية */}
      <div className="relative mt-10 md:mt-0 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[420px] md:h-[420px] bg-blue-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <img
            src={img}
            alt="Hero Section"
            className="w-[260px] h-[260px] sm:w-[310px] sm:h-[310px] md:w-[360px] md:h-[360px] rounded-full border-4 border-gray-300 shadow-xl"
          />
        </motion.div>
      </div>

    </section>
  );
};

export default SectionOne;
