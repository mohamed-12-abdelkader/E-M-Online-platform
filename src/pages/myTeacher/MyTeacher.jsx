import React from "react";
import { useState } from "react";
import { PiChalkboardTeacherBold } from "react-icons/pi";
import {
  Box,
  Heading,
  Skeleton,
  Stack,
  Card,
  CardBody,
  Image,
  Flex,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Badge,
  Icon,
  Center,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaVideo, FaSearch } from "react-icons/fa";
import img from "../../img/Screenshot_2025-03-07_203419-removebg-preview.png";
import useGitMyTeacher from "../../Hooks/student/useGitMyTeacher";
import { motion } from "framer-motion";

const MyTeacher = () => {
  const [loading, teachers] = useGitMyTeacher();
  
  // Colors for light and dark mode
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (loading) {
    return (
      <VStack spacing={4} p={{ base: 4, sm: 6 }} maxW="95%" mx="auto">
        <Skeleton height="20px" w="full" />
        <Skeleton height="20px" w="full" />
        <Skeleton height="20px" w="full" />
        <Skeleton height="20px" w="full" />
      </VStack>
    );
  }
console.log(teachers)
  return (
    <Box>
      {/* عنوان الصفحة */}
      <VStack spacing={{ base: 4, sm: 5, md: 6 }}  mb={{ base: 6, sm: 8 }}>
        {!teachers?.teachers && (
          <Heading 
            size={{ base: "lg", sm: "xl", md: "2xl" }} 
            color={textColor}
            textAlign="center"
          >
            ابحث عن محاضرك
          </Heading>
        )}
      </VStack>

      {/* عرض المحاضرين */}
      {teachers?.teachers?.length > 0 ? (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {teachers.teachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="w-full"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              shadow="lg"
              _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
              transition="all 0.3s ease"
            >
              <CardBody p={{ base: 3, sm: 4, md: 5 }}>
                <Link to={`/teacher/${teacher.id}`}>
                  <VStack spacing={{ base: 2, sm: 3, md: 4 }} align="stretch">
                    <Image
                      src={teacher.avatar}
                      h={{ base: "180px", sm: "200px", md: "220px", lg: "240px" }}
                      w="100%"
                      borderRadius="lg"
                      alt={teacher.name || "Teacher"}
                      objectFit="cover"
                    />
                    <Box h="2px" bg={borderColor} w="full" />
                    <VStack spacing={{ base: 1, sm: 2 }} align="stretch">
                      <HStack justify="space-between" align="center" flexWrap="wrap" gap={1}>
                        <Text 
                          fontWeight="bold" 
                          fontSize={{ base: "sm", sm: "md", md: "lg" }}
                          color={textColor}
                          textAlign="right"
                          noOfLines={1}
                          flex={1}
                          minW="0"
                        >
                          {teacher.name}
                        </Text>
                        <Badge 
                          colorScheme="blue" 
                          variant="subtle" 
                          borderRadius="full"
                          px={{ base: 2, sm: 3 }}
                          py={{ base: 0.5, sm: 1 }}
                          fontSize={{ base: "xs", sm: "sm" }}
                          flexShrink={0}
                        >
                          {teacher.subject}
                        </Badge>
                      </HStack>
                      <HStack spacing={{ base: 1, sm: 2 }} align="center" flexWrap="wrap">
                        <Icon as={FaVideo} color="red.500" boxSize={{ base: 3, sm: 4, md: 5 }} />
                        <Text 
                          fontWeight="bold" 
                          fontSize={{ base: "xs", sm: "sm", md: "md" }}
                          color={subTextColor}
                          noOfLines={1}
                        >
                          محاضر ال {teacher.subject}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        // في حالة عدم وجود محاضرين
        <Center py={{ base: 8, sm: 12, md: 16 }}>
          <VStack 
            spacing={{ base: 6, sm: 8 }} 
            align="center" 
            maxW={{ base: "95%", sm: "600px" }}
            mx="auto"
            textAlign="center"
          >
            <VStack spacing={{ base: 4, sm: 6 }} align="center">
              <Heading 
                size={{ base: "lg", sm: "xl", md: "2xl" }}
                color={textColor}
                textAlign="center"
                lineHeight={{ base: "1.3", md: "1.2" }}
              >
                🚀 لم تقم بالاشتراك مع أي محاضرين بعد!
              </Heading>

              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }}
                color={subTextColor}
                textAlign="center"
                lineHeight={{ base: "1.5", md: "1.4" }}
                maxW={{ base: "320px", sm: "500px" }}
              >
                يمكنك البحث عن محاضرك باستخدام{" "}
                <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                  كود المحاضر
                </Badge>{" "}
                أو من خلال{" "}
                <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                  اسمه
                </Badge>.
              </Text>

              <Link to="/teachers">
                <HStack 
                  spacing={3}
                  bg="blue.500"
                  color="white"
                  px={{ base: 6, sm: 8 }}
                  py={{ base: 3, sm: 4 }}
                  borderRadius="xl"
                  shadow="lg"
                  _hover={{ 
                    bg: "blue.600", 
                    transform: "translateY(-2px)",
                    shadow: "xl"
                  }}
                  transition="all 0.3s ease"
                  fontWeight="bold"
                  fontSize={{ base: "md", sm: "lg" }}
                >
                  <Icon as={FaSearch} boxSize={{ base: 5, sm: 6 }} />
                  <Text>ابحث عن محاضرك</Text>
                </HStack>
              </Link>
            </VStack>
          </VStack>
        </Center>
      )}
    </Box>
  );
};

export default MyTeacher;
