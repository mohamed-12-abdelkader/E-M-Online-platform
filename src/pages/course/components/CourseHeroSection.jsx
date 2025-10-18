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
  useDisclosure,
  Box,
  Heading,
  Flex,
  Badge,
  useBreakpointValue,
  AspectRatio
} from "@chakra-ui/react";
import { FaUserGraduate, FaUserPlus, FaPlay, FaChartBar, FaClock, FaUsers } from "react-icons/fa";
import { IoIosSchool } from "react-icons/io";
import { Link } from "react-router-dom";
import baseUrl from "../../../api/baseUrl";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const CourseHeroSection = ({ course, isTeacher, isAdmin, handleViewEnrollments }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const token = localStorage.getItem("token");

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
        { headers: { Authorization: `Bearer ${token}` } }
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
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        dir="rtl"
        position="relative"
        overflow="hidden"
        bgGradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)"
        minH={{ base: "auto", md: "500px" }}
        py={{ base: 8, md: 12 }}
        px={{ base: 4, md: 6 }}
      >
        {/* Overlay with pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)"
          bgSize="30px 30px"
          opacity={0.3}
        />
        
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(45deg, rgba(0,0,0,0.2) 0%, transparent 100%)"
        />

        <Box
          maxW="7xl"
          mx="auto"
          position="relative"
          zIndex={1}
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={{ base: 8, lg: 12 }}
          >
            {/* Text Content */}
            <Box
              flex={1}
              textAlign={{ base: "center", lg: "right" }}
              color="white"
            >
              <MotionBox
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                mb={6}
              >
                <Badge
                  colorScheme="blue"
                  bg="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  borderRadius="full"
                  px={4}
                  py={2}
                  fontSize="md"
                  fontWeight="bold"
                >
                  <HStack spacing={2} justify={{ base: "center", lg: "flex-end" }}>
                    <Icon as={IoIosSchool} />
                    <Text>كورس تعليمي متكامل</Text>
                  </HStack>
                </Badge>
              </MotionBox>

              <MotionBox
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                mb={6}
              >
                <Heading
                  as="h1"
                  size={{ base: "xl", md: "2xl", lg: "3xl" }}
                  fontWeight="black"
                  lineHeight="shorter"
                  textShadow="0 4px 8px rgba(0, 0, 0, 0.3)"
                >
                  {course.title}
                </Heading>
              </MotionBox>

              <MotionBox
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                mb={8}
              >
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  opacity={0.9}
                  lineHeight="tall"
                  maxW={{ base: "100%", lg: "90%" }}
                  mx={{ base: "auto", lg: 0 }}
                >
                  {course.description}
                </Text>
              </MotionBox>

              {/* Course Stats */}
              <MotionBox
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                mb={8}
              >
                <HStack
                  spacing={{ base: 4, md: 8 }}
                  justify={{ base: "center", lg: "flex-start" }}
                  flexWrap="wrap"
                >
                  <HStack>
                    <Icon as={FaClock} />
                    <Text>12 ساعة</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaUsers} />
                    <Text>+500 طالب</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaChartBar} />
                    <Text>مستوى متوسط</Text>
                  </HStack>
                </HStack>
              </MotionBox>

              {/* Action Buttons */}
              <MotionBox
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <VStack spacing={4} align={{ base: "center", lg: "flex-end" }}>
                  <HStack spacing={4} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
               
           {isTeacher  ? <Link to={`/CourseStatisticsPage/${course.id}`}>
                      <MotionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        bg="transparent"
                        color="white"
                        border="2px solid"
                        borderColor="whiteAlpha.600"
                        fontWeight="bold"
                        size={buttonSize}
                        px={6}
                        rounded="xl"
                        shadow="md"
                        _hover={{ 
                          bg: "whiteAlpha.100", 
                          borderColor: "white",
                          transform: "translateY(-2px)"
                        }}
                      >
                        تفاصيل الكورس
                      </MotionButton>
                    </Link>  :null}
                  
                  </HStack>

                  {/* Teacher/Admin Buttons */}
                  {(isTeacher || isAdmin) && (
                    <HStack spacing={4} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                      <MotionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewEnrollments}
                        bg="whiteAlpha.200"
                        color="white"
                        border="1px solid"
                        borderColor="whiteAlpha.400"
                        fontWeight="bold"
                        size={isMobile ? "md" : buttonSize}
                        px={6}
                        rounded="lg"
                        shadow="md"
                        _hover={{ 
                          bg: "whiteAlpha.300",
                          transform: "translateY(-2px)"
                        }}
                        leftIcon={<FaUserGraduate />}
                      >
                        عرض المشتركين
                      </MotionButton>
                      <MotionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpen}
                        bg="green.500"
                        color="white"
                        fontWeight="bold"
                        size={isMobile ? "md" : buttonSize}
                        px={6}
                        rounded="lg"
                        shadow="lg"
                        _hover={{ 
                          bg: "green.600",
                          transform: "translateY(-2px)"
                        }}
                        leftIcon={<FaUserPlus />}
                      >
                        تفعيل طالب
                      </MotionButton>
                    </HStack>
                  )}
                </VStack>
              </MotionBox>
            </Box>

            {/* Course Image */}
            <MotionBox
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              flex={1}
              maxW={{ base: "100%", lg: "50%" }}
            >
              <Box
                position="relative"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                border="1px solid"
                borderColor="whiteAlpha.300"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                _hover={{
                  "& .play-overlay": {
                    opacity: 1
                  },
                  "& img": {
                    transform: "scale(1.05)"
                  }
                }}
              >
                <AspectRatio ratio={16/9}>
                  <Box overflow="hidden">
                    <img
                      src={
                        course.avatar ||
                        "https://via.placeholder.com/600x350/1e3a8a/ffffff?text=صورة+الكورس"
                      }
                      alt={course.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease"
                      }}
                    />
                  </Box>
                </AspectRatio>
                
                <Box
                  className="play-overlay"
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="blackAlpha.500"
                  opacity={0}
                  transition="opacity 0.3s ease"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MotionButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    bg="whiteAlpha.900"
                    color="blue.600"
                    rounded="full"
                    p={4}
                    shadow="xl"
                    size="lg"
                  >
                    <Icon as={FaPlay} boxSize={6} />
                  </MotionButton>
                </Box>
              </Box>
            </MotionBox>
          </Flex>
        </Box>
      </MotionBox>

      {/* Activate Student Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "md" }}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent 
          bg="white" 
          borderRadius="2xl" 
          boxShadow="2xl" 
          mx={4}
        >
          <ModalHeader pt={6}>
            <HStack spacing={3}>
              <Icon as={FaUserPlus} color="green.500" boxSize={5} />
              <Text fontWeight="bold" fontSize="xl">تفعيل طالب للكورس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton left={4} right="auto" />
          <ModalBody pb={6}>
            <VStack spacing={5}>
              <Text fontSize="md" color="gray.600" textAlign="center">
                أدخل رقم الطالب المراد تفعيله للكورس
              </Text>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">رقم الطالب</FormLabel>
                <Input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="أدخل رقم الطالب"
                  size="lg"
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="blue.200"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pt={4}>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onClose} 
              isDisabled={isLoading}
              borderRadius="lg"
              size="md"
            >
              إلغاء
            </Button>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              colorScheme="green"
              onClick={handleActivateStudent}
              isLoading={isLoading}
              loadingText="جاري التفعيل..."
              leftIcon={<Icon as={FaUserPlus} />}
              borderRadius="lg"
              size="md"
            >
              تفعيل الطالب
            </MotionButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CourseHeroSection;