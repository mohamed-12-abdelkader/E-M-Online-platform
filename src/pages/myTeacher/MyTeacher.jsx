import React from "react";
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
  const textColor = useColorModeValue("gray.700", "gray.300");
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
    <Box w="100%" height={"100%"}>
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
      <VStack spacing={{ base: 4, sm: 5, md: 6 }} mb={{ base: 6, sm: 8 }}>
        {!teachers?.teachers && (
          <Heading
            size={{ base: "lg", sm: "xl", md: "2xl" }}
            color={textColor}
            textAlign="center"
          >
            ابحث عن محاضرك
          </Heading>
        )}
      </VStack>

      {teachers?.teachers?.length > 0 ? (
        <div className="md:flex flex-wrap">
          {teachers.teachers.map((teacher) => (
            <Link key={teacher.id} to={`/teacher/${teacher.id}`} style={{ display: "block" }}>
              <Card
             className="m-2 my-5  mx-auto md:w-[340px]  min-[840px]:m-3 :my-5  "
                style={{
                  marginTop:"10px !important",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  background: "#fff",
                  overflow: "hidden",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15)",
                }}
                
                h="100%"
                display="flex"
                flexDirection="column"
              >
                <AspectRatio ratio={4 / 3} w="100%">
                  <Box position="relative" w="100%" h="100%">
                    <Image
                      src={teacher.avatar || "https://via.placeholder.com/320x200/4fd1c5/ffffff?text=صورة+المدرس"}
                      alt={teacher.name}
                     className="w-[350px]"
                      h="100%"
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      _hover={{ transform: "scale(1.02)" }}
                    />

                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      bg="rgba(0, 0, 0, 0.7)"
                      color="white"
                      px={{ base: 2, sm: 3 }}
                      py={{ base: 0.5, sm: 1 }}
                      borderRadius="full"
                      fontSize={{ base: "2xs", sm: "xs" }}
                      fontWeight="bold"
                      backdropFilter="blur(10px)"
                    >
                      {teacher.subject}
                    </Box>

                    <Box
                      position="absolute"
                      top={2}
                      left={2}
                      bg="rgba(59, 130, 246, 0.9)"
                      color="white"
                      px={{ base: 2, sm: 3 }}
                      py={{ base: 0.5, sm: 1 }}
                      borderRadius="full"
                      fontSize={{ base: "2xs", sm: "xs" }}
                      fontWeight="bold"
                      backdropFilter="blur(10px)"
                    >
                      مدرس
                    </Box>
                  </Box>
                </AspectRatio>

                <CardBody p={{ base: 4, sm: 5, md: 6 }} display="flex" flexDirection="column" flex="1">
                  <VStack align="flex-start" spacing={{ base: 3, sm: 4 }} w="full" h="100%" justify="space-between">
                    <Box w="full">
                      <Text
                        fontWeight="bold"
                        fontSize={{ base: "lg", sm: "xl", md: "xl" }}
                        color="#2d3748"
                        textAlign="right"
                        mb={1}
                        noOfLines={1}
                      >
                        {teacher.name}
                      </Text>
                      {teacher.description ? (
                        <Text
                          fontSize={{ base: "xs", sm: "sm", md: "sm" }}
                          color="#718096"
                          textAlign="right"
                          noOfLines={{ base: 2, sm: 3 }}
                          lineHeight="1.5"
                        >
                          {teacher.description}
                        </Text>
                      ) : null}
                    </Box>

                    <Flex justify="space-between" align="center" w="full" pt={2}>
                      <HStack spacing={2}>
                        <FaVideo color="#3b82f6" size={14} />
                        <Text fontSize={{ base: "2xs", sm: "xs" }} color="#718096" fontWeight="medium">
                          {teacher.subject}
                        </Text>
                      </HStack>
                    </Flex>

                    <Button
                      colorScheme="blue"
                      w="full"
                      borderRadius="xl"
                      fontWeight="bold"
                      fontSize={{ base: "sm", sm: "md" }}
                      h={{ base: "40px", sm: "44px", md: "48px" }}
                      mt={2}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                      }}
                      transition="all 0.2s ease"
                    >
                      عرض الكورسات
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Link>
          ))}
          
        </div>
      ) : (
        <Center py={{ base: 8, sm: 12, md: 16 }}>
          <VStack spacing={{ base: 6, sm: 8 }} align="center" w="100%" textAlign="center">
            <VStack spacing={{ base: 4, sm: 6 }} align="center" w="100%">
              <Heading
                size={{ base: "lg", sm: "xl", md: "xl" }}
                color={textColor}
                textAlign="center"
                lineHeight={{ base: "1.3", md: "1.2" }}
              >
                🚀 لم تقم بالاشتراك مع أي محاضرين بعد!
              </Heading>

              <Text
                fontSize={{ base: "md", sm: "lg", md: "xl" }}
                color={subTextColor}
                textAlign="center"
                lineHeight={{ base: "1.5", md: "1.4" }}
                maxW={{ base: "320px", sm: "500px" }}
              >
                يمكنك البحث عن محاضرك باستخدام{" "}
                <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                  كود المحاضر
                </Badge>{" "}
                أو من خلال{" "}
                <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                  اسمه
                </Badge>.
              </Text>

              <Link to="/teachers">
                <HStack
                  spacing={3}
                  bg="blue.500"
                  color="white"
                  px={{ base: 6, sm: 8 }}
                  py={{ base: 3, sm: 4 }}
                  borderRadius="xl"
                  shadow="lg"
                  _hover={{
                    bg: "blue.600",
                    transform: "translateY(-2px)",
                    shadow: "xl",
                  }}
                  transition="all 0.3s ease"
                  fontWeight="bold"
                  fontSize={{ base: "md", sm: "lg" }}
                >
                  <Icon as={FaSearch} boxSize={{ base: 5, sm: 6 }} />
                  <Text>ابحث عن محاضرك</Text>
                </HStack>
              </Link>
            </VStack>
          </VStack>
        </Center>
      )}
    </Box>
  );
};

export default MyTeacher;
