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
  SimpleGrid, // Changed from div for better grid control
  Center,
  AspectRatio,
} from "@chakra-ui/react";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { FaSearch, FaPlay, FaCalendarAlt, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import GitMyMonthes from "../../Hooks/student/GitMyMonthes";
// Assuming CoursesCard is not strictly needed if we are customizing the Card directly
// import { CoursesCard } from "../../ui/card/CoursesCard";
// Removed unused image import
import { motion } from "framer-motion";

const Lectures = () => {
  const [myMonth, myMonthLoading] = GitMyMonthes();

  // Colors for light and dark mode
  const cardBg = useColorModeValue("white", "gray.700"); // Slightly darker gray for dark mode for better contrast
  const textColor = useColorModeValue("gray.800", "gray.100"); // Stronger contrast
  const subTextColor = useColorModeValue("gray.600", "gray.300"); // Adjusted for readability
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const buttonColorScheme = useColorModeValue("blue", "teal"); // Different button color for dark mode

  return (
    <Box   w="100%">
      {/* Page Title - You can add one here if needed */}
      {/* <Heading as="h1" size="xl" mb={6} textAlign="center" color={textColor}>
        دوراتي المسجلة 📚
      </Heading> */}

      {/* Display Courses */}
      {myMonthLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
          {[...Array(6)].map((_, i) => (
            <Card  key={i} bg={cardBg} borderRadius="xl" shadow="md" overflow="hidden">
              <Skeleton height="200px" width="100%" />
              <CardBody p={4}>
                <VStack align="flex-start" spacing={3}>
                  <Skeleton height="20px" width="80%" />
                  <Skeleton height="16px" width="60%" />
                  <HStack justify="space-between" w="full">
                    <Skeleton height="24px" width="30%" />
                    <Skeleton height="16px" width="40%" />
                  </HStack>
                  <Skeleton height="40px" width="100%" />
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : myMonth.courses?.length > 0 ? (
        <div className="md:flex flex-wrap" >
          {myMonth.courses.map((course) => (
            <Link key={course.id} to={`/CourseDetailsPage/${course.id}`}>
           
                <Card
              className=" m-5 md:w-[345px] md:m-2"
                  bg={cardBg}
                  border="1px solid"
                  
                  borderColor={borderColor}
                  borderRadius="xl" // Larger border radius for a softer look
                  overflow="hidden"
                  shadow="md" // Initial shadow
                  _hover={{
                    shadow: "xl", // Enhanced shadow on hover
                    transform: "translateY(-5px)", // Subtle lift effect
                  }}
                  transition="all 0.3s ease-in-out" // Smooth transition for all properties
                
                  display="flex"
                  flexDirection="column"
                >
                  <AspectRatio
                    ratio={16 / 9}
                    w="100%"
                    borderBottom="1px solid"
                    borderColor={borderColor}
                  >
                    <Image
                      src={course.avatar}
                      alt={course.title}
                      objectFit="cover"
                    />
                  </AspectRatio>
                  <CardBody p={{ base: 3, sm: 4, md: 5 }} display="flex" flexDirection="column" flex="1">
                    <VStack align="flex-end" spacing={{ base: 2, sm: 3 }} w="full" h="100%" justify="space-between"> {/* Align text to the right for Arabic */}
                      <Box w="full" >
                        <Text
                        fontWeight="extrabold" // Bolder title
                        fontSize={{ base: "md", sm: "lg", md: "xl" }} // Larger font size for title
                        color={textColor}
                        textAlign="right"
                        noOfLines={2}
                        lineHeight="short" // Tighter line height
                      >
                        {course.title}
                        </Text>
                      </Box>
                      <Box w="full" minH={{ base: "54px", sm: "60px", md: "72px" }}>
                        {course.description ? (
                          <Text
                            fontSize={{ base: "xs", sm: "sm", md: "md" }}
                            color={subTextColor}
                            textAlign="right"
                            noOfLines={3} // Allow more lines for description
                            lineHeight="tall"
                          >
                            {course.description}
                          </Text>
                        ) : null}
                      </Box>
                      <HStack justify="space-between" w="full" pt={2}> {/* Add padding top */}
                        <Badge
                          colorScheme="green"
                          borderRadius="full"
                          px={{ base: 2.5, sm: 3.5 }}
                          py={{ base: 1, sm: 1.5 }}
                          fontSize={{ base: "xs", sm: "sm" }} // Slightly larger badge text
                          fontWeight="bold"
                        >
                          {course.price} جنيه 💰
                        </Badge>
                        <HStack spacing={1} color={subTextColor} fontSize={{ base: "xs", sm: "sm" }}>
                            <Icon as={FaCalendarAlt} /> {/* Calendar icon for date */}
                            <Text>
                            {new Date(course.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                            </Text>
                        </HStack>
                      </HStack>
                      <Button
                        colorScheme={buttonColorScheme}
                        w="full"
                        size="lg" // Larger button
                        rightIcon={<FaPlay />}
                        borderRadius="lg" // Matching card's border radius
                        mt={4} // Margin top for separation from text
                        fontSize={{ base: "sm", sm: "md" }}
                        _hover={{ opacity: 0.9 }}
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
        <Center py={{ base: 8, sm: 12, md: 16 }} flexDirection="column">
          <Icon as={MdOutlineVideoLibrary} boxSize={{ base: 16, md: 20 }} color="gray.400" mb={4} />
          <VStack
            spacing={{ base: 4, sm: 6 }}
            align="center"
            w="100%"
            textAlign="center"
          >
            <Heading
              size={{ base: "lg", sm: "xl" }}
              color={textColor}
              textAlign="center"
              lineHeight="short"
            >
              🚀 لم تقم بالاشتراك في أي كورسات بعد!
            </Heading>

            <Text
              fontSize={{ base: "md", sm: "lg" }}
              color={subTextColor}
              textAlign="center"
              lineHeight="tall"
              maxW="500px"
            >
              بمجرد الاشتراك في أي كورسات سوف تظهر في هذا القسم. انطلق واكتشف
              المزيد!
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<FaSearch />}
              mt={6}
            >
              تصفح الكورسات المتاحة
            </Button>
          </VStack>
        </Center>
      )}
    </Box>
  );
};

export default Lectures;