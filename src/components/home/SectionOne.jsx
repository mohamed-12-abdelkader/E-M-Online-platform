import React from "react";
import { motion, useInView } from "framer-motion";
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaGraduationCap } from "react-icons/fa";
import { Link } from "react-router-dom";

const SectionOne = () => {
  const { ref, inView } = useInView({
    triggerOnce: true, // التأثيرات تحدث مرة واحدة فقط
   threshold: 0.1, // تقليل الحد الأدنى للظهور لضمان التفعيل
  });

  // تأثيرات الحركة للدخول
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const floatAnimation = {
    animate: { y: [0, -10, 0], scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
  };

  return (
    <div className="bg-gradient-to-b from-blue-500 to-blue-300">


    <section
      dir="rtl"
      className="relative flex flex-col md:flex-row items-center  justify-between px-6 md:px-12 py-16 md:py-24 bg-gradient-to-br from-white via-blue-50 to-blue-400 overflow-hidden"
      style={{
        fontFamily: "'Changa', sans-serif",
        minHeight: "600px",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* المحتوى النصي والأزرار */}
      <motion.div
        className="max-w-lg text-right relative z-20 space-y-8" // z-20 لضمان ظهور النصوص والأزرار
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "visible"} // ضمان الظهور حتى لو لم يتم تفعيل inView
        ref={ref}
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl text-white sm:text-5xl font-bold text-gray-900"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          ابدأ رحلتك التعليمية مع
          <span
            className="text-orange-500 font-extrabold"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {" "}
            EM Academy
          </span>
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-lg text-white md:text-xl text-gray-600 leading-relaxed"
        >
          منصة <span  style={{ fontFamily: "'Amiri', serif" }} className="font-bold text-orange-500">EM Academy</span> هي الأولى في مصر والوطن
          العربي التي تعتمد على
          <span className="text-orange-500 font-bold"> الذكاء الاصطناعي </span>
          لتقديم تجربة تعليمية متطورة ومتميزة، مما يساعد الطلاب على التعلم بفعالية وكفاءة.
        </motion.p>
      <div className="flex my-10 justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/login">
              <img src="/log in (1).png" alt="login" className="rounded-md w-[150px] h-[60px]" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/welcome">
              <img src="/signup2.png" alt="signup" className="rounded-md w-[150px] h-[60px]" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* الصورة مع الإحصائيات */}
      <motion.div
        className="relative flex flex-col items-center text-center md:text-right mt-12 md:mt-0 z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible" // ضمان ظهور الصورة والإحصائيات دائمًا
      >
        <motion.div
          {...floatAnimation}
          className="relative w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
          >
          <img
            src="/طالب 2.png"
            alt="Hero Student"
            className="rounded-full border-4 border-white shadow-xl w-[260px] sm:w-[340px] h-[260px] sm:h-[380px] object-cover"
          />
        </motion.div>

        {/* الإحصائيات */}
        
      </motion.div>
    </section>
          </div>
  );
};

export default SectionOne;