import {
  Button,
  Card,
  CardBody,
  Skeleton,
  Stack,
  Box,
  Image,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Heading,
  SimpleGrid,
  Center,
  AspectRatio,
  Container,
  Divider,
  Collapse,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useToast,
} from "@chakra-ui/react";
import { MdOutlineVideoLibrary, MdAccessTime } from "react-icons/md";
import { FaSearch, FaPlay, FaCalendarAlt, FaStar, FaGraduationCap, FaUsers, FaChevronDown, FaChevronUp, FaQrcode, FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import GitMyMonthes from "../../Hooks/student/GitMyMonthes";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import baseUrl from "../../api/baseUrl";

const Lectures = () => {
  const [myMonth, myMonthLoading] = GitMyMonthes();
  const [expandedCards, setExpandedCards] = useState({});
  const toast = useToast();
  const authHeader = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  }), []);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanner, setQrScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Function to toggle description expansion
  const toggleDescription = (courseId) => {
    setExpandedCards(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const activateCourseWithQR = async (qrData) => {
    try {
      const response = await baseUrl.post('api/course/scan-qr-activate', { qr_data: qrData }, { headers: authHeader });
      if (response.data.success) {
        toast({ title: 'تم تفعيل الكورس بنجاح', status: 'success' });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast({ title: 'لم يتم التفعيل', status: 'error' });
      }
    } catch (error) {
      let errorMessage = error.response?.data?.message || 'حدث خطأ في التفعيل';
      if (errorMessage.includes('fully used') || errorMessage.includes('مستخدم')) {
        errorMessage = 'هذا الكود مستخدم من قبل';
      }
      toast({ title: errorMessage, status: 'error' });
    }
  };

  const startQrScanner = async () => {
    setIsScanning(true);
    try {
      const element = document.getElementById("qr-reader");
      if (!element) { setIsScanning(false); return; }
      const html5Qrcode = new Html5Qrcode("qr-reader");
      await html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setIsScanning(false);
          html5Qrcode.stop().then(() => {
            html5Qrcode.clear();
            setQrScanner(null);
            setIsQrScannerOpen(false);
            activateCourseWithQR(decodedText);
          }).catch(() => {
            html5Qrcode.clear();
            setQrScanner(null);
            setIsQrScannerOpen(false);
            activateCourseWithQR(decodedText);
          });
        },
        () => {}
      ).catch(() => setIsScanning(false));
      setQrScanner(html5Qrcode);
    } catch (e) {
      setIsScanning(false);
    }
  };

  const openQrScannerModal = () => setIsQrScannerOpen(true);
  const closeQrScanner = async () => {
    setIsScanning(false);
    if (qrScanner) {
      try {
        const state = await qrScanner.getState();
        if (state === 2) { await qrScanner.stop(); }
        qrScanner.clear();
      } catch {}
      setQrScanner(null);
    }
    setIsQrScannerOpen(false);
  };

  useEffect(() => {
    if (isQrScannerOpen && !qrScanner) {
      const t = setTimeout(() => startQrScanner(), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQrScannerOpen]);

  // Enhanced colors for light and dark mode
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const buttonColorScheme = useColorModeValue("blue", "teal");
  const shadowColor = useColorModeValue("rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)");
  const hoverShadowColor = useColorModeValue("rgba(0,0,0,0.15)", "rgba(0,0,0,0.4)");
  const gradientBg = useColorModeValue("linear(to-br, blue.50, purple.50)", "linear(to-br, gray.700, gray.800)");

  return (
    <Container maxW="7xl" >
      <Box w="100%">
        {/* QR Activation - Simple Card */}
        <Box
          bg="blue.100"
          borderRadius="2xl"
          p={{ base: 4, md: 5 }}
          border="1px solid"
          borderColor={borderColor}
       
          textAlign="center"
        >
          <VStack spacing={3}>
            <Icon as={FaQrcode} w={10} h={10} color="blue.600" />
            <Heading size="md" color="blue.700">تفعيل كورس جديد</Heading>
            <Text fontSize="sm" color={subTextColor}>قم بمسح QR Code لتفعيل الكورس فوراً</Text>
            <Button onClick={openQrScannerModal} colorScheme="blue" leftIcon={<FaCamera />} size="md" borderRadius="full">
              مسح QR Code
            </Button>
          </VStack>
        </Box>
        {/* Page Title */}
    

        {/* Display Courses */}
        {myMonthLoading ? (
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="w-full teacher-course  lg:w-[calc(33.333%-12px)] "
            >
              <Card 
              className="teacher-course"
                bg={cardBg} 
                borderRadius="2xl" 
                shadow="lg" 
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
              >
                <Skeleton height="200px" width="100%" />
                <CardBody p={{ base: 4, sm: 5, md: 6 }}>
                  <VStack align="flex-end" spacing={4}>
                    <Skeleton height="24px" width="90%" />
                    <Skeleton height="16px" width="70%" />
                    <Skeleton height="16px" width="50%" />
                    <HStack justify="space-between" w="full">
                      <Skeleton height="32px" width="40%" borderRadius="full" />
                      <Skeleton height="20px" width="35%" />
                    </HStack>
                    <Skeleton height="48px" width="100%" borderRadius="xl" />
                  </VStack>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : myMonth.courses?.length > 0 ? (
        
        <div >
              <Box textAlign="center" mb={12}>
      
        </Box>
          <div className="flex flex-wrap  ">

          
          {myMonth.courses.map((course, index) => (
              <Link 
                key={course.id}
                className="w-full md:w-[330px] mx-3" 
                to={`/CourseDetailsPage/${course.id}`} 
                style={{ textDecoration: "none" }}
              >
                <Card
                  className=" stu-course  md:w-[340px] my-3"
                
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  overflow="hidden"
                  shadow="lg"
                  _hover={{
                    shadow: "2xl",
                    transform: "translateY(-8px)",
                    borderColor: useColorModeValue("blue.300", "blue.500"),
                  }}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  display="flex"
                  flexDirection="column"
                  position="relative"
                  bgGradient={useColorModeValue("linear(to-br, white, gray.50)", "linear(to-br, gray.800, gray.700)")}
                  role="group"
                  cursor="pointer"
                >
                  <Box position="relative" overflow="hidden" borderRadius="2xl">
                    <AspectRatio
                      ratio={16 / 9}
                      w="100%"
                     
                    >
                      <Image
                      style={{borderRadius:"20px"}}
                       className="p-2"
                        src={course.avatar}
                        alt={course.title}
                        objectFit="cover"
                        transition="transform 0.4s ease"
                        _groupHover={{ transform: "scale(1.05)" }}
                        fallbackSrc="https://via.placeholder.com/400x225/4A90E2/FFFFFF?text=Course+Image"
                      />
                    </AspectRatio>
                    {/* Gradient overlay */}
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      height="50%"
                      bgGradient="linear(to-t, blackAlpha.600, transparent)"
                      opacity="0"
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.3s ease"
                    />
                    {/* Overlay with play button */}
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bg="blackAlpha.400"
                      opacity="0"
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.3s ease"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon
                        as={FaPlay}
                        boxSize={12}
                        color="white"
                        filter="drop-shadow(0 0 8px rgba(0,0,0,0.5))"
                      />
                    </Box>
                    {/* Course status badge */}
                 
                  </Box>
                  <CardBody p={{ base: 4, sm: 5, md: 6 }} display="flex" flexDirection="column" flex="1">
                    <VStack align="flex-end" spacing={4} w="full" h="100%" justify="space-between">
                      {/* Course Title */}
                      <Box w="full">
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "lg", sm: "xl", md: "xl" }}
                          color={textColor}
                          textAlign="right"
                          noOfLines={2}
                          lineHeight="shorter"
                          mb={2}
                        >
                          {course.title}
                        </Text>
                        {/* Course Description */}
                        {course.description && (
                          <Box w="full">
                            <Text
                              fontSize={{ base: "sm", sm: "md" }}
                              color={subTextColor}
                              textAlign="right"
                              lineHeight="tall"
                              noOfLines={expandedCards[course.id] ? undefined : 1}
                            >
                              {course.description}
                            </Text>
                            {course.description.length > 50 && (
                              <HStack 
                                spacing={1} 
                                mt={2} 
                                justify="flex-end"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleDescription(course.id);
                                }}
                                cursor="pointer"
                                _hover={{ opacity: 0.8 }}
                                transition="opacity 0.2s ease"
                              >
                                <Text
                                  color="blue.500"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  {expandedCards[course.id] ? "عرض أقل" : "عرض المزيد"}
                                </Text>
                                <Icon
                                  as={expandedCards[course.id] ? FaChevronUp : FaChevronDown}
                                  color="blue.500"
                                  boxSize={3}
                                />
                              </HStack>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Course Stats */}
                      <Box w="full">
                        <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                          <HStack spacing={2}>
                            <Icon as={FaGraduationCap} color="blue.500" />
                            <Text fontSize="sm" color={subTextColor}>
                              كورس تعليمي
                            </Text>
                          </HStack>
                          <HStack spacing={1} color={subTextColor}>
                            <Icon as={FaUsers} />
                            <Text fontSize="sm">
                              {Math.floor(Math.random() * 500) + 100} طالب
                            </Text>
                          </HStack>
                        </HStack>

                        {/* Price and Date */}
                        <HStack justify="space-between" w="full" mb={4}>
                          <Badge
                            colorScheme="green"
                            borderRadius="full"
                            px={4}
                            py={2}
                            fontSize="sm"
                            fontWeight="bold"
                            bg="green.500"
                            color="white"
                            boxShadow="md"
                          >
                            {course.price} جنيه 💰
                          </Badge>
                          <HStack spacing={1} color={subTextColor} fontSize="sm">
                            <Icon as={FaCalendarAlt} />
                            <Text>
                              {new Date(course.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>

                      {/* Action Button */}
                      <Button
                        colorScheme={buttonColorScheme}
                        w="full"
                        size="lg"
                        rightIcon={<FaPlay />}
                        borderRadius="xl"
                        fontSize="md"
                        fontWeight="bold"
                        bgGradient={useColorModeValue(
                          "linear(to-r, blue.500, blue.600)",
                          "linear(to-r, teal.500, teal.600)"
                        )}
                        _hover={{
                          bgGradient: useColorModeValue(
                            "linear(to-r, blue.600, blue.700)",
                            "linear(to-r, teal.600, teal.700)"
                          ),
                          transform: "translateY(-2px)",
                          boxShadow: "xl"
                        }}
                        _active={{
                          transform: "translateY(0px)"
                        }}
                        transition="all 0.2s ease"
                        boxShadow="lg"
                      >
                        دخول الكورس
                      </Button>
                    </VStack>
                  </CardBody>
                  </Card>
                </Link>
          
          ))}
          </div>
        </div>
      ) : (
        // No courses message
        <Center flexDirection="column">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              p={8}
              borderRadius="2xl"
              bgGradient={gradientBg}
              border="1px solid"
              borderColor={borderColor}
              boxShadow="xl"
              textAlign="center"
             
            >
            
              <VStack spacing={6} align="center">
                <Heading
                  size={{ base: "xl", sm: "2xl" }}
                  color="blue.500"
                 
                  fontWeight="bold"
                >
                  🚀 لم تقم بالاشتراك في أي كورسات بعد!
                </Heading>          
              </VStack>
            </Box>
          </motion.div>
        </Center>
      )}
      </Box>

      {/* QR Scanner Modal */}
      <Modal 
        isOpen={isQrScannerOpen} 
        onClose={closeQrScanner} 
        isCentered 
        size="xl"
        closeOnOverlayClick={false}
        closeOnEsc={true}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          <ModalHeader textAlign="center" bg="blue.50" py={6}>
            <VStack spacing={2}>
              <Box w="54px" h="54px" bg="blue.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FaQrcode} w="28px" h="28px" color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="blue.800">تفعيل كورس جديد</Text>
              <Text fontSize="sm" color="blue.600">ضع QR Code داخل الإطار</Text>
            </VStack>
          </ModalHeader>
          <ModalBody py={8}>
            <VStack spacing={4} textAlign="center">
              <Box position="relative" w="100%" h="360px" borderRadius="lg" overflow="hidden" border="2px solid" borderColor="blue.200" bg="gray.100">
                <div id="qr-reader" style={{ width: "100%", height: "100%", position: "relative" }} />
                {isScanning && (
                  <Box position="absolute" top="50%" left="0" right="0" height="3px" bg="linear-gradient(90deg, transparent, #2563eb, transparent)" transform="translateY(-50%)" animation="scanning 2s linear infinite" zIndex={10} pointerEvents="none" />
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center" py={6}>
            <Button onClick={closeQrScanner} variant="ghost">إلغاء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Lectures;