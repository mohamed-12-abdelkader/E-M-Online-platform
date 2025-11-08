import { Box, Flex, Heading, Text, useColorModeValue, Icon } from "@chakra-ui/react";
import { FaQuestionCircle, FaVideo, FaUniversity, FaBookOpen } from "react-icons/fa";
import { motion, useInView } from "framer-motion";
const SectionThree = () => {
  const bgGradient = useColorModeValue(
    "linear(to-br, #f0f4ff, #e5e8ff)",
    "linear(to-br, #1a202c, #2d3748)"
  );
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(45, 55, 72, 0.8)");
  const textColor = useColorModeValue("gray.900", "white");
  const descriptionColor = useColorModeValue("gray.600", "gray.400");

  const educationalServices = [
    {
      id: 1,
      title: "مسابقات يومية",
      description: "اختبر معلوماتك يوميًا عبر مسابقات تعليمية شيقة.",
      rating: 4.8,
      reviews: 250,
      icon: FaQuestionCircle,
      color: "blue.400",
    },
    {
      id: 2,
      title: "محاضرات مسجلة",
      description: "استمتع بمحاضرات مسجلة متاحة في أي وقت من خبراء التعليم.",
      rating: 4.6,
      reviews: 180,
      icon: FaVideo,
      color: "green.400",
    },
    {
      id: 3,
      title: "دورات للجامعات",
      description: "دورات متخصصة لمختلف التخصصات الجامعية يقدمها أكاديميون محترفون.",
      rating: 4.9,
      reviews: 220,
      icon: FaUniversity,
      color: "purple.400",
    },
    {
      id: 4,
      title: "مكتبة رقمية",
      description: "أكبر مكتبة إلكترونية تحتوي على آلاف الكتب والمراجع التعليمية.",
      rating: 4.7,
      reviews: 190,
      icon: FaBookOpen,
      color: "orange.400",
    },
  ];

  return (
    <Box w="full" py={10} px={6}    textAlign="center" mb={10}>
      <motion.h1    className="text-6xl my-3 text-orange-400 sm:text-5xl lg:text-7xl font-extrabold leading-tight">
        خدماتنا التعليمية 📚
      </motion.h1 >
      <Text fontSize="lg" color="blue.500" mb={10}>
        اكتشف أفضل الدورات التعليمية والدروس الخاصة مع خبراء التعليم.
      </Text>

      <Flex wrap="wrap" justify="center" gap={8}>
        {educationalServices.map((service) => (
          <Box
            key={service.id}
            p={8}
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.18)"
            borderRadius="2xl"
            boxShadow="0 8px 30px rgba(0, 0, 0, 0.1)"
            transition="transform 0.4s ease, box-shadow 0.4s ease"
            _hover={{
              transform: "translateY(-10px)",
              boxShadow: "0 12px 50px rgba(0, 0, 0, 0.2)",
            }}
            w={{ base: "100%", sm: "45%", md: "22%" }}
          >
            <Flex justify="center" align="center" mb={6}>
              <Box
                bg={service.color}
                p={5}
                borderRadius="full"
                boxShadow="inset 0 0 10px rgba(0,0,0,0.1)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.4s"
                _hover={{ transform: "scale(1.1) rotate(10deg)" }}
              >
                <Icon as={service.icon} boxSize={10} color="white" />
              </Box>
            </Flex>
            <Heading fontSize="xl" fontWeight="bold" color="blue.500" mb={3}>
              {service.title}
            </Heading>
            <Text fontSize="md" color={descriptionColor}>
              {service.description}
            </Text>
            <Flex justify="center" align="center" mt={4}>
              <Text fontSize="sm" color="yellow.400" fontWeight="bold">★ {service.rating}</Text>
              <Text fontSize="xs" color={descriptionColor} ml={2}>
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
