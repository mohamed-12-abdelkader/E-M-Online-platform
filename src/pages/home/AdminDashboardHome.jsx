import React from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Flex,
  Spacer,
  Badge,
  Divider,
  Progress,
  Link as ChakraLink,
  Avatar,
  useBreakpointValue,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaTasks,
  FaBell,
  FaEnvelope,
  FaQuestionCircle,
  FaUsers,
  FaTags,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaChartBar,
  FaCrown,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlay,
  FaPause,
  FaStop,
} from "react-icons/fa";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

// Motion Components for animations
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Mock Data - في تطبيق حقيقي هذه البيانات ستأتي من Backend/API
const quickStats = [
  { 
    id: 1, 
    label: "إجمالي الأسئلة", 
    value: "2,450", 
    icon: FaQuestionCircle, 
    colorScheme: "blue",
    gradient: "linear(to-br, blue.400, blue.600)",
    change: "+45 هذا الأسبوع"
  },
  { 
    id: 2, 
    label: "المستخدمون الجدد اليوم", 
    value: "12", 
    icon: FaUsers, 
    colorScheme: "green",
    gradient: "linear(to-br, green.400, green.600)",
    change: "+3 هذا اليوم"
  },
  { 
    id: 3, 
    label: "التصنيفات المتاحة", 
    value: "35", 
    icon: FaTags, 
    colorScheme: "purple",
    gradient: "linear(to-br, purple.400, purple.600)",
    change: "+2 هذا الشهر"
  },
  { 
    id: 4, 
    label: "الأسئلة المعلقة", 
    value: "8", 
    icon: FaClock, 
    colorScheme: "orange",
    gradient: "linear(to-br, orange.400, orange.600)",
    change: "-2 هذا الأسبوع"
  },
];

const tasks = [
  { 
    id: 1, 
    title: "مراجعة 50 سؤال جديد", 
    priority: "عالية", 
    dueDate: "اليوم", 
    status: "قيد التنفيذ",
    progress: 75,
    assignee: "أحمد محمد",
    category: "مراجعة"
  },
  { 
    id: 2, 
    title: "إضافة تصنيفات جديدة لمادة التاريخ", 
    priority: "متوسطة", 
    dueDate: "الغد", 
    status: "لم تبدأ",
    progress: 0,
    assignee: "سارة أحمد",
    category: "إدارة"
  },
  { 
    id: 3, 
    title: "إعداد تقرير أداء الأسئلة لشهر مايو", 
    priority: "عاجلة", 
    dueDate: "8 يونيو 2025", 
    status: "مكتملة",
    progress: 100,
    assignee: "محمد علي",
    category: "تقارير"
  },
  { 
    id: 4, 
    title: "الرد على استفسارات المستخدمين", 
    priority: "منخفضة", 
    dueDate: "10 يونيو 2025", 
    status: "لم تبدأ",
    progress: 0,
    assignee: "فاطمة أحمد",
    category: "دعم"
  },
];

const notifications = [
  { 
    id: 1, 
    message: "تمت الموافقة على 10 أسئلة جديدة.", 
    type: "success", 
    time: "منذ 5 دقائق",
    icon: FaCheckCircle,
    color: "green.500"
  },
  { 
    id: 2, 
    message: "تحذير: مساحة التخزين تقترب من الامتلاء.", 
    type: "warning", 
    time: "منذ ساعة",
    icon: FaExclamationTriangle,
    color: "orange.500"
  },
  { 
    id: 3, 
    message: "خطأ في اتصال قاعدة البيانات، يرجى التحقق.", 
    type: "error", 
    time: "منذ 3 ساعات",
    icon: FaDatabase,
    color: "red.500"
  },
  { 
    id: 4, 
    message: "تم تحديث لوحة التحكم إلى الإصدار 2.0.", 
    type: "info", 
    time: "أمس",
    icon: FaServer,
    color: "blue.500"
  },
];

const messages = [
  { 
    id: 1, 
    sender: "فاطمة المصممة", 
    subject: "بخصوص تصميم واجهة الأسئلة", 
    snippet: "أهلاً، لدي بعض المقترحات لتحسين...", 
    time: "الآن",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    unread: true
  },
  { 
    id: 2, 
    sender: "علي محلل البيانات", 
    subject: "تقرير الأداء الشهري", 
    snippet: "مرفق تقرير أداء الأسئلة للشهر الماضي...", 
    time: "منذ 30 دقيقة",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    unread: false
  },
  { 
    id: 3, 
    sender: "الدعم الفني", 
    subject: "مشكلة في تحميل الصور", 
    snippet: "لقد واجه بعض المستخدمين مشكلة في...", 
    time: "منذ ساعة",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    unread: true
  },
];

const AdminDashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  // Colors for light and dark mode
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  // Responsive values
  const statsCols = useBreakpointValue({ base: 1, sm: 2, lg: 4 });
  const contentCols = useBreakpointValue({ base: 1, lg: 3 });

  // Variants for card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const staggerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const hoverVariants = {
    hover: { 
      scale: 1.02, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "عاجلة": return "red";
      case "عالية": return "orange";
      case "متوسطة": return "yellow";
      case "منخفضة": return "green";
      default: return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "مكتملة": return "green";
      case "قيد التنفيذ": return "blue";
      case "لم تبدأ": return "gray";
      default: return "gray";
    }
  };

  const getNotificationColorScheme = (type) => {
    switch (type) {
      case "success": return "green";
      case "warning": return "orange";
      case "error": return "red";
      case "info": return "blue";
      default: return "gray";
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, blue.50, purple.50, pink.50)" className="mt-[]" p={{ base: 4, md: 8 }} dir="rtl">
      <VStack spacing={8} align="stretch" maxW="1400px" mx="auto">
        {/* Header Section */}
        <MotionCard
          bgGradient="linear(to-r, blue.600, blue.400)"
          color="white"
          borderRadius="2xl"
          shadow="2xl"
          p={8}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          overflow="hidden"
          position="relative"
        >
          <Box position="absolute" top={-10} right={-10} opacity={0.15}>
            <Icon as={FaCrown} w={32} h={32} />
          </Box>
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
            <VStack align={{ base: "center", md: "flex-start" }} spacing={4}>
              <Heading as="h1" size="2xl" fontWeight="extrabold" letterSpacing="tight" textAlign={{ base: "center", md: "right" }}>
                لوحة تحكم المدير 👑
              </Heading>
              <Text fontSize="xl" opacity={0.9} fontWeight="medium" textAlign={{ base: "center", md: "right" }}>
                إدارة شاملة لمنصة الأسئلة التعليمية
              </Text>
            </VStack>
            <HStack spacing={4} mt={{ base: 6, md: 0 }}>
              <Avatar 
                name={`${user.fname} ${user.lname}`}
                src="https://bit.ly/dan-abramov"
                size="lg"
                border="4px solid"
                borderColor="whiteAlpha.300"
                shadow="xl"
              />
              <VStack align="flex-start" spacing={1}>
                <Text fontWeight="bold" fontSize="lg">{user.fname} {user.lname}</Text>
                <Text fontSize="sm" opacity={0.8}>مدير النظام</Text>
                <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>
                  نشط
                </Badge>
              </VStack>
            </HStack>
          </Flex>
        </MotionCard>

        {/* Quick Stats Section */}
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
          w="full"
        >
          <Heading as="h2" size="lg" mb={6} color={headingColor} textAlign="center">
            إحصائيات سريعة
          </Heading>
          <SimpleGrid columns={statsCols} spacing={6}>
            {quickStats.map((stat) => (
              <MotionCard
                key={stat.id}
                bg={cardBg}
                borderRadius="2xl"
                shadow="xl"
                p={6}
                textAlign="center"
                variants={cardVariants}
                whileHover="hover"
                variants={hoverVariants}
                border="1px solid"
                borderColor={borderColor}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="4px"
                  bgGradient={stat.gradient}
                />
                <VStack spacing={4}>
                  <Box
                    p={4}
                    borderRadius="full"
                    bgGradient={stat.gradient}
                    color="white"
                    shadow="lg"
                  >
                    <Icon as={stat.icon} boxSize={8} />
                  </Box>
                  <VStack spacing={2}>
                    <Text fontSize="3xl" fontWeight="extrabold" color={headingColor}>
                      {stat.value}
                    </Text>
                    <Text fontSize="md" color={subTextColor} fontWeight="medium">
                      {stat.label}
                    </Text>
                    <Badge colorScheme={stat.colorScheme} fontSize="xs" px={2} py={1} borderRadius="full">
                      {stat.change}
                    </Badge>
                  </VStack>
                </VStack>
              </MotionCard>
            ))}
          </SimpleGrid>
        </MotionBox>

        {/* Tasks, Notifications, Messages Section */}
        <SimpleGrid columns={contentCols} spacing={8}>
          {/* Tasks Card */}
          <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            shadow="xl"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover="hover"
            variants={hoverVariants}
          >
            <CardHeader bgGradient="linear(to-r, blue.50, purple.50)" pb={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color={headingColor}>المهام المطلوبة</Heading>
                <Icon as={FaTasks} boxSize={6} color="blue.500" />
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                {tasks.map((task) => (
                  <Box 
                    key={task.id} 
                    p={4} 
                    borderRadius="xl" 
                    bg={useColorModeValue("gray.50", "gray.700")} 
                    border="1px solid" 
                    borderColor={borderColor}
                    shadow="sm"
                    whileHover={{ x: 5, boxShadow: "md" }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack justifyContent="space-between" alignItems="flex-start" mb={3}>
                      <VStack align="flex-start" spacing={1} flex={1}>
                        <Text fontWeight="bold" color={headingColor} fontSize="md">
                          {task.title}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme={getPriorityColor(task.priority)} variant="solid" borderRadius="full" fontSize="xs">
                            {task.priority}
                          </Badge>
                          <Badge colorScheme={getStatusColor(task.status)} variant="subtle" borderRadius="full" fontSize="xs">
                            {task.status}
                          </Badge>
                        </HStack>
                      </VStack>
                      <IconButton
                        icon={<FaEye />}
                        aria-label="عرض المهمة"
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        borderRadius="full"
                      />
                    </HStack>
                    
                    <HStack justify="space-between" mb={3}>
                      <HStack spacing={2}>
                        <Icon as={FaCalendarAlt} color="purple.500" boxSize={4} />
                        <Text fontSize="sm" color={subTextColor}>{task.dueDate}</Text>
                      </HStack>
                      <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                        {task.assignee}
                      </Text>
                    </HStack>
                    
                    <VStack align="flex-start" spacing={2}>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color={subTextColor}>التقدم</Text>
                        <Text fontSize="sm" fontWeight="bold" color={headingColor}>{task.progress}%</Text>
                      </HStack>
                      <Progress 
                        value={task.progress} 
                        size="sm" 
                        colorScheme={getStatusColor(task.status)} 
                        borderRadius="full"
                        hasStripe
                        isAnimated
                      />
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
            <CardFooter justifyContent="flex-end" p={6} pt={0}>
              <Button colorScheme="blue" variant="outline" rightIcon={<FaArrowRight />} borderRadius="xl">
                عرض كل المهام
              </Button>
            </CardFooter>
          </MotionCard>

          {/* Notifications Card */}
          <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            shadow="xl"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover="hover"
            variants={hoverVariants}
          >
            <CardHeader bgGradient="linear(to-r, orange.50, red.50)" pb={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color={headingColor}>الإشعارات الهامة</Heading>
                <Icon as={FaBell} boxSize={6} color="orange.500" />
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                {notifications.map((notif) => (
                  <Box
                    key={notif.id}
                    p={4}
                    borderRadius="xl"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderLeft="4px solid"
                    borderColor={notif.color}
                    shadow="sm"
                    whileHover={{ x: 5, boxShadow: "md" }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack spacing={3} mb={2}>
                      <Box
                        p={2}
                        borderRadius="full"
                        bg={notif.color}
                        color="white"
                        shadow="md"
                      >
                        <Icon as={notif.icon} boxSize={4} />
                      </Box>
                      <Badge colorScheme={getNotificationColorScheme(notif.type)} variant="solid" borderRadius="full" fontSize="xs">
                        {notif.type === "success" ? "نجح" : notif.type === "warning" ? "تحذير" : notif.type === "error" ? "خطأ" : "معلومات"}
                      </Badge>
                    </HStack>
                    <Text fontWeight="medium" color={textColor} mb={2}>{notif.message}</Text>
                    <Text fontSize="sm" color={subTextColor}>{notif.time}</Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
            <CardFooter justifyContent="flex-end" p={6} pt={0}>
              <Button colorScheme="blue" variant="outline" rightIcon={<FaArrowRight />} borderRadius="xl">
                عرض كل الإشعارات
              </Button>
            </CardFooter>
          </MotionCard>

          {/* Messages Card */}
          <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            shadow="xl"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover="hover"
            variants={hoverVariants}
          >
            <CardHeader bgGradient="linear(to-r, green.50, blue.50)" pb={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color={headingColor}>الرسائل الأخيرة</Heading>
                <Icon as={FaEnvelope} boxSize={6} color="green.500" />
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                {messages.map((msg) => (
                  <ChakraLink
                    key={msg.id}
                    href="#"
                    _hover={{ textDecoration: "none", bg: useColorModeValue("gray.100", "gray.600") }}
                    p={4}
                    borderRadius="xl"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    transition="all 0.2s ease-in-out"
                    border="1px solid"
                    borderColor={msg.unread ? "blue.200" : "transparent"}
                    position="relative"
                  >
                    {msg.unread && (
                      <Box
                        position="absolute"
                        top={3}
                        right={3}
                        w={3}
                        h={3}
                        bg="blue.500"
                        borderRadius="full"
                      />
                    )}
                    <HStack spacing={3} mb={3}>
                      <Avatar size="sm" name={msg.sender} src={msg.avatar} />
                      <VStack align="flex-start" spacing={1} flex={1}>
                        <Text fontWeight="bold" color={headingColor} fontSize="sm">
                          {msg.sender}
                        </Text>
                        <Text fontSize="xs" color={subTextColor}>
                          {msg.time}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor} noOfLines={1}>
                        {msg.subject}
                      </Text>
                      <Text fontSize="xs" color={subTextColor} noOfLines={2}>
                        {msg.snippet}
                      </Text>
                    </VStack>
                  </ChakraLink>
                ))}
              </VStack>
            </CardBody>
            <CardFooter justifyContent="flex-end" p={6} pt={0}>
              <Button colorScheme="blue" variant="outline" rightIcon={<FaArrowRight />} borderRadius="xl">
                عرض كل الرسائل
              </Button>
            </CardFooter>
          </MotionCard>
        </SimpleGrid>

        {/* Progress Section */}
        <MotionCard
          bg={cardBg}
          borderRadius="2xl"
          shadow="xl"
          p={8}
          w="full"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover="hover"
          variants={hoverVariants}
        >
          <HStack justifyContent="space-between" mb={6}>
            <Heading size="lg" color={headingColor}>التقدم العام</Heading>
            <Icon as={FaChartBar} boxSize={8} color="purple.500" />
          </HStack>
          <Divider borderColor={dividerColor} mb={6} />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack spacing={4} p={6} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="xl">
              <Icon as={FaCheckCircle} color="blue.500" boxSize={8} />
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">75%</Text>
                <Text fontSize="sm" color="blue.600" fontWeight="medium">إنجاز المهام</Text>
              </VStack>
              <Progress value={75} size="lg" colorScheme="blue" w="full" borderRadius="full" hasStripe isAnimated />
            </VStack>
            
            <VStack spacing={4} p={6} bg={useColorModeValue("green.50", "green.900")} borderRadius="xl">
              <Icon as={FaTags} color="green.500" boxSize={8} />
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">90%</Text>
                <Text fontSize="sm" color="green.600" fontWeight="medium">تغطية التصنيفات</Text>
              </VStack>
              <Progress value={90} size="lg" colorScheme="green" w="full" borderRadius="full" hasStripe isAnimated />
            </VStack>
            
            <VStack spacing={4} p={6} bg={useColorModeValue("purple.50", "purple.900")} borderRadius="xl">
              <Icon as={FaShieldAlt} color="purple.500" boxSize={8} />
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">85%</Text>
                <Text fontSize="sm" color="purple.600" fontWeight="medium">جودة البيانات</Text>
              </VStack>
              <Progress value={85} size="lg" colorScheme="purple" w="full" borderRadius="full" hasStripe isAnimated />
            </VStack>
          </SimpleGrid>
        </MotionCard>
      </VStack>
      <ScrollToTop />
    </Box>
  );
};

export default AdminDashboardHome;