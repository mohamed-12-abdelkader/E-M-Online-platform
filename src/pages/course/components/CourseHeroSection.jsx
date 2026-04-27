import React, { useState } from "react";
import {
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  useDisclosure,
  Box,
  Heading,
  Flex,
  Badge,
  useBreakpointValue,
  AspectRatio,
  Center,
  Image,
  SimpleGrid,
  Container,
} from "@chakra-ui/react";
import {
  FaUserGraduate,
  FaUserPlus,
  FaPlay,
  FaChartBar,
  FaClock,
  FaUsers,
  FaStar,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { IoIosSchool } from "react-icons/io";
import { Link } from "react-router-dom";
import baseUrl from "../../../api/baseUrl";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const CourseHeroSection = ({
  course,
  isTeacher,
  isAdmin,
  handleViewEnrollments,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const token = localStorage.getItem("token");

  // =========================
  // HERO DATA (من API مع fallback)
  // =========================
  const ratingRaw =
    course?.rating ??
    course?.average_rating ??
    course?.avg_rating ??
    course?.course_rating ??
    course?.rate;

  const ratingNum = ratingRaw != null ? Number(ratingRaw) : null;
  const ratingDisplay = Number.isFinite(ratingNum)
    ? ratingNum.toFixed(1)
    : "4.8";

  const durationText =
    course?.duration_text ??
    (course?.duration_hours != null
      ? `${course.duration_hours} ساعة`
      : course?.duration_minutes != null
        ? `${course.duration_minutes} دقيقة`
        : "12 ساعة");

  const studentsCountRaw =
    course?.students_count ??
    course?.enrolled_students ??
    course?.total_students ??
    course?.participants;

  const studentsCountNum =
    studentsCountRaw != null ? Number(studentsCountRaw) : null;

  const studentsDisplay = (() => {
    if (!Number.isFinite(studentsCountNum)) return "500+";
    if (studentsCountNum >= 1000)
      return `${Math.floor(studentsCountNum / 100) / 10}k+`;
    return `${studentsCountNum}+`;
  })();

  const heroSubtitle =
    course?.subtitle ??
    course?.headline ??
    course?.category_name ??
    course?.grade_name ??
    "كورس تعليمي احترافي";

  const heroTitleRaw = course?.title_en ?? course?.title ?? "Course";
  const heroTitleWords = String(heroTitleRaw)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const heroTitleLine1 = heroTitleWords.slice(0, 3).join(" ");
  const heroTitleLine2 = heroTitleWords.slice(3).join(" ");

  const heroBgGradient = useColorModeValue(
    "linear(to-b, white, blue.50)",
    "linear(to-b, gray.900, blue.950)",
  );
  const dotBlueBg = useColorModeValue("blue.100", "blue.900");
  const dotOrangeBg = useColorModeValue("orange.100", "orange.900");

  const panelBg = useColorModeValue("white", "gray.800");
  const panelTextMuted = useColorModeValue("gray.500", "gray.400");
  const panelTextMain = useColorModeValue("gray.800", "gray.100");
  const copyText = useColorModeValue("gray.600", "gray.300");
  const featureText = useColorModeValue("gray.700", "gray.100");

  const bottomPanelBg = useColorModeValue("whiteAlpha.200", "whiteAlpha.100");
  const bottomPanelBorder = useColorModeValue(
    "whiteAlpha.300",
    "whiteAlpha.100",
  );

  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleActivateStudent = async () => {
    if (!studentId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الطالب",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      await baseUrl.post(
        `api/course/${course.id}/open-for-student/${studentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast({
        title: "تم التفعيل بنجاح",
        description: `تم تفعيل الطالب برقم ${studentId} للكورس`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setStudentId("");
    } catch (error) {
      toast({
        title: "خطأ في التفعيل",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box
        bgGradient={heroBgGradient}
        position="relative"
        overflow="hidden"
        dir="rtl"
        pt={{ base: 8, md: 12 }}
        pb={{ base: 10, md: 14 }}
      >
        {/* Soft decorative dots */}
        <Box position="absolute" inset={0} pointerEvents="none">
          <Box
            position="absolute"
            top="10%"
            left="-5%"
            w="260px"
            h="260px"
            bg={dotBlueBg}
            borderRadius="full"
            filter="blur(30px)"
            opacity={0.6}
          />
          <Box
            position="absolute"
            bottom="-10%"
            right="-10%"
            w="260px"
            h="260px"
            bg={dotOrangeBg}
            borderRadius="full"
            filter="blur(30px)"
            opacity={0.5}
          />
        </Box>

        <Container
          maxW="8xl"
          px={{ base: 3, sm: 4, md: 6 }}
          position="relative"
          zIndex={1}
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={{ base: 10, lg: 14 }}
          >
            {/* Left: Illustration */}
            <MotionBox
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              flex={1}
              w="full"
            >
              <Box
                className="bg-blue-500"
                borderRadius="3xl"
                boxShadow="2xl"
                p={{ base: 6, md: 7 }}
                w={{ base: "full", lg: "520px" }}
                maxW="100%"
                position="relative"
                overflow="hidden"
              >
                {/* hexagon */}
                <Box
                  mx="auto"
                  mb={6}
                  bg={panelBg}
                  borderRadius="2xl"
                  p={5}
                  boxShadow="lg"
                  style={{
                    clipPath:
                      "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
                    WebkitClipPath:
                      "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
                  }}
                >
                  <VStack spacing={2}>
                    <Text fontSize="xs" color={panelTextMuted} fontWeight="700">
                      {course?.level_name || course?.type_name || "Course"}
                    </Text>
                    <Text fontSize="sm" fontWeight="900" color={panelTextMain}>
                      {course?.title_en || course?.title || "Development"}
                    </Text>
                    <HStack spacing={2}>
                      <Box w="6px" h="6px" bg="blue.500" borderRadius="full" />
                      <Box w="6px" h="6px" bg="blue.200" borderRadius="full" />
                      <Box w="6px" h="6px" bg="blue.300" borderRadius="full" />
                    </HStack>
                  </VStack>
                </Box>

                {/* bottom mini panel */}
                <Box
                  bg={bottomPanelBg}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={bottomPanelBorder}
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color="white" fontWeight="800">
                      NextEdu
                    </Text>
                    <Text fontSize="10px" color="whiteAlpha.900">
                      {course.title}
                    </Text>
                  </VStack>
                  <Box
                    bg={panelBg}
                    borderRadius="xl"
                    w="72px"
                    h="40px"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={bottomPanelBorder}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={
                        course.avatar ||
                        "https://via.placeholder.com/120x60/0ea5e9/ffffff?text=Course"
                      }
                      alt={course.title}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                </Box>
              </Box>
            </MotionBox>

            {/* Right: Copy */}
            <VStack
              flex={1}
              spacing={4}
              align={{ base: "center", lg: "flex-start" }}
              textAlign={{ base: "center", lg: "right" }}
              w="full"
            >
              <HStack
                bg={panelBg}
                borderRadius="full"
                px={4}
                py={2}
                boxShadow="lg"
                spacing={2}
              >
                <HStack spacing={1}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} as={FaStar} color="yellow.400" boxSize={3} />
                  ))}
                </HStack>
                <Text fontSize="sm" fontWeight="900" color={panelTextMain}>
                  ({ratingDisplay})
                </Text>
                <Text fontSize="xs" color={panelTextMuted}>
                  تقييم
                </Text>
              </HStack>

              <Heading
                size="lg"
                color={panelTextMain}
                fontWeight="900"
                letterSpacing="tight"
              >
                {heroSubtitle}
              </Heading>

              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="900"
                lineHeight="1.1"
                color="blue.700"
              >
                {heroTitleLine1}
                {heroTitleLine2 ? (
                  <>
                    <br />
                    {heroTitleLine2}
                  </>
                ) : null}
              </Text>

              <Text
                color={copyText}
                fontSize={{ base: "sm", md: "md" }}
                lineHeight="1.9"
                maxW="560px"
              >
                {course.description}
              </Text>

              {/* CTA Buttons like the mock */}
              <HStack
                spacing={3}
                justify={{ base: "center", lg: "flex-start" }}
                w="full"
                flexWrap="wrap"
              >
                {(isTeacher || isAdmin) && (
                  <Button
                    colorScheme="orange"
                    bg="orange.500"
                    color="white"
                    borderRadius="xl"
                    px={8}
                    _hover={{ bg: "orange.600" }}
                    leftIcon={<Icon as={FaUserPlus} />}
                    onClick={onOpen}
                  >
                    تفعيل طالب
                  </Button>
                )}

                {isTeacher ? (
                  <Link to={`/CourseStatisticsPage/${course.id}`}>
                    <Button
                      colorScheme="blue"
                      bg="blue.600"
                      color="white"
                      borderRadius="xl"
                      px={8}
                      _hover={{ bg: "blue.700" }}
                      leftIcon={<Icon as={FaChartBar} />}
                    >
                      الإحصائيات
                    </Button>
                  </Link>
                ) : isAdmin ? (
                  <Button
                    colorScheme="blue"
                    bg="blue.600"
                    color="white"
                    borderRadius="xl"
                    px={8}
                    _hover={{ bg: "blue.700" }}
                    leftIcon={<Icon as={FaUserGraduate} />}
                    onClick={handleViewEnrollments}
                  >
                    المشتركين
                  </Button>
                ) : null}
              </HStack>

              {/* Features row */}
              <HStack
                spacing={6}
                justify={{ base: "center", lg: "flex-start" }}
              >
                <HStack spacing={2}>
                  <Icon as={FaClock} color="blue.500" />
                  <Text fontSize="sm" fontWeight="900" color={featureText}>
                    {durationText}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaUsers} color="blue.500" />
                  <Text fontSize="sm" fontWeight="900" color={featureText}>
                    {studentsDisplay} طالب
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaStar} color="blue.500" />
                  <Text fontSize="sm" fontWeight="900" color={featureText}>
                    تقييم {ratingDisplay}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Activate Student Modal - متجاوب */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size={{ base: "full", md: "md" }}
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent
          bg={useColorModeValue("white", "gray.800")}
          borderRadius={{ base: "none", md: "2xl" }}
          boxShadow="2xl"
          mx={{ base: 0, md: 4 }}
          maxH={{ base: "100vh", md: "90vh" }}
        >
          <ModalHeader
            pt={{ base: 4, md: 6 }}
            pb={{ base: 3, md: 4 }}
            borderBottomWidth="1px"
            borderColor="gray.100"
          >
            <HStack spacing={3}>
              <Center w={10} h={10} bg="blue.100" borderRadius="full">
                <Icon as={FaUserPlus} color="blue.500" boxSize={5} />
              </Center>
              <Text
                fontWeight="bold"
                fontSize={{ base: "md", md: "xl" }}
                color={useColorModeValue("gray.800", "gray.100")}
              >
                تفعيل طالب للكورس
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton left={4} right="auto" mt={2} />
          <ModalBody py={{ base: 4, md: 8 }}>
            <VStack spacing={{ base: 4, md: 6 }}>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color={useColorModeValue("gray.500", "gray.300")}
                textAlign="center"
              >
                قم بإدخال رقم الطالب (ID) لتفعيله في هذا الكورس مباشرة.
              </Text>
              <FormControl isRequired>
                <FormLabel
                  fontWeight="bold"
                  color={useColorModeValue("gray.700", "gray.200")}
                >
                  رقم الطالب
                </FormLabel>
                <Input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="مثال: 12345"
                  size={{ base: "md", md: "lg" }}
                  borderRadius="xl"
                  bg={useColorModeValue("gray.50", "gray.700")}
                  border="2px solid"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                  _focus={{
                    borderColor: "blue.500",
                    bg: useColorModeValue("white", "gray.900"),
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pb={{ base: 4, md: 6 }} flexWrap="wrap" gap={2}>
            <Button
              variant="ghost"
              mr={{ base: 0, md: 3 }}
              onClick={onClose}
              isDisabled={isLoading}
              borderRadius="xl"
              size={{ base: "md", md: "lg" }}
              color={useColorModeValue("gray.500", "gray.300")}
            >
              إلغاء
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleActivateStudent}
              isLoading={isLoading}
              loadingText="جاري التفعيل..."
              leftIcon={<Icon as={FaUserPlus} />}
              borderRadius="xl"
              size={{ base: "md", md: "lg" }}
              shadow="lg"
            >
              تفعيل الطالب
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CourseHeroSection;
