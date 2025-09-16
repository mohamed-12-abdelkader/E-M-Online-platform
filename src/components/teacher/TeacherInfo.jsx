import React from "react";
import {
  Box,
  Text,
  Flex,
  Container,
  useColorModeValue,
  Icon,
  Heading,
  VStack,
  useBreakpointValue,
  Avatar,
  Badge
} from "@chakra-ui/react";
import { FaGraduationCap, FaBookOpen } from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const bgGradient = useColorModeValue(
    "linear(to-r, blue.500, blue.700)",
    "linear(to-r, blue.600, blue.800)"
  );
  const headingColor = useColorModeValue("white", "white");

  const isMobile = useBreakpointValue({ base: true, md: false });
  const imageSize = useBreakpointValue({ base: "150px", md: "250px", lg: "300px" });

  return (
    <Box position="relative" mb={8} >
      {/* Hero Section */}
      <Box
        position="relative"
        bgGradient={bgGradient}
        py={8}
        px={4}
        overflow="hidden"
        minH={isMobile ? "auto" : "450px"}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundAttachment: "fixed",
          backgroundRepeat: "repeat",
          zIndex: 1
        }}
        className="flex items-center mt-[80px]"
      >
        {/* عناصر زخرفية مضيئة */}
        <Box
          position="absolute"
          top={{ base: "-80px", md: "-120px" }}
          right={{ base: "-80px", md: "-120px" }}
          w={{ base: "220px", md: "320px" }}
          h={{ base: "220px", md: "320px" }}
          bg="orange.300"
          borderRadius="full"
          filter="blur(60px)"
          opacity={0.35}
          zIndex={1}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom={{ base: "-80px", md: "-120px" }}
          left={{ base: "-80px", md: "-120px" }}
          w={{ base: "240px", md: "360px" }}
          h={{ base: "240px", md: "360px" }}
          bg="blue.300"
          borderRadius="full"
          filter="blur(70px)"
          opacity={0.3}
          zIndex={1}
          pointerEvents="none"
        />
        <Container dir="rtl" maxW="container.lg" position="relative" zIndex={2}>
          <Flex
            direction={{ base: "column-reverse", md: "row" }}
            align="center"
            justify="space-between"
            gap={8}
            dir="rtl"
          >
            {/* Teacher Info - يظهر على اليمين */}
            <Box
              flex={1}
              w="100%"
              display="flex"
              justifyContent={{ base: "center", md: "flex-end" }}
            >
              <Box
                dir="rtl"
                bg="whiteAlpha.200"
                borderWidth="1px"
                borderColor="whiteAlpha.400"
                boxShadow="xl"
                backdropFilter="saturate(180%) blur(10px)"
                rounded={{ base: "lg", md: "2xl" }}
                p={{ base: 5, md: 8 }}
                maxW="640px"
                transition="all 0.3s ease"
                _hover={{ transform: { md: "translateY(-2px)" }, boxShadow: "2xl" }}
              >
                <VStack align={{ base: "center", md: "flex-end" }} spacing={4}>
                  <Heading
                    fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                    fontWeight="extrabold"
                    color={headingColor}
                    lineHeight="shorter"
                    textShadow="0 2px 12px rgba(0,0,0,0.25)"
                  >
                    {teacher.name}
                  </Heading>

                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color="whiteAlpha.900"
                    maxW="600px"
                    textAlign="right"
                  >
                    {teacher.description}
                  </Text>

                  <Flex direction={{ base: "column", sm: "row" }} gap={3} w="full" justify="flex-end">
                    <Badge
                      colorScheme="orange"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                      display="flex"
                      alignItems="center"
                      gap={2}
                      bg="orange.400"
                      color="white"
                      boxShadow="md"
                    >
                      <Icon as={FaGraduationCap} />
                      <Text>محاضر {teacher.subject}</Text>
                    </Badge>

                    <Badge
                      colorScheme="orange"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                      display="flex"
                      alignItems="center"
                      gap={2}
                      bg="whiteAlpha.300"
                      color="white"
                      boxShadow="md"
                    >
                      <Icon as={FaBookOpen} />
                      <Text>عدد الكورسات: {number || 0}</Text>
                    </Badge>
                  </Flex>
                </VStack>
              </Box>
            </Box>

            {/* صورة المدرس - تظهر على اليسار */}
            <Box position="relative" mb={{ base: 6, md: 0 }}>
              <Box
                position="absolute"
                inset={0}
                m="auto"
                w={{ base: "180px", md: "260px", lg: "320px" }}
                h={{ base: "180px", md: "260px", lg: "320px" }}
                bg="whiteAlpha.700"
                borderRadius="full"
                filter="blur(20px)"
                zIndex={1}
              />
              <Avatar
                src={teacher.avatar}
                size="2xl"
                width={imageSize}
                height={imageSize}
                borderWidth="6px"
                borderColor="white"
                outline="6px solid"
                outlineColor="blue.400"
                boxShadow="2xl"
                objectFit="cover"
                objectPosition="center"
                position="relative"
                zIndex={2}
                transition="transform 0.3s ease, box-shadow 0.3s ease"
                _hover={{ transform: "scale(1.02)", boxShadow: "dark-lg" }}
              />
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherInfo;
