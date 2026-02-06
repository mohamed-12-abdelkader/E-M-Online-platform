import React from "react";
import { motion } from "framer-motion";
import { useColorModeValue } from "@chakra-ui/react";
import { FaGraduationCap, FaUserTie, FaRocket } from "react-icons/fa";

const AboutUsSection = () => {
  const sectionBg = useColorModeValue("bg-white", "bg-gray.900");
  const headingColor = useColorModeValue("text-slate-900", "text-gray.100");
  const subheadingColor = useColorModeValue("text-slate-600", "text-gray.400");
  const textColor = useColorModeValue("text-slate-600", "text-gray.400");
  const textBoldColor = useColorModeValue("text-slate-800", "text-gray.200");
  const accentColor = useColorModeValue("text-orange-500", "text-orange-400");
  const accentBg = useColorModeValue("bg-orange-500/10", "bg-orange-500/20");
  const accentIconColor = useColorModeValue("text-orange-600", "text-orange-400");
  const logoBoxBg = useColorModeValue("bg-slate-50/80", "bg-gray-800/80");
  const logoBoxBorder = useColorModeValue("border-slate-100", "border-gray-700");
  const ctaColor = useColorModeValue("text-slate-700", "text-gray.300");

  const fadeInLeft = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const fadeInRight = {
    hidden: { opacity: 0, x: 24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const points = [
    {
      icon: FaGraduationCap,
      text: "تمكين الطلاب من تحقيق أحلامهم الأكاديمية بكل يسر وسلاسة.",
    },
    {
      icon: FaUserTie,
      text: "سواء طالب مدرسة أو جامعي أو محترف يطوّر مهاراته — منصتنا تلبي احتياجاتك.",
    },
  ];

  return (
    <section
      dir="rtl"
      className={`relative py-20 sm:py-24 ${sectionBg}`}
      style={{ fontFamily: "'Changa', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            className="relative order-2 lg:order-1 flex items-center justify-center"
            variants={fadeInRight}
            initial="hidden"
            animate="visible"
          >
            <div className={`relative rounded-2xl overflow-hidden ${logoBoxBg} ${logoBoxBorder} p-8 flex items-center justify-center min-h-[320px] max-h-[420px] w-full shadow-xl border`}>
              <img
                src="/next%20logo.png"
                alt="NextEdu School - شعار منصة التعليم"
                className="w-full max-w-[320px] h-auto object-contain object-center"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="order-1 lg:order-2"
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
          >
            <div className={`inline-flex items-center gap-2 ${accentColor} font-semibold text-sm mb-4`}>
              <FaRocket className="text-base" />
              <span>من نحن</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold ${headingColor} mb-6 leading-tight`}>
              Next Edu
              <span className={`block ${subheadingColor} text-2xl sm:text-3xl font-medium mt-1`}>
                منصتك للتعلم الذكي
              </span>
            </h2>
            <p className={`${textColor} text-lg leading-relaxed mb-6`}>
              منصة{" "}
              <span className={`font-semibold ${textBoldColor}`}>Next Edu</span>{" "}
              وجهتك للتعلم الإلكتروني بطريقة مبتكرة وسهلة. نقدّم تجربة تعليمية
              متكاملة تجمع المحتوى المتميز والتقنيات الحديثة.
            </p>
            <ul className="space-y-4 mb-8">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3 items-start">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center ${accentIconColor}`}>
                    <Icon className="text-lg" />
                  </span>
                  <span className={`${textColor} leading-relaxed pt-1`}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <p className={`${ctaColor} font-medium`}>
              انضم إلينا اليوم وابدأ رحلتك نحو النجاح.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
