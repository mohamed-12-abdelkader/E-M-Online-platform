import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaHandshake, // التعاون
  FaDollarSign, // الدخل
  FaUsers, // الوصول لطلاب أكثر
  FaLaptopHouse, // المرونة
  FaChartLine, // النمو المهني
  FaLightbulb, // أدوات مبتكرة
  FaGlobe, // وصول عالمي
  FaStar, // تقييمات عالية
} from "react-icons/fa";

const MotionBox = motion(Box);

// بيانات الفوائد
const benefitsData = [
  {
    icon: FaHandshake,
    title: "شراكة قوية ودعم مستمر",
    description: "نقدم لك الدعم الفني والتعليمي اللازم لضمان نجاحك وتقديم أفضل تجربة لطلابك.",
  },
  {
    icon: FaDollarSign,
    title: "دخل إضافي ومجزي",
    description: "احصل على دخل تنافسي ومجزي يتناسب مع خبرتك وجهدك، مع نظام شفاف للمكافآت.",
  },
  {
    icon: FaUsers,
    title: "وصول لآلاف الطلاب",
    description: "انضم إلى مجتمعنا الكبير ووصل لعدد هائل من الطلاب من مختلف أنحاء العالم العربي.",
  },
  {
    icon: FaLaptopHouse,
    title: "مرونة كاملة في العمل",
    description: "حدد ساعات عملك وجدولك الخاص بما يتناسب مع حياتك الشخصية والمهنية.",
  },
  {
    icon: FaChartLine,
    title: "نمو مهني وتطوير مستمر",
    description: "وفر لك فرص التدريب وورش العمل لتطوير مهاراتك التعليمية والتقنية باستمرار.",
  },
  {
    icon: FaLightbulb,
    title: "أدوات تعليمية مبتكرة",
    description: "استخدم أحدث الأدوات والتقنيات التعليمية التفاعلية لجعل دروسك أكثر جاذبية وفعالية.",
  },
  {
    icon: FaGlobe,
    title: "تأثير عالمي",
    description: "ساهم في نشر المعرفة واللغة العربية لجمهور أوسع، وكن جزءًا من مجتمع تعليمي عالمي.",
  },
  {
    icon: FaStar,
    title: "بناء سمعة ممتازة",
    description: "احصل على تقييمات إيجابية من الطلاب المتميزين وعزز مكانتك كمعلم رائد.",
  },
];

const WhyWorkWithUsSection = () => {
  // الألوان المتكيفة مع الوضع الفاتح والداكن
  const sectionBg = useColorModeValue("blue.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("blue.800", "blue.100");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("blue.200", "gray.600");
  const iconColor = useColorModeValue("blue.500", "blue.300");

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <VStack
      spacing={12}
      align="center"
      py={20}
      px={{ base: 6, md: 12 }}
      bg={sectionBg}
      dir="rtl"
      fontFamily="'Cairo', sans-serif"
    >
      <MotionBox
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        textAlign="center"
      >
        <Heading
          as="h2"
          size={{ base: "xl", md: "2xl", lg: "3xl" }}
          fontWeight="extrabold"
          color={headingColor}
          mb={4}
        >
          لماذا تختار العمل معنا كمعلم؟
        </Heading>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          color={textColor}
          maxW="3xl"
          mx="auto"
        >
          نحن نؤمن بأن نجاحك هو نجاحنا. انضم إلينا واستفد من بيئة تعليمية داعمة ومبتكرة.
        </Text>
      </MotionBox>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        spacing={8}
        width="full"
        maxW="7xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {benefitsData.map((benefit, index) => (
          <MotionBox
            key={index}
            variants={itemVariants}
            p={6}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
            height="full"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start" // Align items to the top
            _hover={{ transform: "translateY(-8px)", boxShadow: "2xl" }}
            transition="all 0.3s ease-in-out"
          >
            <Icon as={benefit.icon} w={14} h={14} color={iconColor} mb={4} />
            <Heading size="md" fontWeight="bold" color={headingColor} mb={2}>
              {benefit.title}
            </Heading>
            <Text fontSize="md" color={subTextColor}>
              {benefit.description}
            </Text>
          </MotionBox>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default WhyWorkWithUsSection;
