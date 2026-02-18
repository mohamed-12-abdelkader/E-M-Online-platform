import React, { useState, useMemo } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Avatar,
  useBreakpointValue,
  Container,
  Badge,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  MdDashboard,
  MdLiveTv,
  MdForum,
  MdPeople,
  MdPublic,
  MdInventory,
  MdAssignment,
  MdLibraryBooks,
  MdEmojiEvents,
  MdLeaderboard,
  MdDateRange,
  MdQuiz,
  MdVideoLibrary,
  MdQuestionAnswer,
  MdEventAvailable,
  MdGrading,
  MdBook,
  MdSearch,
  MdClose,
  MdSupportAgent,
  MdVpnKey,
} from "react-icons/md";
import { FaCrown, FaArrowLeft, FaChevronLeft } from "react-icons/fa";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

// Motion Components for animations
const MotionBox = motion(Box);

// Admin Links Data - from Links.jsx
const adminLinks = [
  { to: "/streams", Icon: MdLiveTv, label: "البث المباشر" },
  { to: "/admin/management", Icon: MdDashboard, label: "لوحة التحكم" },
  { to: "/teamChat", Icon: MdForum, label: "دردشة الفريق" },
  { to: "/all_students", Icon: MdPeople, label: "كل الطلاب" },
  { to: "/social", Icon: MdPublic, label: "EM Social" },
  { to: "/packages-management", Icon: MdInventory, label: "إدارة الباقات" },
  { to: "/tasks", Icon: MdAssignment, label: "المهام" },
  {
    to: "/question-bank-dashboard",
    Icon: MdLibraryBooks,
    label: "لوحة تحكم بنك الأسئلة",
  },
  { to: "/create_comp", Icon: MdEmojiEvents, label: "إنشاء مسابقة" },
  { to: "/allComps", Icon: MdLeaderboard, label: "عرض المسابقات" },
  { to: "/create_exam", Icon: MdDateRange, label: "إنشاء امتحان شهري" },
  { to: "/add_sub_exam", Icon: MdQuiz, label: "إنشاء امتحان المادة" },
  {
    to: "/add_video_exam",
    Icon: MdVideoLibrary,
    label: "إضافة فيديو للامتحان",
  },
  {
    to: "/add_sup_questions",
    Icon: MdQuestionAnswer,
    label: "إضافة أسئلة للامتحان",
  },
  { to: "/view_exams", Icon: MdEventAvailable, label: "عرض الامتحانات" },
  { to: "/show_grades", Icon: MdGrading, label: "عرض درجات الامتحان" },
  { to: "/leagues", Icon: MdLeaderboard, label: "إدارة الدوريات" },
  { to: "/general-courses", Icon: MdBook, label: "إدارة الكورسات العامة" },
  { to: "/support-chat", Icon: MdSupportAgent, label: "شات الدعم الفني" },
  { to: "/activation-codes", Icon: MdVpnKey, label: "إدارة أكواد التفعيل" },
];

// ألوان البراند: أزرق وبنفسجي وبرتقالي (من index.css)
const brandSchemes = [
  {
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    icon: "white",
    glow: "rgba(102, 126, 234, 0.35)",
    bar: "linear-gradient(90deg, #667eea, #764ba2)",
  },
  {
    bg: "linear-gradient(135deg, #4299E1 0%, #3182CE 100%)",
    icon: "white",
    glow: "rgba(66, 153, 225, 0.35)",
    bar: "linear-gradient(90deg, #4299E1, #3182CE)",
  },
  {
    bg: "linear-gradient(135deg, #DD6B20 0%, #C05621 100%)",
    icon: "white",
    glow: "rgba(221, 107, 32, 0.35)",
    bar: "linear-gradient(90deg, #DD6B20, #C05621)",
  },
  {
    bg: "linear-gradient(135deg, #4299E1 0%, #DD6B20 100%)",
    icon: "white",
    glow: "rgba(66, 153, 225, 0.3)",
    bar: "linear-gradient(90deg, #4299E1, #DD6B20)",
  },
];

const AdminDashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const employeeData =
    JSON.parse(localStorage.getItem("employee_data")) || null;

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // Colors for light and dark mode
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const searchBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.800");
  const headerGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)"
  );
  const linkRowHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");

  // Responsive: عدد الأعمدة للعرض الشبكي (إن استُخدم) أو 1 للقائمة
  const listColumns = useBreakpointValue({ base: 1, md: 2 });

  // Filter links by search query
  const filteredLinks = useMemo(() => {
    if (!searchQuery) return adminLinks;
    return adminLinks.filter((link) =>
      link.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.04,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  return (
    <Box minH="100vh" bg={pageBg} dir="rtl" pb={12} pt={6}>
      <Container maxW="1600px" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Enhanced Header Section */}
          <MotionBox
            bgGradient={headerGradient}
            borderRadius="3xl"
            shadow="2xl"
            p={{ base: 6, md: 10 }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            position="relative"
            overflow="hidden"
            color="white"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, #4299E1, #DD6B20)"
              opacity={0.9}
              zIndex={1}
            />
            {/* Animated Background Elements */}
            <Box
              position="absolute"
              top={-20}
              right={-20}
              w="400px"
              h="400px"
              bg="whiteAlpha.100"
              borderRadius="full"
              filter="blur(60px)"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Box
              position="absolute"
              bottom={-30}
              left={-30}
              w="300px"
              h="300px"
              bg="whiteAlpha.100"
              borderRadius="full"
              filter="blur(50px)"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
              position="relative"
              zIndex={1}
            >
              <VStack
                align={{ base: "center", md: "flex-start" }}
                spacing={4}
                flex={1}
              >
                <HStack spacing={4}>
                  <Box
                    p={3}
                    bg="whiteAlpha.200"
                    borderRadius="xl"
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    <Icon as={FaCrown} w={8} h={8} color="yellow.300" />
                  </Box>
                  <VStack
                    align={{ base: "center", md: "flex-start" }}
                    spacing={1}
                  >
                    <Heading
                      as="h1"
                      size={{ base: "xl", md: "2xl" }}
                      fontWeight="extrabold"
                      textAlign={{ base: "center", md: "right" }}
                      textShadow="0 2px 10px rgba(0,0,0,0.2)"
                    >
                      لوحة تحكم المدير
                    </Heading>
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      opacity={0.95}
                      fontWeight="medium"
                      textAlign={{ base: "center", md: "right" }}
                    >
                      الوصول السريع لجميع أقسام المنصة
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <HStack spacing={4} mt={{ base: 6, md: 0 }}>
                <Box
                  position="relative"
                  _hover={{ transform: "scale(1.05)" }}
                  transition="transform 0.2s"
                >
                  <Avatar
                    name={
                      employeeData
                        ? employeeData.name
                        : `${user.fname} ${user.lname}`
                    }
                    src={employeeData?.avatar}
                    size="xl"
                    border="4px solid"
                    borderColor="whiteAlpha.400"
                    shadow="xl"
                    bg="whiteAlpha.200"
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    w={4}
                    h={4}
                    bg="green.400"
                    borderRadius="full"
                    border="3px solid"
                    borderColor="white"
                    shadow="md"
                  />
                </Box>
                <VStack
                  align="flex-start"
                  spacing={1}
                  display={{ base: "none", md: "flex" }}
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    textShadow="0 1px 3px rgba(0,0,0,0.2)"
                  >
                    {employeeData
                      ? employeeData.name
                      : `${user.fname} ${user.lname}`}
                  </Text>
                  <Text fontSize="sm" opacity={0.9}>
                    {employeeData ? employeeData.email : "مدير النظام"}
                  </Text>
                  {employeeData && (
                    <Badge
                      colorScheme={employeeData.is_active ? "green" : "red"}
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="xs"
                      boxShadow="md"
                    >
                      {employeeData.is_active ? "✓ نشط" : "✗ غير نشط"}
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </Flex>
          </MotionBox>

          {/* Enhanced Search Section */}
          <MotionBox
            bg={searchBg}
            borderRadius="2xl"
            shadow="xl"
            p={6}
            border="1px solid"
            borderColor={borderColor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, #4299E1, #DD6B20)"
              opacity={0.6}
            />
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" h="full" pl={4}>
                <Icon as={MdSearch} color="blue.500" boxSize={6} />
              </InputLeftElement>
              <Input
                placeholder="ابحث عن رابط..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                }}
                borderRadius="xl"
                fontSize="lg"
                h="65px"
                pl={14}
                pr={searchQuery ? 14 : 4}
              />
              {searchQuery && (
                <Box
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={2}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    borderRadius="full"
                    p={2}
                    minW="auto"
                    h="auto"
                    colorScheme="gray"
                  >
                    <Icon as={MdClose} boxSize={5} />
                  </Button>
                </Box>
              )}
            </InputGroup>
            {searchQuery && (
              <HStack justify="space-between" mt={4} px={2}>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    {filteredLinks.length}
                  </Badge>
                  <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                    نتيجة البحث
                  </Text>
                </HStack>
              </HStack>
            )}
          </MotionBox>

          {/* عنوان القسم بالبراند */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Heading
              size="md"
              color={headingColor}
              className="brand-section-title"
              mb={2}
            >
              روابط سريعة
            </Heading>
            <Text fontSize="sm" color={subTextColor} mb={4}>
              اختر القسم للانتقال إليه
            </Text>
          </MotionBox>

          {/* عرض الروابط كقائمة صفوف */}
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredLinks.length === 0 ? (
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  textAlign="center"
                  py={20}
                  bg={cardBg}
                  borderRadius="2xl"
                  shadow="lg"
                  border="2px dashed"
                  borderColor={borderColor}
                >
                  <Icon
                    as={MdSearch}
                    w={20}
                    h={20}
                    color={subTextColor}
                    mb={4}
                    opacity={0.5}
                  />
                  <Text
                    fontSize="xl"
                    color={headingColor}
                    fontWeight="bold"
                    mb={2}
                  >
                    لم يتم العثور على نتائج
                  </Text>
                  <Text fontSize="sm" color={subTextColor}>
                    جرب البحث بكلمات مختلفة أو امسح البحث لعرض جميع الروابط
                  </Text>
                </Box>
              </MotionBox>
            ) : (
              <Box
                bg={cardBg}
                borderRadius="2xl"
                shadow="lg"
                border="2px solid"
                borderColor={borderColor}
                overflow="hidden"
              >
                <Box
                  h="4px"
                  bgGradient="linear(to-r, #4299E1, #DD6B20)"
                  opacity={0.95}
                />
                <SimpleGrid columns={listColumns} spacing={0}>
                  {filteredLinks.map((link, index) => {
                    const scheme = brandSchemes[index % brandSchemes.length];
                    const showBorderBottom = index < filteredLinks.length - 1;
                    return (
                      <MotionBox
                        key={link.to}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <RouterLink to={link.to}>
                          <Flex
                            align="center"
                            gap={4}
                            p={4}
                            cursor="pointer"
                            borderBottomWidth={showBorderBottom ? 1 : 0}
                            borderBottomColor={borderColor}
                            _hover={{ bg: linkRowHoverBg }}
                            transition="background 0.2s"
                            position="relative"
                          >
                            <Flex flex={1} align="center" gap={3} minW={0}>
                              <Flex
                                w={12}
                                h={12}
                                flexShrink={0}
                                borderRadius="xl"
                                bg={scheme.bg}
                                align="center"
                                justify="center"
                              >
                                <Icon
                                  as={link.Icon}
                                  w={6}
                                  h={6}
                                  color={scheme.icon}
                                />
                              </Flex>
                              <Text
                                fontSize="md"
                                fontWeight="600"
                                color={headingColor}
                                noOfLines={1}
                              >
                                {link.label}
                              </Text>
                            </Flex>
                            <Icon
                              as={FaChevronLeft}
                              w={4}
                              h={4}
                              color={subTextColor}
                              flexShrink={0}
                            />
                          </Flex>
                        </RouterLink>
                      </MotionBox>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}
          </MotionBox>
        </VStack>
      </Container>
      <ScrollToTop />
    </Box>
  );
};

export default AdminDashboardHome;
