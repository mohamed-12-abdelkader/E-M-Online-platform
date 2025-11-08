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
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Spinner,
  useToast,
  NumberInput,
  NumberInputField,
  Center,
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
  FaGamepad,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

import MyTeacher from "../myTeacher/MyTeacher";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import UserType from "../../Hooks/auth/userType";
import baseUrl from "../../api/baseUrl";
import BottomNavItems from "../../components/Footer/BottomNavItems";
import { Html5Qrcode } from "html5-qrcode";
import { io } from 'socket.io-client';
import { useRef } from "react";
import MyCourses from "../../components/courses/MyCourses";

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
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const notificationsLoading = false;
  const notifications = { notifications: [] };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const invitationModal = useDisclosure();
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
  const toast = useToast();

  // Game invitation state (for receiving invitations)
  const [latestInvitation, setLatestInvitation] = useState(null);
  const socketRef = useRef(null);

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

  // Fetch latest game invitation (initial load only, real-time updates come from WebSocket)
  const fetchLatestInvitation = async () => {
    try {
      const res = await baseUrl.get('/api/game/invitations/latest', { headers: authHeader });
      if (res?.data?.success && res?.data?.data) {
        const invitation = res.data.data;
        setLatestInvitation(invitation);
        
        // Open modal if invitation is pending (only on initial load)
        if (invitation.status === 'pending') {
          const now = new Date();
          const expiresAt = new Date(invitation.expiresAt);
          const timeDiff = expiresAt.getTime() - now.getTime();
          if (timeDiff > 0 || Math.abs(timeDiff) < 86400000) {
            setTimeout(() => {
              invitationModal.onOpen();
            }, 300);
          }
        }
      } else {
        // No invitation found
        setLatestInvitation(null);
      }
    } catch (e) {
      // Silent fail - no invitation or error
      setLatestInvitation(null);
    }
  };

  // Handle accept invitation
  const handleAcceptInvitation = async () => {
    if (!latestInvitation) return;
    try {
      const res = await baseUrl.post(`/api/game/accept/${latestInvitation.id}`, {}, { headers: authHeader });
      if (res?.data?.success) {
        toast({ title: 'تم قبول الدعوة!', status: 'success' });
        invitationModal.onClose();
        setLatestInvitation(null);
        // Navigate to game or start game logic here
      } else {
        toast({ title: res?.data?.message || 'فشل قبول الدعوة', status: 'error' });
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'فشل قبول الدعوة';
      toast({ title: errorMsg, status: 'error' });
    }
  };

  // Handle reject invitation
  const handleRejectInvitation = async () => {
    if (!latestInvitation) return;
    try {
      const res = await baseUrl.post(`/api/game/reject/${latestInvitation.id}`, {}, { headers: authHeader });
      if (res?.data?.success) {
        toast({ title: 'تم رفض الدعوة', status: 'info' });
        invitationModal.onClose();
        setLatestInvitation(null);
      } else {
        toast({ title: res?.data?.message || 'فشل رفض الدعوة', status: 'error' });
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'فشل رفض الدعوة';
      toast({ title: errorMsg, status: 'error' });
    }
  };

  // Fetch invitation on mount
  useEffect(() => {
    fetchLatestInvitation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // Setup WebSocket for real-time updates (Primary method)
  useEffect(() => {
    // Real-time invitation handler - processes invitation data and opens modal if needed
    const processNewInvitation = (invitation) => {
      if (!invitation) return;
      
      console.log('📨 Processing new invitation:', invitation);
      setLatestInvitation(invitation);
      
      // Open modal immediately if invitation is pending and valid
      if (invitation.status === 'pending') {
        const now = new Date();
        const expiresAt = new Date(invitation.expiresAt);
        const timeDiff = expiresAt.getTime() - now.getTime();
        
        // Open modal if not expired (or if date seems wrong, allow it for testing)
        if (timeDiff > 0 || Math.abs(timeDiff) < 86400000) {
          console.log('🎯 Opening invitation modal immediately');
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            invitationModal.onOpen();
          });
        }
      }
    };

    const tokenOnly = (localStorage.getItem('Authorization') || '').replace(/^Bearer\s+/i, '') || localStorage.getItem('token');
    let socketEndpoint;
    try {
      socketEndpoint = new URL(baseUrl.defaults.baseURL || window.location.origin).origin;
    } catch {
      socketEndpoint = window.location.origin;
    }

    const socket = io(socketEndpoint, {
      path: '/socket.io',
      withCredentials: true,
      auth: tokenOnly ? { token: tokenOnly } : {},
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected for game invitations, Socket ID:', socket.id);
      // Join a room for game invitations (if backend supports rooms)
      if (user?.id) {
        socket.emit('game:join-room', { userId: user?.id });
        console.log('📤 Emitted join-room for user:', user?.id);
      }
      // Also try alternative room join events
      socket.emit('join', `user-${user?.id}`);
      socket.emit('subscribe', { type: 'game-invitations', userId: user?.id });
      
      // Fetch latest invitation immediately after connection to ensure we have current state
      fetchLatestInvitation();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (e) => {
      console.error('❌ WebSocket connection error:', e);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      if (user?.id) {
        socket.emit('game:join-room', { userId: user?.id });
      }
    });

    // Catch-all listener: Listen to ALL events for debugging (Socket.IO feature)
    // This will catch ANY event sent from the backend
    const catchAllHandler = (eventName, ...args) => {
      const payload = args[0];
      // Log ALL events to help debug
      console.log(`🔍 [ALL EVENTS] WebSocket event [${eventName}]:`, payload);
      console.log(`📊 Event type:`, typeof payload, Array.isArray(payload) ? 'Array' : 'Object');
      
      // Check if this looks like an invitation event
      if (payload && (
        payload.invitation || 
        payload.data || 
        (payload.id && (payload.status || payload.inviterName || payload.lessonNames || payload.inviterId)) ||
        payload.status === 'pending' ||
        (typeof payload === 'object' && payload.inviterName) ||
        (typeof payload === 'object' && payload.lessonIds)
      )) {
        console.log('🎯 ✅✅✅ DETECTED INVITATION DATA in event:', eventName);
        handleInvitationEvent(payload, eventName);
      }
    };
    
    // Use socket.onAny to catch ALL events (Socket.IO built-in method)
    if (socket.onAny) {
      socket.onAny(catchAllHandler);
      console.log('👂 Listening to ALL WebSocket events via onAny');
    } else {
      console.warn('⚠️ socket.onAny is not available');
    }

    // Handler function for all invitation events
    const handleInvitationEvent = (payload, eventName = 'unknown') => {
      console.log(`📥 Received invitation event [${eventName}]:`, payload);
      console.log('📋 Full payload structure:', JSON.stringify(payload, null, 2));
      
      let invitation = null;
      // Try different payload structures
      if (payload?.invitation) {
        invitation = payload.invitation;
      } else if (payload?.data?.invitation) {
        invitation = payload.data.invitation;
      } else if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        // If data is the invitation object
        invitation = payload.data;
      } else if (payload?.id && (payload.status || payload.inviterName || payload.lessonNames || payload.inviterId)) {
        // If payload is the invitation itself
        invitation = payload;
      }
      
      if (invitation) {
        console.log('✅ Valid invitation found:', invitation);
        processNewInvitation(invitation);
      } else {
        console.log('⚠️ Could not extract invitation from payload');
        console.log('🔍 Payload keys:', Object.keys(payload || {}));
        // Try to fetch from API as fallback if WebSocket event structure is unexpected
        setTimeout(() => {
          fetchLatestInvitation();
        }, 1000);
      }
    };

    // Listen to ALL possible event names from backend
    const eventNames = [
      'game:invitation-received',
      'game:new-invitation',
      'game:invitation',
      'game:invitation-created',
      'invitation:new',
      'invitation:received',
      'invitation:created',
      'game:invite-received',
      'invite:received',
      'new:invitation',
      'invitation',
      'game:invitation-latest',
      'game:new-invite',
    ];

    // Register all event listeners
    eventNames.forEach(eventName => {
      socket.on(eventName, (payload) => handleInvitationEvent(payload, eventName));
    });

    // Listen for invitation status updates
    socket.on('game:invitation-updated', (payload) => {
      console.log('🔄 Invitation updated:', payload);
      if (payload?.invitation || payload?.data) {
        setLatestInvitation(payload.invitation || payload.data);
      }
    });

    // Cleanup
    return () => {
      if (socket.offAny && catchAllHandler) {
        socket.offAny(catchAllHandler);
      }
      eventNames.forEach(eventName => {
        socket.off(eventName);
      });
      socket.off('game:invitation-updated');
      socket.disconnect();
    };
  }, [invitationModal, user?.id]);

  // Note: SSE would require backend support and token in query params or cookies
  // Since backend already uses WebSocket (Socket.IO), we rely on WebSocket only

  // Debug: manually test modal (remove in production)
  useEffect(() => {
    if (latestInvitation && invitationModal.isOpen) {
      console.log('Modal is open with invitation:', latestInvitation);
    }
  }, [latestInvitation, invitationModal.isOpen]);


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
   
             {/* Header Section & Competition Notifications - الترحيب وإشعارات المسابقات */}
        <MotionBox
         initial="hidden"
         animate="visible"
         variants={containerVariants}
         mb={{ base: 5, md: 6 }}
       >
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
      {/* Header Section - الترحيب */}
           <Box
           bgGradient={"linear(135deg, blue.400, blue.600)"}
             
              borderRadius="2xl"
             p={{ base: 4, md: 5 }}
          position="relative"
          overflow="hidden"
              boxShadow="sm"
              height="100%"
               display="flex"
               flexDirection="column"
        >
                           <VStack 
                align={{ base: "center", lg: "flex-start" }} 
                spacing={{ base: 3, md: 3 }} 
                color="white"
                height="100%"
            justify="space-between"
              >
                <VStack spacing={{ base: 3, md: 4 }} align={{ base: "center", lg: "flex-start" }}>
          
              
              <Heading
                size={{ base: "md", md: "lg" }}
                fontWeight="extrabold"
                    textAlign={{ base: "center", lg: "right" }}
                textShadow="0 2px 4px rgba(0,0,0,0.2)"
                    lineHeight={1.2}
              >
                    مرحباً {user?.name || user?.fname || "المستخدم"} ! 🚀
              </Heading>
              

            </VStack>

                <VStack spacing={2} align="center">
                <Text 
                  fontWeight="bold" 
                    fontSize={{ base: "md", md: "lg" }} 
                  textShadow="0 2px 4px rgba(0,0,0,0.3)" 
                >
                  {user?.fname || ""} {user?.lname || ""}
                </Text>
                
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} opacity={0.8}>
                  كود الطالب: {user?.id || "غير متاح"}
                </Text>
                
               
              </VStack>
              </VStack>
           </Box>

           {/* Competition Notifications Section */}
           {competitionNotifications.length > 0 && (
             <VStack spacing={3} align="stretch" height="100%">
               {competitionNotifications.slice(0, 2).map((notification) => (
              <Box
                key={notification.id}
                   bgGradient={notification.type === 'league' ? "linear(135deg, blue.400, blue.600)" : "linear(135deg, blue.600, blue.400)"}
                borderRadius="xl"
                p={4}
                position="relative"
                overflow="hidden"
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
                           <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                          {notification.title}
                        </Text>
                        {notification.urgent && (
                          <Badge colorScheme="white" variant="solid" size="sm" borderRadius="full" bg="whiteAlpha.20">
                            عاجل
                          </Badge>
                        )}
                      </HStack>
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
                  </HStack>
                </HStack>
              </Box>
            ))}
            
               {competitionNotifications.length > 2 && (
              <Button
                as={Link}
                to="/competitions"
                size="md"
                   colorScheme="blue"
                variant="outline"
                borderRadius="full"
                   _hover={{ bg: "blue.50" }}
                rightIcon={<FaArrowRight />}
                w="100%"
              >
                عرض جميع الإشعارات ({competitionNotifications.length})
              </Button>
            )}
          </VStack>
      )}

         </SimpleGrid>
       </MotionBox>

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
            bgGradient={"linear(135deg, blue.300, blue.600)"}
            px={6}
            py={4}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
              <HStack spacing={3}>
              <Icon as={FaBookOpen} color="white" boxSize={6} />
              <Heading size="md" color="white">
                    كورساتي
                  </Heading>
               
            </HStack>
          </Box>
              
          <Box >
              <MyCourses/>
                        </Box>
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
            bgGradient={"linear(135deg, blue.300, blue.600)"}
            px={6}
            py={4}
      borderBottom="1px solid"
      borderColor={borderColor}
          >
            <HStack spacing={3}>
              <Icon as={FaChalkboardTeacher} color="white" boxSize={6} />
              <Heading size="md" color="white">
          محاضرينى
        </Heading>
      
      </HStack>
          </Box>
    
          <Box >
      <MyTeacher />
    </Box>
  </Box>
</MotionBox>

          {/* My Lectures - كورساتي */}

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
                          color={selectedAnnouncement.type === 'league' ? "blue.500" : "blue.500"} 
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
                      colorScheme={selectedAnnouncement.type === 'league' ? "blue" : "blue"} 
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
                      colorScheme={selectedAnnouncement.type === 'league' ? "blue" : "blue"} 
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
                colorScheme={selectedAnnouncement.type === 'league' ? "blue" : "blue"}
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


      {/* Game Invitation Modal */}
      <Modal isOpen={invitationModal.isOpen} onClose={invitationModal.onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader  bgGradient={"linear(135deg, blue.300, blue.600)"} py={6}>
            <HStack spacing={3}>
              <Box
                w="54px"
                h="54px"
                bg="whiteAlpha.200"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaTrophy} w="26px" h="26px" color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" color="white">دعوة للتحدي 🎮</Heading>
                <Text fontSize="sm" color="whiteAlpha.900">لديك دعوة جديدة من صديقك</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalBody bg="white" py={6}>
            {latestInvitation ? (
              <VStack spacing={4} align="stretch">
                {/* Inviter Info */}
                <Box bg="blue.50" borderRadius="lg" p={4} border="1px solid" borderColor="purple.100">
                  <HStack spacing={3}>
                    <Avatar name={latestInvitation.inviterName} size="md" bg="blue.500" />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold" color="purple.800" fontSize="lg">
                        {latestInvitation.inviterName}
                      </Text>
                      <Text fontSize="sm" color="purple.600">
                        يدعوك للعب معه! 🚀
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Lessons */}
                <Box>
                  <Text fontWeight="semibold" mb={3} color="gray.700">الدروس المختارة:</Text>
                  <VStack spacing={2} align="stretch">
                    {latestInvitation.lessonNames.map((lesson) => (
                      <HStack
                        key={lesson.id}
                        bg="blue.50"
                        p={3}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="blue.100"
                        justify="space-between"
                      >
                        <HStack spacing={2}>
                          <Icon as={FaBookOpen} color="blue.600" boxSize={4} />
                          <Text fontWeight="medium" color="blue.800">{lesson.name}</Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Game Details */}
                <SimpleGrid columns={2} spacing={4}>
                  <Box bg="gray.50" p={3} borderRadius="md" textAlign="center">
                    <Text fontSize="xs" color="gray.600" mb={1}>عدد الأسئلة</Text>
                    <Text fontWeight="bold" color="gray.800" fontSize="lg">{latestInvitation.questionsCount}</Text>
                  </Box>
                  <Box bg="gray.50" p={3} borderRadius="md" textAlign="center">
                    <Text fontSize="xs" color="gray.600" mb={1}>ينتهي في</Text>
                    <Text fontWeight="bold" color="gray.800" fontSize="sm" noOfLines={1}>
                      {new Date(latestInvitation.expiresAt).toLocaleTimeString('ar-EG', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FaTrophy} boxSize={12} color="gray.400" />
                  <Text color="gray.600" fontSize="lg">لا توجد دعوة حالياً</Text>
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    سيتم عرض الدعوات الجديدة تلقائياً عند وصولها
                  </Text>
                </VStack>
              </Center>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack w="full" justify="space-between" spacing={3}>
              <Button
                onClick={handleRejectInvitation}
                variant="outline"
                colorScheme="red"
                flex={1}
                borderRadius="xl"
                size="md"
                fontWeight="semibold"
              >
                رفض
              </Button>
              <Button
                onClick={handleAcceptInvitation}
                bgGradient="linear(135deg, blue.500, blue.600)"
               
                color="white"
                flex={1}
                borderRadius="xl"
                leftIcon={<FaTrophy />}
                fontWeight="bold"
                size="md"
              >
                قبول الدعوة
              </Button>
            </HStack>
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
