import React from "react";
import {
  Box,
  Text,
  Flex,
  Container,
  Icon,
  Heading,
  VStack,
  useBreakpointValue,
  Avatar,
  Badge,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
  Link as ChakraLink,
  Divider,
} from "@chakra-ui/react";
import {
  FaGraduationCap,
  FaBookOpen,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const imageSize = useBreakpointValue({ base: "140px", sm: "160px", md: "200px" });
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const descBg = useColorModeValue("blue.50", "blue.900");
  const descBorder = useColorModeValue("blue.100", "blue.800");

  return (
    <Box position="relative" mb={8} dir="rtl">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        {/* كارت واحد — شريط أزرق + محتوى على خلفية الصفحة */}
        <Box
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={cardBorder}
          bg={cardBg}
        >
          <Box h="1" w="100%" bgGradient="linear(to-r, blue.500, orange.500)" />

          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            gap={{ base: 6, md: 8 }}
            p={{ base: 6, md: 8 }}
          >
            {/* أفاتار — يمين في RTL */}
            <Box position="relative" flexShrink={0}>
              <Avatar
                src={teacher.avatar}
                name={teacher.name}
                width={imageSize}
                height={imageSize}
                borderWidth="4px"
                borderColor="blue.500"
                boxShadow="0 12px 40px rgba(66, 153, 225, 0.3)"
                bg="blue.100"
                color="blue.600"
              />
              <Box
                position="absolute"
                bottom="2"
                right="2"
                w="5"
                h="5"
                borderRadius="full"
                bg="green.400"
                borderWidth="3px"
                borderColor={cardBg}
              />
            </Box>

            {/* المحتوى — اسم، مادة، وصف، إجراءات */}
            <VStack flex={1} align="stretch" spacing={5} w="full" maxW="640px">
              <Box textAlign={{ base: "center", md: "right" }} w="full">
                <Text fontSize="sm" color="orange.500" fontWeight="bold" letterSpacing="wider" mb={1}>
                  محاضر
                </Text>
                <Heading size={{ base: "xl", md: "2xl" }} color={headingColor} fontWeight="bold" mb={3}>
                  {teacher.name}
                </Heading>
                <Badge
                  bg="blue.500"
                  color="white"
                  px={4}
                  py={1.5}
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="bold"
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FaGraduationCap} boxSize={4} />
                  {teacher.subject}
                </Badge>
              </Box>

              {teacher.description && (
                <>
                  <Divider borderColor={cardBorder} />
                  <Box
                    p={4}
                    borderRadius="xl"
                    bg={descBg}
                    borderWidth="1px"
                    borderColor={descBorder}
                    textAlign={{ base: "center", md: "right" }}
                  >
                    <Text fontSize="md" color={subtextColor} lineHeight="tall">
                      {teacher.description}
                    </Text>
                  </Box>
                </>
              )}

              {/* صف الإجراءات: عدد الكورسات | واتساب | سوشيال */}
              <Flex
                direction={{ base: "column", sm: "row" }}
                gap={3}
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
                align="center"
              >
                <Flex
                  px={5}
                  py={3}
                  bg="orange.500"
                  color="white"
                  borderRadius="xl"
                  align="center"
                  gap={3}
                  boxShadow="md"
                  fontWeight="bold"
                >
                  <Icon as={FaBookOpen} boxSize={5} />
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="xs" opacity={0.95}>الكورسات</Text>
                    <Text fontSize="xl">{number || 0}</Text>
                  </VStack>
                </Flex>

                {teacher.whatsapp_number && (
                  <ChakraLink
                    href={`https://wa.me/${teacher.whatsapp_number.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "none" }}
                  >
                    <Flex
                      px={5}
                      py={3}
                      bg="#25D366"
                      color="white"
                      borderRadius="xl"
                      align="center"
                      gap={3}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ bg: "#128C7E", transform: "translateY(-2px)", boxShadow: "lg" }}
                      fontWeight="bold"
                    >
                      <Icon as={FaWhatsapp} boxSize={5} />
                      مراسلة
                    </Flex>
                  </ChakraLink>
                )}

                {(teacher.facebook_url || teacher.youtube_url || teacher.tiktok_url) && (
                  <HStack spacing={2}>
                    {teacher.facebook_url && (
                      <Tooltip label="فيسبوك" hasArrow placement="top">
                        <IconButton
                          as={ChakraLink}
                          href={teacher.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<FaFacebook />}
                          size="md"
                          borderRadius="xl"
                          bg="blue.500"
                          color="white"
                          _hover={{ bg: "blue.400", transform: "scale(1.08)" }}
                        />
                      </Tooltip>
                    )}
                    {teacher.youtube_url && (
                      <Tooltip label="يوتيوب" hasArrow placement="top">
                        <IconButton
                          as={ChakraLink}
                          href={teacher.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<FaYoutube />}
                          size="md"
                          borderRadius="xl"
                          bg="red.500"
                          color="white"
                          _hover={{ bg: "red.400", transform: "scale(1.08)" }}
                        />
                      </Tooltip>
                    )}
                    {teacher.tiktok_url && (
                      <Tooltip label="تيك توك" hasArrow placement="top">
                        <IconButton
                          as={ChakraLink}
                          href={teacher.tiktok_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<FaTiktok />}
                          size="md"
                          borderRadius="xl"
                          bg="gray.800"
                          color="white"
                          _hover={{ bg: "gray.700", transform: "scale(1.08)" }}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                )}
              </Flex>
            </VStack>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default TeacherInfo;
