import React from "react";
import { motion } from "framer-motion";
import { useColorModeValue } from "@chakra-ui/react";
import {
  FaQuestionCircle,
  FaVideo,
  FaUniversity,
  FaBookOpen,
  FaStar,
} from "react-icons/fa";

const SectionThree = () => {
  const sectionBg = useColorModeValue("bg-slate-100", "bg-gray.800");
  const headingColor = useColorModeValue("text-slate-900", "text-gray.100");
  const subtextColor = useColorModeValue("text-slate-600", "text-gray.400");
  const cardBg = useColorModeValue("bg-white", "bg-gray.700");
  const cardBorder = useColorModeValue("border-slate-200", "border-gray-600");
  const cardBorderHover = useColorModeValue("hover:border-slate-300", "hover:border-gray-500");
  const reviewCountColor = useColorModeValue("text-slate-500", "text-gray-500");

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
    hidden: {},
  };

  const services = [
    {
      id: 1,
      title: "مسابقات يومية",
      description: "اختبر معلوماتك يوميًا عبر مسابقات تعليمية شيقة.",
      rating: 4.8,
      reviews: 250,
      icon: FaQuestionCircle,
      accent: "blue",
    },
    {
      id: 2,
      title: "محاضرات مسجلة",
      description: "محاضرات مسجلة متاحة في أي وقت من خبراء التعليم.",
      rating: 4.6,
      reviews: 180,
      icon: FaVideo,
      accent: "emerald",
    },
    {
      id: 3,
      title: "دورات للجامعات",
      description: "دورات متخصصة لمختلف التخصصات يقدمها أكاديميون محترفون.",
      rating: 4.9,
      reviews: 220,
      icon: FaUniversity,
      accent: "violet",
    },
    {
      id: 4,
      title: "مكتبة رقمية",
      description: "أكبر مكتبة إلكترونية تحتوي على آلاف الكتب والمراجع.",
      rating: 4.7,
      reviews: 190,
      icon: FaBookOpen,
      accent: "amber",
    },
  ];

  const accentClasses = {
    blue: "bg-blue-500/10 text-blue-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    violet: "bg-violet-500/10 text-violet-600",
    amber: "bg-amber-500/10 text-amber-600",
  };

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
            لماذا Next Edu؟
          </h2>
          <p className={`${subtextColor} text-lg max-w-xl mx-auto`}>
            خدمات مصممة لنجاحك مع تقييمات حقيقية من آلاف المستخدمين.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {services.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              className={`group relative p-6 rounded-2xl ${cardBg} border ${cardBorder} ${cardBorderHover} shadow-sm hover:shadow-xl transition-all duration-300`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${accentClasses[item.accent]} mb-4 transition-transform duration-300 group-hover:scale-105`}
              >
                <item.icon className="text-xl" />
              </div>
              <h3 className={`text-lg font-bold ${headingColor} mb-2`}>
                {item.title}
              </h3>
              <p className={`${subtextColor} text-sm leading-relaxed mb-4`}>
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-orange-500 font-semibold">
                  <FaStar className="text-orange-500" />
                  {item.rating}
                </span>
                <span className={reviewCountColor}>({item.reviews} تقييم)</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SectionThree;
