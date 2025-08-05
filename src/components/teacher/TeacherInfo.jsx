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
    <Box position="relative" my={8} className="mt-[50px]">
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
        <Container dir="rtl" maxW="container.lg" position="relative" zIndex={2}>
          <Flex
            direction={{ base: "column-reverse", md: "row" }}
            align="center"
            justify="space-between"
            gap={8}
            dir="rtl"
          >
            {/* Teacher Info - يظهر على اليمين */}
            <VStack
              align={{ base: "center", md: "flex-end" }}
              textAlign="right"
              spacing={4}
              flex={1}
              dir="rtl"
            >
              <Heading
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                fontWeight="bold"
                color={headingColor}
                lineHeight="shorter"
              >
                {teacher.name}
              </Heading>

              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="whiteAlpha.800"
                maxW="600px"
                textAlign="right"
              >
                {teacher.description}
              </Text>

              <Flex direction={{ base: "column", sm: "row" }} gap={3}>
                <Badge
                  colorScheme="orange"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
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
                >
                  <Icon as={FaBookOpen} />
                  <Text>عدد الكورسات: {number || 0}</Text>
                </Badge>
              </Flex>
            </VStack>

            {/* صورة المدرس - تظهر على اليسار */}
            <Box position="relative" mb={{ base: 4, md: 0 }}>
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
              />
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherInfo;
