import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  VStack,
  Icon,
  useColorModeValue,
  Container,
  Button,
  HStack
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";
import { FaPlayCircle, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

const MotionBox = motion(Box);

const Video = () => {
  const { videoId, token: urlToken } = useParams();
  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const playerRef = useRef(null);

  const mainBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const shadow = useColorModeValue("xl", "dark-lg");

  // Get token from URL or localStorage
  const getToken = () => {
    if (urlToken) {
      return decodeURIComponent(urlToken);
    }
    return localStorage.getItem("token") || "";
  };

  // استرجاع رابط الفيديو من API
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          setError("لم يتم العثور على رمز الوصول، يرجى تسجيل الدخول");
          setLoading(false);
          return;
        }
        const response = await baseUrl.get(`/api/course/video/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideoUrl(response.data.video_url);
        setError("");
      } catch (err) {
        console.error("خطأ في جلب رابط الفيديو:", err);
        setError("حدث خطأ في تحميل الفيديو");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoUrl();
    }
  }, [videoId, urlToken]);

  // استخراج YouTube ID
  const getYoutubeId = (url) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }
    return null;
  };

  // تهيئة Plyr وإضافة الإعدادات المتقدمة
  useEffect(() => {
    if (videoUrl) {
      const player = new Plyr("#player", {
        disableContextMenu: true,
        controls: [
          'play-large',       // الزر الكبير في المنتصف
          'rewind',           // تأخير 10 ثواني
          'play',             // تشغيل وإيقاف
          'fast-forward',     // تقديم 10 ثواني
          'progress',         // شريط الوقت
          'current-time',     // الوقت الحالي
          'duration',         // إجمالي الوقت
          'mute',             // كتم الصوت
          'volume',           // مستوى الصوت
          'settings',         // الإعدادات (جودة، سرعة، إلخ)
          'pip',              // صورة داخل صورة
          'fullscreen',       // ملء الشاشة
        ],
        settings: ['quality', 'speed'], // الإعدادات المتاحة للتحكم
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }, // خيارات سرعة الفيديو
        seekTime: 10, // تقديم وتأخير بمقدار 10 ثواني
        i18n: {       // تعريب قوائم المشغل
          restart: 'إعادة التشغيل',
          rewind: 'تأخير 10 ثواني',
          play: 'تشغيل',
          pause: 'إيقاف مؤقت',
          fastForward: 'تقديم 10 ثواني',
          seek: 'بحث',
          seekLabel: '{currentTime} من {duration}',
          played: 'تـم التشغيل',
          buffered: 'تم التحميل',
          currentTime: 'الوقت الحالي',
          duration: 'المدة الإجمالية',
          volume: 'مستوى الصوت',
          mute: 'كتم الصوت',
          unmute: 'إلغاء كتم الصوت',
          enableCaptions: 'تفعيل الترجمة',
          disableCaptions: 'إلغاء الترجمة',
          download: 'تنزيل',
          enterFullscreen: 'ملء الشاشة',
          exitFullscreen: 'الخروج من ملء الشاشة',
          frameTitle: 'مشغل الفيديو',
          captions: 'الترجمة',
          settings: 'الإعدادات',
          menuBack: 'الرجوع',
          speed: 'سرعة التشغيل',
          normal: 'عادي',
          quality: 'الجودة',
          loop: 'تكرار المشاهدة',
          start: 'البداية',
          end: 'النهاية',
          all: 'الكل',
          reset: 'إعادة ضبط',
          disabled: 'معطل',
          enabled: 'مفعل',
        }
      });
      playerRef.current = player;

      return () => {
        try { player.destroy(); } catch (e) { }
        playerRef.current = null;
      };
    }
  }, [videoUrl]);

  // حظر سياق الكليك يمين والاختصارات
  useEffect(() => {
    const preventContext = (e) => e.preventDefault();
    const preventKeys = (e) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      if (
        key === "f12" ||
        (ctrl && shift && ["i", "j", "c"].includes(key)) ||
        (ctrl && ["u", "s", "p", "c", "x"].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const preventSelect = (e) => e.preventDefault();

    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventKeys, true);
    document.addEventListener("selectstart", preventSelect);
    document.addEventListener("dragstart", preventSelect);

    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventKeys, true);
      document.removeEventListener("selectstart", preventSelect);
      document.removeEventListener("dragstart", preventSelect);
    };
  }, []);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={mainBg} pt={{ base: "80px", md: "100px" }}>
        <VStack spacing={6}>
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" />
          <Text fontWeight="bold" color="blue.500" fontSize="lg" fontFamily="'Cairo', 'Tajawal', sans-serif">
            جاري تهيئة المشغل...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={mainBg} pt={{ base: "80px", md: "100px" }} px={4}>
        <VStack spacing={6} bg={cardBg} p={10} borderRadius="2xl" shadow={shadow} border="1px dashed" borderColor="red.200" maxW="md" textAlign="center">
          <Icon as={FaExclamationTriangle} boxSize={12} color="red.400" />
          <VStack spacing={2}>
            <Heading size="md" color="red.500" fontFamily="'Cairo', 'Tajawal', sans-serif">تنبيه أمني أومشكلة في العرض</Heading>
            <Text color="gray.500">{error}</Text>
          </VStack>
          <Button colorScheme="red" variant="solid" onClick={() => navigate(-1)} rightIcon={<FaArrowRight />} borderRadius="xl" px={8}>
            العودة للخلف
          </Button>
        </VStack>
      </Flex>
    );
  }

  const youtubeId = getYoutubeId(videoUrl);

  return (
    <Box
      minH="100vh"
      bg={mainBg}
      pt={{ base: "100px", md: "120px" }}
      pb="40px"
      px={{ base: 4, md: 8 }}
      className="select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <Container maxW="container.xl" p={0}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          bg={cardBg}
          borderRadius={{ base: "xl", md: "3xl" }}
          shadow={shadow}
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
        >
          {/* شريط العنوان */}
          <Flex
            bg="transparent"
            px={{ base: 4, md: 8 }}
            py={4}
            align="center"
            justify="flex-end"
          >
            <Button
              size="md"
              colorScheme="blue"
              variant="solid"
              onClick={() => navigate(-1)}
              rightIcon={<FaArrowRight />}
              fontFamily="'Cairo', 'Tajawal', sans-serif"
            >
              العودة للدرس
            </Button>
          </Flex>

          {/* مشغل الفيديو */}
          <Box p={{ base: 0, md: 6 }} bg={useColorModeValue("black", "gray.900")}>
            {youtubeId ? (
              <Box
                borderRadius={{ base: "none", md: "2xl" }}
                overflow="hidden"
                shadow="2xl"
                borderWidth={{ base: "0px", md: "1px" }}
                borderColor={useColorModeValue("blackAlpha.200", "whiteAlpha.200")}
                mx="auto"
                maxW="1100px" // مقاس ممتاز لعرض الفيديو
                sx={{
                  ".plyr": {
                    fontFamily: "'Cairo', 'Tajawal', sans-serif", // خطوط موحدة
                  },
                  ".plyr__control--overlaid": {
                    bg: "blue.500",
                  },
                  ".plyr--video .plyr__control.plyr__tab-focus, .plyr--video .plyr__control:hover, .plyr--video .plyr__control[aria-expanded=true]": {
                    bg: "orange.500", // ألوان البراند
                  },
                  ".plyr__menu__container": {
                    direction: "rtl", // لدعم القوائم العربية إن لزم الأمر
                    textAlign: "right"
                  },
                  // إضافة رقم 10 لأيقونات التقدم والتأخير
                  ".plyr__controls [data-plyr='rewind'], .plyr__controls [data-plyr='fast-forward']": {
                    position: "relative",
                  },
                  ".plyr__controls [data-plyr='rewind']::after, .plyr__controls [data-plyr='fast-forward']::after": {
                    content: "'10'",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "11px",
                    fontWeight: "bold",
                    pointerEvents: "none",
                  }
                }}
              >
                <div
                  id="player"
                  data-plyr-provider="youtube"
                  data-plyr-embed-id={youtubeId}
                ></div>
              </Box>
            ) : (
              <Flex h={{ base: "250px", md: "500px" }} align="center" justify="center" color="white" flexDirection="column" gap={4}>
                <Spinner size="lg" color="white" />
                <Text fontFamily="'Cairo', 'Tajawal', sans-serif">يتم تحميل الفيديو...</Text>
              </Flex>
            )}
          </Box>
        </MotionBox>
      </Container>
      <ScrollToTop />
    </Box>
  );
};

export default Video;
