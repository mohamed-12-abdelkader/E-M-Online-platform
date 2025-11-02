import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Skeleton,
  // Stack,
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
  Button,
  AspectRatio,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaVideo, FaSearch } from "react-icons/fa";
import useGitMyTeacher from "../../Hooks/student/useGitMyTeacher";


const MyTeacher = () => {
  const [loading, teachers, error] = useGitMyTeacher();

  const sessionExpired = error === "Session expired or replaced";

  const handleForceLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("examAnswers");
      localStorage.removeItem("examTimeLeft");
    } catch (e) {}
    window.location.href = "/login";
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("blue.700", "blue.500");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (loading) {
    return (
      <VStack spacing={4} p={{ base: 4, sm: 6 }} w="100%">
        <Skeleton height="20px" w="full" />
        <Skeleton height="20px" w="full" />
        <Skeleton height="20px" w="full" />
        <Skeleton height="20px" w="full" />
      </VStack>
    );
  }

  return (
    <Box 
      w="100%" 
    
      py={8}
      position="relative"
      overflow="hidden"
    >
      {/* CSS Animations */}
      
      
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.05}
        bgImage="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')"
        pointerEvents="none"
        animation="gradientShift 20s ease-in-out infinite"
      />
      
      {/* Additional Background Effects */}
      <Box
        position="absolute"
        top="20%"
        left="-10%"
        w="30%"
        h="60%"
        bgGradient="radial(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
        borderRadius="full"
        animation="float 15s ease-in-out infinite"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        right="-5%"
        w="25%"
        h="50%"
        bgGradient="radial(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)"
        borderRadius="full"
        animation="float 12s ease-in-out infinite reverse"
        pointerEvents="none"
      />
      <Modal isOpen={sessionExpired} onClose={() => {}} isCentered closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">انتهاء الجلسة</ModalHeader>
          <ModalBody>
            <Text textAlign="center" color={subTextColor}>
              لقد انتهت جلستك أو تم استبدالها. يجب تسجيل الدخول مرة أخرى.
            </Text>
            <Text textAlign="center" color={subTextColor}>
          سجّل دخولك باستخدام رقم الهاتف وكلمة المرور التي قمت بالتسجيل بهما من قبل.
إذا كنت قد نسيت كلمة المرور، يُرجى التواصل مع الدعم الفني لاستعادتها.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" w="full" onClick={handleForceLogout}>
              تسجيل الدخول مرة أخرى
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Header Section */}
     

      {teachers?.teachers?.length > 0 ? (
        <div >
           <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, md: 8 }} position="relative" zIndex={1}>
        <VStack spacing={{ base: 6, sm: 8, md: 10 }} mb={{ base: 12, sm: 16, md: 20 }}>
          <VStack spacing={6} textAlign="center" position="relative">
            <VStack spacing={4}>
              <Heading
                size={{ base: "2xl", sm: "3xl", md: "4xl" }}
                fontWeight="black"
               color="blue.500"
                textAlign="center"        
               
              >
                🎓 محاضروك المفضلون
              </Heading> 
            </VStack>
          </VStack>
        </VStack>
      </Box>
      <div className="flex flex-wrap">

      
            {teachers.teachers.map((teacher, index) => (
              <Link className="w-full w-[340px] md:  m-3 " key={teacher.id} to={`/teacher/${teacher.id}`} style={{ display: "block" }}>
                <Card
                 className=" w-full mx-auto md:w-[340px] md:mx-3 "
                  h="full"
                  bg={cardBg}
                  borderRadius="2xl"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={borderColor}
                  boxShadow="lg"
                  transition="all 0.3s ease"
                  cursor="pointer"
                  position="relative"
                  group
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    borderColor: "blue.300"
                  }}
                  sx={{
                    animation: `cardSlideUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Image Section */}
                  <Box position="relative" h="250px" overflow="hidden">
                    <Image
                      src={teacher.avatar || "https://via.placeholder.com/400x300/4fd1c5/ffffff?text=صورة+المدرس"}
                      alt={teacher.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      _groupHover={{ transform: "scale(1.05)" }}
                    />

                    {/* Gradient Overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgGradient="linear(to-b, transparent 0%, rgba(0,0,0,0.2) 100%)"
                    />

                    {/* Subject Badge */}
                    <Box
                      position="absolute"
                      top={3}
                      right={3}
                      bg="white"
                      color="blue.600"
                      px={3}
                      py={1}
                      borderRadius="lg"
                      fontSize="xs"
                      fontWeight="bold"
                      boxShadow="md"
                    >
                      📚 {teacher.subject}
                    </Box>

                    {/* Online Status */}
                    <Box
                      position="absolute"
                      bottom={3}
                      right={3}
                      bg="green.500"
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      border="2px solid white"
                      boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                    />
                  </Box>

                  {/* Content Section */}
                  <CardBody p={4} display="flex" flexDirection="column" flex="1">
                    <VStack align="flex-start" spacing={3} w="full" h="100%" justify="space-between">
                      {/* Teacher Info */}
                      <Box w="full">
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          color={textColor}
                          textAlign="right"
                          mb={2}
                          noOfLines={1}
                        >
                          {teacher.name}
                        </Text>
                        
                        {teacher.description ? (
                          <Text
                            fontSize="sm"
                            color={subTextColor}
                            textAlign="right"
                            noOfLines={2}
                            lineHeight="1.4"
                            mb={3}
                          >
                            {teacher.description}
                          </Text>
                        ) : (
                          <Text
                            fontSize="sm"
                            color={subTextColor}
                            textAlign="right"
                            fontStyle="italic"
                            mb={3}
                          >
                            محاضر متخصص في {teacher.subject}
                          </Text>
                        )}

                        {/* Stats Row */}
                        <HStack spacing={3} w="full" justify="space-between" mb={3}>
                          

                        </HStack>
                      </Box>

                      {/* Action Button */}
                      <Button
                        colorScheme="blue"
                        w="full"
                        borderRadius="lg"
                        fontWeight="bold"
                        fontSize="sm"
                        h="40px"
                        bgGradient="linear(to-r, blue.500, blue.600)"
                        color="white"
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
                          bgGradient: "linear(to-r, blue.600, purple.600)",
                        }}
                        _active={{
                          transform: "translateY(0)",
                        }}
                        transition="all 0.2s ease"
                        leftIcon={<Icon as={FaVideo} boxSize={3} />}
                        boxShadow="sm"
                      >
                        عرض الكورسات
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </Link>
            ))}
         </div>
        </div>
      ) : (
        <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, md: 8 }}>
          <Center >
            <VStack spacing={{ base: 8, sm: 10, md: 12 }} align="center" w="100%" textAlign="center">
              <VStack spacing={{ base: 6, sm: 8 }} align="center" w="100%">
                {/* Empty State Icon */}
               

                <VStack spacing={4}>
                  <Heading
                    size={{ base: "xl", sm: "2xl", md: "3xl" }}
                    color="blue.500"
                    textAlign="center"
                    lineHeight="1.2"
                  
                 
                    fontWeight="bold"
                  >
                    🚀 ابدأ رحلتك التعليمية!
                  </Heading>

                  <Text
                    fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                    color={subTextColor}
                    textAlign="center"
                    lineHeight="1.6"
                    maxW={{ base: "400px", sm: "600px", md: "700px" }}
                  >
                    لم تقم بالاشتراك مع أي محاضرين بعد. ابحث عن محاضرك من خلال اسمه !
                  </Text>
                </VStack>

                <VStack spacing={6} w="full" maxW="500px">
               

                  <Link to="/teachers">
                    <Button
                      size={{ base: "lg", sm: "xl" }}
                      colorScheme="blue"
                      bgGradient="blue.500"
                      color="white"
                      px={{ base: 8, sm: 10, md: 12 }}
                      py={{ base: 4, sm: 5, md: 6 }}
                      borderRadius="2xl"
                      fontWeight="bold"
                      fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                      h={{ base: "56px", sm: "64px", md: "72px" }}
                      leftIcon={<Icon as={FaSearch} boxSize={{ base: 6, sm: 7, md: 8 }} />}
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                        bgGradient: "linear(to-r, blue.600, purple.600)",
                      }}
                      _active={{
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      boxShadow="xl"
                    >
                      🔍 ابحث عن محاضرك
                    </Button>
                  </Link>
                </VStack>
              </VStack>
            </VStack>
          </Center>
        </Box>
      )}
    </Box>
  );
};

export default MyTeacher;
