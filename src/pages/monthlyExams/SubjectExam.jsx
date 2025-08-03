import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  Button,
  HStack,
  Stack,
  Center,
  IconButton,
  Skeleton,
  useColorModeValue,
  VStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FaVideo, FaClipboardList, FaCheckCircle } from "react-icons/fa";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";
import { Link, useParams } from "react-router-dom";
import useGitSupExamDetails from "../../Hooks/student/monthlyExams/useGitSupExamDetails";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Box);

const SubjectExam = () => {
  const { id } = useParams();

  const [studentExamsLoading, studentExam, refetchStudenExam, error] =
    useGitSupExamDetails({ id });
  const [examStarted, setExamStarted] = useState(false);

  const handleStartExamClick = () => {
    setExamStarted(true);
  };
  // console.log(error);

  const bg = useColorModeValue("gray.50", "gray.800");
  const boxBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("blue.700", "blue.200");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const buttonColorScheme = useColorModeValue("blue", "teal");

  if (!studentExam && studentExamsLoading) {
    return (
      <Center minH='100vh'>
        <Skeleton height='20px' width='80%' />
      </Center>
    );
  }

  if (!studentExam) {
    return (
      <Center minH='100vh'>
        <Text>لم يتم العثور على الاختبار</Text>
      </Center>
    );
  }

  return (
    <Center w='100%' minH='100vh' bg={bg} p={5}>
      <MotionBox
        w={{ base: "100%", md: "80%", lg: "70%" }}
        p={{ base: 4, md: 8 }}
        bg={boxBg}
        boxShadow='2xl'
        borderRadius='2xl'
        overflow='hidden'
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={10}>
          {/* هيدر الامتحان */}
          <VStack spacing={4} textAlign='center'>
            <Box position="relative" w="full">
              <Image
                src={studentExam.cover?.path || "https://via.placeholder.com/800x400"}
                alt='Exam Cover'
                borderRadius='xl'
                mb={3}
                maxH='300px'
                mx='auto'
                objectFit='cover'
                w="full"
                boxShadow="lg"
              />
              <Badge
                position="absolute"
                top={4}
                right={4}
                colorScheme="blue"
                borderRadius="full"
                px={4}
                py={2}
                fontSize="md"
                shadow="md"
              >
                امتحان شهري
              </Badge>
            </Box>
            <HStack justify="center" spacing={3}>
              <Icon as={FaClipboardList} color={accentColor} boxSize={7} />
              <Heading as='h2' size='xl' color={headingColor}>
                {studentExam.title}
              </Heading>
            </HStack>
          </VStack>

          {/* كارت معلومات الامتحان وزر البدء */}
          <MotionCard
            p={8}
            bgGradient="linear(to-br, blue.50, green.50)"
            borderRadius='2xl'
            boxShadow='xl'
            textAlign='center'
            whileHover={{ scale: 1.01, boxShadow: "2xl" }}
            transition={{ duration: 0.2 }}
          >
            <VStack spacing={4}>
              <Text fontSize='xl' fontWeight='bold' color={textColor}>
                اسم الامتحان: {studentExam.title}
              </Text>
              {studentExam.completed ? (
                <HStack justify="center" spacing={2}>
                  <Icon as={FaCheckCircle} color="green.500" boxSize={6} />
                  <Text fontSize='xl' fontWeight='bold' color="green.600">
                    هذا الامتحان مكتمل
                  </Text>
                </HStack>
              ) : null}
              {studentExam.completed ? (
                <Link to={`/subject_exam/${id}/review`}>
                  <Button colorScheme='blue' size='lg' borderRadius="full" px={8} py={6} fontSize="xl">
                    عرض تفاصيل الامتحان 📊
                  </Button>
                </Link>
              ) : (
                <Link to={`/subject_exam/${studentExam.id}/questions`}>
                  <Button
                    colorScheme={buttonColorScheme}
                    size='lg'
                    w='full'
                    borderRadius='full'
                    px={8}
                    py={6}
                    fontSize="xl"
                    onClick={handleStartExamClick}
                    isDisabled={examStarted}
                  >
                    {examStarted ? "جاري التحميل..." : "ابدأ الامتحان"}
                  </Button>
                </Link>
              )}
            </VStack>
          </MotionCard>

          {/* فيديوهات المراجعة */}
          {studentExam.reviews && studentExam.reviews.length > 0 && (
            <Box>
              <Heading size="md" mb={4} color={headingColor}>
                فيديوهات مراجعة الامتحان
              </Heading>
              <Stack spacing={5}>
                {studentExam.reviews.map((video, index) => (
                  <MotionCard
                    key={index}
                    p={5}
                    bg={useColorModeValue("gray.100", "gray.600")}
                    borderRadius='xl'
                    boxShadow='md'
                    alignItems='center'
                    whileHover={{ scale: 1.01, boxShadow: "xl" }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack justify='space-between' align="center">
                      <Text fontSize='lg' fontWeight='medium' color={textColor}>
                        {video.title}
                      </Text>
                      <IconButton
                        icon={<FaVideo />}
                        colorScheme='red'
                        size='lg'
                        variant='solid'
                        aria-label={`تشغيل الفيديو ${index + 1}`}
                        onClick={() => {
                          window.open(video.path, "_blank");
                        }}
                        borderRadius="full"
                        shadow="md"
                      />
                    </HStack>
                  </MotionCard>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </MotionBox>
    </Center>
  );
};

export default SubjectExam;
