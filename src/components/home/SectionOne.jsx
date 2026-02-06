import React from "react";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaGraduationCap,
  FaRocket,
  FaArrowLeft,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Text, useColorModeValue } from "@chakra-ui/react";

const SectionOne = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const brandOrange = useColorModeValue("orange.300", "orange.400");
  const stagger = {
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
    hidden: {},
  };

  const stats = [
    { icon: FaChalkboardTeacher, value: "500+", label: "محاضر" },
    { icon: FaBookOpen, value: "1000+", label: "كورس" },
    { icon: FaGraduationCap, value: "98%", label: "رضا" },
  ];

  return (
    <section
      dir="rtl"
      className="relative min-h-[68vh] sm:min-h-[65vh] flex items-center overflow-hidden bg-blue-500 dark:bg-slate-900"
      style={{ fontFamily: "'Changa', sans-serif" }}
    >
      {/* Light: blue gradient | Dark: subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.2),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <motion.div
          className="max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 dark:bg-white/5 border border-white/25 dark:border-white/10 text-white/95 dark:text-slate-300 text-xs font-medium mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            منصة التعليم الرائدة
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight mb-4"
          >
            اصنع مستقبلك في Next
            <Text as="span" color={brandOrange} mx={1}>
              Edu
            </Text>
            School
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-blue-50 dark:text-slate-400 leading-relaxed max-w-xl mb-6"
          >
            تجربة تعليمية تجمع التكنولوجيا الحديثة والمحتوى المتميز. انضم لآلاف
            الطلاب الذين يحققون أهدافهم مع Next Education.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors dark:bg-orange-500 dark:hover:bg-orange-400"
              >
                <span>تسجيل الدخول</span>
                <FaArrowLeft className="text-xs" />
              </motion.button>
            </Link>
            <Link to="/welcome">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/15 text-white font-semibold text-sm border border-white/30 dark:border-white/20 transition-colors"
              >
                <span>ابدأ رحلتك</span>
                <FaRocket className="text-xs" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats bar — مدمج ومختصر */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 pt-6 border-t border-white/20 dark:border-white/10"
        >
          <div className="flex flex-wrap gap-8 sm:gap-12">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <Icon className="text-orange-400 dark:text-orange-500 text-lg" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-blue-100 dark:text-slate-500">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionOne;
