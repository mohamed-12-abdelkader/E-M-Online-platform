import React from "react";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaGraduationCap,
  FaRocket,
  FaArrowLeft,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Text, Box, VStack, Icon, useColorModeValue } from "@chakra-ui/react";
import { FiUser, FiLogIn, FiBookOpen } from "react-icons/fi";

const SectionOne = () => {
  const navigate = useNavigate();
  const fadeInUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const brandOrange = useColorModeValue("orange.300", "orange.400");
  const hintBg = useColorModeValue("blue.50", "blue.900");
  const hintBorder = useColorModeValue("blue.200", "blue.800");
  const hintText = useColorModeValue("blue.700", "blue.200");
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-stretch">
          {/* النص الرئيسي */}
          <motion.div
            className="max-w-xl"
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.25] tracking-tight mb-4"
              style={{ fontFamily: "'Changa', sans-serif" }}
            >
              <span className="text-white dark:text-blue-50 dark:[text-shadow:0_0_32px_rgba(255,255,255,0.2)]">
                اصنع مستقبلك في{" "}
              </span>
              <span dir="ltr" className="inline-block me-3 sm:me-4 text-white ">
                <span className="text-white dark:text-blue-500">Next</span>
                <Text
                  as="span"
                  color={brandOrange}
                  mx={1}
                  className="dark:!text-orange-300 dark:drop-shadow-[0_0_18px_rgba(251,146,60,0.55)]"
                  fontWeight="extrabold"
                >
                  Edu
                </Text>
                <span className="text-white dark:text-blue-500">School</span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-blue-50 dark:text-slate-400 leading-relaxed max-w-xl mb-6"
            >
              تجربة تعليمية تجمع التكنولوجيا الحديثة والمحتوى المتميز. انضم
              لآلاف الطلاب الذين يحققون أهدافهم مع Next Education.
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

          {/* بطاقة الترحيب (مثل WelcomePage) — أقصى الشمال + glow في الدارك */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center lg:justify-end lg:justify-self-end"
          >
            <Box
              bg="white"
              _dark={{
                bg: "gray.800",
                borderColor: "whiteAlpha.200",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.06), 0 0 32px rgba(59, 130, 246, 0.35), 0 0 64px rgba(59, 130, 246, 0.2), 0 25px 50px rgba(0,0,0,0.4)",
              }}
              borderRadius="2xl"
              p={{ base: 6, md: 8 }}
              boxShadow="0 25px 50px rgba(0,0,0,0.12)"
              borderWidth="1px"
              borderColor="whiteAlpha.400"
              maxW="400px"
              w="full"
            >
              <VStack spacing={6} align="stretch">
                <VStack spacing={2} align="center">
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="gray.800"
                    _dark={{ color: "white" }}
                  >
                    مرحباً بك في Next Edu
                  </Text>
                </VStack>

                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color="gray.800"
                  _dark={{ color: "white" }}
                >
                  هل لديك حساب من قبل؟
                </Text>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-base transition-colors shadow-lg"
                >
                  <Icon as={FiLogIn} w="5" h="5" />
                  نعم، لدي حساب - تسجيل الدخول
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/signup")}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-base transition-colors shadow-lg"
                >
                  <Icon as={FiUser} w="5" h="5" />
                  لا، أنا جديد - إنشاء حساب
                </motion.button>

                <Box
                  bg={hintBg}
                  borderRadius="xl"
                  p={3}
                  borderWidth="1px"
                  borderColor={hintBorder}
                >
                  <Text fontSize="xs" color={hintText} textAlign="center">
                    💡 غير متأكد؟ جرّب "تسجيل الدخول" أولاً. إن لم يكن لديك حساب
                    سنوجهك لإنشاء حساب جديد.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </motion.div>
        </div>

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
