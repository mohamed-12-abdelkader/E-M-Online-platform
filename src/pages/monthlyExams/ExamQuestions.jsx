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
  Radio,
  RadioGroup,
  Stack,
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
} from "@chakra-ui/react";
import { FaArrowRight, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

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
      // السماح بالإرسال حتى لو انتهى الوقت
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

  // تنفيذ الإنهاء تلقائيًا عند انتهاء الوقت
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

  if (loading) return <Text>جاري التحميل...</Text>;
  if (error) return <Text>حدث خطأ: {error.message}</Text>;

  const currentQuestion = responseData?.questions[currentQuestionIndex];

  return (
    <Box
      maxW='800px'
      mx='auto'
      p={5}
      bg='gray.100'
      borderRadius='lg'
      boxShadow='lg'
      mt={8}
    >
      <VStack align='start' spacing={4} mb={8}>
        <Text fontSize='2xl' fontWeight='bold' color='blue.600'>
          {responseData?.exam?.title}
        </Text>
        <Flex
          align='center'
          bg='blue.50'
          p={3}
          borderRadius='md'
          boxShadow='sm'
        >
          <Icon as={BiTime} boxSize={6} color='blue.500' mr={2} />
          <Text fontSize='lg' fontWeight='semibold' color='blue.700'>
            الوقت المتبقي: {formatTime(timeLeft)} دقيقة
          </Text>
        </Flex>
        {warningVisible && (
          <Alert status='warning' borderRadius='md'>
            <AlertIcon />
            <AlertDescription>
              تنبيه: أقل من دقيقة واحدة متبقية!
            </AlertDescription>
          </Alert>
        )}
      </VStack>
      <Box mb={8}>
        <Progress
          value={progress}
          colorScheme='blue'
          size='lg'
          borderRadius='full'
        />
      </Box>
      {currentQuestion && (
        <Box
          borderWidth='1px'
          borderRadius='lg'
          p={6}
          boxShadow='md'
          bg='white'
        >
          <Text fontSize='xl' fontWeight='semibold' mb={6} color='gray.700'>
            {currentQuestion.question_text}
          </Text>
          <RadioGroup
            onChange={(value) =>
              handleAnswerChange(currentQuestion.question_id, value)
            }
          >
            <Stack spacing={4}>
              {currentQuestion.options.map((option) => (
                <Radio
                  key={option.option_id}
                  value={option.option_id.toString()}
                >
                  {option.option_text}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </Box>
      )}
      <Flex justifyContent='space-between' mt={8}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={handlePrev}
          isDisabled={currentQuestionIndex === 0}
          colorScheme='blue'
          variant='outline'
          size='lg'
        >
          السابق
        </Button>
        <Button
          rightIcon={<FaArrowRight />}
          onClick={handleNext}
          isDisabled={
            currentQuestionIndex === responseData?.questions.length - 1
          }
          colorScheme='blue'
          size='lg'
        >
          التالي
        </Button>
      </Flex>
      {currentQuestionIndex === responseData?.questions.length - 1 && (
        <Flex justify='center' mt={8}>
          <Button
            leftIcon={<FaCheckCircle />}
            onClick={handleSubmitExam}
            colorScheme='green'
            size='lg'
          >
            إنهاء الامتحان
          </Button>
        </Flex>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size='md'>
        <ModalOverlay />
        <ModalContent p={5} borderRadius='lg' boxShadow='xl'>
          <ModalHeader textAlign='center' fontSize='2xl' fontWeight='bold'>
            نتيجة الامتحان 🎉
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} align='center'>
              <Text fontSize='xl' fontWeight='semibold' color='blue.600'>
                درجتك: {examResult?.mark}/100
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent='center'>
            <Link to={`/subject_exam/${id}/review`}>
              <Button colorScheme='blue' size='lg'>
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
