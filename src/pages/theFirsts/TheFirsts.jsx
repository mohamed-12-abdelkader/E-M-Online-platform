import React from "react";
import { FaMedal, FaTrophy, FaStar, FaCrown, FaAward } from "react-icons/fa";
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Flex, 
  Avatar,
  Badge,
  useColorModeValue,
  Heading,
  Divider,
  SimpleGrid,
  Icon,
  Progress,
  Button
} from "@chakra-ui/react";

const TheFirsts = () => {
  const topCompetitors = [
    {
      name: "أحمد علي",
      rank: 1,
      points: 1500,
      progress: 95,
      avatar: "https://bit.ly/dan-abramov",
      subjects: ["الرياضيات", "الفيزياء"]
    },
    {
      name: "سارة محمد",
      rank: 2,
      points: 1400,
      progress: 85,
      avatar: "https://bit.ly/kent-c-dodds",
      subjects: ["الكيمياء", "الأحياء"]
    },
    {
      name: "محمد حسن",
      rank: 3,
      points: 1300,
      progress: 75,
      avatar: "https://bit.ly/ryan-florence",
      subjects: ["اللغة العربية", "التاريخ"]
    },
    {
      name: "ليلى عبد الله",
      rank: 4,
      points: 1200,
      progress: 65,
      avatar: "https://bit.ly/prosper-baba",
      subjects: ["اللغة الإنجليزية", "الفلسفة"]
    },
    {
      name: "خالد عمرو",
      rank: 5,
      points: 1100,
      progress: 55,
      avatar: "https://bit.ly/code-beast",
      subjects: ["الجغرافيا", "العلوم"]
    },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Icon as={FaCrown} color="yellow.400" boxSize="6" />;
      case 2:
        return <Icon as={FaTrophy} color="gray.400" boxSize="6" />;
      case 3:
        return <Icon as={FaMedal} color="orange.400" boxSize="6" />;
      case 4:
        return <Icon as={FaAward} color="blue.400" boxSize="5" />;
      case 5:
        return <Icon as={FaStar} color="green.400" boxSize="5" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank) => {
    const rankColors = {
      1: { bg: "yellow.100", color: "yellow.800", border: "yellow.200" },
      2: { bg: "gray.100", color: "gray.800", border: "gray.200" },
      3: { bg: "orange.100", color: "orange.800", border: "orange.200" },
      4: { bg: "blue.100", color: "blue.800", border: "blue.200" },
      5: { bg: "green.100", color: "green.800", border: "green.200" }
    };
    
    return (
      <Badge 
        bg={rankColors[rank]?.bg || "gray.100"} 
        color={rankColors[rank]?.color || "gray.800"}
        borderWidth="1px"
        borderColor={rankColors[rank]?.border || "gray.200"}
        borderRadius="full"
        px={3}
        py={1}
        fontSize="lg"
        fontWeight="bold"
      >
        #{rank}
      </Badge>
    );
  };

  const cardBg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("blue.600", "blue.800");

  return (
    <Box width="100%" maxW="800px" mx="auto" mt={8} mb={12}>
      {/* Header */}
      <Box 
        bgGradient={`linear(to-r, ${headerBg}, purple.600)`}
        color="white"
        p={6}
        borderRadius="lg"
        mb={6}
        boxShadow="lg"
        textAlign="center"
      >
        <Heading size="xl" mb={2}>لوحة المتصدرين</Heading>
        <Text fontSize="lg">أفضل الطلاب في المسابقة هذا الأسبوع</Text>
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">إجمالي المشاركين</Text>
          <Text fontSize="2xl" fontWeight="bold">248</Text>
        </Box>
        <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">النقاط الكلية</Text>
          <Text fontSize="2xl" fontWeight="bold">12,450</Text>
        </Box>
        <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="md" textAlign="center">
          <Text fontSize="sm" color="gray.500">الوقت المتبقي</Text>
          <Text fontSize="2xl" fontWeight="bold">3 أيام</Text>
        </Box>
      </SimpleGrid>

      {/* Top Competitors */}
      <VStack spacing={4}>
        {topCompetitors.map((competitor) => (
          <Box
            key={competitor.rank}
            width="100%"
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            p={4}
            borderLeftWidth="4px"
            borderLeftColor={
              competitor.rank === 1 ? "yellow.400" :
              competitor.rank === 2 ? "gray.400" :
              competitor.rank === 3 ? "orange.400" : "blue.400"
            }
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg"
            }}
          >
            <Flex alignItems="center">
              <Flex alignItems="center" flex="1">
                <Box mr={4}>
                  {getRankBadge(competitor.rank)}
                </Box>
                <Avatar 
                  name={competitor.name} 
                  src={competitor.avatar} 
                  size="md"
                  mr={4}
                />
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    {competitor.name}
                    {competitor.rank <= 3 && (
                      <Box as="span" ml={2} display="inline-block">
                        {getRankIcon(competitor.rank)}
                      </Box>
                    )}
                  </Text>
                  <HStack spacing={2} mt={1} flexWrap="wrap">
                    {competitor.subjects.map((subject, idx) => (
                      <Badge 
                        key={idx} 
                        colorScheme={
                          idx % 2 === 0 ? "blue" : 
                          idx % 3 === 0 ? "green" : "purple"
                        }
                        variant="subtle"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              </Flex>
              
              <Box textAlign="right" minW="120px">
                <Text fontSize="xl" fontWeight="bold" color="blue.500">
                  {competitor.points} نقطة
                </Text>
                <Progress 
                  value={competitor.progress} 
                  size="sm" 
                  colorScheme="blue" 
                  mt={2}
                  borderRadius="full"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {competitor.progress}% إنجاز
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* Footer */}
      <Box mt={8} textAlign="center">
        <Text color="gray.500">
          يتم تحديث الترتيب كل ساعة. آخر تحديث: {new Date().toLocaleTimeString()}
        </Text>
        <Button
          colorScheme="blue" 
          variant="outline" 
          mt={4}
          size="sm"
        >
          عرض الترتيب الكامل
        </Button>
      </Box>
    </Box>
  );
};

export default TheFirsts;