import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Container,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaTrophy,
  FaBookOpen,
  FaLightbulb,
  FaRocket,
  FaQrcode,
  FaCamera,
  FaGift,
  FaBell,
  FaChevronLeft,
  FaChalkboardTeacher,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import UserType from "../../Hooks/auth/userType";
import baseUrl from "../../api/baseUrl";
import { Html5Qrcode } from "html5-qrcode";
import { io } from "socket.io-client";
import MyCourses from "../../components/courses/MyCourses";
import MyTeacher from "../myTeacher/MyTeacher";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const HomePage = () => {
  // --- Logic & State (Preserved) ---
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const { isOpen, onOpen, onClose } = useDisclosure(); // For announcement modal
  const invitationModal = useDisclosure(); // For game invite
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [userData] = UserType();
  const navigate = useNavigate();
  const location = useLocation();

  // Notifications & Feed
  const [competitionNotifications, setCompetitionNotifications] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");

  // QR Scanner
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanner, setQrScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activationResult, setActivationResult] = useState(null);

  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    }),
    []
  );
  const toast = useToast();

  // Socket & Invites
  const [latestInvitation, setLatestInvitation] = useState(null);
  const socketRef = useRef(null);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("ar-EG", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  // --- API Functions ---

  const activateCourseWithQR = async (qrData) => {
    try {
      const response = await baseUrl.post(
        "api/course/scan-qr-activate",
        { qr_data: qrData },
        { headers: authHeader }
      );
      if (response.data.success) {
        setActivationResult({
          success: true,
          message: response.data.message || "تم تفعيل الكورس بنجاح!",
          courseName: response.data.course_name || "الكورس الجديد",
        });
        setShowSuccessModal(true);
        setTimeout(() => window.location.reload(), 3000);
      }
    } catch (error) {
      let errorMessage =
        error.response?.data?.message || "حدث خطأ في تفعيل الكورس";
      let errorReason =
        error.response?.data?.reason || "يرجى المحاولة مرة أخرى";
      if (
        errorMessage.includes("Activation code has been fully used") ||
        errorMessage.includes("fully used")
      ) {
        errorMessage = "هذا الكود مستخدم من قبل";
        errorReason = "تم استخدام كود التفعيل هذا مسبقاً.";
      }
      setActivationResult({
        success: false,
        message: errorMessage,
        reason: errorReason,
      });
      setShowErrorModal(true);
    }
  };

  const startQrScanner = async () => {
    setIsScanning(true);
    try {
      const element = document.getElementById("qr-reader");
      if (!element) return setIsScanning(false);

      const html5Qrcode = new Html5Qrcode("qr-reader");
      try {
        await html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setIsScanning(false);
            html5Qrcode
              .stop()
              .then(() => {
                html5Qrcode.clear();
                setQrScanner(null);
                setIsQrScannerOpen(false);
                activateCourseWithQR(decodedText);
              })
              .catch(() => {
                html5Qrcode.clear();
                setQrScanner(null);
                setIsQrScannerOpen(false);
                activateCourseWithQR(decodedText);
              });
          },
          () => {}
        );
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

  const closeQrScanner = async () => {
    setIsScanning(false);
    if (qrScanner) {
      try {
        if ((await qrScanner.getState()) === 2) await qrScanner.stop();
        qrScanner.clear();
        setQrScanner(null);
      } catch (e) {
        console.error(e);
      }
    }
    setIsQrScannerOpen(false);
  };

  useEffect(() => {
    if (isQrScannerOpen && !qrScanner) {
      const timer = setTimeout(startQrScanner, 500);
      return () => clearTimeout(timer);
    }
  }, [isQrScannerOpen]);

  useEffect(() => {
    if (!isQrScannerOpen && qrScanner) closeQrScanner();
  }, [isQrScannerOpen]);

  // Feed Fetching
  const fetchGradeFeed = async () => {
    try {
      setFeedLoading(true);
      setFeedError("");
      const res = await baseUrl.get("/api/notifications/grade-feed", {
        headers: authHeader,
      });
      const feed = res?.data?.feed || [];
      const mapped = feed.map((n, idx) => ({
        id: `${n.type}-${n.item_id}-${idx}`,
        title: n.title,
        message:
          n.description ||
          (n.type === "league" ? "دوري جديد متاح لصفك" : "مسابقة جديدة لصفك"),
        time: formatDateTime(n.created_at),
        type: n.type,
        urgent: n.type === "league",
        itemId: n.item_id,
        imageUrl: n.image_url,
      }));
      setCompetitionNotifications(mapped);
    } catch (e) {
      setFeedError("تعذر جلب إشعارات الصف");
      setCompetitionNotifications([]);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeFeed();
  }, [authHeader]);

  // Socket Logic
  const fetchLatestInvitation = async () => {
    try {
      const res = await baseUrl.get("/api/game/invitations/latest", {
        headers: authHeader,
      });
      if (res?.data?.success && res?.data?.data) {
        setLatestInvitation(res.data.data);
        if (res.data.data.status === "pending") invitationModal.onOpen();
      } else {
        setLatestInvitation(null);
      }
    } catch (e) {
      setLatestInvitation(null);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!latestInvitation) return;
    try {
      const res = await baseUrl.post(
        `/api/game/accept/${latestInvitation.id}`,
        {},
        { headers: authHeader }
      );
      if (res?.data?.success) {
        toast({ title: "تم قبول الدعوة!", status: "success" });
        invitationModal.onClose();
        setLatestInvitation(null);
      } else {
        toast({
          title: res?.data?.message || "فشل قبول الدعوة",
          status: "error",
        });
      }
    } catch (e) {
      toast({
        title: e.response?.data?.message || "فشل قبول الدعوة",
        status: "error",
      });
    }
  };

  const handleRejectInvitation = async () => {
    if (!latestInvitation) return;
    try {
      const res = await baseUrl.post(
        `/api/game/reject/${latestInvitation.id}`,
        {},
        { headers: authHeader }
      );
      if (res?.data?.success) {
        toast({ title: "تم رفض الدعوة", status: "info" });
        invitationModal.onClose();
        setLatestInvitation(null);
      }
    } catch (e) {
      toast({
        title: e.response?.data?.message || "فشل رفض الدعوة",
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchLatestInvitation();
  }, [authHeader]);

  useEffect(() => {
    const processNewInvitation = (invitation) => {
      if (!invitation) return;
      setLatestInvitation(invitation);
      if (invitation.status === "pending") invitationModal.onOpen();
    };

    const tokenOnly =
      (localStorage.getItem("Authorization") || "").replace(
        /^Bearer\s+/i,
        ""
      ) || localStorage.getItem("token");
    let socketEndpoint;
    try {
      socketEndpoint = new URL(
        baseUrl.defaults.baseURL || window.location.origin
      ).origin;
    } catch {
      socketEndpoint = window.location.origin;
    }

    const socket = io(socketEndpoint, {
      path: "/socket.io",
      withCredentials: true,
      auth: tokenOnly ? { token: tokenOnly } : {},
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (user?.id) {
        socket.emit("game:join-room", { userId: user?.id });
        socket.emit("join", `user-${user?.id}`);
        socket.emit("subscribe", {
          type: "game-invitations",
          userId: user?.id,
        });
      }
      fetchLatestInvitation();
    });

    const handleInvitationEvent = (payload) => {
      let invitation =
        payload?.invitation ||
        payload?.data?.invitation ||
        (payload?.id ? payload : null);
      if (invitation) processNewInvitation(invitation);
      else fetchLatestInvitation();
    };

    const eventNames = [
      "game:invitation-received",
      "game:new-invitation",
      "game:invitation",
      "invitation:new",
      "invitation:received",
    ];
    eventNames.forEach((evt) => socket.on(evt, handleInvitationEvent));

    return () => {
      socket.disconnect();
    };
  }, [invitationModal, user?.id]);

  // --- UI Styling (براند: blue.500 & orange.500) ---
  const mainLinks = [
    {
      name: "دوري Next",
      href: "/leagues",
      icon: FaTrophy,
      iconBg: "orange.500",
      desc: "نافس وتحدى زملائك",
    },
    {
      name: "بنك الأسئلة",
      href: "/question_bank",
      icon: FaLightbulb,
      iconBg: "blue.500",
      desc: "تدرب على آلاف الأسئلة",
    },
    {
      name: "Next سوشيال",
      href: "/social",
      icon: FaRocket,
      iconBg: "orange.500",
      desc: "مجتمع طلابي متفاعل",
    },
    {
      name: "كورساتي",
      href: "/my_courses",
      icon: FaBookOpen,
      iconBg: "blue.500",
      desc: "تابع دروسك وتقدمك",
    },
  ];

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const heroShadow = useColorModeValue(
    "0 20px 40px rgba(66, 153, 225, 0.25)",
    "0 20px 40px rgba(0,0,0,0.3)"
  );
  const blurBlue = useColorModeValue(0.06, 0.08);
  const blurOrange = useColorModeValue(0.05, 0.07);
  const linkCardShadow = useColorModeValue(
    "0 16px 40px rgba(66, 153, 225, 0.12)",
    "0 16px 40px rgba(0,0,0,0.35)"
  );
  const modalBg = useColorModeValue("white", "gray.800");
  const modalBorder = useColorModeValue("gray.200", "gray.700");
  const modalText = useColorModeValue("gray.700", "gray.300");
  const modalTextMuted = useColorModeValue("gray.600", "gray.400");
  const inviteHeaderBg = useColorModeValue(
    "linear(to-br, blue.500, blue.600)",
    "linear(to-br, blue.600, blue.700)"
  );
  const successIconColor = useColorModeValue("green.500", "green.400");
  const successTextColor = useColorModeValue("green.600", "green.300");
  const errorIconColor = useColorModeValue("red.500", "red.400");
  const errorTextColor = useColorModeValue("red.600", "red.300");

  return (
    <Box
      minH="100vh"
      pb={10}
      position="relative"
      overflow="hidden"
      bg={bgColor}
      dir="rtl"
      style={{ fontFamily: "'Changa', sans-serif" }}
    >
      {/* خلفية خفيفة */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="400px"
        h="400px"
        bg="blue.400"
        opacity={blurBlue}
        filter="blur(100px)"
        borderRadius="full"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-20%"
        left="-10%"
        w="350px"
        h="350px"
        bg="orange.400"
        opacity={blurOrange}
        filter="blur(100px)"
        borderRadius="full"
        zIndex={0}
      />

      <Container
        maxW="container.xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        {/* 1. ترحيب + تفعيل كورس — هيرو براند موحّد */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          mb={8}
          borderRadius="2xl"
          overflow="hidden"
          position="relative"
          boxShadow={heroShadow}
          bg={cardBg}
          borderWidth="1px"
          borderColor={cardBorder}
        >
          {/* شريط علوي برتقالي براند */}
          <Box h="4" w="100%" bgGradient="linear(to-r, blue.400, blue.500)" />
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
            gap={{ base: 6, md: 8 }}
            p={{ base: 5, md: 6 }}
          >
            {/* الترحيب */}
            <HStack spacing={{ base: 4, md: 6 }} flex="1">
              <Box position="relative">
                <Avatar
                  size={{ base: "xl", md: "2xl" }}
                  name={user?.name || user?.fname}
                  src={user?.avatar}
                  border="4px solid"
                  borderColor="blue.500"
                  boxShadow="0 8px 24px rgba(66, 153, 225, 0.35)"
                />
                <Box
                  position="absolute"
                  bottom="0"
                  right="0"
                  w="6"
                  h="6"
                  borderRadius="full"
                  bg="green.400"
                  border="3px solid"
                  borderColor={cardBg}
                />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text
                  fontSize="sm"
                  color="orange.500"
                  fontWeight="bold"
                  letterSpacing="wider"
                >
                  أهلاً بك 👋
                </Text>
                <Heading
                  size={{ base: "lg", md: "xl" }}
                  color={headingColor}
                  fontWeight="bold"
                >
                  {user?.name || user?.fname || "طالب نجيب"}
                </Heading>
                <Badge
                  bg="blue.50"
                  color="blue.600"
                  _dark={{ bg: "blue.900", color: "blue.200" }}
                  fontSize="0.75rem"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="semibold"
                >
                  كود الطالب: {user?.id}
                </Badge>
              </VStack>
            </HStack>

            {/* زر تفعيل كورس — CTA برتقالي */}
            <Flex
              align="center"
              justify={{ base: "center", md: "flex-end" }}
              flexShrink={0}
            >
              <Button
                leftIcon={<Icon as={FaQrcode} boxSize={6} />}
                size="lg"
                minH="64px"
                px={8}
                borderRadius="2xl"
                bgGradient="linear(to-r, orange.500, orange.600)"
                color="white"
                fontWeight="bold"
                boxShadow="0 8px 24px rgba(237, 137, 54, 0.4)"
                _hover={{
                  bgGradient: "linear(to-r, orange.400, orange.500)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 32px rgba(237, 137, 54, 0.45)",
                }}
                _active={{ transform: "scale(0.98)" }}
                onClick={() => setIsQrScannerOpen(true)}
                transition="all 0.2s"
                flexDirection="column"
                gap={0}
                alignItems="flex-start"
              >
                <Text fontSize="lg">تفعيل كورس</Text>
                <Text fontSize="xs" fontWeight="normal" opacity={0.95}>
                  امسح الكود الآن
                </Text>
              </Button>
            </Flex>
          </Flex>
        </MotionBox>

        {/* 2. شبكة الروابط الرئيسية */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={10}>
          {mainLinks.map((link, idx) => (
            <Link key={idx} to={link.href}>
              <MotionCard
                whileHover={{ y: -6 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={cardBorder}
                boxShadow="md"
                bg={cardBg}
                h="full"
                overflow="hidden"
                _hover={{
                  borderColor: "blue.400",
                  boxShadow: linkCardShadow,
                }}
              >
                <Box h="4px" bg={link.iconBg} />
                <VStack p={6} align="center" spacing={4}>
                  <Flex
                    w="14"
                    h="14"
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    bg={link.iconBg}
                    color="white"
                    boxShadow="md"
                  >
                    <Icon as={link.icon} boxSize={6} />
                  </Flex>
                  <VStack spacing={1}>
                    <Heading size="md" color={headingColor}>
                      {link.name}
                    </Heading>
                    <Text fontSize="sm" color={subtextColor} textAlign="center">
                      {link.desc}
                    </Text>
                  </VStack>
                </VStack>
              </MotionCard>
            </Link>
          ))}
        </SimpleGrid>

        {/* 3. كورساتي + محاضروك — سكاشن موحّدة مع البراند */}
        <VStack width="100%" align="stretch" spacing={10}>
          <MyCourses embedded />
          <MyTeacher embedded />
        </VStack>
      </Container>

      {/* --- Modals --- */}

      {/* 1. Announcement Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent
          borderRadius="2xl"
          bg={modalBg}
          borderWidth="1px"
          borderColor={modalBorder}
        >
          <ModalHeader
            bgGradient="linear(to-r, blue.500, blue.600)"
            color="white"
            borderTopRadius="2xl"
            py={5}
          >
            {selectedAnnouncement?.title}
          </ModalHeader>
          <ModalBody p={6}>
            {selectedAnnouncement?.imageUrl && (
              <Box
                mb={4}
                borderRadius="xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={modalBorder}
              >
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt="Event"
                  style={{ width: "100%" }}
                />
              </Box>
            )}
            <Text fontSize="lg" color={modalText} lineHeight="tall">
              {selectedAnnouncement?.message}
            </Text>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={modalBorder}>
            <Button
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              onClick={() => {
                onClose();
                if (selectedAnnouncement?.type === "league")
                  navigate("/leagues");
              }}
            >
              الذهاب للتفاصيل
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2. QR Scanner Modal */}
      <Modal
        isOpen={isQrScannerOpen}
        onClose={closeQrScanner}
        isCentered
        size="xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent
          borderRadius="2xl"
          bg={modalBg}
          borderWidth="1px"
          borderColor={modalBorder}
        >
          <ModalHeader
            textAlign="center"
            borderBottomWidth="1px"
            borderColor={modalBorder}
            bg="blue.500"
            color="white"
            borderTopRadius="2xl"
            py={5}
          >
            تفعيل الكورس
          </ModalHeader>
          <ModalBody py={8}>
            <VStack spacing={5}>
              <Box
                w="100%"
                h="300px"
                bg="black"
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                borderWidth="2px"
                borderColor="blue.400"
              >
                <div
                  id="qr-reader"
                  style={{ width: "100%", height: "100%" }}
                ></div>
                {isScanning && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={10}
                  >
                    <Spinner color="blue.400" size="xl" />
                  </Box>
                )}
              </Box>
              <Text textAlign="center" color={modalTextMuted}>
                وجه الكاميرا نحو كود الـ QR الخاص بالكورس
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter
            justify="center"
            borderTopWidth="1px"
            borderColor={modalBorder}
          >
            <Button
              variant="outline"
              colorScheme="red"
              onClick={closeQrScanner}
            >
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 3. Game Invitation Modal */}
      <Modal
        isOpen={invitationModal.isOpen}
        onClose={invitationModal.onClose}
        isCentered
        size="md"
        closeOnOverlayClick={false}
      >
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent
          borderRadius="3xl"
          bg={modalBg}
          borderWidth="1px"
          borderColor={modalBorder}
          boxShadow="2xl"
        >
          <ModalBody p={0}>
            <Box
              bgGradient={inviteHeaderBg}
              p={6}
              borderTopRadius="3xl"
              textAlign="center"
              color="white"
            >
              <Icon as={FaTrophy} boxSize={12} mb={2} />
              <Heading size="lg">تحدي جديد!</Heading>
              <Text fontSize="lg" mt={2}>
                {latestInvitation?.inviterName || "منافس"} يتحداك!
              </Text>
            </Box>
            <VStack p={6} spacing={6}>
              <HStack justify="center" spacing={8} w="full">
                <VStack>
                  <Avatar
                    size="lg"
                    src={latestInvitation?.inviterAvatar}
                    name={latestInvitation?.inviterName}
                    border="3px solid"
                    borderColor="blue.400"
                  />
                  <Text fontWeight="bold" color={headingColor}>
                    {latestInvitation?.inviterName}
                  </Text>
                </VStack>
                <Badge colorScheme="orange" fontSize="lg" px={3} py={1}>
                  VS
                </Badge>
                <VStack>
                  <Avatar
                    size="lg"
                    src={user?.avatar}
                    name={user?.name}
                    border="3px solid"
                    borderColor="orange.400"
                  />
                  <Text fontWeight="bold" color={headingColor}>
                    أنت
                  </Text>
                </VStack>
              </HStack>
              <HStack w="full" spacing={3}>
                <Button
                  flex={1}
                  variant="outline"
                  colorScheme="red"
                  onClick={handleRejectInvitation}
                >
                  رفض
                </Button>
                <Button
                  flex={1}
                  bg="orange.500"
                  color="white"
                  _hover={{ bg: "orange.600" }}
                  onClick={handleAcceptInvitation}
                  leftIcon={<Icon as={FaRocket} />}
                >
                  قبول التحدي
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Success/Error Alerts */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
        <ModalContent
          textAlign="center"
          borderRadius="2xl"
          p={8}
          bg={modalBg}
          borderWidth="1px"
          borderColor={modalBorder}
        >
          <Icon
            as={FaTrophy}
            color={successIconColor}
            boxSize={16}
            mx="auto"
            mb={4}
          />
          <Heading size="md" color={successTextColor} mb={2}>
            تم التفعيل بنجاح!
          </Heading>
          <Text color={modalText}>{activationResult?.courseName}</Text>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
        <ModalContent
          textAlign="center"
          borderRadius="2xl"
          p={8}
          bg={modalBg}
          borderWidth="1px"
          borderColor={modalBorder}
        >
          <Icon
            as={FaBell}
            color={errorIconColor}
            boxSize={16}
            mx="auto"
            mb={4}
          />
          <Heading size="md" color={errorTextColor} mb={2}>
            خطأ في التفعيل
          </Heading>
          <Text color={modalText}>{activationResult?.message}</Text>
          <Text fontSize="sm" mt={2} color={modalTextMuted}>
            {activationResult?.reason}
          </Text>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default HomePage;
