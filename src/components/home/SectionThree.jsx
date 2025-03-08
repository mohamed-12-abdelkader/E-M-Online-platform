import { Box, Flex, Heading, Text, useColorModeValue, Icon, Button } from "@chakra-ui/react";
import { FaQuestionCircle, FaVideo, FaUniversity, FaBookOpen } from "react-icons/fa";

const SectionThree = () => {
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const btnBg = useColorModeValue("#592BEC", "purple.400");

  const educationalServices = [
    {
      id: 1,
      title: "مسابقات يومية",
      description: "اختبر معلوماتك يوميًا عبر مسابقات تعليمية شيقة.",
      rating: 4.8,
      reviews: 250,
      icon: FaQuestionCircle,
      color: "blue.500",
    },
    {
      id: 2,
      title: "محاضرات مسجلة",
      description: "استمتع بمحاضرات مسجلة متاحة في أي وقت من خبراء التعليم.",
      rating: 4.6,
      reviews: 180,
      icon: FaVideo,
      color: "green.500",
    },
    {
      id: 3,
      title: "دورات للجامعات",
      description: "دورات متخصصة لمختلف التخصصات الجامعية يقدمها أكاديميون محترفون.",
      rating: 4.9,
      reviews: 220,
      icon: FaUniversity,
      color: "purple.500",
    },
    {
      id: 4,
      title: "مكتبة رقمية",
      description: "أكبر مكتبة إلكترونية تحتوي على آلاف الكتب والمراجع التعليمية.",
      rating: 4.7,
      reviews: 190,
      icon: FaBookOpen,
      color: "orange.500",
    },
  ];

  return (
    <Box w="full" py={12} px={6} textAlign="center">
      <Heading fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
        خدماتنا التعليمية 📚
      </Heading>
      <Text color="gray.500" mb={6}>
        اكتشف أفضل الدورات التعليمية والدروس الخاصة مع خبراء التعليم.
      </Text>

      <Flex wrap="wrap" justify="center" gap={4}>
        {educationalServices.map((service) => (
          <Box
            key={service.id}
            p={6}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            boxShadow="md"
            transition="transform 0.3s ease, box-shadow 0.3s ease"
            _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
            w={{ base: "100%", sm: "48%", md: "23%" }}
          >
            <Flex justify="center" align="center" mb={4}>
              <Icon as={service.icon} boxSize={10} color={service.color} />
            </Flex>
            <Heading fontSize="lg" fontWeight="semibold" color={textColor} mb={2}>
              {service.title}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {service.description}
            </Text>
            <Flex justify="center" align="center" mt={3}>
              <Text fontSize="sm" color="yellow.400">★ {service.rating}</Text>
              <Text fontSize="xs" color="gray.400" ml={2}>
                ({service.reviews} تقييم)
              </Text>
            </Flex>
          </Box>
        ))}
      </Flex>

      
    </Box>
  );
};

export default SectionThree;
