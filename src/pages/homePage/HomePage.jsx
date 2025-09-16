import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Icon,
  Text,
  Flex,
  useBreakpointValue,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Avatar,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Card,
  Collapse,
} from "@chakra-ui/react";
import {
  FaChalkboardTeacher,
  FaTrophy,
  FaBookOpen,
  FaSearch,
  FaBell,
  FaGraduationCap,
  FaArrowRight,
  FaFire,
  FaRocket,
  FaLightbulb,
  FaGift,
  FaClock,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import MyLecture from "../leacter/MyLecture";
import MyTeacher from "../myTeacher/MyTeacher";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserType from "../../Hooks/auth/userType";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const notificationsLoading = false;
  const notifications = { notifications: [] };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const quickActionsDisclosure = useDisclosure({ defaultIsOpen: false });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [userData, isAdmin, isTeacher, student] = UserType();

  // إشعارات مسابقات/دوريات من الـ API
  const [competitionNotifications, setCompetitionNotifications] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");
  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  }), []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return dateStr;
    }
  };

  const fetchGradeFeed = async () => {
    try {
      setFeedLoading(true);
      setFeedError("");
      const res = await baseUrl.get('/api/notifications/grade-feed', { headers: authHeader });
      const feed = res?.data?.feed || [];
      const mapped = feed.map((n, idx) => ({
        id: `${n.type}-${n.item_id}-${idx}`,
        title: n.title,
        message: n.description || (n.type === 'league' ? 'دوري جديد متاح لصفك' : 'مسابقة جديدة لصفك'),
        time: formatDateTime(n.created_at),
        type: n.type,
        urgent: n.type === 'league',
        itemId: n.item_id,
      }));
      setCompetitionNotifications(mapped);
    } catch (e) {
      setFeedError('تعذر جلب إشعارات الصف');
      setCompetitionNotifications([]);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeFeed();
  }, [authHeader]);

  // عدد الإشعارات المعروضة في البداية
  const [visibleNotifications, setVisibleNotifications] = useState(2);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // روابط التنقل الرئيسية
  const mainLinks = [
    {
      name: "دوري EM",
      href: "/leagues",
      icon: FaTrophy,
      color: "yellow.500",
      desc: "شارك في دوري EM وتحدَّي زملاءك",
      gradient: "linear(135deg, yellow.400, yellow.600)"
    },
    {
      name: "بنك الأسئلة",
      href: "/question_bank",
      icon: FaLightbulb,
      color: "green.500",
      desc: "تدرّب على أسئلة متنوعة مع الحلول",
      gradient: "linear(135deg, green.400, green.600)"
    },
    {
      name: "EM سوشيال",
      href: "/social",
      icon: FaRocket,
      color: "pink.500",
      desc: "تواصل وتفاعل مع مجتمع EM",
      gradient: "linear(135deg, pink.400, pink.600)"
    },
    {
      name: "كورساتي",
      href: "/my_courses",
      icon: FaBookOpen,
      color: "blue.500",
      desc: "الكورسات المشترك بها",
      gradient: "linear(135deg, blue.500, blue.700)"
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
      transition: { duration: 0.2 }
    }
  };

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const avatarSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });
  const headingSize = useBreakpointValue({ base: "lg", md: "xl", lg: "2xl" });
  const subHeadingSize = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });

  return (
    <Box 
      width="100%" 
      minHeight="100vh" 
      bg={bgColor}
      py={{ base: 4, md: 6, lg: 8 }}
      px={{ base: 4, md: 6, lg: 8 }}
    >
             {/* Header Section & Competition Notifications - الترحيب وإشعارات المسابقات */}
       <MotionBox
         initial="hidden"
         animate="visible"
         variants={containerVariants}
         mb={{ base: 6, md: 8 }}
       >
         <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      {/* Header Section - الترحيب */}
             <Box
               bgGradient="linear(135deg, blue.500, blue.600)"
               borderRadius="3xl"
               p={{ base: 4, md: 6, lg: 8 }}
          position="relative"
          overflow="hidden"
               boxShadow="0 20px 40px rgba(59, 130, 246, 0.3)"
               height="100%"
               display="flex"
               flexDirection="column"
        >
          {/* Background Elements */}
             <Box position="absolute" top={-20} right={-20} opacity={0.1}>
               <Icon as={FaGraduationCap} w={32} h={32} color="white" />
          </Box>
             <Box position="absolute" bottom={-20} left={-20} opacity={0.1}>
               <Icon as={FaRocket} w={24} h={24} color="white" />
          </Box>

                           <VStack 
                align={{ base: "center", lg: "flex-start" }} 
                spacing={{ base: 3, md: 4 }} 
                color="white"
                height="100%"
            justify="space-between"
              >
                <VStack spacing={{ base: 3, md: 4 }} align={{ base: "center", lg: "flex-start" }}>
              <Badge
                bg="whiteAlpha.20"
                color="white"
                    px={4}
                    py={2}
                borderRadius="full"
                    fontSize="sm"
                fontWeight="semibold"
                backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="whiteAlpha.30"
              >
                🎓 منصة التعلم الذكية
              </Badge>
              
              <Heading
                size={headingSize}
                fontWeight="extrabold"
                    textAlign={{ base: "center", lg: "right" }}
                textShadow="0 4px 8px rgba(0,0,0,0.3)"
                    lineHeight={1.2}
              >
                    مرحباً {user.name} ! 🚀
              </Heading>
              
              <Text
                fontSize={subHeadingSize}
                fontWeight="medium"
                    textAlign={{ base: "center", lg: "right" }}
                    maxW="500px"
                    lineHeight={1.6}
                    opacity={0.9}
              >
                استكشف عالم التعلم الرقمي مع أفضل المحاضرين واحصل على تجربة تعليمية فريدة
              </Text>
            </VStack>

                <VStack spacing={2} align="center">
                <Text 
                  fontWeight="bold" 
                    fontSize={{ base: "md", md: "lg" }} 
                  textShadow="0 2px 4px rgba(0,0,0,0.3)" 
                >
                  {user.fname} {user.lname}
                </Text>
                
                  <Text fontSize="sm" opacity={0.8}>
                  كود الطالب: {user?.id}
                </Text>
                
                <Badge
                    colorScheme="orange"
                  variant="solid"
                  borderRadius="full"
                    px={3}
                    py={1}
                    bg="orange.500"
                    fontSize="xs"
                >
                  طالب نشط ⭐
                </Badge>
              </VStack>
              </VStack>
           </Box>

                                   {/* Competition Notifications - إشعارات المسابقات */}
             <Box
               bgGradient="linear(135deg, orange.400, orange.500)"
               borderRadius="2xl"
               p={{ base: 3, md: 4 }}
               position="relative"
               overflow="hidden"
               boxShadow="0 15px 30px rgba(251, 146, 60, 0.3)"
               height="100%"
               display="flex"
               flexDirection="column"
             >
              {/* Background Pattern */}
              <Box position="absolute" top={-10} right={-10} opacity={0.1}>
                <Icon as={FaTrophy} w={24} h={24} color="white" />
      </Box>

              <VStack spacing={4} align="stretch" height="100%" justify="space-between">
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Icon as={FaBell} color="white" boxSize={6} />
                    <Heading size="md" color="white">
                      إشعارات المسابقات
                    </Heading>
                    <Badge 
                      colorScheme="white" 
                      variant="solid" 
                      borderRadius="full"
                      bg="whiteAlpha.20"
                    >
                      {competitionNotifications.length}
                    </Badge>
                  </HStack>
                  
                  <Button
                    as={Link}
                    to="/competitions"
                    size="sm"
                    colorScheme="white"
                    variant="outline"
                    borderRadius="full"
                    _hover={{ bg: "whiteAlpha.20" }}
                    rightIcon={<FaArrowRight />}
                  >
                    عرض جميع المسابقات
                  </Button>
                </HStack>

                <VStack spacing={4} align="stretch" flex={1} overflow="hidden">
                  <SimpleGrid columns={1} spacing={4}>
                    {feedLoading && (
                      <Box bg="white" borderRadius="xl" p={4}>جارِ تحميل الإشعارات...</Box>
                    )}
                    {feedError && !feedLoading && (
                      <Box bg="white" borderRadius="xl" p={4} color="red.600">{feedError}</Box>
                    )}
                    {!feedLoading && !feedError && competitionNotifications.slice(0, visibleNotifications).map((notification, index) => (
                      <MotionCard
                        key={notification.id}
                        variants={itemVariants}
                        bg="white"
                        borderRadius="xl"
                        p={4}
                        cursor="pointer"
                        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                        transition="all 0.2s"
                        onClick={() => handleAnnouncementClick(notification)}
                      >
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack spacing={2}>
                                <Icon 
                                  as={notification.urgent ? FaFire : FaGift} 
                                  color={notification.urgent ? "red.500" : "orange.500"} 
                                  boxSize={4}
                                />
                                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                                  {notification.title}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {notification.message}
                              </Text>
                            </VStack>
                            
                            {notification.urgent && (
                              <Badge colorScheme="red" variant="solid" size="sm">
                                عاجل
                              </Badge>
                            )}
                          </HStack>
                          
                          <HStack justify="space-between" fontSize="xs" color="gray.500">
                            <HStack spacing={1}>
                              <Icon as={FaClock} />
                              <Text>{notification.time}</Text>
                            </HStack>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              variant="ghost"
                              borderRadius="full"
                              _hover={{ bg: "blue.50" }}
                            >
                              عرض التفاصيل
                            </Button>
                          </HStack>
                        </VStack>
                      </MotionCard>
                    ))}
                  </SimpleGrid>

                  {/* زر عرض المزيد من الإشعارات */}
                  {competitionNotifications.length > visibleNotifications && (
                    <Button
                      size="sm"
                      colorScheme="white"
                      variant="outline"
                      borderRadius="full"
                      _hover={{ bg: "whiteAlpha.20" }}
                      onClick={() => {
                        if (showAllNotifications) {
                          setVisibleNotifications(2);
                          setShowAllNotifications(false);
                        } else {
                          setVisibleNotifications(competitionNotifications.length);
                          setShowAllNotifications(true);
                        }
                      }}
                      width="100%"
                      leftIcon={showAllNotifications ? <FaArrowRight style={{ transform: 'rotate(180deg)' }} /> : <FaArrowRight />}
                    >
                      {showAllNotifications ? "عرض أقل" : `عرض ${competitionNotifications.length - visibleNotifications} إشعارات أخرى`}
                    </Button>
                  )}
                </VStack>
              </VStack>
            </Box>
         </SimpleGrid>
       </MotionBox>

      

          {/* Quick Actions - الوصول السريع */}
            <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        mb={{ base: 6, md: 8 }}
      >
        <Box
              bg={cardBg}
          borderRadius="2xl"
          shadow="lg"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
        >
          <Box
            bgGradient="linear(135deg, blue.50, blue.100)"
            px={6}
            py={4}
                borderBottom="1px solid"
                borderColor={borderColor}
          >
            <HStack spacing={3} justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={FaLightbulb} color="blue.500" boxSize={6} />
                <Heading size="md" color="blue.700">
                      الوصول السريع
                    </Heading>
                  </HStack>
              <Button
                display={{ base: "inline-flex", md: "none" }}
                size="sm"
                variant="outline"
                colorScheme="blue"
                borderRadius="full"
                onClick={quickActionsDisclosure.isOpen ? quickActionsDisclosure.onClose : quickActionsDisclosure.onOpen}
                rightIcon={<FaArrowRight style={{ transform: quickActionsDisclosure.isOpen ? 'rotate(90deg)' : 'rotate(-90deg)' }} />}
              >
                {quickActionsDisclosure.isOpen ? 'إخفاء' : 'عرض'}
              </Button>
            </HStack>
          </Box>
              
          <Collapse in={isDesktop || quickActionsDisclosure.isOpen} animateOpacity style={{ overflow: 'hidden' }}>
            <Box p={6}>
                  <div 
              className="flex flex-wrap justify-center"
                  >
                    {mainLinks.map((link, index) => (
                      <Link className="m-3 w-[90%] mx-auto md:w-[250px]" key={index} to={link.href}>
                    <MotionCard
                      variants={itemVariants}
                          bg={cardBg}
                      borderRadius="xl"
                          shadow="md"
                      p={5}
                          cursor="pointer"
                          border="1px solid"
                          borderColor={borderColor}
                      _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                      transition="all 0.3s"
                      height="100%"
                        >
                      <VStack spacing={4} align="center" height="100%">
                            <Box
                          p={4}
                              borderRadius="full"
                              bgGradient={link.gradient}
                              color="white"
                          shadow="lg"
                            >
                          <Icon as={link.icon} boxSize={6} />
                            </Box>
                            
                        <VStack spacing={2} align="center" flex={1}>
                              <Text 
                                fontWeight="bold" 
                            fontSize="md" 
                                color={textColor}
                                textAlign="center"
                              >
                                {link.name}
                              </Text>
                              
                              <Text 
                            fontSize="sm" 
                                color="gray.500" 
                                textAlign="center"
                                noOfLines={2}
                            lineHeight="1.4"
                              >
                                {link.desc}
                              </Text>
                            </VStack>
                        
                        <Icon 
                          as={FaArrowRight} 
                          color={link.color} 
                          boxSize={4}
                          opacity={0.7}
                        />
                          </VStack>
                    </MotionCard>
                      </Link>
                    ))}
                  </div>
            </Box>
          </Collapse>
              </Box>
            </MotionBox>

          {/* My Teachers - محاضرينى */}
          <MotionBox
  initial="hidden"
  animate="visible"
  variants={containerVariants}
        mb={{ base: 6, md: 8 }}
>
  <Box
    bg={cardBg}
          borderRadius="2xl"
          shadow="lg"
    border="1px solid"
    borderColor={borderColor}
    overflow="hidden"
        >
          <Box
            bgGradient="linear(135deg, orange.50, orange.100)"
            px={6}
            py={4}
      borderBottom="1px solid"
      borderColor={borderColor}
          >
            <HStack spacing={3}>
              <Icon as={FaChalkboardTeacher} color="orange.500" boxSize={6} />
              <Heading size="md" color="orange.700">
          محاضرينى
        </Heading>
        <Badge 
                colorScheme="orange" 
                variant="solid" 
          borderRadius="full" 
                bg="orange.500"
        >
          مميز
        </Badge>
      </HStack>
          </Box>
    
          <Box p={6}>
      <MyTeacher />
    </Box>
  </Box>
</MotionBox>

          {/* My Lectures - كورساتي */}
          <MotionBox
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        mb={{ base: 6, md: 8 }}
          >
            <Box
              bg={cardBg}
          borderRadius="2xl"
          shadow="lg"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
            >
          <Box
            bgGradient="linear(135deg, blue.50, blue.100)"
            px={6}
            py={4}
                borderBottom="1px solid"
                borderColor={borderColor}
          >
            <HStack spacing={3}>
              <Icon as={FaBookOpen} color="blue.500" boxSize={6} />
              <Heading size="md" color="blue.700">
                    كورساتي
                  </Heading>
                  <Badge 
                    colorScheme="blue" 
                variant="solid" 
                    borderRadius="full" 
                bg="blue.500"
                  >
                    نشط
                  </Badge>
                </HStack>
          </Box>
              
          <Box p={6}>
                <MyLecture />
              </Box>
            </Box>
          </MotionBox>

      {/* Notification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg="blue.500" color="white" borderRadius="xl">
            <HStack spacing={3}>
              <Icon as={FaBell} />
              <Text>تفاصيل الإشعار</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            {selectedAnnouncement && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color="gray.800" mb={2}>
                    {selectedAnnouncement.title}
                  </Text>
                  <Text color="gray.600" lineHeight="1.6">
                    {selectedAnnouncement.message}
                  </Text>
                </Box>
                
                <HStack justify="space-between" fontSize="sm" color="gray.500">
                  <HStack spacing={2}>
                    <Icon as={FaClock} />
                    <Text>{selectedAnnouncement.time}</Text>
                  </HStack>
                  {selectedAnnouncement.urgent && (
                    <Badge colorScheme="red" variant="solid">
                      عاجل
                    </Badge>
                  )}
                </HStack>
        </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="ghost" mr={3}>
              إغلاق
            </Button>
            <Button 
              as={Link} 
              to="/competitions" 
              colorScheme="blue"
              leftIcon={<FaTrophy />}
            >
              عرض المسابقات
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default HomePage;
