import React from 'react';
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
  Avatar,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Button,
  Icon, // لاستخدام الأيقونات بشكل أفضل مع Chakra UI
} from '@chakra-ui/react';
import {
  FiBook,
  FiBookOpen,
  FiAward,
  FiSearch,
  FiArrowRight,
  FiGrid, // أيقونة جديدة
  FiUser, // أيقونة جديدة
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // استيراد motion

// مكونات Motion لإضافة الحركات
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const QuestionBank = () => {
  const studentData = {
    name: "أحمد محمد",
    level: "الصف الثالث الثانوي",
    points: 1250,
    avatar: "https://bit.ly/dan-abramov" // يمكن استبدالها برابط حقيقي
  };

  const subjects = [
    { id: 1, name: "الرياضيات", questions: 1245, icon: FiBook, color: "blue", progress: 75 },
    { id: 2, name: "الفيزياء", questions: 876, icon: FiBookOpen, color: "teal", progress: 60 },
    { id: 3, name: "الكيمياء", questions: 932, icon: FiBook, color: "purple", progress: 45 },
    { id: 4, name: "اللغة العربية", questions: 765, icon: FiBookOpen, color: "orange", progress: 80 },
    { id: 5, name: "اللغة الإنجليزية", questions: 1023, icon: FiBook, color: "red", progress: 65 },
    { id: 6, name: "الأحياء", questions: 654, icon: FiBookOpen, color: "green", progress: 55 },
  ];

  // ألوان مخصصة للثيم الفاتح والداكن
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.800"); // خلفية الهيدر
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("blue.500", "blue.300"); // لون التركيز
  const accentLightBg = useColorModeValue("blue.50", "blue.900"); // خلفية خفيفة للتركيز

  // Framer Motion Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // تأخير بسيط بين كل عنصر
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Flex minH="100vh" bg={bgColor} direction="column">
      {/* Header */}
      <Box
        as={motion.header}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        bg={headerBg}
        p={{ base: 3, md: 4 }}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        boxShadow="sm"
       
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
          <Heading size={{ base: "md", md: "lg" }} color={accentColor}>
            <Icon as={FiGrid} mr={2} /> بنك الأسئلة
          </Heading>

          <Flex align="center">
            <Avatar
              name={studentData.name}
              src={studentData.avatar}
              size="sm"
              mr={3}
              border="2px solid"
              borderColor={accentColor}
            />
            <Box textAlign="right">
              <Text fontWeight="600" color={headingColor}>{studentData.name}</Text>
              <Text fontSize="xs" color={textColor}>{studentData.level}</Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content */}
      <MotionBox
        flex={1}
        p={{ base: 4, md: 8 }}
        maxW="1400px"
        mx="auto"
        w="full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome Section */}
        <MotionBox
          variants={itemVariants}
          bg={cardBg}
          p={{ base: 5, md: 7 }}
          borderRadius="xl"
          boxShadow="lg"
          mb={8}
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            wrap="wrap"
          >
            <Box mb={{ base: 4, md: 0 }}>
              <Heading size={{ base: "xl", md: "2xl" }} mb={2} color={headingColor}>
                مرحباً بك، <Text as="span" color={accentColor}>{studentData.name.split(" ")[0]}</Text> 👋
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color={textColor}>
                استعد للامتحانات بأسئلة متنوعة ومصنفة لتضمن تفوقك!
              </Text>
            </Box>

            <Flex
              bg={accentLightBg}
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue("blue.100", "blue.700")}
              align="center"
              minW={{ base: "auto", md: "200px" }}
              justifyContent="center"
            >
              <Box p={3} bg={accentColor} borderRadius="full" mr={3} boxShadow="md">
                <Icon as={FiAward} color="white" size="24px" />
              </Box>
              <Box>
                <Text fontSize="sm" color={useColorModeValue("blue.800", "blue.200")}>نقاطك الحالية</Text>
                <Text fontWeight="extrabold" fontSize="2xl" color={useColorModeValue("blue.700", "blue.100")}>
                  {studentData.points.toLocaleString()} نقطة
                </Text>
              </Box>
            </Flex>
          </Flex>
        </MotionBox>

        {/* Stats Section */}
        <MotionBox variants={itemVariants} mb={8}>
          <Heading size="md" mb={4} color={headingColor} borderBottom="1px solid" borderColor={borderColor} pb={2}>
            <Icon as={FiUser} mr={2} color={accentColor} /> ملخص الأداء
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
            {[
              {
                title: "المواد المتاحة",
                value: subjects.length,
                icon: <Icon as={FiBook} />,
                color: "blue",
              },
              {
                title: "إجمالي الأسئلة",
                value: subjects.reduce((acc, sub) => acc + sub.questions, 0).toLocaleString(),
                icon: <Icon as={FiBookOpen} />,
                color: "teal",
              },
              {
                title: "أسئلة محلولة",
                value: Math.floor(subjects.reduce((acc, sub) => acc + sub.questions, 0) * 0.65).toLocaleString(),
                icon: <Icon as={FiAward} />,
                color: "purple",
              }
            ].map((stat, index) => (
              <MotionBox
                key={index}
                variants={itemVariants}
                bg={cardBg}
                p={5}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "md"
                }}
              >
                <Flex align="center">
                  <Flex
                    p={3}
                    bg={`${stat.color}.50`}
                    borderRadius="full"
                    mr={3}
                    color={`${stat.color}.500`}
                    boxShadow="sm"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {stat.icon}
                  </Flex>
                  <Box>
                    <Text fontSize="sm" color={textColor} fontWeight="medium">{stat.title}</Text>
                    <Text fontWeight="extrabold" fontSize="2xl" color={`${stat.color}.600`}>
                      {stat.value}
                    </Text>
                  </Box>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
        </MotionBox>

        {/* Search Bar */}
        <MotionBox variants={itemVariants} mb={8}>
          <InputGroup size="lg" boxShadow="sm">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="ابحث عن مادة أو سؤال محدد..."
              bg={cardBg}
              borderColor={borderColor}
              _hover={{ borderColor: useColorModeValue("gray.300", "gray.600") }}
              _focus={{
                borderColor: accentColor,
                boxShadow: `0 0 0 1px ${useColorModeValue('colors.blue.500', 'colors.blue.300')}`, // Shadow matching accent color
              }}
              borderRadius="lg"
              py={6} // لزيادة ارتفاع مربع البحث
            />
          </InputGroup>
        </MotionBox>

        {/* Subjects Section */}
        <MotionBox variants={itemVariants}>
          <Heading size="lg" mb={5} color={headingColor} borderBottom="1px solid" borderColor={borderColor} pb={2}>
            <Icon as={FiBook} mr={2} color="green.400" /> استكشف المواد الدراسية
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {subjects.map((subject) => (
              <MotionCard
                key={subject.id}
                variants={itemVariants}
                bg={cardBg}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="lg"
                transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: `${subject.color}.400`, // Border highlights on hover
                }}
              >
                <CardHeader pb={2}>
                  <Flex align="center">
                    <Flex
                      p={4}
                      bg={`${subject.color}.100`}
                      borderRadius="full"
                      mr={4}
                      color={`${subject.color}.600`}
                      boxShadow="sm"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Icon as={subject.icon} size="24px" />
                    </Flex>
                    <Box>
                      <Heading size="md" color={headingColor} mb={1}>{subject.name}</Heading>
                      <Text fontSize="sm" color={textColor}>
                        <Text as="span" fontWeight="bold" color={`${subject.color}.500`}>
                          {subject.questions.toLocaleString()}
                        </Text> سؤال متاح
                      </Text>
                    </Box>
                  </Flex>
                </CardHeader>

                <CardBody py={4}>
                  <Box mb={3}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" color={textColor} fontWeight="medium">التقدم في الأسئلة</Text>
                      <Text fontSize="sm" fontWeight="bold" color={`${subject.color}.600`}>
                        {subject.progress}%
                      </Text>
                    </Flex>
                    <Progress
                      value={subject.progress}
                      size="md"
                      colorScheme={subject.color}
                      borderRadius="full"
                      bg={`${subject.color}.50`}
                      hasStripe
                      isAnimated
                    />
                  </Box>
                </CardBody>

                <CardFooter pt={0}>
                  <Link to={`/supject/${subject.id}`} style={{ width: '100%' }}>
                    <MotionButton
                      rightIcon={<FiArrowRight />}
                      variant="solid" // تغيير إلى solid لإبراز الزر
                      colorScheme={subject.color}
                      w="full"
                      size="md"
                      borderRadius="lg"
                      py={3} // لزيادة ارتفاع الزر
                      fontWeight="semibold"
                      boxShadow="md"
                      _hover={{
                        boxShadow: "lg",
                        transform: "translateY(-1px)"
                      }}
                      _active={{
                        transform: "translateY(1px)"
                      }}
                    >
                      عرض الأسئلة
                    </MotionButton>
                  </Link>
                </CardFooter>
              </MotionCard>
            ))}
          </SimpleGrid>
        </MotionBox>
      </MotionBox>
    </Flex>
  );
};

export default QuestionBank;