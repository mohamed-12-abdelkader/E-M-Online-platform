import React from "react";
import { motion } from "framer-motion";
import { useColorModeValue } from "@chakra-ui/react";
import { FaTrophy, FaBook, FaRobot, FaChalkboardTeacher } from "react-icons/fa";

const SectionTwo = () => {
  const sectionBg = useColorModeValue("bg-slate-50", "bg-gray.900");
  const headingColor = useColorModeValue("text-slate-900", "text-gray.100");
  const subtextColor = useColorModeValue("text-slate-600", "text-gray.400");
  const cardBg = useColorModeValue("bg-white", "bg-gray.800");
  const cardBorder = useColorModeValue("border-slate-200/80", "border-gray.700");
  const cardBorderHover = useColorModeValue("hover:border-slate-300/80", "hover:border-gray-600");

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    hidden: {},
  };

  const features = [
    {
      id: 1,
      name: "مسابقات يومية",
      description: "اختبر مهاراتك يوميًا من خلال تحديات تعليمية ممتعة.",
      icon: FaTrophy,
      color: "bg-violet-500",
      light: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      id: 2,
      name: "امتحانات شهرية",
      description: "قيّم مستواك عبر امتحانات شهرية متخصصة ومنظمة.",
      icon: FaBook,
      color: "bg-blue-500",
      light: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      id: 3,
      name: "ذكاء اصطناعي",
      description: "استفد من أحدث تقنيات الذكاء الاصطناعي في التعلم.",
      icon: FaRobot,
      color: "bg-emerald-500",
      light: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      id: 4,
      name: "أقوى المحاضرين",
      description: "تعلم من نخبة المحاضرين المتخصصين في مختلف المجالات.",
      icon: FaChalkboardTeacher,
      color: "bg-amber-500",
      light: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <section
      dir="rtl"
      className={`relative py-20 sm:py-24 ${sectionBg}`}
      style={{ fontFamily: "'Changa', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-3xl sm:text-4xl font-bold ${headingColor} mb-3`}>
            خدماتنا التعليمية
          </h2>
          <p className={`${subtextColor} text-lg max-w-xl mx-auto`}>
            اكتشف أفضل الدورات والدروس مع خبراء التعليم.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {features.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              className={`group relative p-6 rounded-2xl ${cardBg} border ${cardBorder} ${cardBorderHover} shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.light} ${item.iconColor} mb-4 transition-transform duration-300 group-hover:scale-105`}
              >
                <item.icon className="text-xl" />
              </div>
              <h3 className={`text-lg font-bold ${headingColor} mb-2`}>
                {item.name}
              </h3>
              <p className={`${subtextColor} text-sm leading-relaxed`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SectionTwo;
