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
} from "@chakra-ui/react";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { FaSearch, FaPlay, FaCalendarAlt, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import GitMyMonthes from "../../Hooks/student/GitMyMonthes";
import { CoursesCard } from "../../ui/card/CoursesCard";
import img from "../../img/Screenshot_2025-03-07_203419-removebg-preview.png";
import { motion } from "framer-motion";

const Lectures = () => {
  const [myMonth, myMonthLoading] = GitMyMonthes();
  
  // Colors for light and dark mode
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box  maxW="1400px" mx="auto">
      {/* عنوان الصفحة */}
    

      {/* عرض الكورسات */}
      {myMonthLoading ? (
        <VStack spacing={{ base: 3, sm: 4 }} p={{ base: 3, sm: 4, md: 6 }} maxW="95%" mx="auto">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={{ base: "16px", sm: "20px" }} w="full" />
          ))}
        </VStack>
      ) : myMonth.courses?.length > 0 ? (
        <div className="w-[95%] m-auto flex flex-wrap"
        >
          {myMonth.courses.map((course) => (
            <Link key={course.id} to={`/CourseDetailsPage/${course.id}`}>
              <Card
                className="w-[300px] m-2"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={{ base: "lg", sm: "xl" }}
                overflow="hidden"
                shadow={{ base: "md", sm: "lg" }}
                _hover={{ 
                  transform: "translateY(-4px)", 
                  shadow: { base: "lg", sm: "xl" }
                }}
                transition="all 0.3s ease"
                mx="auto"
              >
                  <Image
                    src={course.avatar || "https://via.placeholder.com/300x200/4fd1c5/ffffff?text=صورة+الكورس"}
                    alt={course.title}
                    height={{ base: "160px", sm: "180px", md: "200px", lg: "220px" }}
                    width="100%"
                    objectFit="cover"
                  />
                  <CardBody p={{ base: 3, sm: 4, md: 5 }}>
                    <VStack align="flex-start" spacing={{ base: 2, sm: 3, md: 4 }}>
                      <Text 
                        fontWeight="bold" 
                        fontSize={{ base: "sm", sm: "md", md: "lg" }} 
                        color={textColor} 
                        textAlign="right"
                        noOfLines={2}
                        lineHeight={{ base: "1.3", md: "1.2" }}
                      >
                        {course.title}
                      </Text>
                      {course.description && (
                        <Text 
                          fontSize={{ base: "xs", sm: "sm", md: "md" }} 
                          color={subTextColor} 
                          textAlign="right"
                          noOfLines={2}
                          lineHeight={{ base: "1.4", md: "1.3" }}
                        >
                          {course.description}
                        </Text>
                      )}
                      <HStack justify="space-between" w="full" spacing={{ base: 2, sm: 3 }}>
                        <Badge 
                          colorScheme="green" 
                          borderRadius="full" 
                          px={{ base: 2, sm: 3 }}
                          py={{ base: 0.5, sm: 1, md: 2 }}
                          fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                        >
                          {course.price} جنيه
                        </Badge>
                        <Text 
                          fontSize={{ base: "2xs", sm: "xs", md: "sm" }} 
                          color={subTextColor}
                          noOfLines={1}
                        >
                          {new Date(course.created_at).toLocaleDateString('ar-EG')}
                        </Text>
                      </HStack>
                      <Button 
                        colorScheme="blue" 
                        w="full" 
                        size={{ base: "xs", sm: "sm", md: "md" }}
                        rightIcon={<FaPlay />}
                        borderRadius={{ base: "md", sm: "lg" }}
                        fontSize={{ base: "xs", sm: "sm", md: "md" }}
                        py={{ base: 2, sm: 3 }}
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
        // في حالة عدم وجود كورسات
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
                🚀 لم تقم بالاشتراك فى أي كورسات بعد!
              </Heading>

              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }}
                color={subTextColor}
                textAlign="center"
                lineHeight={{ base: "1.5", md: "1.4" }}
                maxW={{ base: "320px", sm: "500px" }}
              >
                بمجرد الاشتراك فى اى كورسات سوف تظهر فى هذا القسم
              </Text>
            </VStack>
          </VStack>
        </Center>
      )}
    </Box>
  );
};

export default Lectures;