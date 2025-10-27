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
  FaHome,
  FaUser,
  FaQrcode,
  FaCamera,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import MyLecture from "../leacter/MyLecture";
import MyTeacher from "../myTeacher/MyTeacher";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import UserType from "../../Hooks/auth/userType";
import baseUrl from "../../api/baseUrl";
import BottomNavItems from "../../components/Footer/BottomNavItems";
import { Html5Qrcode } from "html5-qrcode";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// CSS للحركة المتحركة
const scanningAnimation = `
  @keyframes scanning {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const notificationsLoading = false;
  const notifications = { notifications: [] };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const quickActionsDisclosure = useDisclosure({ defaultIsOpen: false });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [userData, isAdmin, isTeacher, student] = UserType();
  const navigate = useNavigate();
  const location = useLocation();

  // إشعارات مسابقات/دوريات من الـ API
  const [competitionNotifications, setCompetitionNotifications] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanner, setQrScanner] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activationResult, setActivationResult] = useState(null);
  const [showNotificationBar, setShowNotificationBar] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
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

  // دالة تفعيل الكورس من خلال QR Code
  const activateCourseWithQR = async (qrData) => {
    try {
      const response = await baseUrl.post('api/course/scan-qr-activate', {
        qr_data: qrData
      }, {
        headers: authHeader
      });
      
      if (response.data.success) {
        setActivationResult({
          success: true,
          message: response.data.message || 'تم تفعيل الكورس بنجاح!',
          courseName: response.data.course_name || 'الكورس الجديد'
        });
        setShowSuccessModal(true);
        // إعادة تحميل البيانات بعد 3 ثوان
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error('خطأ في تفعيل الكورس:', error);
      
      // معالجة خاصة لرسالة "Activation code has been fully used"
      let errorMessage = error.response?.data?.message || 'حدث خطأ في تفعيل الكورس';
      let errorReason = error.response?.data?.reason || 'يرجى المحاولة مرة أخرى';
      
      if (errorMessage.includes('Activation code has been fully used') || 
          errorMessage.includes('fully used') ||
          errorMessage.includes('مستخدم من قبل')) {
        errorMessage = 'هذا الكود مستخدم من قبل';
        errorReason = 'تم استخدام كود التفعيل هذا مسبقاً. يرجى استخدام كود جديد أو التواصل مع الدعم الفني.';
      }
      
      setActivationResult({
        success: false,
        message: errorMessage,
        reason: errorReason
      });
      setShowErrorModal(true);
    }
  };

  // دالة بدء QR Scanner
  const startQrScanner = async () => {
    setIsScanning(true);
    
    try {
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.error("QR reader element not found");
        setIsScanning(false);
        return;
      }

      const html5Qrcode = new Html5Qrcode("qr-reader");
      
      // محاولة بدء الكاميرا تلقائياً
      try {
        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText, decodedResult) => {
            // تم قراءة QR Code بنجاح
            console.log("QR Code scanned:", decodedText);
            setIsScanning(false);
            html5Qrcode.stop().then(() => {
              html5Qrcode.clear();
              setQrScanner(null);
              setIsQrScannerOpen(false);
              activateCourseWithQR(decodedText);
            }).catch(() => {
              html5Qrcode.clear();
              setQrScanner(null);
              setIsQrScannerOpen(false);
              activateCourseWithQR(decodedText);
            });
          },
          (errorMessage) => {
            // خطأ في القراءة - لا نعرضه للمستخدم
          }
        ).catch((err) => {
          console.error("Error starting camera:", err);
          setIsScanning(false);
        });
        
        setQrScanner(html5Qrcode);
      } catch (err) {
        console.error("Camera permission error:", err);
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Error starting scanner:", error);
      setIsScanning(false);
    }
  };

  // دالة بدء الـ Modal وفتح الكاميرا
  const openQrScannerModal = () => {
    setIsQrScannerOpen(true);
  };

  // دالة إغلاق QR Scanner
  const closeQrScanner = async () => {
    setIsScanning(false);
    
    if (qrScanner) {
      try {
        const state = await qrScanner.getState();
        if (state === 2) { // Html5QrcodeState.SCANNING
          await qrScanner.stop();
        }
        qrScanner.clear();
        setQrScanner(null);
      } catch (error) {
        console.error("Error clearing scanner:", error);
        try {
          qrScanner.clear();
        } catch (e) {}
        setQrScanner(null);
      }
    }
    
    setIsQrScannerOpen(false);
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
        imageUrl: n.image_url,
        gradeId: n.grade_id,
        gradeName: n.grade_name,
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

  // بدء Scanner عندما يفتح الـ Modal
  useEffect(() => {
    if (isQrScannerOpen && !qrScanner) {
      // تأخير أكبر لضمان أن الـ Modal متكامل بالكامل
      const timer = setTimeout(() => {
        startQrScanner();
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQrScannerOpen]);

  // تنظيف Scanner عند إغلاق الـ Modal
  useEffect(() => {
    if (!isQrScannerOpen && qrScanner) {
      closeQrScanner();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQrScannerOpen]);

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

  const handleNotificationAction = (notification) => {
    if (notification.type === 'league') {
      // Navigate to leagues page using React Router
      navigate('/leagues');
    } else if (notification.type === 'competition') {
      // Navigate to competitions page using React Router
      navigate('/competitions');
    }
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

  const bottomNavItems = [
    { label: "الرئيسية", href: "/home", icon: FaHome },
    { label: "محاضرين", href: "/teachers", icon: FaChalkboardTeacher },
    { label: "كورساتي", href: "/my_courses", icon: FaBookOpen },
    { label: "سوشيال", href: "/social", icon: FaRocket },
    { label: "حسابي", href: "/profile", icon: FaUser },
  ];

  const isActivePath = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <>
      <style>{scanningAnimation}</style>
      <Box 
        width="100%" 
        minHeight="100vh" 
        bg={bgColor}
        py={{ base: 4, md: 6, lg: 8 }}
        pb={{ base: "96px", md: 6, lg: 8 }}
        px={{ base: 4, md: 6, lg: 8 }}
      >
      {/* Notification Bar */}
      {showNotificationBar && competitionNotifications.length > 0 && (
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          mb={6}
        >
          <VStack spacing={3}>
            {competitionNotifications.slice(0, 3).map((notification, index) => (
              <Box
                key={notification.id}
                bgGradient={notification.type === 'league' ? "linear(135deg, red.400, red.500)" : "linear(135deg, orange.400, orange.500)"}
                borderRadius="xl"
                p={4}
                position="relative"
                overflow="hidden"
                boxShadow={notification.type === 'league' ? "0 10px 25px rgba(239, 68, 68, 0.3)" : "0 10px 25px rgba(251, 146, 60, 0.3)"}
                w="100%"
                cursor="pointer"
                onClick={() => handleAnnouncementClick(notification)}
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                {/* Background Pattern */}
                <Box position="absolute" top={-10} right={-10} opacity={0.1}>
                  <Icon as={notification.type === 'league' ? FaTrophy : FaGift} w={24} h={24} color="white" />
                </Box>

                <HStack justify="space-between" align="center" color="white">
                  <HStack spacing={3} flex={1}>
                    <Icon as={notification.type === 'league' ? FaTrophy : FaGift} boxSize={5} />
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2} align="center">
                        <Text fontWeight="bold" fontSize="md">
                          {notification.title}
                        </Text>
                        {notification.urgent && (
                          <Badge colorScheme="white" variant="solid" size="sm" borderRadius="full" bg="whiteAlpha.20">
                            عاجل
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" opacity={0.9} noOfLines={2}>
                        {notification.message}
                      </Text>
                      {notification.gradeName && (
                        <Badge 
                          colorScheme="white" 
                          variant="outline" 
                          size="sm"
                          borderRadius="full"
                          bg="whiteAlpha.10"
                        >
                          {notification.gradeName}
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="white"
                      variant="outline"
                      borderRadius="full"
                      _hover={{ bg: "whiteAlpha.20" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnnouncementClick(notification);
                      }}
                    >
                      {notification.type === 'league' ? 'عرض الدوري' : 'عرض المسابقة'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: "whiteAlpha.20" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotificationBar(false);
                      }}
                      borderRadius="full"
                    >
                      ✕
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            ))}
            
            {/* زر عرض المزيد */}
            {competitionNotifications.length > 3 && (
              <Button
                as={Link}
                to="/competitions"
                size="md"
                colorScheme="orange"
                variant="outline"
                borderRadius="full"
                _hover={{ bg: "orange.50" }}
                rightIcon={<FaArrowRight />}
                w="100%"
              >
                عرض جميع الإشعارات ({competitionNotifications.length})
              </Button>
            )}
          </VStack>
        </MotionBox>
      )}
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

           {/* QR Code Activation Button */}
           <Box
             bgGradient="linear(135deg, orange.500, orange.600)"
             borderRadius="3xl"
             p={{ base: 4, md: 6, lg: 8 }}
             position="relative"
             overflow="hidden"
             boxShadow="0 20px 40px rgba(255, 140, 0, 0.3)"
             height="100%"
             display="flex"
             flexDirection="column"
             justifyContent="center"
             alignItems="center"
           >
             {/* Background Elements */}
             <Box position="absolute" top={-20} right={-20} opacity={0.1}>
               <Icon as={FaQrcode} w={32} h={32} color="white" />
             </Box>
             <Box position="absolute" bottom={-20} left={-20} opacity={0.1}>
               <Icon as={FaCamera} w={24} h={24} color="white" />
             </Box>

             <VStack spacing={4} color="white" textAlign="center">
               <Icon as={FaQrcode} w={16} h={16} />
               
               <Heading size="lg" fontWeight="bold" textShadow="0 4px 8px rgba(0,0,0,0.3)">
                 تفعيل كورس جديد
               </Heading>
               
               <Text fontSize="md" opacity={0.9} maxW="300px" lineHeight={1.6}>
                 قم بمسح QR Code الخاص بكورسك الجديد لتفعيله فوراً
               </Text>
               
               <Button
                 onClick={openQrScannerModal}
                 bg="white"
                 color="orange.600"
                 size="lg"
                 borderRadius="full"
                 px={8}
                 py={6}
                 fontWeight="bold"
                 _hover={{
                   bg: "orange.50",
                   transform: "translateY(-2px)",
                   boxShadow: "0 8px 25px rgba(255, 140, 0, 0.4)"
                 }}
                 leftIcon={<FaCamera />}
                 boxShadow="0 4px 15px rgba(255, 140, 0, 0.3)"
               >
                 مسح QR Code
               </Button>
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
          borderRadius="xl"
          shadow="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Box
            bg="blue.50"
            px={{ base: 4, md: 5 }}
            py={{ base: 4, md: 5 }}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3} justify="space-between" align="center">
              <HStack spacing={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="blue.500"
                  color="white"
                  shadow="md"
                >
                  <Icon as={FaLightbulb} boxSize={5} />
                </Box>
                <VStack align="flex-start" spacing={1}>
                  <Heading size="md" color="blue.700" fontWeight="bold">
                    الوصول السريع
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    أدواتك المفضلة في مكان واحد
                  </Text>
                </VStack>
              </HStack>
              <Button
                display={{ base: "inline-flex", md: "none" }}
                size="sm"
                variant="outline"
                colorScheme="blue"
                borderRadius="lg"
                px={4}
                onClick={quickActionsDisclosure.isOpen ? quickActionsDisclosure.onClose : quickActionsDisclosure.onOpen}
                rightIcon={<FaArrowRight style={{ transform: quickActionsDisclosure.isOpen ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform 0.3s ease' }} />}
                _hover={{
                  bg: "blue.50",
                  transform: "translateY(-1px)"
                }}
                transition="all 0.2s ease"
              >
                {quickActionsDisclosure.isOpen ? 'إخفاء' : 'عرض'}
              </Button>
            </HStack>
          </Box>
              
          <Collapse in={isDesktop || quickActionsDisclosure.isOpen} animateOpacity style={{ overflow: 'hidden' }}>
            <Box p={{ base: 4, md: 5 }}>
              <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainLinks.map((link, index) => (
                  <Link className="w-full link-div" key={index} to={link.href}>
                    <MotionCard
                      variants={itemVariants}
                      bg={cardBg}
                      borderRadius="xl"
                      shadow="md"
                      p={{ base: 4, md: 5 }}
                      cursor="pointer"
                      border="1px solid"
                      borderColor={borderColor}
                      _hover={{ 
                        transform: "translateY(-4px)", 
                        shadow: "lg",
                        borderColor: "blue.300"
                      }}
                      transition="all 0.3s ease"
                      height="100%"
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                      alignItems="center"
                      role="group"
                    >
                      <VStack spacing={4} align="center" width="100%">
                        <Box
                          p={4}
                          borderRadius="xl"
                          bgGradient={link.gradient}
                          color="white"
                          shadow="md"
                          _groupHover={{
                            transform: "scale(1.05)",
                            shadow: "lg"
                          }}
                          transition="all 0.3s ease"
                        >
                          <Icon as={link.icon} boxSize={6} />
                        </Box>

                        <VStack spacing={2} align="center" width="100%">
                          <Text 
                            fontWeight="bold" 
                            fontSize="lg" 
                            color={textColor}
                            textAlign="center"
                            _groupHover={{ color: "blue.600" }}
                            transition="color 0.3s ease"
                          >
                            {link.name}
                          </Text>

                          <Text 
                            fontSize="sm" 
                            color="gray.500" 
                            textAlign="center"
                            noOfLines={2}
                            lineHeight="1.4"
                            _groupHover={{ color: "gray.600" }}
                            transition="color 0.3s ease"
                          >
                            {link.desc}
                          </Text>
                        </VStack>

                        <Box
                          p={2}
                          borderRadius="lg"
                          bg="gray.100"
                          _groupHover={{
                            bg: "blue.50",
                            transform: "translateX(2px)"
                          }}
                          transition="all 0.3s ease"
                        >
                          <Icon 
                            as={FaArrowRight} 
                            color="blue.500" 
                            boxSize={4}
                            _groupHover={{ color: "blue.600" }}
                            transition="color 0.3s ease"
                          />
                        </Box>
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
    
          <Box >
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
              
          <Box >
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
              <VStack spacing={6} align="stretch">
                {/* Image Section */}
                {selectedAnnouncement.imageUrl && (
                  <Box
                    w="full"
                    h="200px"
                    borderRadius="xl"
                    overflow="hidden"
                    bg={selectedAnnouncement.type === 'league' ? 'red.50' : 'orange.50'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <img 
                      src={selectedAnnouncement.imageUrl} 
                      alt={selectedAnnouncement.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}

                {/* Content Section */}
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={2}>
                        <Icon 
                          as={selectedAnnouncement.type === 'league' ? FaTrophy : FaGift} 
                          color={selectedAnnouncement.type === 'league' ? "red.500" : "orange.500"} 
                          boxSize={5}
                        />
                        <Text fontWeight="bold" fontSize="xl" color="gray.800">
                          {selectedAnnouncement.title}
                        </Text>
                      </HStack>
                      
                      <Text color="gray.600" lineHeight="1.6" fontSize="md">
                        {selectedAnnouncement.message}
                      </Text>
                    </VStack>
                    
                    {selectedAnnouncement.urgent && (
                      <Badge colorScheme="red" variant="solid" size="lg" borderRadius="full">
                        عاجل
                      </Badge>
                    )}
                  </HStack>
                  
                  {/* Grade Badge */}
                  {selectedAnnouncement.gradeName && (
                    <Badge 
                      colorScheme={selectedAnnouncement.type === 'league' ? "red" : "orange"} 
                      variant="subtle" 
                      size="lg"
                      borderRadius="full"
                      px={4}
                      py={2}
                      alignSelf="flex-start"
                    >
                      {selectedAnnouncement.gradeName}
                    </Badge>
                  )}
                  
                  <HStack justify="space-between" fontSize="sm" color="gray.500">
                    <HStack spacing={2}>
                      <Icon as={FaClock} />
                      <Text>{selectedAnnouncement.time}</Text>
                    </HStack>
                    <Badge 
                      colorScheme={selectedAnnouncement.type === 'league' ? "red" : "orange"} 
                      variant="outline"
                    >
                      {selectedAnnouncement.type === 'league' ? 'دوري' : 'مسابقة'}
                    </Badge>
                  </HStack>
                </VStack>
        </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="ghost" mr={3}>
              إغلاق
            </Button>
            {selectedAnnouncement && (
              <Button 
                onClick={() => {
                  onClose();
                  handleNotificationAction(selectedAnnouncement);
                }}
                colorScheme={selectedAnnouncement.type === 'league' ? "red" : "orange"}
                leftIcon={selectedAnnouncement.type === 'league' ? <FaTrophy /> : <FaGift />}
                _hover={{ 
                  bg: selectedAnnouncement.type === 'league' ? "red.600" : "orange.600",
                  transform: "scale(1.05)"
                }}
              >
                {selectedAnnouncement.type === 'league' ? 'عرض الدوري' : 'عرض المسابقة'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal 
        isOpen={isQrScannerOpen} 
        onClose={closeQrScanner} 
        isCentered 
        size="xl"
        closeOnOverlayClick={false}
        closeOnEsc={true}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="orange.50" py={6}>
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, #ff8c00 0%, #ff6b00 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaQrcode} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="orange.800">
                تفعيل كورس جديد
              </Text>
              <Text fontSize="md" color="orange.600">
                ضع QR Code داخل المربع
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Box
                position="relative"
                w="100%"
                h="400px"
                borderRadius="lg"
                overflow="hidden"
                border="2px solid"
                borderColor="orange.200"
                bg="gray.100"
              >
                {/* العنصر الذي سيحتوي على الكاميرا */}
                <div
                  id="qr-reader"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative"
                  }}
                />
                
                {/* Scanning Animation Bar */}
                {isScanning && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="0"
                    right="0"
                    height="3px"
                    bg="linear-gradient(90deg, transparent, #ff6b00, transparent)"
                    transform="translateY(-50%)"
                    animation="scanning 2s linear infinite"
                    zIndex={10}
                    pointerEvents="none"
                  />
                )}
                
                {/* Scanning Text */}
                {isScanning && (
                  <Box
                    position="absolute"
                    bottom="20px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="blackAlpha.700"
                    color="white"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                    zIndex={10}
                    pointerEvents="none"
                  >
                    🔍 جاري المسح...
                  </Box>
                )}
              </Box>
              
              <Box
                bg="orange.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="orange.200"
                w="full"
              >
                <Text fontSize="sm" color="orange.700" fontWeight="medium" mb={2}>
                  💡 تعليمات الاستخدام:
                </Text>
                <Text fontSize="sm" color="orange.600">
                  • امنح الإذن لاستخدام الكاميرا عند الطلب<br/>
                  • وجه الكاميرا نحو QR Code<br/>
                  • سيتم قراءة الكود تلقائياً
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <Button
              onClick={closeQrScanner}
              bg="gray.500"
              color="white"
              _hover={{
                bg: "gray.600"
              }}
              borderRadius="xl"
              px={8}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="green.50" py={6}>
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaTrophy} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="green.800">
                تم تفعيل الكورس بنجاح! 🎉
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="green.600" fontWeight="medium">
                {activationResult?.courseName}
              </Text>
              <Text fontSize="md" color="gray.600">
                {activationResult?.message}
              </Text>
              
              <Box
                bg="green.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="green.200"
                w="full"
              >
                <Text fontSize="sm" color="green.700" fontWeight="medium" mb={2}>
                  🎓 مبروك! يمكنك الآن الوصول إلى:
                </Text>
                <Text fontSize="sm" color="green.600">
                  • محتوى الكورس الكامل<br/>
                  • الاختبارات والتمارين<br/>
                  • الشهادات والإنجازات
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <Button
              onClick={() => setShowSuccessModal(false)}
              bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
              color="white"
              _hover={{
                bgGradient: "linear(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
              }}
              borderRadius="xl"
              boxShadow="0 8px 20px rgba(16, 185, 129, 0.3)"
              px={8}
            >
              متابعة
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="red.50" py={6}>
            <VStack spacing={3}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear(135deg, #ef4444 0%, #dc2626 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaBell} w="30px" h="30px" color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="red.800">
                {activationResult?.message?.includes('مستخدم من قبل') ? 'الكود مستخدم من قبل' : 'لم يتم تفعيل الكورس'}
              </Text>
            </VStack>
          </ModalHeader>
          
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="red.600" fontWeight="medium">
                {activationResult?.message}
              </Text>
              
              <Box
                bg="red.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="red.200"
                w="full"
              >
                <Text fontSize="sm" color="red.700" fontWeight="medium" mb={2}>
                  🔍 السبب:
                </Text>
                <Text fontSize="sm" color="red.600">
                  {activationResult?.reason}
                </Text>
              </Box>
              
              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="blue.200"
                w="full"
              >
                <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={2}>
                  💡 نصائح لحل المشكلة:
                </Text>
                <Text fontSize="sm" color="blue.600">
                  {activationResult?.message?.includes('مستخدم من قبل') ? (
                    <>
                      • تأكد من استخدام كود جديد<br/>
                      • تحقق من صحة QR Code<br/>
                      • تواصل مع الدعم الفني للحصول على كود جديد
                    </>
                  ) : (
                    <>
                      • تأكد من صحة QR Code<br/>
                      • تحقق من اتصال الإنترنت<br/>
                      • تواصل مع الدعم الفني
                    </>
                  )}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter justifyContent="center" py={6}>
            <Button
              onClick={() => setShowErrorModal(false)}
              bg="gray.500"
              color="white"
              _hover={{
                bg: "gray.600"
              }}
              borderRadius="xl"
              px={8}
              mr={3}
            >
              إغلاق
            </Button>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                startQrScanner();
              }}
              bgGradient="linear(135deg, #3b82f6 0%, #2563eb 100%)"
              color="white"
              _hover={{
                bgGradient: "linear(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)"
              }}
              borderRadius="xl"
              boxShadow="0 8px 20px rgba(59, 130, 246, 0.3)"
              px={8}
            >
              المحاولة مرة أخرى
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Mobile Bottom Navigation */}
   
      </Box>
    </>
  );
};

export default HomePage;
