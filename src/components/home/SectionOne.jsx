import React from "react";
import { motion, useInView } from "framer-motion";
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaBookOpen, 
  FaGraduationCap, 
  FaRocket, 
  FaBrain,
  FaStar,
  FaArrowLeft,
  FaCheckCircle,
  FaTrophy,
  FaLightbulb
} from "react-icons/fa";
import { Link } from "react-router-dom";

const SectionOne = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // تأثيرات الحركة
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const floatAnimation = {
    animate: { 
      y: [0, -20, 0], 
      rotate: [0, 5, -5, 0],
    },
    transition: { 
      repeat: Infinity, 
      duration: 6, 
      ease: "easeInOut" 
    },
  };

  const stats = [
    { icon: FaUsers, number: "50K+", label: "طالب نشط", bgColor: "bg-blue-500" },
    { icon: FaChalkboardTeacher, number: "500+", label: "محاضر محترف", bgColor: "bg-blue-400" },
    { icon: FaBookOpen, number: "1000+", label: "كورس متاح", bgColor: "bg-orange-400" },
    { icon: FaGraduationCap, number: "98%", label: "معدل الرضا", bgColor: "bg-blue-500" },
  ];

  const features = [
    { icon: FaBrain, text: "تعلم ذكي بالذكاء الاصطناعي" },
    { icon: FaStar, text: "محاضرون محترفون معتمدون" },
    { icon: FaTrophy, text: "شهادات معتمدة ومعترف بها" },
    { icon: FaLightbulb, text: "محتوى تعليمي متطور ومحدث" },
  ];

  return (
    <section
      dir="rtl"
      className="relative  flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600"
      style={{ fontFamily: "'Changa', sans-serif" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient circles - Blue */}
        <motion.div
          className="absolute top-20   bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg: py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <motion.div
            className="space-y-8 text-white"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "visible"}
            ref={ref}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <FaRocket className="text-orange-400" />
              <span className="text-sm font-semibold">منصة التعليم الرائدة في مصر والوطن العربي</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            >
              اكتشف مستقبل التعليم مع{" "}
              <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                EM Academy
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-blue-50 leading-relaxed max-w-xl"
            >
              انضم إلى آلاف الطلاب الذين يطورون مهاراتهم ويحققون أهدافهم التعليمية من خلال 
              <span className="font-bold text-orange-400"> منصة EM Academy</span> المتطورة. 
              نقدم لك تجربة تعليمية فريدة تجمع بين 
              <span className="font-bold text-orange-400"> التكنولوجيا الحديثة</span> و
              <span className="font-bold text-orange-400"> المحتوى التعليمي المتميز</span> لضمان نجاحك.
            </motion.p>

            {/* Features List */}
 

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  <span>سجل الدخول</span>
                  <FaArrowLeft />
                </motion.button>
              </Link>
              <Link to="/welcome">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <span>ابدأ رحلتك الآن</span>
                  <FaRocket />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Image and Stats */}
          <motion.div
            className="relative"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Main Image */}
            <motion.div
              className="relative"
              {...floatAnimation}
            >
              <div className="relative z-10">
                        <motion.div variants={fadeInUp} className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                style={{border:"3px solid white"}}
                  key={index}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5, bg: "white/15" }}
                >
                  <div className="bg-orange-400 p-2 rounded-lg">
                    <feature.icon className="text-white text-lg" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
              </div>

              {/* Floating stats cards */}
             
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
      
      </div>

      {/* Scroll indicator */}
     
    </section>
  );
};

export default SectionOne;