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
} from "@chakra-ui/react";
import { MdOutlineVideoLibrary, MdAccessTime } from "react-icons/md";
import { FaSearch, FaPlay, FaCalendarAlt, FaStar, FaGraduationCap, FaUsers, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import GitMyMonthes from "../../Hooks/student/GitMyMonthes";
import { motion } from "framer-motion";
import { useState } from "react";

const Lectures = () => {
  const [myMonth, myMonthLoading] = GitMyMonthes();
  const [expandedCards, setExpandedCards] = useState({});

  // Function to toggle description expansion
  const toggleDescription = (courseId) => {
    setExpandedCards(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

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
    <Container maxW="7xl" pb={8}>
      <Box w="100%">
        {/* Page Title */}
        <Box textAlign="center" mb={12}>
          <motion.div
            
          >
            <Heading 
              as="h1" 
              size="3xl" 
              mb={6} 
             
             
             
              fontWeight="extrabold"
              
              position="relative"
            
            >
              دوراتي المسجلة 📚
            </Heading>
            <Text 
              color={subTextColor} 
              fontSize="xl" 
              maxW="700px" 
              mx="auto"
              lineHeight="tall"
              fontWeight="medium"
            >
              استكشف دوراتك المسجلة وتابع تقدمك في التعلم معنا
            </Text>
          </motion.div>
        </Box>

        {/* Display Courses */}
        {myMonthLoading ? (
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="w-full lg:w-[calc(33.333%-12px)]"
            >
              <Card 
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
        
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          {myMonth.courses.map((course, index) => (
              <Link 
                key={course.id}
                className="w-full lg:w-[calc(33.333%-12px)]" 
                to={`/CourseDetailsPage/${course.id}`} 
                style={{ textDecoration: "none" }}
              >
                <Card
                  className="w-full mx-auto"
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
      ) : (
        // No courses message
        <Center py={{ base: 12, sm: 16, md: 20 }} flexDirection="column">
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
              maxW="600px"
            >
              <Icon 
                as={MdOutlineVideoLibrary} 
                boxSize={{ base: 20, md: 24 }} 
                color="blue.400" 
                mb={6}
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
              />
              <VStack spacing={6} align="center">
                <Heading
                  size={{ base: "xl", sm: "2xl" }}
                  color={textColor}
                  bgGradient={useColorModeValue("linear(to-r, blue.400, purple.500)", "linear(to-r, blue.300, purple.400)")}
                  bgClip="text"
                  fontWeight="bold"
                >
                  🚀 لم تقم بالاشتراك في أي كورسات بعد!
                </Heading>

                <Text
                  fontSize={{ base: "lg", sm: "xl" }}
                  color={subTextColor}
                  lineHeight="tall"
                  maxW="500px"
                >
                  بمجرد الاشتراك في أي كورسات سوف تظهر في هذا القسم. انطلق واكتشف
                  المزيد من الفرص التعليمية المذهلة!
                </Text>
                
                <Button
                  colorScheme="blue"
                  size="xl"
                  leftIcon={<FaSearch />}
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.600, purple.600)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                  }}
                  _active={{
                    transform: "translateY(0px)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="xl"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  boxShadow="lg"
                >
                  تصفح الكورسات المتاحة
                </Button>
              </VStack>
            </Box>
          </motion.div>
        </Center>
      )}
      </Box>
    </Container>
  );
};

export default Lectures;