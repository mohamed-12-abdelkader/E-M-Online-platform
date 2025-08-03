import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Progress,
  Text,
  VStack,
  Flex,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaArrowRight, FaArrowLeft, FaCheckCircle, FaClock, FaTrophy } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const ExamQuestions = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [loading, responseData, error, handleStart] = useStartExam({ id: id });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [subloading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [examResult, setExamResult] = useState(null);
  const [warningVisible, setWarningVisible] = useState(false);

  useEffect(() => {
    handleStart();
  }, []);

  useEffect(() => {
    if (responseData?.exam?.time_minutes) {
      setTimeLeft(responseData.exam.time_minutes * 60);
    }
  }, [responseData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (timeLeft <= 60 && timeLeft > 0) {
      setWarningVisible(true);
    } else {
      setWarningVisible(false);
    }
    if (timeLeft === 0) {
      handleSubmitExam();
    }
  }, [timeLeft]);

  const handleSubmitExam = async () => {
    if (timeLeft === 0 || Object.keys(answers).length > 0) {
      const finalAnswers = Object.keys(answers).reduce((acc, questionId) => {
        acc[questionId] = answers[questionId];
        return acc;
      }, {});
      try {
        setLoading(true);
        const response = await baseUrl.post(
          `api/exams/submit`,
          { exam_id: id, answers: finalAnswers },
          { headers: { token: token } }
        );
        toast.success("تم انهاء الامتحان بنجاح");
        setExamResult(response.data);
        onOpen();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning("يجب اختيار إجابة على الأقل قبل الإنهاء");
    }
  };

  useEffect(() => {
    if (timeLeft == 0) {
      handleSubmitExam();
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < responseData?.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const progress =
    responseData && responseData.questions
      ? (Object.keys(answers).length / responseData.questions.length) * 100
      : 0;

  const currentQuestion = responseData?.questions[currentQuestionIndex];

  // ألوان ديناميكية
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const optionBg = useColorModeValue("blue.50", "gray.700");
  const selectedBg = useColorModeValue("blue.500", "blue.400");
  const selectedColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (loading) return <Text>جاري التحميل...</Text>;
  if (error) return <Text>حدث خطأ: {error.message}</Text>;

  return (
    <Box minH="100vh" bg={bgColor} pb={10}>
      {/* هيدر Sticky */}
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bg={bgColor}
        boxShadow="sm"
        py={4}
        mb={8}
      >
        <Flex align="center" justify="space-between" maxW="900px" mx="auto" px={4}>
          <VStack align="start" spacing={0}>
            <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
              {responseData?.exam?.title}
            </Text>
            <Text fontSize="md" color="gray.500">
              سؤال {currentQuestionIndex + 1} من {responseData?.questions.length}
            </Text>
          </VStack>
          <HStack spacing={6}>
            <VStack spacing={0} align="center">
              <CircularProgress
                value={progress}
                color={accentColor}
                size="60px"
                thickness="8px"
                trackColor={useColorModeValue("gray.200", "gray.700")}
              >
                <CircularProgressLabel fontWeight="bold" fontSize="lg">
                  {Math.round(progress)}%
                </CircularProgressLabel>
              </CircularProgress>
              <Text fontSize="xs" color="gray.500">التقدم</Text>
            </VStack>
            <VStack spacing={0} align="center">
              <Box position="relative">
                <Icon as={FaClock} color={accentColor} boxSize={7} />
                {warningVisible && (
                  <Box position="absolute" top={-2} right={-2} w={3} h={3} bg="red.400" borderRadius="full" />
                )}
              </Box>
              <Text fontWeight="bold" color={accentColor} fontSize="lg">
                {formatTime(timeLeft)}
              </Text>
              <Text fontSize="xs" color="gray.500">الوقت المتبقي</Text>
            </VStack>
          </HStack>
        </Flex>
        {warningVisible && (
          <Alert status='warning' borderRadius='md' maxW="900px" mx="auto" mt={3}>
            <AlertIcon />
            <AlertDescription>
              تنبيه: أقل من دقيقة واحدة متبقية!
            </AlertDescription>
          </Alert>
        )}
      </Box>

      {/* كارت السؤال */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={currentQuestion?.question_id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          maxW="600px"
          mx="auto"
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="2xl"
          p={{ base: 5, md: 10 }}
          mt={8}
        >
          <VStack align="stretch" spacing={8}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {currentQuestion?.question_text}
            </Text>
            <VStack spacing={4} align="stretch">
              {currentQuestion?.options.map((option) => {
                const isSelected = answers[currentQuestion.question_id] == option.option_id;
                return (
                  <MotionButton
                    key={option.option_id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerChange(currentQuestion.question_id, option.option_id)}
                    w="full"
                    py={5}
                    fontSize="lg"
                    fontWeight="bold"
                    borderRadius="xl"
                    bg={isSelected ? selectedBg : optionBg}
                    color={isSelected ? selectedColor : textColor}
                    border={isSelected ? `2px solid ${accentColor}` : `1px solid ${borderColor}`}
                    shadow={isSelected ? "xl" : "sm"}
                    transition="all 0.2s"
                  >
                    {option.option_text}
                  </MotionButton>
                );
              })}
            </VStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>

      {/* أزرار التنقل */}
      <Flex justifyContent='space-between' maxW="600px" mx="auto" mt={8}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={handlePrev}
          isDisabled={currentQuestionIndex === 0}
          colorScheme='blue'
          variant='outline'
          size='lg'
          borderRadius="full"
        >
          السابق
        </Button>
        <Button
          rightIcon={<FaArrowRight />}
          onClick={handleNext}
          isDisabled={currentQuestionIndex === responseData?.questions.length - 1}
          colorScheme='blue'
          size='lg'
          borderRadius="full"
        >
          التالي
        </Button>
      </Flex>

      {/* زر إنهاء الامتحان */}
      {currentQuestionIndex === responseData?.questions.length - 1 && (
        <Flex justify='center' mt={8}>
          <Button
            leftIcon={<FaCheckCircle />}
            onClick={handleSubmitExam}
            colorScheme='green'
            size='lg'
            borderRadius="full"
            px={10}
            py={6}
            fontSize="xl"
            shadow="xl"
          >
            إنهاء الامتحان
          </Button>
        </Flex>
      )}

      {/* Modal النتيجة */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size='md'>
        <ModalOverlay />
        <ModalContent p={5} borderRadius='2xl' boxShadow='2xl'>
          <ModalHeader textAlign='center' fontSize='2xl' fontWeight='bold'>
            <HStack justify="center" spacing={3}>
              <Icon as={FaTrophy} color="yellow.400" boxSize={8} />
              <Text>نتيجة الامتحان 🎉</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} align='center'>
              <Text fontSize='2xl' fontWeight='bold' color='green.500'>
                درجتك: {examResult?.mark}/100
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent='center'>
            <Link to={`/subject_exam/${id}/review`}>
              <Button colorScheme='blue' size='lg' borderRadius="full">
                عرض تفاصيل الامتحان 📊
              </Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExamQuestions;
