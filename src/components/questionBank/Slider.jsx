import React from "react";
import {
  Box,
  VStack,
  Text,
  Icon,
  Link as ChakraLink,
  useColorModeValue,
  Flex,
  Heading,
  Image,
} from "@chakra-ui/react";
import { FaPlusSquare, FaListAlt, FaTags, FaChartBar, FaCog } from "react-icons/fa"; // إضافة أيقونات
import { Link as ReactRouterLink } from "react-router-dom"; // إذا كنت تستخدم React Router

const Sidebar = ({ activeLink, setActiveLink, onClose, isMobile }) => {
  const sidebarBg = useColorModeValue("blue.700", "gray.900"); // أزرق غامق في الفاتح، أغمق في الداكن
  const linkColor = useColorModeValue("blue.100", "gray.200");
  const activeLinkBg = useColorModeValue("blue.600", "blue.700"); // خلفية زرقاء نشطة
  const activeLinkColor = useColorModeValue("white", "white");
  const hoverLinkBg = useColorModeValue("blue.600", "blue.800");

  const navItems = [
    { id: "add-question", label: "إضافة سؤال", icon: FaPlusSquare },
    { id: "manage-questions", label: "إدارة الأسئلة", icon: FaListAlt },
    { id: "manage-categories", label: "إدارة التصنيفات", icon: FaTags },
    { id: "reports", label: "التقارير", icon: FaChartBar },
    { id: "settings", label: "الإعدادات", icon: FaCog },
  ];

  return (
    <VStack
      as="nav"
      spacing={4}
      align="stretch"
      bg={sidebarBg}
      color={linkColor}
      p={4}
      h="full"
      borderLeftRadius={{ base: "none", md: "xl" }} // حواف مستديرة على الجانب الأيسر
      boxShadow="lg"
    >
      <Flex direction="column" alignItems="center" mb={6} mt={2}>
        <Image src="https://via.placeholder.com/60/FFFFFF/000000?text=QB" alt="Logo" borderRadius="full" mb={2} />
        <Heading size="md" color="white" fontFamily="'Tajawal', sans-serif" textAlign="center">
          بنك الأسئلة
        </Heading>
      </Flex>

      {navItems.map((item) => (
        <ChakraLink
          key={item.id}
          // as={ReactRouterLink} to={`/dashboard/${item.id}`} // إذا كنت تستخدم React Router
          onClick={() => {
            setActiveLink(item.id);
            if (isMobile && onClose) onClose(); // إغلاق السايدبار في الجوال بعد الاختيار
          }}
          p={3}
          borderRadius="md"
          _hover={{ bg: hoverLinkBg }}
          bg={activeLink === item.id ? activeLinkBg : "transparent"}
          color={activeLink === item.id ? activeLinkColor : linkColor}
          fontWeight={activeLink === item.id ? "bold" : "normal"}
          display="flex"
          alignItems="center"
          justifyContent="flex-end" // محاذاة لليمين للنص والأيقونة
        >
          <Text mr={3}>{item.label}</Text>
          <Icon as={item.icon} boxSize={5} />
        </ChakraLink>
      ))}
    </VStack>
  );
};

export default Sidebar;