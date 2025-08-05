import React, { useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
  Flex,
  useBreakpointValue,
  useColorModeValue,
  SimpleGrid,
  Stack,
  Badge,
  Avatar,
  Button,
  Divider,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaTrophy,
  FaBookOpen,
  FaSearch,
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaGraduationCap,
  FaStar,
  FaPlay,
  FaEye,
  FaArrowRight,
  FaCrown,
  FaMedal,
  FaFire,
  FaRocket,
  FaLightbulb,
  FaAward,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import MyLecture from "../leacter/MyLecture";
import MyTeacher from "../myTeacher/MyTeacher";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserType from "../../Hooks/auth/userType";

const MotionBox = motion(Box);
const MotionGridItem = motion(GridItem);

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const notificationsLoading = false;
  const notifications = { notifications: [] };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [userData, isAdmin, isTeacher, student] = UserType();

  // روابط التنقل الرئيسية
  const mainLinks = [
    {
      name: "ابحث عن محاضر",
      href: "/teachers",
      icon: FaSearch,
      color: "purple.500",
      desc: "ابحث عن أفضل المحاضرين في تخصصك",
      gradient: "linear(to-br, purple.400, purple.600)"
    },
    {
      name: "محاضرينى",
      href: "/my-teachers",
      icon: FaChalkboardTeacher,
      color: "green.500",
      desc: "المحاضرين الذين تدرس معهم حالياً",
      gradient: "linear(to-br, green.400, green.600)"
    },
    {
      name: "المسابقات",
      href: "/competitions",
      icon: FaTrophy,
      color: "yellow.500",
      desc: "شارك واربح جوائز قيمة",
      gradient: "linear(to-br, yellow.400, orange.500)"
    },
    {
      name: "كورساتي",
      href: "/my_courses",
      icon: FaBookOpen,
      color: "blue.500",
      desc: "الكورسات المشترك بها",
      gradient: "linear(to-br, blue.400, blue.600)"
    },
  ];

  // إحصائيات سريعة
  const stats = [
    {
      icon: FaGraduationCap,
      label: "الكورسات المكتملة",
      value: "3",
      color: "blue.500",
      gradient: "linear(to-br, blue.400, blue.600)",
      change: "+1 هذا الشهر",
      bg: "blue.50"
    },
    {
      icon: FaChartLine,
      label: "النقاط المجمعة",
      value: "1,245",
      color: "green.500",
      gradient: "linear(to-br, green.400, green.600)",
      change: "+150 هذا الأسبوع",
      bg: "green.50"
    },
    {
      icon: FaUsers,
      label: "المحاضرين",
      value: "5",
      color: "purple.500",
      gradient: "linear(to-br, purple.400, purple.600)",
      change: "+2 هذا الشهر",
      bg: "purple.50"
    },
    {
      icon: FaCalendarAlt,
      label: "الأيام المتتالية",
      value: "12",
      color: "orange.500",
      gradient: "linear(to-br, orange.400, orange.600)",
      change: "+3 أيام",
      bg: "orange.50"
    },
  ];

  const studentData = {
    name: "أحمد محمد",
    level: "الصف الثالث الثانوي",
    points: 1250,
    avatar: "https://bit.ly/dan-abramov"
  };

  // استخدام نظام ألوان Chakra المدمج
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerGradient = useColorModeValue(
    "linear(to-r, blue.500, blue.600)",
    "linear(to-r, blue.600, blue.700)"
  );

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    onOpen();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: {
      scale: 1.02,
      boxShadow: useColorModeValue(
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
      ),
      transition: { duration: 0.2 }
    }
  };

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const avatarSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });
  const headingSize = useBreakpointValue({ base: "lg", md: "xl", lg: "2xl" });
  const subHeadingSize = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });

  return (
    <Box 
      width="95%" 
      mx="auto" 
      minHeight="100vh" 
      bg={bgColor}
      py={{ base: 4, md: 6, lg: 8 }}
    >
      {/* Header Section - الترحيب */}
      <Box width="100%" my={{ base: 3, md: 5 }}>
        <Flex
          direction="column"
          bgGradient={headerGradient}
          p={{ base: 4, sm: 5, md: 6, lg: 8 }}
          borderRadius="xl"
          width="100%"
          minHeight={{ base: "180px", md: "200px" }}
          mt={{ base: 4, md: 8 }}
          position="relative"
          overflow="hidden"
        >
          {/* Background Elements */}
          <Box position="absolute" top={-10} right={-10} opacity={0.1}>
            <Icon as={FaGraduationCap} w={{ base: 20, sm: 24, md: 32 }} h={{ base: 20, sm: 24, md: 32 }} />
          </Box>
          <Box position="absolute" bottom={-10} left={-10} opacity={0.1}>
            <Icon as={FaRocket} w={{ base: 16, sm: 20, md: 24 }} h={{ base: 16, sm: 20, md: 24 }} />
          </Box>

          <Flex 
            direction={{ base: "column", md: "row" }} 
            align="center" 
            justify="space-between"
            zIndex={1}
          >
            <VStack 
              align={{ base: "center", md: "flex-start" }} 
              spacing={{ base: 2, sm: 3, md: 4 }} 
              flex={1}
              width="100%"
            >
              <Badge
                bg="whiteAlpha.20"
                color="white"
                px={{ base: 2, sm: 3, md: 4 }}
                py={{ base: 1, sm: 1.5, md: 2 }}
                borderRadius="full"
                fontSize={{ base: "xs", sm: "sm" }}
                fontWeight="semibold"
                backdropFilter="blur(10px)"
              >
                🎓 منصة التعلم الذكية
              </Badge>
              
              <Heading
                color="white"
                as="h1"
                size={headingSize}
                fontWeight="extrabold"
                letterSpacing="tight"
                textAlign={{ base: "center", md: "right" }}
                textShadow="0 4px 8px rgba(0,0,0,0.3)"
                lineHeight={{ base: 1.3, md: 1.1 }}
              >
                مرحباً بك في منصتك التعليمية! 🚀
              </Heading>
              
              <Text
                color="whiteAlpha.900"
                fontSize={subHeadingSize}
                fontWeight="medium"
                textAlign={{ base: "center", md: "right" }}
                maxW={{ base: "280px", sm: "400px", md: "500px", lg: "600px" }}
                lineHeight={{ base: 1.5, md: 1.3 }}
              >
                استكشف عالم التعلم الرقمي مع أفضل المحاضرين واحصل على تجربة تعليمية فريدة
              </Text>
            </VStack>

            <HStack 
              spacing={{ base: 3, sm: 4, md: 6 }} 
              mt={{ base: 3, sm: 4, md: 6, lg: 0 }}
            >
              <Avatar
                name={`${user.fname} ${user.lname}`}
                src={studentData.avatar}
                size={avatarSize}
                border="4px solid"
                borderColor="whiteAlpha.400"
                shadow="2xl"
              />
              
              <VStack 
                align={{ base: "center", md: "flex-start" }} 
                spacing={{ base: 1, sm: 1.5, md: 2 }}
              >
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: "sm", sm: "md", md: "lg", lg: "xl" }} 
                  color="white"
                  textShadow="0 2px 4px rgba(0,0,0,0.3)" 
                  textAlign={{ base: "center", md: "left" }}
                >
                  {user.fname} {user.lname}
                </Text>
                
                <Text 
                  fontSize={{ base: "xs", sm: "sm" }} 
                  color="whiteAlpha.800" 
                  textAlign={{ base: "center", md: "left" }}
                >
                  كود الطالب: {user?.id}
                </Text>
                
                <Badge
                  colorScheme="blue"
                  variant="solid"
                  borderRadius="full"
                  px={{ base: 1.5, sm: 2, md: 3 }}
                  py={{ base: 0.5, sm: 0.5, md: 1 }}
                  bg="whiteAlpha.20"
                  backdropFilter="blur(10px)"
                  fontSize={{ base: "xs", sm: "sm" }}
                >
                  طالب نشط ⭐
                </Badge>
              </VStack>
            </HStack>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box width="100%" px={{ base: 2, sm: 4, md: 6, lg: 8 }}>
        <VStack width="100%" align="stretch" spacing={{ base: 4, sm: 6, md: 8, lg: 10 }}>
          {/* Quick Actions - الوصول السريع */}
          <Box width="100%">
            <MotionBox
              bg={cardBg}
              borderRadius="xl"
              shadow="md"
              border="1px solid"
              borderColor={borderColor}
              width="100%"
              overflow="hidden"
              variants={itemVariants}
            >
              <Flex
                bgGradient="linear(to-r, blue.50, green.50)"
                px={{ base: 4, sm: 5, md: 6 }}
                py={3}
                borderBottom="1px solid"
                borderColor={borderColor}
                width="100%"
                align="center"
                justify="center"
              >
                <HStack spacing={{ base: 2, sm: 3, md: 4 }}>
                  <Icon as={FaLightbulb} color="blue.500" boxSize={{ base: 4, sm: 5, md: 6 }} />
                  <Heading 
                    size={{ base: "sm", md: "md" }} 
                    color={headingColor}
                    textAlign="center"
                  >
                    الوصول السريع
                  </Heading>
                </HStack>
              </Flex>
              
              <Box p={{ base: 3, sm: 4, md: 5, lg: 6 }} width="100%">
                <SimpleGrid 
                  columns={{ base: 1, sm: 2, md: 2, lg: 4 }} 
                  spacing={{ base: 3, sm: 4, md: 5 }}
                >
                  {mainLinks.map((link, index) => (
                    <Link key={index} to={link.href}>
                      <MotionBox
                        bg={cardBg}
                        borderRadius="lg"
                        shadow="md"
                        p={{ base: 3, md: 4, lg: 5 }}
                        variants={itemVariants}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: useColorModeValue(
                            "0 10px 20px rgba(0, 0, 0, 0.1)", 
                            "0 10px 20px rgba(0, 0, 0, 0.3)"
                          )
                        }}
                        transition={{ duration: 0.2 }}
                        cursor="pointer"
                        border="1px solid"
                        borderColor={borderColor}
                        width="100%"
                        minHeight={{ base: "100px", sm: "120px", md: "140px" }}
                      >
                        <VStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" height="100%">
                          <Box
                            p={{ base: 2, sm: 3 }}
                            borderRadius="full"
                            bgGradient={link.gradient}
                            color="white"
                            shadow="md"
                          >
                            <Icon as={link.icon} boxSize={{ base: 4, sm: 5 }} />
                          </Box>
                          
                          <VStack 
                            spacing={{ base: 1, sm: 2 }} 
                            align="center" 
                            flex={1} 
                            justify="center"
                          >
                            <Text 
                              fontWeight="bold" 
                              fontSize={{ base: "sm", sm: "md" }} 
                              color={textColor}
                              textAlign="center"
                            >
                              {link.name}
                            </Text>
                            
                            <Text 
                              fontSize={{ base: "xs", sm: "sm" }} 
                              color="gray.500" 
                              textAlign="center"
                              noOfLines={2}
                              lineHeight="1.3"
                            >
                              {link.desc}
                            </Text>
                          </VStack>
                        </VStack>
                      </MotionBox>
                    </Link>
                  ))}
                </SimpleGrid>
              </Box>
            </MotionBox>
          </Box>

          {/* My Teachers - محاضرينى */}
          <MotionBox
  initial="hidden"
  animate="visible"
  variants={containerVariants}
  width="100%"
>
  <Box
    bg={cardBg}
    borderRadius="xl"
    shadow="md"
    border="1px solid"
    borderColor={borderColor}
    width="100%"
    overflow="hidden"
    dir="rtl" // ✅ أضف هذا السطر هنا
  >
    <Flex
      bgGradient="linear(to-r, green.50, blue.50)"
      px={{ base: 4, sm: 5, md: 6 }}
      py={3}
      borderBottom="1px solid"
      borderColor={borderColor}
      width="100%"
      align="center"
      justify="start"
    >
      <HStack spacing={{ base: 2, sm: 3, md: 4 }}>
        <Icon as={FaChalkboardTeacher} color="green.500" boxSize={{ base: 4, sm: 5, md: 6 }} />
        <Heading 
          size={{ base: "sm", md: "md" }} 
          color={headingColor}
          textAlign="center"
        >
          محاضرينى
        </Heading>
        <Badge 
          colorScheme="green" 
          variant="subtle" 
          borderRadius="full" 
          fontSize={{ base: "xs", sm: "sm" }}
        >
          مميز
        </Badge>
      </HStack>
    </Flex>
    
    <Box p={{ base: 3, sm: 4, md: 5 }}>
      <MyTeacher />
    </Box>
  </Box>
</MotionBox>


          {/* My Lectures - كورساتي */}
          <MotionBox
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            width="100%"
          >
            <Box
              bg={cardBg}
              borderRadius="xl"
              shadow="md"
              border="1px solid"
              borderColor={borderColor}
              width="100%"
              overflow="hidden"
            >
              <Flex
                bgGradient="linear(to-r, blue.50, purple.50)"
                px={{ base: 4, sm: 5, md: 6 }}
                py={3}
                borderBottom="1px solid"
                borderColor={borderColor}
                width="100%"
                align="center"
                justify="center"
              >
                <HStack spacing={{ base: 2, sm: 3, md: 4 }}>
                  <Icon as={FaBookOpen} color="blue.500" boxSize={{ base: 4, sm: 5, md: 6 }} />
                  <Heading 
                    size={{ base: "sm", md: "md" }} 
                    color={headingColor}
                    textAlign="center"
                  >
                    كورساتي
                  </Heading>
                  <Badge 
                    colorScheme="blue" 
                    variant="subtle" 
                    borderRadius="full" 
                    fontSize={{ base: "xs", sm: "sm" }}
                  >
                    نشط
                  </Badge>
                </HStack>
              </Flex>
              
              <Box p={{ base: 3, sm: 4, md: 5 }}>
                <MyLecture />
              </Box>
            </Box>
          </MotionBox>
        </VStack>
      </Box>
    </Box>
  );
};

export default HomePage;