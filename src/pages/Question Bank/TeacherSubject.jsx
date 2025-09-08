import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  useColorModeValue,
  Icon,
  Image,
  Spinner,
  HStack,
  VStack,
  useToast,
  InputGroup,
  InputLeftElement,
  Input,
} from "@chakra-ui/react";
import {
  FaBook,
  FaGraduationCap,
  FaSearch,
  FaEye,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import baseUrl from "../../api/baseUrl";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const TeacherSubject = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [subjects, setSubjects] = useState([]);
  
  // تحديد الألوان بناءً على وضع الثيم (فاتح/داكن)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Fetch teacher subjects
  const fetchTeacherSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await baseUrl.get(`/api/teacher/subjects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Teacher Subjects API Response:", response.data);
      
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ في جلب المواد المتاحة";
      setError(errorMsg);
      console.error("Error fetching teacher subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeacherSubjects();
  }, []);

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>جاري تحميل المواد المتاحة...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={{ base: 4, md: 8 }} className="mt-[80px]" maxW="1200px" mx="auto" bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="80vh">
          <Box textAlign="center" p={6} bg="red.50" borderRadius="lg">
            <Text color="red.600">خطأ في تحميل البيانات: {error}</Text>
            <Button 
              mt={4} 
              colorScheme="blue" 
              onClick={fetchTeacherSubjects}
              leftIcon={<FaBook />}
            >
              إعادة المحاولة
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)" position="relative">
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        backgroundImage="radial-gradient(circle at 25px 25px, white 2px, transparent 0), radial-gradient(circle at 75px 75px, white 2px, transparent 0)"
        backgroundSize="100px 100px"
      />
      
      {/* Header */}
      <Box
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        position="sticky"
        top={0}
        zIndex={10}
        mt="0px"
      >
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
          <Flex align="center" gap={4}>
            <Box
              w="60px"
              h="60px"
              bg="linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)"
              borderRadius="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 10px 30px rgba(49, 130, 206, 0.3)"
            >
              <Icon as={FaGraduationCap} color="white" boxSize={6} />
            </Box>
            <Box>
              <Heading 
                size={{ base: "lg", md: "xl" }} 
                bgGradient="linear(to-r, #3182ce, #2c5aa0)"
                bgClip="text"
                fontWeight="bold"
              >
                المواد المتاحة
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                {subjects.length} مادة متاحة لك
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8} position="relative" zIndex={1}>
      {/* رأس الصفحة */}
      <Flex
        direction={{ base: "column", md: "row" }}
        mb={10}
        p={6}
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="xl"
        align="center"
        justify="space-between"
      >
        <VStack align={{ base: "center", md: "flex-start" }} spacing={3} mb={{ base: 6, md: 0 }}>
          <HStack spacing={4} align="center">
            <Icon as={FaGraduationCap} color={accentColor} boxSize={10} />
            <Heading size={{ base: "xl", md: "2xl" }} color={headingColor}>
              المواد المتاحة
            </Heading>
            <Badge colorScheme="green" ml={3} fontSize="lg" px={3} py={1} borderRadius="full">
              {subjects.length} مادة
            </Badge>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} color={textColor} textAlign={{ base: "center", md: "right" }}>
            المواد التي تم منحك صلاحية الوصول إليها
          </Text>
        </VStack>
      </Flex>

      {/* شريط البحث */}
      <Box mb={8}>
        <InputGroup size="lg" boxShadow="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="ابحث عن مادة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={cardBg}
            borderRadius="full"
            boxShadow="sm"
            _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
            py={6}
          />
        </InputGroup>
      </Box>

      {/* عرض المواد */}
      <Box>
        <Heading size="lg" mb={6} color={headingColor} textAlign="center">
          <Icon as={FaBook} mr={2} color={accentColor} />
          المواد المتاحة ({filteredSubjects.length})
        </Heading>

        {filteredSubjects.length === 0 ? (
          <Box textAlign="center" py={12} bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor}>
            <FaBook size={48} color="gray.400" style={{ margin: "0 auto 16px" }} />
            <Text color="gray.500" fontSize="lg">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مواد متاحة لك بعد"}
            </Text>
            {!searchTerm && (
              <Text mt={2} color="gray.400" fontSize="sm">
                اتصل بالمدير لمنحك صلاحية الوصول للمواد
              </Text>
            )}
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredSubjects.map((subject) => (
              <MotionCard
                key={subject.id}
                whileHover={{ scale: 1.02, y: -5 }}
                bg={cardBg}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{
                  boxShadow: "xl",
                  borderColor: "blue.400"
                }}
              >
                <CardHeader pb={2}>
                  {subject.image_url && (
                    <Box mb={4}>
                      <Image
                        src={subject.image_url}
                        alt={subject.name}
                        borderRadius="md"
                        maxH="180px"
                        objectFit="cover"
                        w="full"
                        fallback={
                          <Box
                            bg="gray.100"
                            h="180px"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon as={FaBook} size="48px" color="gray.400" />
                          </Box>
                        }
                      />
                    </Box>
                  )}
                  <Flex align="center">
                    <Box>
                      <Heading size="md" color={headingColor} mb={1}>{subject.name}</Heading>
                      {subject.description && (
                        <Text fontSize="sm" color={textColor} noOfLines={2}>
                          {subject.description}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </CardHeader>

                <CardBody py={4}>
                  <VStack spacing={3} align="stretch">
                   
                    
                    <HStack justify="space-between" p={3} bg="green.50" borderRadius="md">
                      <VStack spacing={1}>
                        <Icon as={FaBook} color="green.500" />
                        <Text fontSize="xs" color="green.600">بنك الأسئلة</Text>
                      </VStack>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {subject.question_bank_id}
                      </Text>
                    </HStack>

                    <HStack justify="space-between" p={3} bg="orange.50" borderRadius="md">
                      <VStack spacing={1}>
                        <Icon as={FaClock} color="orange.500" />
                        <Text fontSize="xs" color="orange.600">تاريخ الإنشاء</Text>
                      </VStack>
                      <Text fontSize="sm" color="orange.600" textAlign="center">
                        {new Date(subject.created_at).toLocaleDateString('ar-EG')}
                      </Text>
                    </HStack>

                    <HStack spacing={2} justify="center">
                      <Badge 
                        colorScheme={subject.is_active ? "green" : "red"} 
                        variant="subtle" 
                        p={2} 
                        borderRadius="md"
                      >
                        {subject.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                      {subject.color && (
                        <Box
                          w="20px"
                          h="20px"
                          bg={subject.color}
                          borderRadius="full"
                          border="2px solid"
                          borderColor="gray.200"
                        />
                      )}
                    </HStack>
                  </VStack>
                </CardBody>

                <CardFooter pt={0}>
                  <Link to={`/supject/${subject.id}`} style={{ width: "100%" }}>
                    <Button
                      rightIcon={<FaEye />}
                      variant="solid"
                      colorScheme="blue"
                      w="full"
                      size="md"
                      borderRadius="lg"
                    >
                      عرض الفصول
                    </Button>
                  </Link>
                </CardFooter>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </Box>
      
      <ScrollToTop/>
      </Box>
    </Box>
  );
};

export default TeacherSubject;
