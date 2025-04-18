import React from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Container,
  useColorModeValue,
  SlideFade,
} from "@chakra-ui/react";
import { FaGraduationCap, FaBookOpen, FaUserGraduate } from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #2563EB, #1E3A8A)",
    "linear-gradient(135deg, #2D3748, #1A202C)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const statBg = useColorModeValue("blue.100", "gray.700");

  return (
    <Box position="relative" className="mt-[80px]">
      {/* Hero Section */}
      <Box position="relative" color="white" overflow="hidden">
        <Box
          position="absolute"
          inset="0"
          bgImage="url('/2(5).png')"
          bgSize="cover"
          bgPosition="center"
          filter="brightness(0.5)"
        />

        <Box position="absolute" inset="0" bg={bgGradient} opacity={0.9} />

        <Container maxW="7xl" position="relative" style={{ height: "400px" }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
            h="full"
            py={10}
            px={5}
            gap={10}
          >
            {/* Teacher Info */}
            <SlideFade in offsetY={40}>
              <Flex direction="column" align={{ base: "center", md: "start" }} flex="1">
                <Text
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="bold"
                  textAlign={{ base: "center", md: "start" }}
                  mb={3}
                >
                  {teacher.name}
                </Text>
                <Flex
                  align="center"
                  gap={2}
                  bg="whiteAlpha.200"
                  p={3}
                  px={5}
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                >
                  <FaGraduationCap size={18} />
                  <Text fontSize="md">محاضر {teacher.subject}</Text>
                </Flex>
              </Flex>
            </SlideFade>

            {/* Teacher Image */}
            <SlideFade in offsetY={40} delay={0.2}>
              <Box position="relative" w={{ base: "200px", md: "280px" }} h={{ base: "200px", md: "280px" }}>
                <Box
                  borderRadius="full"
                  overflow="hidden"
                  boxShadow="2xl"
                  border="5px solid white"
                  transition="0.3s"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Image
                    src={teacher.image}
                    alt={teacher.name}
                    objectFit="cover"
                    w="full"
                    h="full"
                  />
                </Box>
              </Box>
            </SlideFade>
          </Flex>
        </Container>

        {/* Wave Effect */}
        <Box
          position="absolute"
          bottom="-2px"
          left="0"
          right="0"
          height="120px"
          bgImage={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='${encodeURIComponent(
            useColorModeValue("#f7fafc", "#1a202c")
          )}' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`}
          bgSize="cover"
          bgRepeat="no-repeat"
        />
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" mt={10}>
        <Flex justify="center" gap={8} flexWrap="wrap">
          <StatCard
            icon={<FaUserGraduate size={24} />}
            label="المادة"
            value={teacher.subject}
            bg={cardBg}
            textColor={textColor}
            headingColor={headingColor}
            statBg={statBg}
          />
          <StatCard
            icon={<FaBookOpen size={24} />}
            label="عدد الكورسات"
            value={number || 0}
            bg={cardBg}
            textColor={textColor}
            headingColor={headingColor}
            statBg={statBg}
          />
        </Flex>
      </Container>
    </Box>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  bg,
  textColor,
  headingColor,
  statBg,
}) => (
  <Flex
    direction="column"
    align="center"
    p={6}
    minW="220px"
    bg={bg}
    borderRadius="2xl"
    boxShadow="lg"
    transition="all 0.3s ease"
    _hover={{
      transform: "translateY(-8px)",
      boxShadow: "2xl",
    }}
  >
    <Box color={headingColor} bg={statBg} p={3} borderRadius="full" mb={4}>
      {icon}
    </Box>
    <Text color={textColor} fontSize="sm" mb={1}>
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="bold" color={headingColor}>
      {value}
    </Text>
  </Flex>
);

export default TeacherInfo;
