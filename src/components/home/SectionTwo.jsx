import { Box, Flex, Heading, Text, useColorModeValue, Icon } from "@chakra-ui/react";
import { BiTrophy, BiBook } from "react-icons/bi";
import { FaRobot, FaChalkboardTeacher } from "react-icons/fa";

const SectionTwo = () => {
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const features = [
    {
      id: 1,
      name: "مسابقات يومية",
      description: "اختبر مهاراتك يوميًا من خلال تحديات تعليمية ممتعة.",
      icon: BiTrophy,
      color: "purple.500",
    },
    {
      id: 2,
      name: "امتحانات شهرية",
      description: "قم بتقييم مستواك عبر امتحانات شهرية متخصصة.",
      icon: BiBook,
      color: "blue.500",
    },
    {
      id: 3,
      name: "ذكاء اصطناعي",
      description: "استفد من أحدث تقنيات الذكاء الاصطناعي في التعليم.",
      icon: FaRobot,
      color: "green.500",
    },
    {
      id: 4,
      name: "أقوى المحاضرين",
      description: "تعلم من نخبة المحاضرين المتخصصين في مختلف المجالات.",
      icon: FaChalkboardTeacher,
      color: "orange.500",
    },
  ];

  return (
    <Box w="full" py={12} px={6} textAlign="center">
      <Heading fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
        مميزات منصتنا التعليمية 🚀
      </Heading>
      <Text color="gray.500" mb={6}>
        اكتشف كيف يمكن لمنصتنا تحسين تجربتك التعليمية.
      </Text>

      <Flex wrap="wrap" justify="center" gap={4}>
        {features.map((feature) => (
          <Box
            key={feature.id}
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
              <Icon as={feature.icon} boxSize={10} color={feature.color} />
            </Flex>
            <Heading fontSize="lg" fontWeight="semibold" color={textColor} mb={2}>
              {feature.name}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {feature.description}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default SectionTwo;
