import React from "react";
import {
  Box,
  Text,
  Flex,
  Container,
  Icon,
  Heading,
  VStack,
  useBreakpointValue,
  Avatar,
  Badge,
  HStack,
  IconButton,
  Tooltip,
  SimpleGrid,
  Link as ChakraLink
} from "@chakra-ui/react";
import { 
  FaGraduationCap, 
  FaBookOpen, 
  FaPhone, 
  FaEnvelope,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaWhatsapp
} from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const imageSize = useBreakpointValue({ base: "200px", md: "300px" });

  return (
    <Box position="relative" mb={8}>
      {/* Hero Section بسيط */}
      <Box
        bg="blue.500"
        py={8}
        px={4}
      >
        <Container dir="rtl" maxW="container.xl">
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={6}
          >
            {/* معلومات المدرس */}
            <Box flex={1} w="100%">
              <VStack align={{ base: "center", lg: "flex-start" }} spacing={6}>
                
                {/* الاسم والمادة */}
                <Box textAlign={{ base: "center", lg: "right" }} w="full">
                  <Heading
                    fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                    fontWeight="bold"
                    color="white"
                    mb={4}
                  >
                    {teacher.name}
                  </Heading>
                  
                  <Badge
                    bg="orange.500"
                    color="white"
                    px={6}
                    py={3}
                    borderRadius="xl"
                    fontSize="lg"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    w="fit-content"
                    mx={{ base: "auto", lg: "0" }}
                    fontWeight="bold"
                  >
                    <Icon as={FaGraduationCap} boxSize={5} />
                    <Text>محاضر {teacher.subject}</Text>
                  </Badge>
                </Box>

                {/* الوصف */}
                {teacher.description && (
                  <Box 
                    w="full" 
                    maxW="600px"
                    p={4}
                    bg="whiteAlpha.200"
                    borderRadius="xl"
                  >
                    <Text
                      fontSize="lg"
                      color="white"
                      textAlign={{ base: "center", lg: "right" }}
                      lineHeight="1.6"
                      fontWeight="medium"
                    >
                      {teacher.description}
                    </Text>
                  </Box>
                )}

                {/* إحصائيات */}
             
             <div className="flex">
                      <Box w="full" maxW="500px">
                  <Flex 
                    direction={{ base: "column", sm: "row" }} 
                    gap={4} 
                    w="full" 
                    justify={{ base: "center", lg: "flex-start" }}
                  >
                    <Box
                      px={5}
                      py={3}
                      bg="orange.500"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <Icon as={FaBookOpen} boxSize={5} color="white" />
                      <VStack align="flex-start" spacing={0}>
                        <Text color="white" fontSize="sm" fontWeight="medium">
                          الكورسات
                        </Text>
                        <Text color="white" fontSize="xl" fontWeight="bold">
                          {number || 0}
                        </Text>
                      </VStack>
                    </Box>
                  </Flex>
                       </Box>

                    {/* الواتساب */}
                    {teacher.whatsapp_number && (
                      <ChakraLink
                      className="w-[130px] mx-3"
                        href={`https://wa.me/${teacher.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        _hover={{ textDecoration: "none" }}
                      >
                        <Box
                          p={4}
                          bg="#25D366"
                          borderRadius="xl"
                          cursor="pointer"
                          transition="all 0.2s ease"
                          _hover={{ bg: "#128C7E" }}
                        >
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              bg="whiteAlpha.200"
                              borderRadius="lg"
                            >
                              <Icon as={FaWhatsapp} color="white" boxSize={5} />
                            </Box>
                            <VStack align="flex-start" spacing={0} flex={1}>
                          
                              <Text color="white" fontSize="lg" fontWeight="bold">
                            مراسلة 
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      </ChakraLink>
                    )}
             </div>

                {/* معلومات الاتصال */}
                <Box w="full" maxW="600px">
                  <VStack className="flex" spacing={4} align="stretch">
                 
              

                    {/* الوسائط الاجتماعية */}
                    {(teacher.facebook_url || teacher.youtube_url || teacher.tiktok_url) && (
                      <Box>
                        <Text 
                          color="white" 
                          fontSize="md" 
                          fontWeight="bold" 
                          mb={3} 
                          textAlign={{ base: "center", lg: "right" }}
                        >
                          تابعني على
                        </Text>
                        <HStack spacing={3} justify={{ base: "center", lg: "flex-start" }}>
                          {teacher.facebook_url && (
                            <Tooltip label="فيسبوك" hasArrow placement="top">
                              <IconButton
                                as={ChakraLink}
                                href={teacher.facebook_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<FaFacebook />}
                                size="md"
                                borderRadius="lg"
                                bg="#1877F2"
                                color="white"
                                _hover={{ bg: "#166FE5" }}
                              />
                            </Tooltip>
                          )}
                          
                          {teacher.youtube_url && (
                            <Tooltip label="يوتيوب" hasArrow placement="top">
                              <IconButton
                                as={ChakraLink}
                                href={teacher.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<FaYoutube />}
                                size="md"
                                borderRadius="lg"
                                bg="#FF0000"
                                color="white"
                                _hover={{ bg: "#E60000" }}
                              />
                            </Tooltip>
                          )}
                          
                          {teacher.tiktok_url && (
                            <Tooltip label="تيك توك" hasArrow placement="top">
                              <IconButton
                                as={ChakraLink}
                                href={teacher.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                icon={<FaTiktok />}
                                size="md"
                                borderRadius="lg"
                                bg="#000000"
                                color="white"
                                _hover={{ bg: "#333333" }}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* صورة المدرس */}
            <Box>
              <Avatar
                src={teacher.avatar}
               
                width={imageSize}
                height={imageSize}
                borderWidth="6px"
                borderColor="white"
                boxShadow="lg"
              />
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default TeacherInfo;