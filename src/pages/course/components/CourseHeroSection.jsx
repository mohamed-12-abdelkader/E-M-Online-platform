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
} from "@chakra-ui/react";
import { FaUserGraduate, FaUserPlus, FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import baseUrl from "../../../api/baseUrl";
import { motion } from "framer-motion"; // لإضافة الرسوم المتحركة

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const CourseHeroSection = ({ course, isTeacher, isAdmin, handleViewEnrollments }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const token = localStorage.getItem("token");

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
      await baseUrl.post(`api/course/${course.id}/open-for-student/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: "تم التفعيل بنجاح",
        description: `تم تفعيل الطالب برقم ${studentId} للكورس`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      setStudentId('');
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
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #93c5fd 100%)",
          minHeight: "400px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <section className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
          {/* Course Info */}
          <div className="flex-1 text-center lg:text-right mb-8 lg:mb-0 lg:ml-12 xl:ml-16 order-2 lg:order-1">
            <MotionBox
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
            >
              <span className="text-white font-semibold text-sm">كورس تعليمي</span>
            </MotionBox>

            <Heading
              as="h1"
              size={{ base: "2xl", md: "3xl", lg: "4xl" }}
              color="white"
              fontWeight="black"
              mb={6}
              lineHeight="tight"
              textShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
            >
            {course.title}
            </Heading>

            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              color="whiteAlpha.900"
              mb={8}
              maxW={{ base: "90%", lg: "80%" }}
              mx="auto"
              lineHeight="relaxed"
              textShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
            >
            {course.description}
            </Text>

            {/* Action Buttons */}
            <HStack spacing={4} justify="center" lg={{ justify: "start" }} mb={6}>
              <MotionButton
                whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                bg="white"
                color="blue.600"
                fontWeight="bold"
                py={4}
                px={8}
                rounded="xl"
                shadow="lg"
                border="2px solid"
                borderColor="whiteAlpha.200"
                _hover={{ bg: "blue.50", borderColor: "blue.200" }}
              >
              ابدأ الكورس
              </MotionButton>

              <Link to={`/CourseStatisticsPage/${course.id}`}>
                <MotionButton
                  whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  bg="transparent"
                  color="white"
                  border="2px solid"
                  borderColor="whiteAlpha.600"
                  fontWeight="bold"
                  py={4}
                  px={8}
                  rounded="xl"
                  shadow="lg"
                  _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                >
               تفاصيل الكورس 
                </MotionButton>
            </Link>
            </HStack>

            {/* Teacher/Admin Buttons */}
            {(isTeacher || isAdmin) && (
              <HStack spacing={4} justify="center" lg={{ justify: "start" }}>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={handleViewEnrollments}
                  bg="whiteAlpha.200"
                  color="white"
                  border="1px solid"
                  borderColor="whiteAlpha.400"
                  fontWeight="bold"
                  py={3}
                  px={6}
                  rounded="lg"
                  shadow="md"
                  _hover={{ bg: "whiteAlpha.300" }}
                >
                  <HStack spacing={2}>
                    <Icon as={FaUserGraduate} />
                    <Text>عرض المشتركين</Text>
                  </HStack>
                </MotionButton>
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpen}
                  bg="green.500"
                  color="white"
                  border="2px solid"
                  borderColor="green.500"
                  fontWeight="bold"
                  py={3}
                  px={6}
                  rounded="lg"
                  shadow="md"
                  _hover={{ bg: "green.600", borderColor: "green.600" }}
                >
                  <HStack spacing={2}>
                    <Icon as={FaUserPlus} />
                    <Text>تفعيل طالب</Text>
                  </HStack>
                </MotionButton>
              </HStack>
            )}
        </div>
        
        {/* Course Image */}
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1 flex justify-center lg:justify-start mt-8 lg:mt-0 p-4 order-1 lg:order-2"
          >
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <img
                  src={course.avatar || "https://via.placeholder.com/400x320/1e3a8a/ffffff?text=صورة+الكورس"}
                  alt="Course Image"
                  className="w-[500px] sm:w-[550px] md:w-[600px] lg:w-[650px] h-[200px] sm:h-[220px] md:h-[250px] lg:h-[280px] object-cover rounded-2xl shadow-2xl border-4 border-white/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl"
              style={{
                    filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <MotionButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    bg="whiteAlpha.900"
                    color="blue.600"
                    rounded="full"
                    p={4}
                    shadow="lg"
                  >
                    <Icon as={FaPlay} boxSize={6} />
                  </MotionButton>
          </div>
        </div>
      </div>
          </MotionBox>
        </section>
      </MotionBox>

      {/* Activate Student Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent bg="whiteAlpha.900" backdropFilter="blur(20px)" rounded="xl" shadow="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FaUserPlus} color="green.500" />
              <Text fontWeight="bold">تفعيل طالب للكورس</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Text fontSize="md" color="gray.600" textAlign="center">
                أدخل رقم الطالب المراد تفعيله للكورس
              </Text>
              <FormControl isRequired>
                <FormLabel>رقم الطالب</FormLabel>
                <Input
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="أدخل رقم الطالب"
                  size="lg"
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="blue.200"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>
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