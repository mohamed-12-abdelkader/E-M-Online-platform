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
  AspectRatio,
  Center,
  Image,
  SimpleGrid,
  Container
} from "@chakra-ui/react";
import { FaUserGraduate, FaUserPlus, FaPlay, FaChartBar, FaClock, FaUsers, FaStar, FaArrowLeft, FaCheck } from "react-icons/fa";
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
      <Box
        bg="blue.500"
        position="relative"
        overflow="hidden"
        dir="rtl"
      >
        {/* Abstract Background Shapes */}
        <Box position="absolute" inset="0" overflow="hidden">
          <Box
            position="absolute" top="-20%" left="-10%" w="70%" h="140%"
            bgGradient="linear(to-br, blue.400, transparent)"
            borderRadius="full"
            opacity={0.3}
            filter="blur(80px)"
          />
          <Box
            position="absolute" bottom="-10%" right="-10%" w="50%" h="100%"
            bgGradient="linear(to-tl, blue.300, transparent)"
            borderRadius="full"
            opacity={0.2}
            filter="blur(60px)"
          />
          {/* Geometric overlay */}
          <Box position="absolute" top="10%" left="5%" opacity={0.1}>
            <Icon as={FaChartBar} boxSize={96} color="white" transform="rotate(-15deg)" />
          </Box>
        </Box>

        <Container maxW="8xl" pt={{ base: 10, md: 16 }} pb={{ base: 16, md: 24 }} position="relative" zIndex={1}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={{ base: 12, lg: 20 }}
          >
            {/* Left Content (Text) */}
            <VStack
              flex={1}
              align={{ base: "center", lg: "flex-start" }}
              spacing={8}
              textAlign={{ base: "center", lg: "right" }}
              w="full"
            >
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <HStack
                  bg="white"
                  px={4} py={2}
                  borderRadius="full"
                  shadow="lg"
                  spacing={3}
                >
                  <Badge colorScheme="blue" variant="solid" rounded="full" px={2}>جديد</Badge>
                  <Text color="blue.600" fontWeight="bold" fontSize="sm">
                    كورس تعليمي شامل واحترافي
                  </Text>
                </HStack>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                w="full"
              >
                <Heading
                  as="h1"
                  color="white"
                  fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }}
                  fontWeight="900"
                  lineHeight="1.1"
                  letterSpacing="tight"
                  mb={4}
                >
                  {course.title}
                  <Text as="span" color="blue.200">.</Text>
                </Heading>
                <Text
                  color="blue.100"
                  fontSize={{ base: "lg", lg: "2xl" }}
                  maxW="2xl"
                  lineHeight="1.6"
                  mx={{ base: "auto", lg: 0 }}
                >
                  {course.description}
                </Text>
              </MotionBox>

              {/* Stats Cards */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                w="full"
              >
                <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4} w="full">
                  {[
                    { icon: FaClock, label: "12 ساعة", sub: "مدة الكورس" },
                    { icon: FaUsers, label: "500+", sub: "مشترك" },
                    { icon: FaStar, label: "4.9", sub: "تقييم" },
                    { icon: IoIosSchool, label: "معتمد", sub: "شهادة" },
                  ].map((stat, i) => (
                    <VStack
                      key={i}
                      bg="whiteAlpha.200"
                      backdropFilter="blur(10px)"
                      p={4}
                      borderRadius="2xl"
                      align="center"
                      border="1px solid whiteAlpha.300"
                      transition="transform 0.2s"
                      _hover={{ transform: "translateY(-5px)", bg: "whiteAlpha.300" }}
                    >
                      <Icon as={stat.icon} color="white" boxSize={6} mb={2} />
                      <Text color="white" fontWeight="bold" fontSize="lg">{stat.label}</Text>
                      <Text color="blue.200" fontSize="xs">{stat.sub}</Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </MotionBox>

              {/* CTAs */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                w="full"
              >
                <Flex gap={4} wrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                  {isTeacher ? (
                    <Link to={`/CourseStatisticsPage/${course.id}`}>
                      <Button
                        size="lg"
                        h="14"
                        px={10}
                        bg="white"
                        color="blue.600"
                        fontSize="lg"
                        fontWeight="bold"
                        borderRadius="2xl"
                        shadow="xl"
                        _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                        leftIcon={<Icon as={FaChartBar} />}
                      >
                        الإحصائيات
                      </Button>
                    </Link>
                  ) : null}

                  {(isTeacher || isAdmin) && (
                    <>
                      <Button
                        size="lg"
                        h="14"
                        px={8}
                        variant="outline"
                        color="white"
                        borderColor="whiteAlpha.500"
                        fontSize="lg"
                        borderRadius="2xl"
                        _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                        onClick={handleViewEnrollments}
                        leftIcon={<Icon as={FaUserGraduate} />}
                      >
                        المشتركين
                      </Button>
                      <Button
                        size="lg"
                        h="14"
                        px={8}
                        bg="blue.700"
                        color="white"
                        fontSize="lg"
                        borderRadius="2xl"
                        _hover={{ bg: "blue.800" }}
                        onClick={onOpen}
                        leftIcon={<Icon as={FaUserPlus} />}
                        shadow="lg"
                      >
                        تفعيل طالب
                      </Button>
                    </>
                  )}
                </Flex>
              </MotionBox>
            </VStack>

            {/* Right Content (Image) */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              flex={1}
              w="full"
              position="relative"
            >
              <Box
                position="relative"
                borderRadius="3xl"
                overflow="hidden"
                boxShadow="2xl"
                border="8px solid"
                borderColor="whiteAlpha.300"
              >
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={course.avatar || "https://via.placeholder.com/800x450/1e3a8a/ffffff?text=Course"}
                    alt={course.title}
                    objectFit="cover"
                  />
                </AspectRatio>

                {/* Play Button Overlay */}
                <Center position="absolute" inset="0" bg="blackAlpha.300" className="group" cursor="pointer">
                  <Flex
                    align="center" justify="center"
                    w="20" h="20"
                    bg="white"
                    borderRadius="full"
                    shadow="2xl"
                    transition="all 0.3s"
                    _groupHover={{ transform: "scale(1.1)" }}
                  >
                    <Icon as={FaPlay} color="blue.500" boxSize={6} ml={1} />
                  </Flex>
                </Center>
              </Box>

              {/* Floating Elements */}
              <Box
                position="absolute" top="-5%" right="-5%"
                bg="white" p={4} borderRadius="2xl" shadow="xl"
                animation="bounce 3s infinite"
              >
                <Icon as={FaStar} color="yellow.400" boxSize={8} />
              </Box>
              <Box
                position="absolute" bottom="-5%" left="-5%"
                bg="green.400" px={6} py={3} borderRadius="xl" shadow="xl"
                color="white" fontWeight="bold"
                display="flex" alignItems="center" gap={2}
              >
                <Icon as={FaCheck} />
                متاح الآن
              </Box>
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* Activate Student Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "md" }}>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          mx={4}
        >
          <ModalHeader pt={6} borderBottomWidth="1px" borderColor="gray.100">
            <HStack spacing={3}>
              <Center w={10} h={10} bg="blue.100" borderRadius="full">
                <Icon as={FaUserPlus} color="blue.500" boxSize={5} />
              </Center>
              <Text fontWeight="bold" fontSize="xl" color="gray.800">تفعيل طالب للكورس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton left={4} right="auto" mt={2} />
          <ModalBody py={8}>
            <VStack spacing={6}>
              <Text fontSize="md" color="gray.500" textAlign="center">
                قم بإدخال رقم الطالب (ID) لتفعيله في هذا الكورس مباشرة.
              </Text>
              <FormControl isRequired>
                <FormLabel fontWeight="bold" color="gray.700">رقم الطالب</FormLabel>
                <Input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="مثال: 12345"
                  size="lg"
                  borderRadius="xl"
                  bg="gray.50"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "blue.500",
                    bg: "white",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pb={6}>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              isDisabled={isLoading}
              borderRadius="xl"
              size="lg"
              color="gray.500"
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
              size="lg"
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