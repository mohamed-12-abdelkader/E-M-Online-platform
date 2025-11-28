import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Center,
  SimpleGrid,
  Card,
  CardBody,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Avatar,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdPeople, MdSearch, MdEmail, MdPhone, MdMenuBook, MdArrowForward } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import baseUrl from "../../api/baseUrl";
import { useNavigate } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const [userData, isAdmin, isTeacher] = UserType();

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("blue.50", "gray.600");

  useEffect(() => {
    if (isTeacher) {
      fetchStudents();
    }
  }, [isTeacher]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await baseUrl.get("/api/course/teacher/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.students || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "حدث خطأ في تحميل قائمة الطلاب";
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term) ||
      student.phone?.includes(term)
    );
  });

  if (loading) {
    return (
      <Center minH="70vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
          <Text fontSize="lg" color="gray.600">
            جاري تحميل قائمة الطلاب...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="70vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500" fontWeight="bold">
            {error}
          </Text>
          <Button colorScheme="blue" onClick={fetchStudents}>
            إعادة المحاولة
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" py={8} px={4} className="mt-[80px]">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={4} mb={4}>
            <Box
              bgGradient="linear(135deg, blue.400, blue.600)"
              p={4}
              borderRadius="xl"
              boxShadow="lg"
            >
              <MdPeople size={32} color="white" />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading size="xl" color="blue.700">
                طلابي
              </Heading>
              <Text color="gray.600" fontSize="lg">
                إدارة ومتابعة طلابك
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <BiSearch color="gray.400" size={20} />
            </InputLeftElement>
            <Input
              placeholder="ابحث عن طالب بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bgColor}
              borderColor={borderColor}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
            />
          </InputGroup>
        </Box>

        {/* Stats */}
        <HStack spacing={4} flexWrap="wrap">
          <Badge
            colorScheme="blue"
            fontSize="md"
            px={4}
            py={2}
            borderRadius="full"
            boxShadow="sm"
          >
            إجمالي الطلاب: {students.length}
          </Badge>
          {searchTerm && (
            <Badge
              colorScheme="green"
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              boxShadow="sm"
            >
              نتائج البحث: {filteredStudents.length}
            </Badge>
          )}
        </HStack>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <Center py={12}>
            <VStack spacing={4}>
              <MdPeople size={64} color="gray.400" />
              <Text fontSize="xl" color="gray.500">
                {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد طلاب مسجلين"}
              </Text>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow="md"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                  borderColor: "blue.300",
                }}
                cursor="pointer"
                onClick={() => navigate(`/teacher-students/${student.id}`)}
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Student Info */}
                    <HStack spacing={4}>
                      <Avatar
                        size="lg"
                        name={student.name}
                        bg="blue.500"
                        color="white"
                        fontWeight="bold"
                      />
                      <VStack align="flex-start" spacing={1} flex={1}>
                        <Heading size="md" color="blue.700" noOfLines={1}>
                          {student.name}
                        </Heading>
                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                          {student.courses_count} كورس
                        </Badge>
                      </VStack>
                    </HStack>

                    {/* Contact Info */}
                    <VStack spacing={2} align="stretch">
                      {student.email && (
                        <HStack spacing={2} color="gray.600">
                          <MdEmail size={18} />
                          <Text fontSize="sm" noOfLines={1}>
                            {student.email}
                          </Text>
                        </HStack>
                      )}
                      {student.phone && (
                        <HStack spacing={2} color="gray.600">
                          <MdPhone size={18} />
                          <Text fontSize="sm">{student.phone}</Text>
                        </HStack>
                      )}
                    </VStack>

                    {/* View Report Button */}
                    <Button
                      colorScheme="blue"
                      rightIcon={<MdArrowForward />}
                      size="md"
                      borderRadius="full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher-students/${student.id}`);
                      }}
                      _hover={{
                        transform: "translateX(4px)",
                      }}
                      transition="all 0.2s"
                    >
                      عرض التقرير
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
};

export default TeacherStudents;


