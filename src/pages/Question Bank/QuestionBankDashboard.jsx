import React, { useState } from "react";
import {
  Box,
  Flex,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Heading,
  HStack,
  Spacer,
  VStack
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa"; // أيقونة لفتح/إغلاق السايدبار في الجوال
import AddQuestionForm from "../../components/questionBank/AddQuestionForm";
import Sidebar from "../../components/questionBank/Slider";

// استيراد المكونات التي أنشأناها



const QuestionBankDashboard = () => {
  const [activeLink, setActiveLink] = useState("add-question"); // الحالة لتحديد الرابط النشط

  // Chakra UI hooks for drawer (mobile sidebar)
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ألوان الخلفية الرئيسية
  const mainBg = useColorModeValue("gray.50", "gray.800");
  const contentBg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("blue.600", "blue.800");
  const headerColor = useColorModeValue("white", "white");

  // دالة لتقديم المكون الصحيح بناءً على activeLink
  const renderContent = () => {
    switch (activeLink) {
      case "add-question":
        return <AddQuestionForm />;
  
      case "reports":
        return (
          <Box p={6} bg={contentBg} borderRadius="lg" shadow="md" w="full">
            <Heading as="h3" size="lg" mb={4} textAlign="center" color={useColorModeValue("gray.700", "gray.300")}>
              تقارير بنك الأسئلة
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.400")}>هنا ستعرض التقارير والتحليلات الخاصة بالأسئلة.</Text>
          </Box>
        );
      case "settings":
        return (
          <Box p={6} bg={contentBg} borderRadius="lg" shadow="md" w="full">
            <Heading as="h3" size="lg" mb={4} textAlign="center" color={useColorModeValue("gray.700", "gray.300")}>
              إعدادات لوحة التحكم
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.400")}>هنا ستتمكن من تعديل الإعدادات العامة للوحة التحكم.</Text>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Flex minH="100vh" bg={mainBg} dir="rtl">
      {/* Sidebar for Desktop */}
      <Box
        display={{ base: "none", md: "block" }} // يظهر فقط على الشاشات الكبيرة
        w="250px" // عرض الشريط الجانبي
        flexShrink={0} // يمنع الشريط الجانبي من الانكماش
        h="100vh" // ارتفاع كامل الشاشة
        position="sticky" // يجعله ثابتاً عند التمرير
        top="0"
      >
        <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} />
      </Box>

      {/* Main Content Area */}
      <VStack flex={1} p={{ base: 4, md: 8 }} spacing={8} alignItems="center">
        {/* Header for Mobile (or general dashboard header) */}
        <Flex
          w="full"
          bg={headerBg}
          color={headerColor}
          p={4}
          borderRadius="lg"
          alignItems="center"
          shadow="md"
          display={{ base: "flex", md: "none" }} // يظهر في الجوال فقط
        >
          <IconButton
            icon={<FaBars />}
            variant="ghost"
            aria-label="Open Sidebar"
            onClick={onOpen} // يفتح الدرج الجانبي
            color="white"
            mr={4}
          />
          <Heading size="md" fontFamily="'Tajawal', sans-serif">
            لوحة تحكم بنك الأسئلة
          </Heading>
        </Flex>

        {/* Content Rendered Based on Active Link */}
        <Box w="full" flex={1} p={{ base: 2, md: 4 }}>
          {renderContent()}
        </Box>
      </VStack>

      {/* Drawer for Mobile Sidebar */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={useColorModeValue("blue.700", "gray.900")}>
          <DrawerCloseButton color="white" />
          <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} onClose={onClose} isMobile />
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default QuestionBankDashboard;