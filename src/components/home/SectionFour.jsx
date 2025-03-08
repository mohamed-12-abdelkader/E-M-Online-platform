import { Box, Flex, Heading, Text, useColorModeValue, Icon } from "@chakra-ui/react";
import { FaHeadset, FaShieldAlt, FaRocket, FaUserShield } from "react-icons/fa";

const SectionFour = () => {
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const teacherServices = [
    {
      id: 1,
      title: "خدمة عملاء 24/7",
      description: "دعم فني متاح على مدار الساعة لضمان تجربة سلسة.",
      icon: FaHeadset,
      color: "blue.500",
    },
    {
      id: 2,
      title: "حماية المحتوى",
      description: "تقنيات أمان متقدمة لضمان حماية دروسك من النسخ غير المصرح به.",
      icon: FaShieldAlt,
      color: "green.500",
    },
    {
      id: 3,
      title: "أداء سريع ومستقر",
      description: "منصة مستقرة وسريعة لضمان تجربة تدريس سلسة دون انقطاعات.",
      icon: FaRocket,
      color: "purple.500",
    },
    {
      id: 4,
      title: "تحكم كامل بالمحتوى",
      description: "إدارة مرنة لدوراتك وإعدادات متقدمة لضبط المحتوى كما تريد.",
      icon: FaUserShield,
      color: "orange.500",
    },
  ];

  return (
    <Box w="full" py={12} px={6} textAlign="center">
      <Heading fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
        خدماتنا للمحاضرين 🎓
      </Heading>
      <Text color="gray.500" mb={6}>
        وفرنا لك أفضل الأدوات لحماية محتواك وضمان تجربة تدريس مثالية.
      </Text>

      <Flex wrap="wrap" justify="center" gap={4}>
        {teacherServices.map((service) => (
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
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default SectionFour;
