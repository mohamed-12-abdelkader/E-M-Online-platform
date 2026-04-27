import React, { useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Link as ChakraLink,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaGraduationCap,
  FaMedal,
  FaPercent,
  FaPlay,
  FaStar,
  FaTiktok,
  FaUserPlus,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const navigate = useNavigate();

  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const textPrimary = useColorModeValue("gray.800", "white");
  const textSecondary = useColorModeValue("gray.600", "gray.300");
  const mutedBg = useColorModeValue("gray.50", "gray.900");

  const teacherName = teacher?.name || "—";
  const teacherSubject = teacher?.subject || "";
  const teacherDescription = teacher?.description || "";

  const ratingAvg =
    teacher?.rating ??
    teacher?.rating_avg ??
    teacher?.average_rating ??
    teacher?.rating_value ??
    null;
  const ratingCount =
    teacher?.rating_count ??
    teacher?.reviews_count ??
    teacher?.reviews ??
    teacher?.num_ratings ??
    null;

  const ratingPercent = useMemo(() => {
    const directPercent =
      teacher?.rating_percent ??
      teacher?.rating_percentage ??
      teacher?.satisfaction_percent ??
      null;
    if (
      directPercent !== null &&
      directPercent !== undefined &&
      !Number.isNaN(Number(directPercent))
    ) {
      return Number(directPercent);
    }
    if (
      ratingAvg !== null &&
      ratingAvg !== undefined &&
      !Number.isNaN(Number(ratingAvg))
    ) {
      const n = Number(ratingAvg);
      // If backend returns 0..5 rating, convert to percent.
      if (n >= 0 && n <= 5) return Math.round((n / 5) * 100);
      // If backend returns 0..100 percent, keep as-is.
      if (n >= 0 && n <= 100) return Math.round(n);
      return null;
    }
    return null;
  }, [ratingAvg, teacher]);

  const coursesCount = teacher?.courses_count ?? number ?? null;

  const followersCount =
    teacher?.followers_count ??
    teacher?.followers ??
    teacher?.followings ??
    teacher?.subscribers_count ??
    null;

  const yearsExperience =
    teacher?.experience_years ??
    teacher?.years_experience ??
    teacher?.teaching_years ??
    teacher?.experience ??
    null;

  const posterSrc =
    teacher?.video_thumbnail ??
    teacher?.video_poster ??
    teacher?.cover_photo ??
    teacher?.avatar ??
    "";

  const whatsappNumber = teacher?.whatsapp_number
    ? teacher.whatsapp_number.replace(/[^0-9]/g, "")
    : null;

  const handleViewAccount = () => {
    if (!teacher?.id) return;
    navigate(`/teacher/${teacher.id}`);
  };

  const StatCard = ({ icon, value, label }) => (
    <Box
      flex="1"
      minW={{ base: "120px", md: "0" }}
      bg={useColorModeValue("white", "gray.800")}
      border={useColorModeValue(
        "1px solid rgba(66,153,225,0.12)",
        "1px solid rgba(66,153,225,0.25)",
      )}
      borderRadius="xl"
      px={4}
      py={3}
      textAlign="center"
      boxShadow={useColorModeValue("sm", "none")}
    >
      <HStack justify="center" mb={2} spacing={2}>
        <Box
          w="10"
          h="10"
          borderRadius="lg"
          bg={useColorModeValue("blue.50", "blue.900")}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon
            as={icon}
            color={useColorModeValue("blue.600", "blue.300")}
            boxSize={5}
          />
        </Box>
      </HStack>
      <Text fontSize="lg" fontWeight="extrabold" color={textPrimary}>
        {value}
      </Text>
      <Text fontSize="xs" color={textSecondary} mt={1}>
        {label}
      </Text>
    </Box>
  );

  return (
    <Box position="relative" mb={{ base: 6, md: 8 }} dir="rtl">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Box
          borderRadius={{ base: "xl", md: "2xl" }}
          borderWidth="1px"
          borderColor={cardBorder}
          bg={cardBg}
          overflow="hidden"
          boxShadow={useColorModeValue(
            "0 25px 50px -12px rgba(66, 153, 225, 0.12), 0 0 0 1px rgba(0,0,0,0.03)",
            "0 25px 50px -12px rgba(0,0,0,0.35)",
          )}
          position="relative"
        >
          {/* Decorative background */}
          <Box
            position="absolute"
            top="-140px"
            left="-120px"
            w="360px"
            h="360px"
            borderRadius="full"
            bg={useColorModeValue("blue.200", "blue.900")}
            opacity={0.25}
            filter="blur(30px)"
          />
          <Box
            position="absolute"
            bottom="-180px"
            right="-160px"
            w="420px"
            h="420px"
            borderRadius="full"
            bg={useColorModeValue("orange.200", "orange.900")}
            opacity={0.18}
            filter="blur(35px)"
          />

          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: 5, md: 8 }}
            align={{ base: "center", md: "flex-start" }}
            justify="space-between"
            px={{ base: 4, sm: 6, md: 8 }}
            py={{ base: 6, md: 8 }}
            position="relative"
            zIndex={1}
          >
            {/* Left poster / video card */}
            <Box
              w={{ base: "full", md: "420px" }}
              display="flex"
              justifyContent="center"
            >
              <Box
                w={{ base: "100%", md: "320px" }}
                borderRadius="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor={useColorModeValue("gray.100", "gray.700")}
                bg={mutedBg}
                position="relative"
              >
                <Box position="relative" h={{ base: "260px", md: "320px" }}>
                  {posterSrc ? (
                    <Image
                      src={posterSrc}
                      alt={teacherName}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Box
                      w="100%"
                      h="100%"
                      bgGradient="linear(to-br, blue.500, orange.500)"
                    />
                  )}
                  {/* Darken for readability */}
                  <Box
                    position="absolute"
                    inset="0"
                    bgGradient={useColorModeValue(
                      "linear(to-t, blackAlpha.50, transparent)",
                      "linear(to-t, blackAlpha.65, transparent)",
                    )}
                  />

                  {/* Bottom label bar */}
                  <Flex
                    position="absolute"
                    left={4}
                    right={4}
                    bottom={4}
                    h="44px"
                    borderRadius="xl"
                    bg={useColorModeValue("whiteAlpha.700", "whiteAlpha.10")}
                    borderWidth="1px"
                    borderColor={useColorModeValue(
                      "whiteAlpha.400",
                      "whiteAlpha.20",
                    )}
                    align="center"
                    justify="space-between"
                    px={3}
                    backdropFilter="blur(10px)"
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color={useColorModeValue("gray.700", "whiteAlpha.900")}
                      noOfLines={1}
                    >
                      {teacherSubject || "محاضر مميز"}
                    </Text>
                    <Box
                      w="28px"
                      h="28px"
                      borderRadius="full"
                      bg={useColorModeValue("blue.500", "blue.400")}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaPlay} color="white" boxSize={3} />
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Box>

            {/* Right content */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={4}
              w="full"
              pt={1}
            >
              {/* Rating row */}
              <HStack justify="center" w="full" spacing={2} mb={1}>
                <Text fontSize="sm" color="red.500" fontWeight="extrabold">
                  {ratingCount !== null && ratingCount !== undefined
                    ? `(${ratingCount}) `
                    : ""}
                  {ratingAvg !== null && ratingAvg !== undefined
                    ? ratingAvg
                    : "—"}
                </Text>
                <Icon as={FaStar} color="orange.400" boxSize={3} />
              </HStack>

              <Heading
                fontSize={{ base: "2xl", md: "3xl" }}
                color={textPrimary}
                fontWeight="extrabold"
              >
                {teacherName}
              </Heading>
              <Text
                fontSize="md"
                color={useColorModeValue("blue.600", "blue.300")}
                fontWeight="bold"
              >
                {teacherSubject || "محاضر"}
              </Text>

              {teacherDescription ? (
                <Text
                  fontSize="sm"
                  color={textSecondary}
                  textAlign={{ base: "center", md: "right" }}
                  lineHeight="tall"
                  maxW="520px"
                >
                  {teacherDescription}
                </Text>
              ) : null}

              {/* Social row */}
              <Flex
                align="center"
                justify={{ base: "center", md: "flex-start" }}
                w="full"
                gap={4}
                mt={2}
              >
                <Text fontSize="sm" fontWeight="extrabold" color="orange.500">
                  تواصل
                </Text>
                <HStack spacing={2}>
                  {teacher?.tiktok_url && (
                    <IconButton
                      as={ChakraLink}
                      href={teacher.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="تيك توك"
                      icon={<Icon as={FaTiktok} boxSize={4} />}
                      size="md"
                      borderRadius="full"
                      bg={useColorModeValue("gray.800", "gray.700")}
                      color="white"
                      _hover={{ transform: "scale(1.08)" }}
                    />
                  )}

                  {teacher?.youtube_url && (
                    <IconButton
                      as={ChakraLink}
                      href={teacher.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="يوتيوب"
                      icon={<Icon as={FaYoutube} boxSize={4} />}
                      size="md"
                      borderRadius="full"
                      bg="red.500"
                      color="white"
                      _hover={{ transform: "scale(1.08)" }}
                    />
                  )}

                  {teacher?.facebook_url && (
                    <IconButton
                      as={ChakraLink}
                      href={teacher.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="فيسبوك"
                      icon={<Icon as={FaFacebook} boxSize={4} />}
                      size="md"
                      borderRadius="full"
                      bg="blue.500"
                      color="white"
                      _hover={{ transform: "scale(1.08)" }}
                    />
                  )}

                  {whatsappNumber && (
                    <IconButton
                      as={ChakraLink}
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="واتساب"
                      icon={<Icon as={FaWhatsapp} boxSize={4} />}
                      size="md"
                      borderRadius="full"
                      bg="green.500"
                      color="white"
                      _hover={{ transform: "scale(1.08)" }}
                    />
                  )}
                </HStack>
              </Flex>

              {/* Actions */}

              {/* Stats row */}
            </VStack>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default TeacherInfo;
