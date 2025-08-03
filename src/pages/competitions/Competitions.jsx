import React from "react";
import { 
  Box, 
  Skeleton, 
  VStack, 
  Text, 
  Center, 
  Button, 
  Flex, 
  Heading, 
  Avatar, 
  Badge,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Stack,
  Divider
} from "@chakra-ui/react";
import { 
  FiAward, 
  FiClock, 
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiChevronRight,
  FiStar
} from "react-icons/fi";
import useGitComps from "../../Hooks/student/competition/useGitComps";
import { CoursesCard } from "../../ui/card/CoursesCard";

// بيانات الطالب (يمكن استبدالها ببيانات حقيقية من API)
const studentData = {
  name: "أحمد محمد",
  points: 1250,
  avatar: "https://bit.ly/dan-abramov",
  level: "الصف الثالث الثانوي"
};

const CompetitionSkeleton = () => {
  return (
    <Box
      w={{ base: "100%", md: "280px" }}
      h="400px"
      m="2"
      p="4"
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
    >
      <Skeleton height="160px" borderRadius="md" mb="4" />
      <VStack align="start" spacing="3">
        <Skeleton height="20px" width="70%" />
        <Skeleton height="16px" width="90%" />
        <Skeleton height="16px" width="50%" />
        <Skeleton height="40px" width="100%" mt="4" borderRadius="md" />
      </VStack>
    </Box>
  );
};

const Competitions = () => {
  const [compsLoading, comps, refetchComps] = useGitComps();
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Box bg={bgColor} minH="100vh" pb="120px">
      {/* Header Section */}
      <Box 
        bgGradient="linear(to-r, blue.500, orange.300)" 
        color="white" 
        py="8"
        px={{ base: 4, md: 8 }}
      >
        <Flex 
          justify="space-between" 
          align="center" 
          maxW="1200px" 
          mx="auto"
          direction={{ base: "column", md: "row" }}
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Heading size="xl" mb="2">المسابقات التعليمية</Heading>
            <Text fontSize="lg">شارك واربح النقاط وطور من مهاراتك</Text>
          </Box>
          
          <Flex 
            align="center" 
            bg="rgba(255,255,255,0.2)" 
            p="3" 
            borderRadius="lg"
            backdropFilter="blur(10px)"
          >
            <Avatar 
              name={studentData.name} 
              src={studentData.avatar} 
              size="md" 
              mr="3"
            />
            <Box>
              <Text fontWeight="bold">{studentData.name}</Text>
              <Flex align="center">
                <Badge colorScheme="yellow" mr="2">
                  <Flex align="center">
                    <Icon as={FiStar} mr="1" />
                    {studentData.points} نقطة
                  </Flex>
                </Badge>
                <Text fontSize="sm">{studentData.level}</Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Stats Section */}
      <Box 
        maxW="1200px" 
        mx="auto" 
        mt="-6" 
        mb="8" 
        px={{ base: 4, md: 8 }}
      >
        <SimpleGrid 
          columns={{ base: 2, md: 4 }} 
          spacing="4"
        >
          <Box 
            bg={cardBg} 
            p="4" 
            borderRadius="lg" 
            boxShadow="md"
            borderLeftWidth="4px"
            borderLeftColor="blue.400"
          >
            <Flex align="center">
              <Box 
                p="2" 
                bg="blue.100" 
                borderRadius="full" 
                mr="3"
                color="blue.500"
              >
                <Icon as={FiAward} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">المسابقات النشطة</Text>
                <Text fontWeight="bold" fontSize="xl">12</Text>
              </Box>
            </Flex>
          </Box>
          
          <Box 
            bg={cardBg} 
            p="4" 
            borderRadius="lg" 
            boxShadow="md"
            borderLeftWidth="4px"
            borderLeftColor="green.400"
          >
            <Flex align="center">
              <Box 
                p="2" 
                bg="green.100" 
                borderRadius="full" 
                mr="3"
                color="green.500"
              >
                <Icon as={FiUsers} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">المشاركين</Text>
                <Text fontWeight="bold" fontSize="xl">348</Text>
              </Box>
            </Flex>
          </Box>
          
          <Box 
            bg={cardBg} 
            p="4" 
            borderRadius="lg" 
            boxShadow="md"
            borderLeftWidth="4px"
            borderLeftColor="purple.400"
          >
            <Flex align="center">
              <Box 
                p="2" 
                bg="purple.100" 
                borderRadius="full" 
                mr="3"
                color="purple.500"
              >
                <Icon as={FiClock} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">الوقت المتبقي</Text>
                <Text fontWeight="bold" fontSize="xl">3 أيام</Text>
              </Box>
            </Flex>
          </Box>
          
          <Box 
            bg={cardBg} 
            p="4" 
            borderRadius="lg" 
            boxShadow="md"
            borderLeftWidth="4px"
            borderLeftColor="orange.400"
          >
            <Flex align="center">
              <Box 
                p="2" 
                bg="orange.100" 
                borderRadius="full" 
                mr="3"
                color="orange.500"
              >
                <Icon as={FiBarChart2} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500">ترتيبك</Text>
                <Text fontWeight="bold" fontSize="xl">#24</Text>
              </Box>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Main Content */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
        <Flex 
          justify="space-between" 
          align="center" 
          mb="6"
          direction={{ base: "column", md: "row" }}
        >
          <Heading size="lg" mb={{ base: 4, md: 0 }}>
            المسابقات المتاحة
          </Heading>
          
          <Flex>
            <Button 
              colorScheme="blue" 
              variant="outline" 
              mr="2"
              leftIcon={<Icon as={FiCalendar} />}
            >
              ترتيب حسب التاريخ
            </Button>
            <Button 
              colorScheme="purple"
              rightIcon={<Icon as={FiChevronRight} />}
            >
              مسابقاتي السابقة
            </Button>
          </Flex>
        </Flex>

        <Divider mb="6" />

        {/* Competitions Grid */}
        <Box>
          {compsLoading ? (
            <SimpleGrid 
              columns={{ base: 1, sm: 2, md: 3 }} 
              spacing="4"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <CompetitionSkeleton key={index} />
              ))}
            </SimpleGrid>
          ) : comps?.data?.length > 0 ? (
            <SimpleGrid 
              columns={{ base: 1, sm: 2, md: 3 }} 
              spacing="4"
            >
              {comps.data.map((comp, idx) => (
                <CoursesCard
                  type={"comp"}
                  lectre={comp}
                  key={comp.id || idx}
                  href={`/competition/${comp.id}`}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center 
              bg={cardBg} 
              p="10" 
              borderRadius="lg" 
              boxShadow="sm"
              flexDirection="column"
            >
              <Text fontSize="xl" mb="4">لا توجد مسابقات متاحة حالياً</Text>
              <Button 
                colorScheme="blue"
                onClick={refetchComps}
                leftIcon={<Icon as={FiAward} />}
              >
                تحديث القائمة
              </Button>
            </Center>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Competitions;